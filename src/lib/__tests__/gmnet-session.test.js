import { IMAGE_MAX_LONG_EDGE } from '../constants.js';
/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createOrtMock() {
  const env = { wasm: {}, webgpu: {} };
  class Tensor {
    constructor(type, data, dims) {
      this.type = type;
      this.data = data;
      this.dims = dims;
    }
  }

  return {
    env,
    Tensor,
    InferenceSession: {
      create: vi.fn(),
    },
  };
}

vi.mock('onnxruntime-web/webgpu', () => createOrtMock());
vi.mock('onnxruntime-web/webgl', () => createOrtMock());
vi.mock('onnxruntime-web/wasm', () => createOrtMock());

function makeImageData(width, height, value = 128) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = value;
    pixels[i + 1] = value;
    pixels[i + 2] = value;
    pixels[i + 3] = 255;
  }
  return new ImageData(pixels, width, height);
}

function makeIngmTensor(width, height, value = 0.5) {
  const data = new Float32Array(width * height);
  data.fill(value);
  return {
    data,
    dims: [1, 1, height, width],
  };
}

function makeDisposableTensor(data, dims = [1], type = 'float32') {
  return {
    data,
    dims,
    type,
    dispose: vi.fn(),
  };
}

describe('GMNetInferenceSession (probe-free split/tile path)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('configures ONNX wasmPaths to only the shipped threaded wasm binaries', async () => {
    const ort = await import('onnxruntime-web/webgpu');

    await import('../gmnet-session.js');

    expect(ort.env.wasm.wasmPaths).toEqual({
      'ort-wasm-simd-threaded.wasm': '/assets/ort-wasm-simd-threaded.wasm',
      'ort-wasm-simd-threaded.jsep.wasm': '/assets/ort-wasm-simd-threaded.jsep.wasm',
      'ort-wasm-simd-threaded.asyncify.wasm': '/assets/ort-wasm-simd-threaded.asyncify.wasm',
      'ort-wasm-simd-threaded.jspi.wasm': '/assets/ort-wasm-simd-threaded.jspi.wasm',
    });
  });

  it('does not block Safari-style user agents when WebGPU is feature-detected', async () => {
    const ort = await import('onnxruntime-web/webgpu');
    ort.InferenceSession.create.mockResolvedValue({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });

    const runtime = {
      navigator: {
        gpu: {},
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      },
      fetch,
      document,
      ImageData,
    };

    const { GMNetInferenceSession, hasWebGpuSupport } = await import('../gmnet-session.js');

    expect(hasWebGpuSupport(runtime)).toBe(true);

    const session = new GMNetInferenceSession({ runtime });
    await session.init('realworld', {
      forceExecutionProviders: ['webgpu'],
    });

    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(2);
    expect(session.activeExecutionProvider).toBe('webgpu');
  });

  it('uses memory-conservative ONNX session options for split sessions', async () => {
    const ort = await import('onnxruntime-web/webgpu');
    ort.InferenceSession.create.mockResolvedValue({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({
      runtime: {
        navigator: { gpu: {}, userAgent: 'UnitTest/1.0' },
        fetch,
        document,
        ImageData,
      },
    });
    await session.init('realworld', {
      forceExecutionProviders: ['webgpu'],
      forceReload: true,
    });

    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(2);
    const globalOptions = ort.InferenceSession.create.mock.calls[0][1];
    const localOptions = ort.InferenceSession.create.mock.calls[1][1];

    expect(globalOptions).toEqual(
      expect.objectContaining({
        enableMemPattern: false,
        enableCpuMemArena: false,
        executionMode: 'sequential',
      }),
    );
    expect(localOptions).toEqual(
      expect.objectContaining({
        enableMemPattern: false,
        enableCpuMemArena: false,
        executionMode: 'sequential',
      }),
    );
  });

  it('resolveGainMapCapability returns a compatibility record without probing side effects', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const session = new GMNetInferenceSession({
      runtime: {
        navigator: { gpu: {}, userAgent: 'UnitTest/1.0' },
        localStorage: storage,
      },
    });

    session.activeExecutionProvider = 'webgpu';
    session.activeModelVariant = 'realworld';
    session.globalSession = { run: vi.fn() };
    session.localSession = { run: vi.fn() };

    const capabilityEvents = [];
    session.on('capability-probe', (event) => capabilityEvents.push(event));

    const result = await session.resolveGainMapCapability();

    expect(result).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        gainMapMaxLongEdge: IMAGE_MAX_LONG_EDGE,
        outputMaxLongEdge: IMAGE_MAX_LONG_EDGE,
      }),
    );
    expect(Array.isArray(result.attempts)).toBe(true);
    expect(result.attempts).toHaveLength(0);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(capabilityEvents).toHaveLength(0);
  });

  it('runs global pass once and local pass for every tile, then finalizes exact output dimensions', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    session.activeModelVariant = 'realworld';
    session.activeExecutionProvider = 'webgpu';
    session.globalSession = {
      run: vi.fn(async () => ({
        wker: { data: new Float32Array([0.1]), dims: [1, 1, 1, 1] },
        wchn: { data: new Float32Array([0.2]), dims: [1, 1, 1, 1] },
        qmax: { data: new Float32Array([1]), dims: [1] },
      })),
    };
    session.localSession = {
      run: vi.fn(async (_feeds) => ({
        ingm: makeIngmTensor(4, 4, 0.5),
      })),
    };

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ type: 'global-tensor' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation(() => ({ type: 'local-tensor' }));

    const tileEvents = [];
    session.on('tile-step', (event) => tileEvents.push(event));

    const input = makeImageData(8, 8, 140);
    const context = await session.prepareTiledInference(input, {
      gmnetTileInputSize: 4,
      gmnetTileHaloPx: 1,
    });
    const tileTotal = context.tiles.length;

    expect(session.globalSession.run).toHaveBeenCalledTimes(1);
    expect(tileTotal).toBeGreaterThan(1);

    for (let tileIndex = 0; tileIndex < tileTotal; tileIndex += 1) {
      await session.runTileStep(context, tileIndex);
    }

    const output = session.finalizeTiledInference(context);
    expect(output).toBeInstanceOf(Uint8ClampedArray);
    expect(output.length).toBe(input.width * input.height * 4);
    expect(session.localSession.run).toHaveBeenCalledTimes(tileTotal);
    expect(tileEvents).toHaveLength(tileTotal);
  });

  it('disposes global and tile tensors and finalizes without persistent accumWeights', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeModelVariant = 'realworld';
    session.activeExecutionProvider = 'webgpu';

    const globalInputTensor = makeDisposableTensor(new Float32Array(1), [1, 1, 1, 1]);
    const localInputTensor = makeDisposableTensor(new Float32Array(4 * 4 * 3), [1, 3, 4, 4]);
    const wker = makeDisposableTensor(new Float32Array([0.1]), [1, 1, 1, 1]);
    const wchn = makeDisposableTensor(new Float32Array([0.2]), [1, 1, 1, 1]);
    const qmax = makeDisposableTensor(new Float32Array([1]), [1, 1, 1, 1]);
    const localOutputTensor = makeDisposableTensor(new Float32Array(4 * 4).fill(0.5), [1, 1, 4, 4]);

    session.globalSession = {
      run: vi.fn(async () => ({
        wker,
        wchn,
        qmax,
      })),
    };
    session.localSession = {
      run: vi.fn(async () => ({
        ingm: localOutputTensor,
      })),
    };
    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue(globalInputTensor);
    vi.spyOn(session, 'createLocalTensorFromSourceTile').mockReturnValue(localInputTensor);

    const input = makeImageData(8, 8, 140);
    const context = await session.prepareTiledInference(input, {
      gmnetTileInputSize: 4,
      gmnetTileHaloPx: 1,
    });

    expect(context.accumWeights).toBeUndefined();

    await session.runTileStep(context, 0);
    expect(localInputTensor.dispose).toHaveBeenCalledTimes(1);
    expect(localOutputTensor.dispose).toHaveBeenCalledTimes(1);
    expect(globalInputTensor.dispose).toHaveBeenCalledTimes(1);

    const output = session.finalizeTiledInference(context);
    expect(output.length).toBe(input.width * input.height * 4);
    expect(wker.dispose).toHaveBeenCalledTimes(1);
    expect(wchn.dispose).toHaveBeenCalledTimes(1);
    expect(qmax.dispose).toHaveBeenCalledTimes(1);
  });

  it('run orchestrates tiled inference end-to-end when split sessions are available', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    const imageData = makeImageData(4, 4, 160);

    session.activeModelVariant = 'realworld';
    session.activeExecutionProvider = 'webgpu';
    session.globalSession = { run: vi.fn() };
    session.localSession = { run: vi.fn() };

    const context = { tiles: [{}, {}] };
    const prepareSpy = vi.spyOn(session, 'prepareTiledInference').mockResolvedValue(context);
    const tileSpy = vi.spyOn(session, 'runTileStep').mockResolvedValue({});
    const finalizeSpy = vi
      .spyOn(session, 'finalizeTiledInference')
      .mockReturnValue(new Uint8ClampedArray(imageData.width * imageData.height * 4));

    await session.run(imageData, {});

    expect(prepareSpy).toHaveBeenCalledTimes(1);
    expect(tileSpy).toHaveBeenCalledTimes(2);
    expect(tileSpy).toHaveBeenNthCalledWith(1, context, 0);
    expect(tileSpy).toHaveBeenNthCalledWith(2, context, 1);
    expect(finalizeSpy).toHaveBeenCalledTimes(1);
  });

  it('run uses legacy monolithic fallback only when split sessions are unavailable', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    const imageData = makeImageData(4, 4, 160);

    session.activeModelVariant = 'realworld';
    session.activeExecutionProvider = 'webgpu';
    session.session = { run: vi.fn() };
    session.globalSession = null;
    session.localSession = null;

    const legacyOutput = new Uint8ClampedArray(imageData.width * imageData.height * 4);
    const legacySpy = vi.spyOn(session, 'runLegacyMonolithic').mockResolvedValue(legacyOutput);

    const output = await session.run(imageData, {});

    expect(legacySpy).toHaveBeenCalledTimes(1);
    expect(output).toBe(legacyOutput);
  });
});
