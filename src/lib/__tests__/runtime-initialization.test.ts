/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  RUNTIME_INIT_ERROR_CODES,
  RUNTIME_INIT_STEP_ORDER,
  initializeRuntime,
} from '../runtime-initialization.ts';

function createSmokeImageData(width = 128, height = 128) {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(127);
  for (let index = 3; index < pixels.length; index += 4) {
    pixels[index] = 255;
  }
  return new ImageData(pixels, width, height);
}

function createSmokeOutputRgba(width = 128, height = 128) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const value = (x + y) % 256;
      pixels[idx] = value;
      pixels[idx + 1] = value;
      pixels[idx + 2] = value;
      pixels[idx + 3] = 255;
    }
  }
  return pixels;
}

function createRuntimeWithGpuAndWebGl() {
  return {
    navigator: {
      gpu: {
        requestAdapter: vi.fn(async () => ({ name: 'mock-adapter' })),
      },
      userAgent: 'UnitTestAgent/1.0',
      platform: 'UnitTestOS',
      hardwareConcurrency: 8,
    },
    fetch: vi.fn(),
    crossOriginIsolated: true,
  };
}

describe('runtime initialization', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not invoke capability probing and emits no probe attempt payloads', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const resolveGainMapCapability = vi.fn();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      run: vi.fn(async () => createSmokeOutputRgba()),
      resolveGainMapCapability,
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };
    const progressEvents = [];

    await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      onProgress: (event) => progressEvents.push(event),
    });

    expect(resolveGainMapCapability).not.toHaveBeenCalled();
    expect(progressEvents.some((event) => event.probeAttempt)).toBe(false);
    expect(progressEvents.some((event) => Array.isArray(event.probeAttempts))).toBe(false);
  });

  it('emits progress events in checklist order and succeeds with webgpu on first attempt', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const resolveGainMapCapability = vi.fn();
    const init = vi.fn(async (_variant, options = {}) => {
      const provider = options.forceExecutionProviders?.[0];
      runtime.navigator.gpu.requestAdapter.mockResolvedValueOnce({ name: 'mock-adapter' });
      session.activeExecutionProvider = provider || 'webgpu';
    });
    const run = vi.fn(async () => createSmokeOutputRgba());
    const session = {
      init,
      run,
      resolveGainMapCapability,
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };
    const progressEvents = [];

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      onProgress: (event) => progressEvents.push(event),
    });

    expect(init).toHaveBeenCalledWith('realworld', {
      forceExecutionProviders: ['webgpu'],
      forceReload: true,
    });
    expect(run).toHaveBeenCalledWith(
      expect.any(ImageData),
      expect.objectContaining({
        gmnetModelVariant: 'realworld',
        forceExecutionProviders: ['webgpu'],
      }),
    );

    const runningOrder = progressEvents
      .filter((event) => event.status === 'running')
      .map((event) => event.stepId);
    const passedOrder = progressEvents
      .filter((event) => event.status === 'passed')
      .map((event) => event.stepId);
    const runningOrderUnique = Array.from(new Set(runningOrder));

    expect(runningOrderUnique).toEqual(RUNTIME_INIT_STEP_ORDER);
    expect(passedOrder).toEqual(RUNTIME_INIT_STEP_ORDER);
    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(result.gmnetCapability).toBeNull();
    expect(resolveGainMapCapability).not.toHaveBeenCalled();
  });

  it('skips smoke inference when startup cache bypass includes the requested provider', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      run: vi.fn(async () => createSmokeOutputRgba()),
      resolveGainMapCapability: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      smokeBypassProviders: ['webgpu'],
    });

    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(session.run).not.toHaveBeenCalled();
  });

  it('retries with wasm when webgpu smoke inference fails and no webgl runtime is available', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const attemptOrder = [];
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        const provider = options.forceExecutionProviders?.[0];
        attemptOrder.push(provider);
        session.activeExecutionProvider = provider;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => {
        if (session.activeExecutionProvider === 'webgpu') {
          throw new Error('webgpu compile failure');
        }
        return createSmokeOutputRgba();
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
    });

    expect(attemptOrder).toEqual(['webgpu', 'wasm']);
    expect(result.resolvedExecutionProvider).toBe('wasm');
    expect(result.gmnetCapability).toBeNull();
  });

  it('uses wasm fallback when webgpu fails and no webgl runtime is available', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const attemptOrder = [];
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        const provider = options.forceExecutionProviders?.[0];
        attemptOrder.push(provider);
        session.activeExecutionProvider = provider;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => {
        if (session.activeExecutionProvider === 'webgpu') {
          throw new Error(`smoke failed on ${session.activeExecutionProvider}`);
        }
        return createSmokeOutputRgba();
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
    });

    expect(attemptOrder).toEqual(['webgpu', 'wasm']);
    expect(result.resolvedExecutionProvider).toBe('wasm');
    expect(result.gmnetCapability).toBeNull();
  });

  it('defaults to WASM-only startup when neither webgpu nor webgl is available', async () => {
    const runtime = {
      navigator: {
        gpu: undefined,
      },
      document: undefined,
      crossOriginIsolated: true,
    };

    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
    });

    expect(result.requestedExecutionProviders).toEqual(['wasm']);
    expect(result.resolvedExecutionProvider).toBe('wasm');
  });

  it('can disable WASM-only startup fallback explicitly', async () => {
    const runtime = {
      navigator: {
        gpu: undefined,
      },
      document: undefined,
      crossOriginIsolated: true,
    };

    await expect(
      initializeRuntime({
        runtime,
        allowWasmOnly: false,
        sessionFactory: () => ({
          init: vi.fn(),
          resolveGainMapCapability: vi.fn(),
          run: vi.fn(),
          activeExecutionProvider: null,
        }),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.NO_COMPATIBLE_GPU_PROVIDER,
      stepId: 'webgpu-check',
    });
  });

  it('fails with PROVIDER_FALLBACK_EXHAUSTED when both webgpu and webgl attempts fail', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => {
        throw new Error(`smoke failed on ${session.activeExecutionProvider}`);
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    await expect(
      initializeRuntime({
        runtime,
        sessionFactory: () => session,
        loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.PROVIDER_FALLBACK_EXHAUSTED,
      stepId: 'gmnet-smoke-run',
    });
  });

  it('fails with RUNTIME_INIT_SMOKE_ASSET_FAILED when smoke asset loading fails', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    await expect(
      initializeRuntime({
        runtime,
        sessionFactory: () => session,
        loadSmokeImageData: vi.fn(async () => {
          throw new Error('asset missing');
        }),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED,
      stepId: 'gmnet-smoke-run',
    });
  });

  it('decodes the default smoke asset without legacy browser image decode shims', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const smokeBytes = await readFile(path.resolve(process.cwd(), 'public/models/gmnet-smoke-128.png'));
    runtime.fetch.mockResolvedValue(
      new Response(smokeBytes, {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );

    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
    });

    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(session.run).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
        data: expect.any(Uint8ClampedArray),
      }),
      expect.any(Object),
    );
  });

  it('fails with RUNTIME_INIT_SMOKE_ASSET_FAILED when forceSmokeFailure is enabled', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    await expect(
      initializeRuntime({
        runtime,
        forceSmokeFailure: true,
        sessionFactory: () => session,
        loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED,
      stepId: 'gmnet-smoke-run',
    });
    expect(session.run).not.toHaveBeenCalled();
  });

  it('fails with PROVIDER_FALLBACK_EXHAUSTED when smoke inference output is flat for all providers', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    runtime.document = undefined;
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => new Uint8ClampedArray(128 * 128 * 4)),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    await expect(
      initializeRuntime({
        runtime,
        sessionFactory: () => session,
        loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.PROVIDER_FALLBACK_EXHAUSTED,
      stepId: 'gmnet-smoke-run',
      diagnostics: expect.objectContaining({
        requestedExecutionProviders: ['webgpu', 'wasm'],
        attemptFailures: [
          expect.objectContaining({
            provider: 'webgpu',
            errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
          }),
          expect.objectContaining({
            provider: 'wasm',
            errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
          }),
        ],
      }),
    });
  });

  it('does not block Safari-style user agents when runtime feature checks pass', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    runtime.navigator.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
    });

    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(result.gmnetCapability).toBeNull();
    expect(session.resolveGainMapCapability).not.toHaveBeenCalled();
  });

  it('times out a hanging offline provider init attempt and falls back to the next provider', async () => {
    vi.useFakeTimers();

    const runtime = createRuntimeWithGpuAndWebGl();
    runtime.navigator.onLine = false;
    runtime.document = undefined;

    const init = vi.fn(async (_variant, options = {}) => {
      const provider = options.forceExecutionProviders?.[0] || 'webgpu';
      session.activeExecutionProvider = provider;

      if (provider === 'webgpu') {
        await new Promise(() => {});
      }
    });
    const run = vi.fn(async () => createSmokeOutputRgba());
    const session = {
      init,
      run,
      resolveGainMapCapability: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null,
    };

    const initPromise = initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      gmnetSessionInitTimeoutMs: 50,
    });

    await vi.advanceTimersByTimeAsync(100);
    const result = await initPromise;

    expect(init).toHaveBeenNthCalledWith(1, 'realworld', {
      forceExecutionProviders: ['webgpu'],
      forceReload: true,
    });
    expect(init).toHaveBeenNthCalledWith(2, 'realworld', {
      forceExecutionProviders: ['wasm'],
      forceReload: true,
    });
    expect(result.resolvedExecutionProvider).toBe('wasm');
  });
});
