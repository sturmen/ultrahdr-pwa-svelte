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
    model: 'gmnet-realworld.onnx',
    data: 'gmnet-realworld.onnx.data',
  },
  synthetic: {
    model: 'gmnet-synthetic.onnx',
    data: 'gmnet-synthetic.onnx.data',
  },
};
const LEGACY_FILES = ['gmnet.onnx', 'gmnet.onnx.data'];

async function validateModelRuntime(modelPath, modelDataPath) {
  const externalDataBuffer = fs.readFileSync(modelDataPath);
  const session = await ort.InferenceSession.create(modelPath, {
    externalData: [{ path: 'gmnet.onnx.data', data: externalDataBuffer }],
  });
  expect(session.inputNames).toEqual(['local_input', 'global_input']);
  expect(session.outputNames).toEqual(['gain_map']);

  const h = 64;
  const w = 64;
  const localInputData = new Float32Array(1 * 3 * h * w).fill(0.5);
  const globalInputData = new Float32Array(1 * 3 * 256 * 256).fill(0.5);
  const feeds = {
    local_input: new ort.Tensor('float32', localInputData, [1, 3, h, w]),
    global_input: new ort.Tensor('float32', globalInputData, [1, 3, 256, 256]),
  };

  const first = (await session.run(feeds)).gain_map;
  const second = (await session.run(feeds)).gain_map;

  expect(first).toBeDefined();
  expect(first.dims).toEqual([1, 1, h, w]);
  expect(first.data.length).toBe(1 * h * w);

  for (let i = 0; i < first.data.length; i++) {
    expect(Number.isFinite(first.data[i])).toBe(true);
    expect(first.data[i]).toBe(second.data[i]);
  }
}

describe('GMNet ONNX model variants', () => {
  for (const [variant, files] of Object.entries(VARIANT_FILES)) {
    const modelPath = path.join(MODELS_ROOT, files.model);
    const modelDataPath = path.join(MODELS_ROOT, files.data);

    it(`${variant} model and external data exist and are non-empty`, () => {
      expect(fs.existsSync(modelPath)).toBe(true);
      expect(fs.statSync(modelPath).size).toBeGreaterThan(1024);

      expect(fs.existsSync(modelDataPath)).toBe(true);
      expect(fs.statSync(modelDataPath).size).toBeGreaterThan(1024);
    });

    it(`${variant} model runs inference with expected dynamic shape output`, async () => {
      await validateModelRuntime(modelPath, modelDataPath);
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

    expect(manifest.default_variant).toBe('realworld');
    expect(manifest.variants).toHaveProperty('realworld');
    expect(manifest.variants).toHaveProperty('synthetic');
    expect(manifest.variants.realworld.model_filename).toBe(VARIANT_FILES.realworld.model);
    expect(manifest.variants.synthetic.model_filename).toBe(VARIANT_FILES.synthetic.model);
  });
});
