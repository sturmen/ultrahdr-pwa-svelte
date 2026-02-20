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
    expect(runtime.fetch.mock.calls[0][1]).toMatchObject({ credentials: 'same-origin' });
    expect(options.externalData).toBeUndefined();
    expect(session.activeExecutionProvider).toBe('webgl');
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
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

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

  it('uses fixed local inference dimensions for webgl and rescales output to original resolution', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    session.session = {
      run: vi.fn(async (feeds) => {
        expect(feeds.local_input.dims).toEqual([1, 3, 128, 128]);
        return { gain_map: { data: new Float32Array(128 * 128).fill(0.5), dims: [1, 1, 128, 128] } };
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

    const inputWidth = 320;
    const inputHeight = 240;
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
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'fixed-model',
      }),
    );
    expect(Array.isArray(capability.attempts)).toBe(true);
    expect(capability.attempts.length).toBeGreaterThan(0);
  });

  it('resolves probed gain-map capability for webgpu provider', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.session = {
      run: vi.fn(async (feeds) => {
        const size = feeds.local_input.dims[2];
        const data = new Float32Array(size * size);
        for (let i = 0; i < data.length; i += 1) {
          data[i] = (i % 256) / 255;
        }
        return {
          gain_map: {
            data,
            dims: [1, 1, size, size],
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
    expect(capability.source).toBe('probe');
    expect(capability.gainMapMaxLongEdge).toBe(512);
    expect(capability.outputMaxLongEdge).toBe(1024);
    expect(Array.isArray(capability.attempts)).toBe(true);
    expect(capability.attempts.length).toBeGreaterThan(0);
  });

  it('probes above 2048 by default so 8192 output remains reachable', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    session.activeExecutionProvider = 'webgpu';
    session.activeModelVariant = 'realworld';
    session.session = {};

    vi.spyOn(session, 'createProbeImageData').mockImplementation((candidateLongEdge) => ({
      width: candidateLongEdge,
      height: candidateLongEdge,
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
        const size = feeds.local_input.dims[2];
        return {
          gain_map: {
            data: new Float32Array(size * size),
            dims: [1, 1, size, size],
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

  it('logs inference runtime details including provider and cpu thread/core counts', async () => {
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
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logSpy.mockClear();
    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);

    await session.run(image);

    expect(
      logSpy.mock.calls.some(([message]) =>
        /Executing inference.*provider:\s*webgpu.*cpu cores:\s*n\/a\/8/i.test(String(message)),
      ),
    ).toBe(true);
    logSpy.mockRestore();
  });
});
