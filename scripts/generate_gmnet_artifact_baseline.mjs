#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import * as ort from 'onnxruntime-node';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const modelsRoot = path.join(repoRoot, 'public', 'models');
const outputPath = path.join(
  repoRoot,
  'src',
  'lib',
  '__tests__',
  'fixtures',
  'gmnet-artifact-baseline.v1.json',
);

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

const DYNAMIC_CASES = [
  { id: 'random-64x64-seed1337', kind: 'random', width: 64, height: 64, seed: 1337 },
  { id: 'random-128x96-seed1338', kind: 'random', width: 128, height: 96, seed: 1338 },
  { id: 'random-256x256-seed1339', kind: 'random', width: 256, height: 256, seed: 1339 },
  { id: 'gradient-128x96', kind: 'gradient', width: 128, height: 96, seed: 4242 },
  { id: 'checkerboard-256x256', kind: 'checkerboard', width: 256, height: 256, seed: 5252 },
];

const WEBGL_INLINE_CASES = [
  { id: 'random-128x128-seed2337', kind: 'random', width: 128, height: 128, seed: 2337 },
  { id: 'gradient-128x128', kind: 'gradient', width: 128, height: 128, seed: 6242 },
  { id: 'checkerboard-128x128', kind: 'checkerboard', width: 128, height: 128, seed: 7252 },
];

function createMulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function encodeTensorData(dtype, dims, data) {
  let bytes;
  if (dtype === 'float32') {
    bytes = Buffer.from(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  } else if (dtype === 'uint8') {
    bytes = Buffer.from(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  } else {
    throw new Error(`Unsupported dtype for encoding: ${dtype}`);
  }
  return {
    dtype,
    dims,
    data_b64: bytes.toString('base64'),
  };
}

function generateRandomChwFloat(width, height, seed) {
  const random = createMulberry32(seed);
  const channelSize = width * height;
  const data = new Float32Array(3 * channelSize);
  for (let idx = 0; idx < channelSize; idx += 1) {
    data[idx] = random();
    data[channelSize + idx] = random();
    data[(2 * channelSize) + idx] = random();
  }
  return data;
}

function generateGradientChwFloat(width, height) {
  const channelSize = width * height;
  const data = new Float32Array(3 * channelSize);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width) + x;
      const xf = width > 1 ? (x / (width - 1)) : 0;
      const yf = height > 1 ? (y / (height - 1)) : 0;
      data[index] = xf;
      data[channelSize + index] = yf;
      data[(2 * channelSize) + index] = 0.5 * (xf + yf);
    }
  }
  return data;
}

function generateCheckerboardChwFloat(width, height) {
  const channelSize = width * height;
  const data = new Float32Array(3 * channelSize);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width) + x;
      const on = (((x >> 3) + (y >> 3)) & 1) === 0;
      const base = on ? 0.85 : 0.15;
      data[index] = base;
      data[channelSize + index] = on ? 0.3 : 0.7;
      data[(2 * channelSize) + index] = on ? 0.55 : 0.25;
    }
  }
  return data;
}

function generateInputChw(kind, width, height, seed) {
  if (kind === 'random') {
    return generateRandomChwFloat(width, height, seed);
  }
  if (kind === 'gradient') {
    return generateGradientChwFloat(width, height);
  }
  if (kind === 'checkerboard') {
    return generateCheckerboardChwFloat(width, height);
  }
  throw new Error(`Unsupported case kind: ${kind}`);
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

const QUIET_NODE_ORT_SESSION_OPTIONS = Object.freeze({
  logSeverityLevel: 3,
  logVerbosityLevel: 0,
});

async function loadDynamicSessions(files) {
  const globalPath = path.join(modelsRoot, files.globalModel);
  const localPath = path.join(modelsRoot, files.localModel);
  const globalDataPath = path.join(modelsRoot, files.globalData);
  const localDataPath = path.join(modelsRoot, files.localData);
  const globalData = fs.readFileSync(globalDataPath);
  const localData = fs.readFileSync(localDataPath);

  const globalSession = await ort.InferenceSession.create(globalPath, {
    externalData: [{ path: files.globalData, data: globalData }],
    ...QUIET_NODE_ORT_SESSION_OPTIONS,
  });
  const localSession = await ort.InferenceSession.create(localPath, {
    externalData: [{ path: files.localData, data: localData }],
    ...QUIET_NODE_ORT_SESSION_OPTIONS,
  });

  return { globalSession, localSession };
}

async function loadWebglInlineSessions(files) {
  const globalPath = path.join(modelsRoot, files.globalInlineModel);
  const localPath = path.join(modelsRoot, files.localWebglModel);
  const globalSession = await ort.InferenceSession.create(globalPath, QUIET_NODE_ORT_SESSION_OPTIONS);
  const localSession = await ort.InferenceSession.create(localPath, QUIET_NODE_ORT_SESSION_OPTIONS);
  return { globalSession, localSession };
}

async function runCase({ sessions, caseConfig }) {
  const { kind, width, height, seed } = caseConfig;
  const globalInput = generateInputChw(kind, 256, 256, seed + 10000);
  const localInput = generateInputChw(kind, width, height, seed);

  const globalInputTensor = new ort.Tensor('float32', globalInput, [1, 3, 256, 256]);
  const localInputTensor = new ort.Tensor('float32', localInput, [1, 3, height, width]);

  const globalOutputs = await sessions.globalSession.run({
    global_input: globalInputTensor,
  });
  const localOutputs = await sessions.localSession.run({
    local_input: localInputTensor,
    wker: globalOutputs.wker,
    wchn: globalOutputs.wchn,
  });

  const gainMapBytes = deriveGainMapBytes(localOutputs.ingm, globalOutputs.qmax);

  return {
    id: caseConfig.id,
    kind,
    width,
    height,
    seed,
    inputs: {
      global_input: encodeTensorData('float32', [1, 3, 256, 256], globalInput),
      local_input: encodeTensorData('float32', [1, 3, height, width], localInput),
    },
    outputs: {
      wker: encodeTensorData('float32', globalOutputs.wker.dims, globalOutputs.wker.data),
      wchn: encodeTensorData('float32', globalOutputs.wchn.dims, globalOutputs.wchn.data),
      qmax: encodeTensorData('float32', globalOutputs.qmax.dims, globalOutputs.qmax.data),
      ingm: encodeTensorData('float32', localOutputs.ingm.dims, localOutputs.ingm.data),
      gain_map_bytes: encodeTensorData('uint8', [1, 1, height, width], gainMapBytes),
    },
  };
}

async function main() {
  const output = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    generator: 'scripts/generate_gmnet_artifact_baseline.mjs',
    variants: {},
  };

  for (const [variant, files] of Object.entries(VARIANT_FILES)) {
    const dynamicSessions = await loadDynamicSessions(files);
    const webglSessions = await loadWebglInlineSessions(files);

    output.variants[variant] = {
      tracks: {
        dynamic: {
          cases: [],
        },
        webgl_inline: {
          cases: [],
        },
      },
    };

    for (const caseConfig of DYNAMIC_CASES) {
      const record = await runCase({
        sessions: dynamicSessions,
        caseConfig,
      });
      output.variants[variant].tracks.dynamic.cases.push(record);
    }

    for (const caseConfig of WEBGL_INLINE_CASES) {
      const record = await runCase({
        sessions: webglSessions,
        caseConfig,
      });
      output.variants[variant].tracks.webgl_inline.cases.push(record);
    }
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  process.stdout.write(`[Baseline] wrote ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`[Baseline] failed: ${error?.stack || error}\n`);
  process.exit(1);
});
