import { IMAGE_MAX_LONG_EDGE, GMNET_MAX_LONG_EDGE } from '../constants.js';
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
vi.mock('onnxruntime-web/all', () => createOrtMock());

describe('GMNetInferenceSession runtime config', () => {
  let originalNavigatorGpuDescriptor;
  let originalNavigatorHardwareConcurrencyDescriptor;
  let originalNavigatorUserAgentDescriptor;
  let originalCrossOriginIsolatedDescriptor;

  beforeEach(() => {
    vi.resetModules();
    if (!originalNavigatorGpuDescriptor) {
      originalNavigatorGpuDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, 'gpu');
    }
    if (!originalNavigatorHardwareConcurrencyDescriptor) {
      originalNavigatorHardwareConcurrencyDescriptor = Object.getOwnPropertyDescriptor(
        Navigator.prototype,
        'hardwareConcurrency',
      );
    }
    if (!originalNavigatorUserAgentDescriptor) {
      originalNavigatorUserAgentDescriptor = Object.getOwnPropertyDescriptor(
        Navigator.prototype,
        'userAgent',
      );
    }
    if (!originalCrossOriginIsolatedDescriptor) {
      originalCrossOriginIsolatedDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        'crossOriginIsolated',
      );
    }
    if (originalNavigatorGpuDescriptor) {
      Object.defineProperty(Navigator.prototype, 'gpu', originalNavigatorGpuDescriptor);
    } else {
      Reflect.deleteProperty(Navigator.prototype, 'gpu');
    }
    if (originalNavigatorHardwareConcurrencyDescriptor) {
      Object.defineProperty(
        Navigator.prototype,
        'hardwareConcurrency',
        originalNavigatorHardwareConcurrencyDescriptor,
      );
    } else {
      Reflect.deleteProperty(Navigator.prototype, 'hardwareConcurrency');
    }
    if (originalNavigatorUserAgentDescriptor) {
      Object.defineProperty(Navigator.prototype, 'userAgent', originalNavigatorUserAgentDescriptor);
    } else {
      Reflect.deleteProperty(Navigator.prototype, 'userAgent');
    }
    if (originalCrossOriginIsolatedDescriptor) {
      Object.defineProperty(globalThis, 'crossOriginIsolated', originalCrossOriginIsolatedDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'crossOriginIsolated');
    }
  });

  it('configures ONNX runtime for browser-safe wasm loading when isolation is unavailable', async () => {
    Object.defineProperty(globalThis, 'crossOriginIsolated', {
      configurable: true,
      value: false,
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};

    await import('../gmnet-session.js');

    expect(ort.env.wasm.numThreads).toBe(1);
    expect(ort.env.wasm.proxy).toBe(false);
    expect(typeof ort.env.wasm.wasmPaths).toBe('object');
    expect(ort.env.wasm.wasmPaths['ort-wasm-simd-threaded.jsep.wasm']).toContain('/assets/');
    expect(ort.env.webgpu.powerPreference).toBe('high-performance');
  });

  it('enables multithreaded wasm when cross-origin isolation is available', async () => {
    Object.defineProperty(globalThis, 'crossOriginIsolated', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    });
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    });

    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};

    await import('../gmnet-session.js');

    expect(ort.env.wasm.numThreads).toBe(4);
    expect(ort.env.wasm.proxy).toBe(false);
  });

  it('forces single-thread wasm on WebKit runtimes for startup compatibility', async () => {
    Object.defineProperty(globalThis, 'crossOriginIsolated', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    });
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15',
    });

    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};

    await import('../gmnet-session.js');

    expect(ort.env.wasm.numThreads).toBe(1);
  });

  it('postprocess expands mono tensor output into RGBA bytes', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    const output = session.postprocess(
      { data: new Float32Array([0, 0.5, 1, 2]) },
      2,
      2,
    );

    expect(output.constructor?.name).toBe('Uint8ClampedArray');
    expect(output.length).toBe(2 * 2 * 4);
    expect(output.length).toBe(16);
    expect(Array.from(output.slice(0, 4))).toEqual([0, 0, 0, 255]);
    expect(Array.from(output.slice(4, 8))).toEqual([127, 127, 127, 255]);
    expect(Array.from(output.slice(8, 12))).toEqual([255, 255, 255, 255]);
    expect(Array.from(output.slice(12, 16))).toEqual([255, 255, 255, 255]);
  });

  it('initializes default realworld ORT session with explicit external ONNX data mapping', async () => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      value: {},
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    await session.init();

    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(1);
    const [modelUrl, options] = ort.InferenceSession.create.mock.calls[0];
    expect(String(modelUrl)).toContain('/models/gmnet-realworld.onnx');
    expect(options.executionProviders).toEqual(['webgpu']);
    expect(options.externalData).toEqual([
      {
        path: 'gmnet.onnx.data',
        data: expect.stringContaining('/models/gmnet-realworld.onnx.data'),
      },
    ]);
  });

  it('fails fast when webgpu runtime is unavailable', async () => {
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({
      runtime: {
        navigator: {},
      },
    });

    await expect(
      session.init('realworld', { forceExecutionProviders: ['webgpu'] }),
    ).rejects.toMatchObject({
      name: 'GmnetWebGpuUnavailableError',
    });
    expect(ort.InferenceSession.create).not.toHaveBeenCalled();
  });

  it('initializes a webgl session when explicitly requested', async () => {
    const ort = await import('onnxruntime-web/all');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['webgl'],
    });

    const runtime = {
      navigator: {},
      fetch: vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
      })),
      document: {
        createElement: () => ({
          getContext: (name) => (name === 'webgl' ? {} : null),
        }),
      },
      OffscreenCanvas: undefined,
    };

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({ runtime });

    await session.init('realworld', { forceExecutionProviders: ['webgl'] });

    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(1);
    const [modelPayload, options] = ort.InferenceSession.create.mock.calls[0];
    expect(modelPayload).toBeInstanceOf(Uint8Array);
    expect(modelPayload).toHaveLength(4);
    expect(options.executionProviders).toEqual(['webgl']);
    expect(runtime.fetch).toHaveBeenCalledTimes(1);
    const fetchedUrls = runtime.fetch.mock.calls.map(([url]) => String(url));
    expect(fetchedUrls.some((url) => url.includes('/models/gmnet-realworld-inline-webgl.onnx'))).toBe(true);
    expect(fetchedUrls.some((url) => url.includes('/models/gmnet-realworld-inline.onnx'))).toBe(false);
    expect(runtime.fetch.mock.calls[0][1]).toMatchObject({ credentials: 'same-origin' });
    expect(options.externalData).toBeUndefined();
    expect(session.activeExecutionProvider).toBe('webgl');
  });


  it('loads the WebGL compatibility model on Firefox runtimes', async () => {
    const ort = await import('onnxruntime-web/all');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['webgl'],
    });

    const runtime = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
      },
      fetch: vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
      })),
      document: {
        createElement: () => ({
          getContext: (name) => (name === 'webgl' ? {} : null),
        }),
      },
      OffscreenCanvas: undefined,
    };

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({ runtime });

    await session.init('realworld', { forceExecutionProviders: ['webgl'] });

    const fetchedUrls = runtime.fetch.mock.calls.map(([url]) => String(url));
    expect(fetchedUrls.some((url) => url.includes('/models/gmnet-realworld-inline-webgl.onnx'))).toBe(true);
    expect(fetchedUrls.some((url) => url.includes('/models/gmnet-realworld-inline.onnx'))).toBe(false);
  });

  it('does not set WebGPU powerPreference on Windows', async () => {
    Object.defineProperty(Navigator.prototype, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};

    await import('../gmnet-session.js');

    expect(ort.env.webgpu.powerPreference).toBeUndefined();
  });

  it('fails webgl init when external model data cannot be fetched', async () => {
    const ort = await import('onnxruntime-web/all');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();

    const runtime = {
      navigator: {},
      fetch: vi.fn(async () => ({
        ok: false,
        status: 503,
        arrayBuffer: async () => new ArrayBuffer(0),
      })),
      document: {
        createElement: () => ({
          getContext: (name) => (name === 'webgl' ? {} : null),
        }),
      },
      OffscreenCanvas: undefined,
    };

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({ runtime });

    await expect(
      session.init('realworld', { forceExecutionProviders: ['webgl'] }),
    ).rejects.toThrow(/Failed to load GMNet ONNX model: 503/i);
    expect(ort.InferenceSession.create).not.toHaveBeenCalled();
  });

  it('emits runtime telemetry with webgpu as the active execution provider', async () => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      value: {},
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });
    const runtimeListener = vi.fn();

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.on('runtime', runtimeListener);
    await session.init();

    expect(runtimeListener).toHaveBeenCalledWith(
      expect.objectContaining({
        executionProvider: 'webgpu',
        requestedExecutionProviders: ['webgpu'],
      }),
    );
  });

  it('logs the selected execution provider to console during init', async () => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      value: {},
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => { });

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    await session.init();

    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[GMNet\] Execution provider: webgpu/i),
    );
    infoSpy.mockRestore();
  });

  it('re-emits runtime telemetry when reusing a cached variant session', async () => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      value: {},
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });
    const runtimeListener = vi.fn();

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.on('runtime', runtimeListener);
    await session.init('realworld');
    runtimeListener.mockClear();
    await session.init('realworld');

    expect(runtimeListener).toHaveBeenCalledWith(
      expect.objectContaining({
        executionProvider: 'webgpu',
        modelVariant: 'realworld',
      }),
    );
  });

  it('loads the synthetic model variant when requested', async () => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      value: {},
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockResolvedValue({
      run: vi.fn(),
      executionProviders: ['webgpu'],
    });
    ort.InferenceSession.create.mockClear();

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    await session.init('synthetic');

    const [modelUrl, options] = ort.InferenceSession.create.mock.calls[0];
    expect(String(modelUrl)).toContain('/models/gmnet-synthetic.onnx');
    expect(options.executionProviders).toEqual(['webgpu']);
    expect(options.externalData).toEqual([
      {
        path: 'gmnet.onnx.data',
        data: expect.stringContaining('/models/gmnet-synthetic.onnx.data'),
      },
    ]);
  });

  it('runs inference at the provided local resolution without internal downscaling', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    session.session = {
      run: vi.fn(async (feeds) => {
        const h = feeds.local_input.dims[2];
        const w = feeds.local_input.dims[3];
        return { gain_map: { data: new Float32Array(h * w).fill(0.5) } };
      }),
    };
    session.activeExecutionProvider = 'webgpu';

    const preprocessGlobalSpy = vi
      .spyOn(session, 'preprocessGlobal')
      .mockResolvedValue({ kind: 'global' });
    const preprocessLocalSpy = vi
      .spyOn(session, 'preprocessLocal')
      .mockImplementation((_imageData, width, height) => ({
        kind: 'local',
        dims: [1, 3, height, width],
      }));

    const inputWidth = 1200;
    const inputHeight = 1200;
    const image = new ImageData(
      new Uint8ClampedArray(inputWidth * inputHeight * 4),
      inputWidth,
      inputHeight,
    );

    const result = await session.run(image);

    expect(preprocessGlobalSpy).toHaveBeenCalledTimes(1);
    expect(preprocessLocalSpy).toHaveBeenCalledTimes(1);

    const localDims = session.session.run.mock.calls[0][0].local_input.dims;
    const inferenceHeight = localDims[2];
    const inferenceWidth = localDims[3];
    expect(inferenceWidth).toBe(inputWidth);
    expect(inferenceHeight).toBe(inputHeight);

    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(inputWidth * inputHeight * 4);
  });

  it('uses fixed 128x128 local inference dimensions for webgl', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    const inputWidth = 320;
    const inputHeight = 240;

    session.session = {
      run: vi.fn(async (feeds) => {
        expect(feeds.local_input.dims).toEqual([1, 3, 128, 128]);
        return { gain_map: { data: new Float32Array(inputWidth * inputHeight).fill(0.5), dims: [1, 1, inputHeight, inputWidth] } };
      }),
    };
    session.activeExecutionProvider = 'webgl';

    const preprocessGlobalSpy = vi
      .spyOn(session, 'preprocessGlobal')
      .mockResolvedValue({ kind: 'global' });
    const preprocessLocalSpy = vi
      .spyOn(session, 'preprocessLocal')
      .mockImplementation((_imageData, width, height) => ({
        kind: 'local',
        dims: [1, 3, height, width],
      }));

    const image = new ImageData(
      new Uint8ClampedArray(inputWidth * inputHeight * 4),
      inputWidth,
      inputHeight,
    );

    const result = await session.run(image);

    expect(preprocessGlobalSpy).toHaveBeenCalledTimes(1);
    expect(preprocessLocalSpy).toHaveBeenCalledTimes(1);
    const [localImageData, localWidth, localHeight] = preprocessLocalSpy.mock.calls[0];
    expect(localWidth).toBe(128);
    expect(localHeight).toBe(128);
    expect(localImageData.width).toBe(128);
    expect(localImageData.height).toBe(128);
    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(inputWidth * inputHeight * 4);
  });

  it('does not force fixed 128 local inference dimensions for firefox webgpu', async () => {
    const runtime = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:129.0) Gecko/20100101 Firefox/129.0',
      },
      document,
      OffscreenCanvas: undefined,
      ImageData,
    };
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({ runtime });

    const inputWidth = 320;
    const inputHeight = 240;
    session.session = {
      run: vi.fn(async (feeds) => {
        expect(feeds.local_input.dims).toEqual([1, 3, inputHeight, inputWidth]);
        return {
          gain_map: {
            data: new Float32Array(inputWidth * inputHeight).fill(0.5),
            dims: [1, 1, inputHeight, inputWidth],
          },
        };
      }),
    };
    session.activeExecutionProvider = 'webgpu';

    const preprocessGlobalSpy = vi
      .spyOn(session, 'preprocessGlobal')
      .mockResolvedValue({ kind: 'global' });
    const preprocessLocalSpy = vi
      .spyOn(session, 'preprocessLocal')
      .mockImplementation((_imageData, width, height) => ({
        kind: 'local',
        dims: [1, 3, height, width],
      }));

    const image = new ImageData(
      new Uint8ClampedArray(inputWidth * inputHeight * 4),
      inputWidth,
      inputHeight,
    );

    const result = await session.run(image);

    expect(preprocessGlobalSpy).toHaveBeenCalledTimes(1);
    expect(preprocessLocalSpy).toHaveBeenCalledTimes(1);
    const [localImageData, localWidth, localHeight] = preprocessLocalSpy.mock.calls[0];
    expect(localWidth).toBe(inputWidth);
    expect(localHeight).toBe(inputHeight);
    expect(localImageData.width).toBe(inputWidth);
    expect(localImageData.height).toBe(inputHeight);
    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(inputWidth * inputHeight * 4);
  });

  it('supports explicit localInputMaxLongEdge for provider-safe scaling', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    const inputWidth = 2000;
    const inputHeight = 1000;
    session.session = {
      run: vi.fn(async (feeds) => {
        expect(feeds.local_input.dims).toEqual([1, 3, 256, 512]);
        return {
          gain_map: {
            data: new Float32Array(512 * 256).fill(0.5),
            dims: [1, 1, 256, 512],
          },
        };
      }),
    };
    session.activeExecutionProvider = 'webgpu';

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const image = new ImageData(
      new Uint8ClampedArray(inputWidth * inputHeight * 4),
      inputWidth,
      inputHeight,
    );

    const result = await session.run(image, { localInputMaxLongEdge: 512 });

    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(inputWidth * inputHeight * 4);
  });

  it('resolves fixed-model gain-map capability for webgl provider', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgl';
    session.session = {
      run: vi.fn(async (feeds) => {
        const size = feeds.local_input.dims[2] * feeds.local_input.dims[3];
        const data = new Float32Array(size);
        for (let i = 0; i < size; i += 1) {
          data[i] = (i % 256) / 255;
        }
        return {
          gain_map: {
            data,
            dims: [1, 1, feeds.local_input.dims[2], feeds.local_input.dims[3]],
          },
        };
      }),
    };

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const capability = await session.resolveGainMapCapability();

    expect(capability).toEqual(
      expect.objectContaining({
        provider: 'webgl',
        gainMapMaxLongEdge: expect.any(Number),
        outputMaxLongEdge: expect.any(Number),
      }),
    );
    expect(capability.gainMapMaxLongEdge).toBe(128);
    expect(capability.outputMaxLongEdge).toBe(256);
    expect(capability.source).toBe('fixed-model');
    expect(Array.isArray(capability.attempts)).toBe(true);
    expect(capability.attempts.length).toBeGreaterThan(0);
  });

  it('resolves probed gain-map capability for webgpu provider', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.session = {
      run: vi.fn(async (feeds) => {
        const height = feeds.local_input.dims[2];
        const width = feeds.local_input.dims[3];
        const data = new Float32Array(width * height).fill(0.5);
        data[0] = 1.0; // make it not flat
        return {
          gain_map: {
            data,
            dims: [1, 1, height, width],
          },
        };
      }),
    };

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const capability = await session.resolveGainMapCapability({
      minLongEdge: 128,
      maxLongEdge: 512,
      timeoutMs: 250,
    });

    expect(capability.provider).toBe('webgpu');
    expect(capability.source).toBe('probe-optimistic');
    expect(capability.gainMapMaxLongEdge).toBe(512);
    expect(capability.outputMaxLongEdge).toBe(1024);
    expect(Array.isArray(capability.attempts)).toBe(true);
    expect(capability.attempts.length).toBeGreaterThan(0);
  });

  it('emits capability-probe events per attempt in testing-then-terminal order', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.session = {
      run: vi.fn(async (feeds) => {
        const height = feeds.local_input.dims[2];
        const width = feeds.local_input.dims[3];
        const size = Math.max(width, height);
        if (size > 256) {
          return {
            gain_map: {
              data: new Float32Array(width * height).fill(0), // flat = failed
              dims: [1, 1, height, width],
            },
          };
        }
        const data = new Float32Array(width * height).fill(0.5);
        data[0] = 1.0; // make it not flat
        return {
          gain_map: {
            data,
            dims: [1, 1, height, width],
          },
        };
      }),
    };

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    /** @type {Array<{candidate?: number, phase?: string}>} */
    const probeEvents = [];
    session.on('capability-probe', (event) => {
      probeEvents.push(event || {});
    });

    await session.resolveGainMapCapability({
      minLongEdge: 128,
      maxLongEdge: 512,
      timeoutMs: 250,
    });

    expect(probeEvents.length).toBeGreaterThan(2);
    const candidates = Array.from(new Set(
      probeEvents
        .map((event) => Number(event.candidate))
        .filter((candidate) => Number.isFinite(candidate)),
    ));
    expect(candidates.length).toBeGreaterThan(1);

    for (const candidate of candidates) {
      const eventsForCandidate = probeEvents.filter(
        (event) => Number(event.candidate) === candidate,
      );
      expect(eventsForCandidate[0]?.phase).toBe('testing');
      expect(['passed', 'failed']).toContain(eventsForCandidate[eventsForCandidate.length - 1]?.phase);
    }
  });

  it('logs per-resolution startup probe attempts and outcomes', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    const mockSession = {
      release: vi.fn(),
      run: vi.fn(async (feeds) => {
        const height = feeds.local_input.dims[2];
        const width = feeds.local_input.dims[3];
        const size = Math.max(width, height);
        if (size > 256) {
          throw new Error(`probe rejected at ${size}`);
        }
        const data = new Float32Array(width * height).fill(0.5);
        data[0] = 1.0; // make it not flat
        return {
          gain_map: {
            data,
            dims: [1, 1, height, width],
          },
        };
      }),
    };
    session.session = mockSession;
    vi.spyOn(session, 'init').mockImplementation(async () => {
      session.session = mockSession;
    });

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    try {
      const capability = await session.resolveGainMapCapability({
        minLongEdge: 128,
        maxLongEdge: 512,
        timeoutMs: 250,
      });

      expect(capability.gainMapMaxLongEdge).toBeLessThanOrEqual(256);
      expect(
        logSpy.mock.calls.some(([message]) =>
          /\[GMNet capability probe\].*Testing\s+\d+x\d+/i.test(String(message)),
        ),
      ).toBe(true);
      expect(
        logSpy.mock.calls.some(([message]) =>
          /\[GMNet capability probe\].*Passed\s+\d+x\d+/i.test(String(message)),
        ),
      ).toBe(true);
      expect(
        warnSpy.mock.calls.some(([message]) =>
          /\[GMNet capability probe\].*Failed\s+\d+x\d+/i.test(String(message)),
        ),
      ).toBe(true);
    } finally {
      logSpy.mockRestore();
      warnSpy.mockRestore();
    }
  });

  it('honors maxAttempts when probing webgpu capability', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    const mockSession = {
      release: vi.fn(),
      run: vi.fn(async () => {
        // All sizes fail — produces near-flat output
        throw new Error('simulated rejection');
      }),
    };
    session.session = mockSession;
    vi.spyOn(session, 'init').mockImplementation(async () => {
      session.session = mockSession;
    });

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const thrownError = await session.resolveGainMapCapability({
      minLongEdge: 128,
      maxLongEdge: 512,
      timeoutMs: 250,
      maxAttempts: 2,
    }).catch(e => e);

    expect(thrownError).toMatchObject({
      name: 'GmnetCapabilityProbeError',
      diagnostics: expect.objectContaining({
        attempts: expect.any(Array),
      }),
    });
    expect(thrownError.diagnostics.attempts.length).toBeLessThanOrEqual(2); // exactly maxAttempts, no hotspot filtering overhead 
  });

  it('probes above 2048 by default so IMAGE_MAX_LONG_EDGE output remains reachable', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.activeModelVariant = 'realworld';
    session.session = {};

    vi.spyOn(session, 'createProbeImageData').mockImplementation((candidateLongEdge) => ({
      width: candidateLongEdge,
      height: Math.max(1, Math.floor(candidateLongEdge * 2 / 3)),
      data: new Uint8ClampedArray(4),
    }));
    vi.spyOn(session, 'run').mockResolvedValue(new Uint8ClampedArray(4));

    let thrownError;
    try {
      await session.resolveGainMapCapability({ timeoutMs: 250 });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toMatchObject({
      name: 'GmnetCapabilityProbeError',
      diagnostics: expect.objectContaining({
        provider: 'webgpu',
        attempts: expect.any(Array),
      }),
    });

    const attemptedCandidates = thrownError.diagnostics.attempts
      .map((attempt) => Number(attempt?.candidateLongEdge))
      .filter((candidateLongEdge) => Number.isFinite(candidateLongEdge));
    expect(attemptedCandidates.length).toBeGreaterThan(0);
    expect(Math.max(...attemptedCandidates)).toBeGreaterThan(2048);
  });

  it('fails probe with diagnostics when no webgpu candidate passes', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.session = {
      run: vi.fn(async (feeds) => {
        const height = feeds.local_input.dims[2];
        const width = feeds.local_input.dims[3];
        return {
          gain_map: {
            data: new Float32Array(height * width),
            dims: [1, 1, height, width],
          },
        };
      }),
    };

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    await expect(
      session.resolveGainMapCapability({
        minLongEdge: 128,
        maxLongEdge: 128,
        timeoutMs: 250,
      }),
    ).rejects.toMatchObject({
      name: 'GmnetCapabilityProbeError',
      diagnostics: expect.objectContaining({
        provider: 'webgpu',
        attempts: expect.any(Array),
      }),
    });
  });

  it('handles model output dims that differ from local input by resizing back to expected shape', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    session.session = {
      run: vi.fn(async () => ({
        gain_map: {
          data: new Float32Array(6).fill(0.5),
          dims: [1, 1, 2, 3],
        },
      })),
    };
    session.activeExecutionProvider = 'webgpu';

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);
    const result = await session.run(image);

    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(2 * 2 * 4);
  });

  it('throws when runtime resolves a provider that was not requested', async () => {
    const ort = await import('onnxruntime-web/all');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['wasm'],
    });

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({
      runtime: {
        navigator: {},
        fetch: vi.fn(async () => ({
          ok: true,
          arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
        })),
        document: {
          createElement: () => ({
            getContext: (name) => (name === 'webgl' ? {} : null),
          }),
        },
        OffscreenCanvas: undefined,
      },
    });

    await expect(
      session.init('realworld', { forceExecutionProviders: ['webgl'] }),
    ).rejects.toMatchObject({
      name: 'GmnetExecutionProviderMismatchError',
    });
  });

  it('does not retry with wasm when webgpu inference fails at runtime', async () => {
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();

    const webgpuSession = {
      run: vi.fn(async () => {
        throw new Error('webgpu pipeline compile failure');
      }),
    };

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.session = webgpuSession;
    session.activeExecutionProvider = 'webgpu';
    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);

    await expect(session.run(image)).rejects.toThrow(/webgpu pipeline compile failure/i);

    expect(ort.InferenceSession.create).not.toHaveBeenCalled();
    expect(webgpuSession.run).toHaveBeenCalledTimes(1);
  });

  it('reinitializes with the requested provider when run() provider differs from active provider', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    const webgpuSession = {
      run: vi.fn(async () => {
        throw new Error('webgpu session should not run');
      }),
    };
    const webglSession = {
      run: vi.fn(async () => ({
        gain_map: {
          data: new Float32Array([0.1, 0.2, 0.3, 0.4]),
          dims: [1, 1, 2, 2],
        },
      })),
    };

    session.session = webgpuSession;
    session.activeExecutionProvider = 'webgpu';
    session.activeModelVariant = 'realworld';

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));
    const initSpy = vi.spyOn(session, 'init').mockImplementation(async (_variant, options = {}) => {
      expect(options).toEqual(
        expect.objectContaining({
          forceExecutionProviders: ['webgl'],
          forceReload: true,
        }),
      );
      session.session = webglSession;
      session.activeExecutionProvider = 'webgl';
      session.activeModelVariant = 'realworld';
    });

    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);
    const output = await session.run(image, { forceExecutionProviders: ['webgl'] });

    expect(output.constructor?.name).toBe('Uint8ClampedArray');
    expect(output.length).toBe(2 * 2 * 4);
    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(webgpuSession.run).not.toHaveBeenCalled();
    expect(webglSession.run).toHaveBeenCalledTimes(1);
  });

  it('does not retry with wasm when webgl inference fails at runtime', async () => {
    const ort = await import('onnxruntime-web/all');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();

    const webglSession = {
      run: vi.fn(async () => {
        throw new Error('webgl pipeline compile failure');
      }),
    };

    const runtime = {
      navigator: {},
      document: {
        createElement: () => ({
          getContext: (name) => (name === 'webgl' ? {} : null),
        }),
      },
      OffscreenCanvas: undefined,
    };

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({ runtime });
    session.session = webglSession;
    session.activeExecutionProvider = 'webgl';
    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);

    await expect(session.run(image)).rejects.toThrow(/webgl pipeline compile failure/i);

    expect(ort.InferenceSession.create).not.toHaveBeenCalled();
    expect(webglSession.run).toHaveBeenCalledTimes(1);
  });

  it('logs inference runtime details including provider only', async () => {
    Object.defineProperty(globalThis, 'crossOriginIsolated', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
      configurable: true,
      value: 8,
    });

    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.session = {
      run: vi.fn(async () => ({
        gain_map: {
          data: new Float32Array(4).fill(0.5),
          dims: [1, 1, 2, 2],
        },
      })),
    };
    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    logSpy.mockClear();
    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);

    await session.run(image);

    expect(
      logSpy.mock.calls.some(([message]) =>
        /Executing inference.*provider:\s*webgpu/i.test(String(message)),
      ),
    ).toBe(true);
    expect(
      logSpy.mock.calls.some(([message]) =>
        /cpu cores:/i.test(String(message)),
      ),
    ).toBe(false);
    logSpy.mockRestore();
  });

  it('initializes a wasm session when explicitly requested', async () => {
    const ort = await import('onnxruntime-web/all');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();
    ort.InferenceSession.create.mockResolvedValueOnce({
      run: vi.fn(),
      executionProviders: ['wasm'],
    });

    const runtime = {
      navigator: {},
      fetch: vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
      })),
    };

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession({ runtime });

    await session.init('realworld', { forceExecutionProviders: ['wasm'] });

    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(1);
    const [modelPayload, options] = ort.InferenceSession.create.mock.calls[0];
    expect(modelPayload).toBeInstanceOf(Uint8Array);
    const fetchedUrls = runtime.fetch.mock.calls.map(([url]) => String(url));
    expect(fetchedUrls.some((url) => url.includes('/models/gmnet-realworld.onnx'))).toBe(true);
    expect(fetchedUrls.some((url) => url.includes('/models/gmnet-realworld.onnx.data'))).toBe(true);
    expect(options.executionProviders).toEqual(['wasm']);
    expect(options.externalData).toBeDefined();
    expect(session.activeExecutionProvider).toBe('wasm');
  });

  it('runs inference with wasm execution provider producing valid RGBA output', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    const inputWidth = 320;
    const inputHeight = 240;

    session.session = {
      run: vi.fn(async (feeds) => {
        const h = feeds.local_input.dims[2];
        const w = feeds.local_input.dims[3];
        return {
          gain_map: {
            data: new Float32Array(w * h).fill(0.5),
            dims: [1, 1, h, w],
          },
        };
      }),
    };
    session.activeExecutionProvider = 'wasm';

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const image = new ImageData(
      new Uint8ClampedArray(inputWidth * inputHeight * 4),
      inputWidth,
      inputHeight,
    );

    const result = await session.run(image, { forceExecutionProviders: ['wasm'] });

    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(inputWidth * inputHeight * 4);
  });

  it('applies local input max long-edge scaling when using wasm provider', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    const inputWidth = 640;
    const inputHeight = 480;
    const localDimsUsed = [];

    session.session = {
      run: vi.fn(async (feeds) => {
        const h = feeds.local_input.dims[2];
        const w = feeds.local_input.dims[3];
        localDimsUsed.push({ width: w, height: h });
        return {
          gain_map: {
            data: new Float32Array(w * h).fill(0.5),
            dims: [1, 1, h, w],
          },
        };
      }),
    };
    session.activeExecutionProvider = 'wasm';

    vi.spyOn(session, 'preprocessGlobal').mockResolvedValue({ kind: 'global' });
    vi.spyOn(session, 'preprocessLocal').mockImplementation((_imageData, width, height) => ({
      kind: 'local',
      dims: [1, 3, height, width],
    }));

    const image = new ImageData(
      new Uint8ClampedArray(inputWidth * inputHeight * 4),
      inputWidth,
      inputHeight,
    );

    const result = await session.run(image, {
      forceExecutionProviders: ['wasm'],
      localInputMaxLongEdge: 128,
    });

    expect(result.constructor?.name).toBe('Uint8ClampedArray');
    expect(result.length).toBe(inputWidth * inputHeight * 4);
    expect(localDimsUsed).toEqual([{ width: 128, height: 96 }]);
  });

  it('returns wasm-unlimited capability without running probes for wasm provider', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'wasm';
    session.session = {
      run: vi.fn(async () => {
        throw new Error('probing should not occur for wasm');
      }),
    };

    const capability = await session.resolveGainMapCapability({
      forceExecutionProviders: ['wasm'],
    });

    expect(capability.provider).toBe('wasm');
    expect(capability.source).toBe('wasm-unlimited');
    expect(capability.gainMapMaxLongEdge).toBe(16384);
    expect(capability.outputMaxLongEdge).toBe(32768);
    expect(session.session.run).not.toHaveBeenCalled();
  });
});

describe('ProbeStateManager', () => {
  let ProbeStateManager;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../gmnet-session.js');
    ProbeStateManager = mod.ProbeStateManager;
  });

  it('writes before-probe state to storage and logs to console', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const storage = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; }, removeItem(k) { delete this.data[k]; } };
    const manager = new ProbeStateManager({ storage });

    manager.writeBeforeProbe(2048, 'webgpu');

    const state = JSON.parse(storage.getItem('ultrahdr:probe-state:v1'));
    expect(state).toMatchObject({ candidate: 2048, provider: 'webgpu', phase: 'running' });
    expect(typeof state.timestamp).toBe('number');
    expect(logSpy.mock.calls.some(([msg]) => /\[GMNet probe state\].*before.*2048/i.test(String(msg)))).toBe(true);
    logSpy.mockRestore();
  });

  it('writes after-probe state to storage and logs to console', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const storage = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; }, removeItem(k) { delete this.data[k]; } };
    const manager = new ProbeStateManager({ storage });

    manager.writeBeforeProbe(4094, 'webgpu');
    manager.writeAfterProbe(4094, 'webgpu', 'passed');

    const state = JSON.parse(storage.getItem('ultrahdr:probe-state:v1'));
    expect(state).toMatchObject({ candidate: 4094, provider: 'webgpu', phase: 'passed' });
    expect(logSpy.mock.calls.some(([msg]) => /\[GMNet probe state\].*after.*4094.*passed/i.test(String(msg)))).toBe(true);
    logSpy.mockRestore();
  });

  it('detects a crash when phase is running on recovery', () => {
    const storage = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; }, removeItem(k) { delete this.data[k]; } };
    // Simulate a previous crash: state left as 'running'
    storage.setItem('ultrahdr:probe-state:v1', JSON.stringify({
      candidate: 2048,
      provider: 'webgpu',
      phase: 'running',
      timestamp: Date.now() - 5000,
    }));

    const manager = new ProbeStateManager({ storage });
    const crashInfo = manager.detectCrash();

    expect(crashInfo).toMatchObject({ candidate: 2048, provider: 'webgpu', phase: 'running' });
  });

  it('does not detect a crash when phase is passed', () => {
    const storage = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; }, removeItem(k) { delete this.data[k]; } };
    storage.setItem('ultrahdr:probe-state:v1', JSON.stringify({
      candidate: 2048,
      provider: 'webgpu',
      phase: 'passed',
      timestamp: Date.now(),
    }));

    const manager = new ProbeStateManager({ storage });
    const crashInfo = manager.detectCrash();

    expect(crashInfo).toBeNull();
  });

  it('clears state after probe completion', () => {
    const storage = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; }, removeItem(k) { delete this.data[k]; } };
    storage.setItem('ultrahdr:probe-state:v1', JSON.stringify({
      candidate: 2048,
      provider: 'webgpu',
      phase: 'passed',
      timestamp: Date.now(),
    }));

    const manager = new ProbeStateManager({ storage });
    manager.clearState();

    expect(storage.getItem('ultrahdr:probe-state:v1')).toBeNull();
  });

  it('handles missing storage gracefully', () => {
    const manager = new ProbeStateManager({ storage: null });

    expect(() => manager.writeBeforeProbe(2048, 'webgpu')).not.toThrow();
    expect(() => manager.writeAfterProbe(2048, 'webgpu', 'passed')).not.toThrow();
    expect(manager.detectCrash()).toBeNull();
    expect(() => manager.clearState()).not.toThrow();
  });
});

describe('isMobileDevice', () => {
  let isMobileDevice;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../gmnet-session.js');
    isMobileDevice = mod.isMobileDevice;
  });

  it('returns true for Android user agent', () => {
    const runtime = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/122.0 Mobile Safari/537.36',
      },
    };
    expect(isMobileDevice(runtime)).toBe(true);
  });

  it('returns true for iPhone user agent', () => {
    const runtime = {
      navigator: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      },
    };
    expect(isMobileDevice(runtime)).toBe(true);
  });

  it('returns true for iPad via maxTouchPoints', () => {
    const runtime = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        maxTouchPoints: 5,
      },
    };
    expect(isMobileDevice(runtime)).toBe(true);
  });

  it('returns false for desktop Chrome user agent', () => {
    const runtime = {
      navigator: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        maxTouchPoints: 0,
      },
    };
    expect(isMobileDevice(runtime)).toBe(false);
  });

  it('returns false for desktop macOS without touch', () => {
    const runtime = {
      navigator: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        maxTouchPoints: 0,
      },
    };
    expect(isMobileDevice(runtime)).toBe(false);
  });
});

describe('binarySearchMaxCapability', () => {
  let binarySearchMaxCapability;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../gmnet-session.js');
    binarySearchMaxCapability = mod.binarySearchMaxCapability;
  });

  it('narrows range to exact max passing candidate', async () => {
    // Max passing value is 700
    const evaluate = vi.fn(async (candidate) => candidate <= 700);
    const result = await binarySearchMaxCapability(512, 1024, evaluate);

    expect(result).toBe(700);
  });

  it('returns low bound when only it passes', async () => {
    const evaluate = vi.fn(async (candidate) => candidate <= 128);
    const result = await binarySearchMaxCapability(128, 256, evaluate);

    expect(result).toBe(128);
  });

  it('returns null when nothing passes', async () => {
    const evaluate = vi.fn(async () => false);
    const result = await binarySearchMaxCapability(128, 256, evaluate);

    expect(result).toBeNull();
  });
});

describe('GMNet probe image aspect ratio handling', () => {
  let GMNetInferenceSession;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../gmnet-session.js');
    GMNetInferenceSession = mod.GMNetInferenceSession;
  });

  it('creates square probe images for WebGL inline models', async () => {
    const session = new GMNetInferenceSession();

    // Test with forceSquare=true (WebGL case)
    const squareImage = session.createProbeImageData(128, true);
    expect(squareImage.width).toBe(128);
    expect(squareImage.height).toBe(128);
  });

  it('creates 4:3 aspect ratio probe images for WebGPU by default', async () => {
    const session = new GMNetInferenceSession();

    // Test with forceSquare=false (WebGPU case) - uses 3/4 height ratio
    const image128 = session.createProbeImageData(128, false);
    expect(image128.width).toBe(128);
    expect(image128.height).toBe(96); // 128 * 3/4 = 96

    const image512 = session.createProbeImageData(512, false);
    expect(image512.width).toBe(512);
    expect(image512.height).toBe(384); // 512 * 3/4 = 384
  });

  it('validates probe output length matches expected dimensions', async () => {
    const session = new GMNetInferenceSession();

    // Create a square probe image (WebGL case)
    const squareImage = session.createProbeImageData(128, true);
    const expectedLength = squareImage.width * squareImage.height * 4; // RGBA

    expect(expectedLength).toBe(65536); // 128 * 128 * 4

    // Create a 4:3 probe image (WebGPU case)
    const aspectRatioImage = session.createProbeImageData(128, false);
    const expectedAspectRatioLength = aspectRatioImage.width * aspectRatioImage.height * 4;

    expect(expectedAspectRatioLength).toBe(49152); // 128 * 96 * 4
  });

  it('handles edge case of very small probe dimensions', async () => {
    const session = new GMNetInferenceSession();

    // Test minimum size with square mode
    const minSquare = session.createProbeImageData(1, true);
    expect(minSquare.width).toBe(1);
    expect(minSquare.height).toBe(1);

    // Test minimum size with aspect ratio mode
    const minAspect = session.createProbeImageData(1, false);
    expect(minAspect.width).toBe(1);
    expect(minAspect.height).toBe(1); // Math.max(1, 1 * 3/4) = 1
  });

  it('simulates WebGL inline model input tensor shape validation', async () => {
    const session = new GMNetInferenceSession();

    // For WebGL, the probe should create square images that match the fixed 128x128 requirement
    const webglProbeImage = session.createProbeImageData(128, true);

    // Simulate what preprocessLocal would do - convert to CHW tensor [1, 3, height, width]
    const float32Data = new Float32Array(3 * webglProbeImage.width * webglProbeImage.height);
    for (let i = 0; i < webglProbeImage.width * webglProbeImage.height; i++) {
      const r = webglProbeImage.data[i * 4] / 255.0;
      float32Data[i] = r; // R channel
      float32Data[webglProbeImage.width * webglProbeImage.height + i] =
        webglProbeImage.data[i * 4 + 1] / 255.0; // G channel
      float32Data[2 * webglProbeImage.width * webglProbeImage.height + i] =
        webglProbeImage.data[i * 4 + 2] / 255.0; // B channel
    }

    const tensorShape = [1, 3, webglProbeImage.height, webglProbeImage.width];

    // WebGL inline model expects exactly [1, 3, 128, 128]
    expect(tensorShape).toEqual([1, 3, 128, 128]);
  });

  it('detects aspect ratio mismatch that would cause WebGL tensor shape error', async () => {
    const session = new GMNetInferenceSession();

    // If we accidentally created a non-square image for WebGL (the bug)
    const buggyImage = session.createProbeImageData(128, false); // 4:3 aspect ratio

    expect(buggyImage.width).toBe(128);
    expect(buggyImage.height).toBe(96);

    // This would cause tensor shape [1, 3, 96, 128] instead of expected [1, 3, 128, 128]
    const buggyTensorShape = [1, 3, buggyImage.height, buggyImage.width];
    expect(buggyTensorShape).not.toEqual([1, 3, 128, 128]);

    // The correct approach is to use forceSquare=true for WebGL
    const correctImage = session.createProbeImageData(128, true);
    const correctTensorShape = [1, 3, correctImage.height, correctImage.width];
    expect(correctTensorShape).toEqual([1, 3, 128, 128]);
  });

  it('validates output length calculation for different probe dimensions', async () => {
    const session = new GMNetInferenceSession();

    // Test various sizes with both square and aspect ratio modes
    const testSizes = [64, 128, 256, 512];

    for (const size of testSizes) {
      // Square mode (WebGL)
      const squareImage = session.createProbeImageData(size, true);
      const expectedSquareLength = squareImage.width * squareImage.height * 4;

      expect(squareImage.width).toBe(size);
      expect(squareImage.height).toBe(size);
      expect(expectedSquareLength).toBe(size * size * 4);

      // Aspect ratio mode (WebGPU) - uses 3/4 height
      const aspectRatioImage = session.createProbeImageData(size, false);
      const expectedAspectRatioHeight = Math.max(1, Math.floor(size * 3 / 4));
      const expectedAspectRatioLength = aspectRatioImage.width * aspectRatioImage.height * 4;

      expect(aspectRatioImage.width).toBe(size);
      expect(aspectRatioImage.height).toBe(expectedAspectRatioHeight);
      expect(expectedAspectRatioLength).toBe(size * expectedAspectRatioHeight * 4);
    }
  });
});
