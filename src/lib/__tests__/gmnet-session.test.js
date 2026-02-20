/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('onnxruntime-web/webgpu', () => {
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
});

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

    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};

    await import('../gmnet-session.js');

    expect(ort.env.wasm.numThreads).toBe(4);
    expect(ort.env.wasm.proxy).toBe(false);
  });

  it('postprocess expands mono tensor output into RGBA bytes', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    const output = session.postprocess(
      { data: new Float32Array([0, 0.5, 1, 2]) },
      2,
      2,
    );

    expect(output).toBeInstanceOf(Uint8ClampedArray);
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

    await expect(session.init()).rejects.toMatchObject({
      name: 'GmnetWebGpuUnavailableError',
    });
    expect(ort.InferenceSession.create).not.toHaveBeenCalled();
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

  it('throws when runtime resolves non-webgpu provider', async () => {
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
      executionProviders: ['wasm'],
    });

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();

    await expect(session.init()).rejects.toMatchObject({
      name: 'GmnetExecutionProviderMismatchError',
    });
  });

  it('does not retry with wasm when webgpu inference fails at runtime', async () => {
    Object.defineProperty(Navigator.prototype, 'gpu', {
      configurable: true,
      value: {},
    });
    const ort = await import('onnxruntime-web/webgpu');
    ort.env.wasm = {};
    ort.env.webgpu = {};
    ort.InferenceSession.create.mockClear();

    const webgpuSession = {
      executionProviders: ['webgpu'],
      run: vi.fn(async () => {
        throw new Error('webgpu pipeline compile failure');
      }),
    };
    ort.InferenceSession.create.mockResolvedValueOnce(webgpuSession);

    const { GMNetInferenceSession } = await import('../gmnet-session.js');
    const session = new GMNetInferenceSession();
    const image = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2);

    await expect(session.run(image)).rejects.toThrow(/webgpu pipeline compile failure/i);

    expect(ort.InferenceSession.create).toHaveBeenCalledTimes(1);
    expect(webgpuSession.run).toHaveBeenCalledTimes(1);
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
