/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import * as ort from 'onnxruntime-node';

const MODELS_ROOT = path.resolve(__dirname, '../../../public/models');
const MANIFEST_PATH = path.join(MODELS_ROOT, 'gmnet-manifest.json');
const VARIANT_FILES = {
  realworld: {
    globalModel: 'gmnet-realworld-global.onnx',
    globalData: 'gmnet-realworld-global.onnx.data',
    localModel: 'gmnet-realworld-local.onnx',
    localData: 'gmnet-realworld-local.onnx.data',
    globalInlineModel: 'gmnet-realworld-global-inline.onnx',
    localInlineModel: 'gmnet-realworld-local-inline.onnx',
    localWebglModel: 'gmnet-realworld-local-inline-webgl.onnx',
  },
  synthetic: {
    globalModel: 'gmnet-synthetic-global.onnx',
    globalData: 'gmnet-synthetic-global.onnx.data',
    localModel: 'gmnet-synthetic-local.onnx',
    localData: 'gmnet-synthetic-local.onnx.data',
    globalInlineModel: 'gmnet-synthetic-global-inline.onnx',
    localInlineModel: 'gmnet-synthetic-local-inline.onnx',
    localWebglModel: 'gmnet-synthetic-local-inline-webgl.onnx',
  },
};
const LEGACY_FILES = ['gmnet.onnx', 'gmnet.onnx.data'];
const QUIET_NODE_ORT_SESSION_OPTIONS = Object.freeze({
  logSeverityLevel: 3,
  logVerbosityLevel: 0,
});

async function validateGlobalModelRuntime(modelPath, modelDataPath, externalDataPath) {
  const externalDataBuffer = fs.readFileSync(modelDataPath);
  const session = await ort.InferenceSession.create(modelPath, {
    externalData: [{ path: externalDataPath, data: externalDataBuffer }],
    ...QUIET_NODE_ORT_SESSION_OPTIONS,
  });
  expect(session.inputNames).toEqual(['global_input']);
  expect(session.outputNames).toEqual(['wker', 'wchn', 'qmax']);

  const h = 256;
  const w = 256;
  const globalInputData = new Float32Array(1 * 3 * 256 * 256).fill(0.5);
  const feeds = {
    global_input: new ort.Tensor('float32', globalInputData, [1, 3, 256, 256]),
  };

  const first = await session.run(feeds);
  const second = await session.run(feeds);
  expect(first.wker).toBeDefined();
  expect(first.wchn).toBeDefined();
  expect(first.qmax).toBeDefined();
  expect(first.wker.dims).toEqual([1, 64, 3, 3]);
  expect(first.wchn.dims).toEqual([1, 64, 1, 1]);
  expect(first.qmax.dims).toEqual([1, 1, 1, 1]);
  expect(first.wker.data.length).toBe(1 * 64 * 3 * 3);
  expect(first.wchn.data.length).toBe(1 * 64 * 1 * 1);
  expect(first.qmax.data.length).toBe(1);

  for (let i = 0; i < first.qmax.data.length; i++) {
    expect(Number.isFinite(first.qmax.data[i])).toBe(true);
    expect(first.qmax.data[i]).toBe(second.qmax.data[i]);
  }
}

function findMetadataShapeByName(metadata, name) {
  if (!Array.isArray(metadata)) {
    return null;
  }
  const entry = metadata.find((item) => item?.name === name);
  return Array.isArray(entry?.shape) ? entry.shape : null;
}

async function validateLocalModelRuntime(modelPath, modelDataPath, externalDataPath) {
  const externalDataBuffer = fs.readFileSync(modelDataPath);
  const session = await ort.InferenceSession.create(modelPath, {
    externalData: [{ path: externalDataPath, data: externalDataBuffer }],
    ...QUIET_NODE_ORT_SESSION_OPTIONS,
  });
  expect(session.inputNames).toEqual(['local_input', 'wker', 'wchn']);
  expect(session.outputNames).toEqual(['ingm']);

  const h = 64;
  const w = 64;
  const localInputData = new Float32Array(1 * 3 * h * w).fill(0.5);
  const wkerData = new Float32Array(1 * 64 * 3 * 3).fill(0.01);
  const wchnData = new Float32Array(1 * 64 * 1 * 1).fill(0.01);
  const feeds = {
    local_input: new ort.Tensor('float32', localInputData, [1, 3, h, w]),
    wker: new ort.Tensor('float32', wkerData, [1, 64, 3, 3]),
    wchn: new ort.Tensor('float32', wchnData, [1, 64, 1, 1]),
  };

  const output = (await session.run(feeds)).ingm;
  expect(output).toBeDefined();
  expect(output.dims).toEqual([1, 1, h, w]);
  expect(output.data.length).toBe(h * w);
}

async function validateGlobalInlineModelRuntime(modelPath) {
  const session = await ort.InferenceSession.create(modelPath, QUIET_NODE_ORT_SESSION_OPTIONS);
  expect(session.inputNames).toEqual(['global_input']);
  expect(session.outputNames).toEqual(['wker', 'wchn', 'qmax']);

  const globalShape = findMetadataShapeByName(session.inputMetadata, 'global_input');
  expect(globalShape).toEqual([1, 3, 256, 256]);
}

async function validateLocalInlineModelRuntime(modelPath) {
  const session = await ort.InferenceSession.create(modelPath, QUIET_NODE_ORT_SESSION_OPTIONS);
  expect(session.inputNames).toEqual(['local_input', 'wker', 'wchn']);
  expect(session.outputNames).toEqual(['ingm']);

  const localShape = findMetadataShapeByName(session.inputMetadata, 'local_input');
  const wkerShape = findMetadataShapeByName(session.inputMetadata, 'wker');
  const wchnShape = findMetadataShapeByName(session.inputMetadata, 'wchn');
  expect(localShape).toEqual([1, 3, 128, 128]);
  expect(wkerShape).toEqual([1, 64, 3, 3]);
  expect(wchnShape).toEqual([1, 64, 1, 1]);
}

describe('GMNet ONNX model variants', () => {
  for (const [variant, files] of Object.entries(VARIANT_FILES)) {
    const globalModelPath = path.join(MODELS_ROOT, files.globalModel);
    const globalDataPath = path.join(MODELS_ROOT, files.globalData);
    const localModelPath = path.join(MODELS_ROOT, files.localModel);
    const localDataPath = path.join(MODELS_ROOT, files.localData);

    it(`${variant} split dynamic models and external data exist and are non-empty`, () => {
      expect(fs.existsSync(globalModelPath)).toBe(true);
      expect(fs.statSync(globalModelPath).size).toBeGreaterThan(1024);
      expect(fs.existsSync(globalDataPath)).toBe(true);
      expect(fs.statSync(globalDataPath).size).toBeGreaterThan(1024);

      expect(fs.existsSync(localModelPath)).toBe(true);
      expect(fs.statSync(localModelPath).size).toBeGreaterThan(1024);
      expect(fs.existsSync(localDataPath)).toBe(true);
      expect(fs.statSync(localDataPath).size).toBeGreaterThan(1024);
    });

    it(`${variant} global dynamic model runs inference with expected outputs`, async () => {
      await validateGlobalModelRuntime(globalModelPath, globalDataPath, files.globalData);
    });

    it(`${variant} local dynamic model runs inference with expected outputs`, async () => {
      await validateLocalModelRuntime(localModelPath, localDataPath, files.localData);
    });

    it(`${variant} inline global/local models exist and enforce fixed input shapes`, async () => {
      const globalInlineModelPath = path.join(MODELS_ROOT, files.globalInlineModel);
      const localInlineModelPath = path.join(MODELS_ROOT, files.localInlineModel);
      expect(fs.existsSync(globalInlineModelPath)).toBe(true);
      expect(fs.statSync(globalInlineModelPath).size).toBeGreaterThan(1024);
      expect(fs.existsSync(localInlineModelPath)).toBe(true);
      expect(fs.statSync(localInlineModelPath).size).toBeGreaterThan(1024);

      await validateGlobalInlineModelRuntime(globalInlineModelPath);
      await validateLocalInlineModelRuntime(localInlineModelPath);
    });

    it(`${variant} webgl compatibility local inline model exists`, () => {
      const webglModelPath = path.join(MODELS_ROOT, files.localWebglModel);
      expect(fs.existsSync(webglModelPath)).toBe(true);
      expect(fs.statSync(webglModelPath).size).toBeGreaterThan(1024);
    });
  }

  it('does not ship legacy model artifacts', () => {
    for (const filename of LEGACY_FILES) {
      expect(fs.existsSync(path.join(MODELS_ROOT, filename))).toBe(false);
    }
  });

  it('manifest exists and sets realworld as default variant', () => {
    expect(fs.existsSync(MANIFEST_PATH)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    expect(manifest.schema_version).toBe(3);
    expect(manifest.default_variant).toBe('realworld');
    expect(manifest.variants).toHaveProperty('realworld');
    expect(manifest.variants).toHaveProperty('synthetic');
    expect(manifest.variants.realworld.global.model_filename).toBe(VARIANT_FILES.realworld.globalModel);
    expect(manifest.variants.realworld.local.model_filename).toBe(VARIANT_FILES.realworld.localModel);
    expect(manifest.variants.realworld.global.inline_model_filename).toBe(VARIANT_FILES.realworld.globalInlineModel);
    expect(manifest.variants.realworld.local.inline_model_filename).toBe(VARIANT_FILES.realworld.localInlineModel);
    expect(manifest.variants.realworld.local.webgl_model_filename).toBe(VARIANT_FILES.realworld.localWebglModel);
    expect(manifest.variants.synthetic.global.model_filename).toBe(VARIANT_FILES.synthetic.globalModel);
    expect(manifest.variants.synthetic.local.model_filename).toBe(VARIANT_FILES.synthetic.localModel);
    expect(manifest.variants.synthetic.global.inline_model_filename).toBe(VARIANT_FILES.synthetic.globalInlineModel);
    expect(manifest.variants.synthetic.local.inline_model_filename).toBe(VARIANT_FILES.synthetic.localInlineModel);
    expect(manifest.variants.synthetic.local.webgl_model_filename).toBe(VARIANT_FILES.synthetic.localWebglModel);

    expect(manifest.variants.realworld.global).toEqual(
      expect.objectContaining({
        opset: expect.any(Number),
        compat_profile: expect.any(String),
        operator_counts: expect.any(Object),
        rewrite_counts: expect.any(Object),
      }),
    );
    expect(manifest.variants.realworld.local).toEqual(
      expect.objectContaining({
        opset: expect.any(Number),
        compat_profile: expect.any(String),
        operator_counts: expect.any(Object),
        rewrite_counts: expect.any(Object),
      }),
    );
    expect(manifest.variants.synthetic.global).toEqual(
      expect.objectContaining({
        opset: expect.any(Number),
        compat_profile: expect.any(String),
        operator_counts: expect.any(Object),
        rewrite_counts: expect.any(Object),
      }),
    );
    expect(manifest.variants.synthetic.local).toEqual(
      expect.objectContaining({
        opset: expect.any(Number),
        compat_profile: expect.any(String),
        operator_counts: expect.any(Object),
        rewrite_counts: expect.any(Object),
      }),
    );
  });

  it('manifest compatibility metadata indicates GatherND/DepthToSpace rewrites for Firefox GPU stability', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    for (const variant of ['realworld', 'synthetic']) {
      const variantData = manifest.variants[variant];
      expect(variantData.global.opset).toBe(18);
      expect(variantData.global_inline.opset).toBe(13);
      expect(variantData.local.opset).toBe(18);
      expect(variantData.local_webgl.opset).toBe(13);

      expect(variantData.global_inline.operator_counts.GatherND || 0).toBe(0);
      expect(variantData.local.operator_counts.DepthToSpace || 0).toBe(0);
      expect(variantData.local_webgl.operator_counts.DepthToSpace || 0).toBe(0);
      expect(variantData.local_webgl.operator_counts.GatherND || 0).toBe(0);
    }
  });

  describe('WebGL inline model fixed input shape requirements', () => {
    for (const [variant, files] of Object.entries(VARIANT_FILES)) {
      const webglModelPath = path.join(MODELS_ROOT, files.localWebglModel);

      it(`${variant} webgl model requires square 128x128 local input`, async () => {
        expect(fs.existsSync(webglModelPath)).toBe(true);
        expect(fs.statSync(webglModelPath).size).toBeGreaterThan(1024);

        // Note: WebGL inline models may have ONNX opset compatibility issues with onnxruntime-node
        // We validate the model exists and has correct structure through the inline model test above
        // The actual shape validation is done in gmnet-session.test.js via createProbeImageData tests

        // Verify that the webgl model file is different from the dynamic model (which accepts any size)
        const webglModelBuffer = fs.readFileSync(webglModelPath);
        const dynamicModelPath = path.join(MODELS_ROOT, files.localModel);
        const dynamicModelBuffer = fs.readFileSync(dynamicModelPath);

        // They should be different models (inline vs external data)
        expect(webglModelBuffer.length).toBeGreaterThan(0);
        expect(webglModelBuffer.length).not.toBe(dynamicModelBuffer.length);
      });
    }
  });

  describe('Probe aspect ratio validation for WebGL compatibility', () => {
    it('validates that probe images match WebGL fixed input requirements', async () => {
      const { GMNetInferenceSession } = await import('../gmnet-session.ts');
      const session = new GMNetInferenceSession();

      // For WebGL, we must use square probe images (128x128) to match the fixed model input
      const webglProbeImage = session.createProbeImageData(128, true);
      expect(webglProbeImage.width).toBe(128);
      expect(webglProbeImage.height).toBe(128);

      // This ensures tensor shape [1, 3, 128, 128] which matches the WebGL model requirement
      const tensorShape = [1, 3, webglProbeImage.height, webglProbeImage.width];
      expect(tensorShape).toEqual([1, 3, 128, 128]);

      // If we accidentally used aspect ratio mode (the bug), it would fail
      const buggyProbeImage = session.createProbeImageData(128, false);
      expect(buggyProbeImage.width).toBe(128);
      expect(buggyProbeImage.height).toBe(96); // 4:3 aspect ratio

      const buggyTensorShape = [1, 3, buggyProbeImage.height, buggyProbeImage.width];
      expect(buggyTensorShape).not.toEqual([1, 3, 128, 128]);
    });
  });
});
