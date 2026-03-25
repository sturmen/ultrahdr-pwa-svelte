/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as ort from 'onnxruntime-node';

const MODELS_ROOT = path.resolve(__dirname, '../../../public/models');
const FIXTURE_PATH = path.resolve(__dirname, './fixtures/gmnet-artifact-baseline.v1.json');
const MAX_ABS_TOLERANCE = 1e-4;
const MEAN_ABS_TOLERANCE = 1e-6;
const QUIET_NODE_ORT_SESSION_OPTIONS = Object.freeze({
  logSeverityLevel: 3,
  logVerbosityLevel: 0,
});

const VARIANT_FILES = {
  realworld: {
    globalModel: 'gmnet-realworld-global.onnx',
    globalData: 'gmnet-realworld-global.onnx.data',
    localModel: 'gmnet-realworld-local.onnx',
    localData: 'gmnet-realworld-local.onnx.data',
    globalInlineModel: 'gmnet-realworld-global-inline.onnx',
    localWebglModel: 'gmnet-realworld-local-inline-webgl.onnx',
  },
  synthetic: {
    globalModel: 'gmnet-synthetic-global.onnx',
    globalData: 'gmnet-synthetic-global.onnx.data',
    localModel: 'gmnet-synthetic-local.onnx',
    localData: 'gmnet-synthetic-local.onnx.data',
    globalInlineModel: 'gmnet-synthetic-global-inline.onnx',
    localWebglModel: 'gmnet-synthetic-local-inline-webgl.onnx',
  },
};

function decodeTensorPayload(payload) {
  expect(payload).toEqual(
    expect.objectContaining({
      dtype: expect.any(String),
      dims: expect.any(Array),
      data_b64: expect.any(String),
    }),
  );
  const raw = Buffer.from(payload.data_b64, 'base64');
  if (payload.dtype === 'float32') {
    return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  }
  if (payload.dtype === 'uint8') {
    return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  }
  throw new Error(`Unsupported baseline tensor dtype: ${payload.dtype}`);
}

function toFloatArray(data) {
  if (data instanceof Float32Array) {
    return data;
  }
  if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
    return Float32Array.from(data);
  }
  throw new Error(`Unsupported tensor data type: ${data?.constructor?.name || typeof data}`);
}

function compareTensorLike({ expectedData, actualData, tensorLabel }) {
  expect(actualData.length).toBe(expectedData.length);

  const expectedFloat = toFloatArray(expectedData);
  const actualFloat = toFloatArray(actualData);
  let maxAbs = 0;
  let sumAbs = 0;

  for (let index = 0; index < expectedFloat.length; index += 1) {
    const absDiff = Math.abs(expectedFloat[index] - actualFloat[index]);
    if (absDiff > maxAbs) {
      maxAbs = absDiff;
    }
    sumAbs += absDiff;
  }

  const meanAbs = sumAbs / Math.max(1, expectedFloat.length);
  expect(
    maxAbs,
    `${tensorLabel} max_abs exceeded tolerance (${maxAbs} > ${MAX_ABS_TOLERANCE})`,
  ).toBeLessThanOrEqual(MAX_ABS_TOLERANCE);
  expect(
    meanAbs,
    `${tensorLabel} mean_abs exceeded tolerance (${meanAbs} > ${MEAN_ABS_TOLERANCE})`,
  ).toBeLessThanOrEqual(MEAN_ABS_TOLERANCE);
}

function deriveGainMapBytes(ingmTensor, qmaxTensor) {
  const qmaxScalar = Number(qmaxTensor.data[0]) || 1;
  const ingmData = ingmTensor.data;
  const bytes = new Uint8Array(ingmData.length);
  for (let index = 0; index < ingmData.length; index += 1) {
    const igm = Math.max(0, Math.min(1, ingmData[index] * qmaxScalar));
    bytes[index] = Math.floor(igm * 255);
  }
  return bytes;
}

async function loadDynamicSessions(variantFiles) {
  const globalModelPath = path.join(MODELS_ROOT, variantFiles.globalModel);
  const globalDataPath = path.join(MODELS_ROOT, variantFiles.globalData);
  const localModelPath = path.join(MODELS_ROOT, variantFiles.localModel);
  const localDataPath = path.join(MODELS_ROOT, variantFiles.localData);
  const globalExternalData = fs.readFileSync(globalDataPath);
  const localExternalData = fs.readFileSync(localDataPath);

  const globalSession = await ort.InferenceSession.create(globalModelPath, {
    externalData: [{ path: variantFiles.globalData, data: globalExternalData }],
    ...QUIET_NODE_ORT_SESSION_OPTIONS,
  });
  const localSession = await ort.InferenceSession.create(localModelPath, {
    externalData: [{ path: variantFiles.localData, data: localExternalData }],
    ...QUIET_NODE_ORT_SESSION_OPTIONS,
  });

  return { globalSession, localSession };
}

async function loadWebglInlineSessions(variantFiles) {
  const globalInlinePath = path.join(MODELS_ROOT, variantFiles.globalInlineModel);
  const localWebglPath = path.join(MODELS_ROOT, variantFiles.localWebglModel);
  const globalSession = await ort.InferenceSession.create(globalInlinePath, QUIET_NODE_ORT_SESSION_OPTIONS);
  const localSession = await ort.InferenceSession.create(localWebglPath, QUIET_NODE_ORT_SESSION_OPTIONS);
  return { globalSession, localSession };
}

describe('GMNet artifact regression gate', () => {
  it('matches committed baseline fixture within strict tolerance for all variants and case tracks', async () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    const baseline = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
    expect(baseline?.schema_version).toBe(1);

    for (const [variant, variantFiles] of Object.entries(VARIANT_FILES)) {
      const variantBaseline = baseline?.variants?.[variant];
      expect(variantBaseline).toBeDefined();

      const dynamicSessions = await loadDynamicSessions(variantFiles);
      const webglSessions = await loadWebglInlineSessions(variantFiles);

      const trackToSessions = {
        dynamic: dynamicSessions,
        webgl_inline: webglSessions,
      };

      for (const [trackName, trackData] of Object.entries(variantBaseline.tracks || {})) {
        expect(trackToSessions[trackName]).toBeDefined();
        const sessions = trackToSessions[trackName];

        for (const caseEntry of trackData.cases || []) {
          const globalInputPayload = caseEntry.inputs?.global_input;
          const localInputPayload = caseEntry.inputs?.local_input;
          const expectedOutputs = caseEntry.outputs || {};
          const globalInput = decodeTensorPayload(globalInputPayload);
          const localInput = decodeTensorPayload(localInputPayload);
          const globalTensor = new ort.Tensor('float32', globalInput, globalInputPayload.dims);
          const localTensor = new ort.Tensor('float32', localInput, localInputPayload.dims);

          const globalRun = await sessions.globalSession.run({
            global_input: globalTensor,
          });
          const localRun = await sessions.localSession.run({
            local_input: localTensor,
            wker: globalRun.wker,
            wchn: globalRun.wchn,
          });

          compareTensorLike({
            expectedData: decodeTensorPayload(expectedOutputs.wker),
            actualData: globalRun.wker.data,
            tensorLabel: `${variant}/${trackName}/${caseEntry.id}/wker`,
          });
          compareTensorLike({
            expectedData: decodeTensorPayload(expectedOutputs.wchn),
            actualData: globalRun.wchn.data,
            tensorLabel: `${variant}/${trackName}/${caseEntry.id}/wchn`,
          });
          compareTensorLike({
            expectedData: decodeTensorPayload(expectedOutputs.qmax),
            actualData: globalRun.qmax.data,
            tensorLabel: `${variant}/${trackName}/${caseEntry.id}/qmax`,
          });
          compareTensorLike({
            expectedData: decodeTensorPayload(expectedOutputs.ingm),
            actualData: localRun.ingm.data,
            tensorLabel: `${variant}/${trackName}/${caseEntry.id}/ingm`,
          });

          const derivedGainMap = deriveGainMapBytes(localRun.ingm, globalRun.qmax);
          compareTensorLike({
            expectedData: decodeTensorPayload(expectedOutputs.gain_map_bytes),
            actualData: derivedGainMap,
            tensorLabel: `${variant}/${trackName}/${caseEntry.id}/gain_map_bytes`,
          });
        }
      }
    }
  }, 20_000);
});
