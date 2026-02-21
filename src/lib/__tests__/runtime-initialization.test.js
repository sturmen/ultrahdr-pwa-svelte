/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import {
  RUNTIME_INIT_ERROR_CODES,
  RUNTIME_INIT_STEP_ORDER,
  initializeRuntime,
} from '../runtime-initialization.js';

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

function createWebGlDocument() {
  return {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: (type) => {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return { clear: () => { } };
        }
        return null;
      },
    }),
  };
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
    document: createWebGlDocument(),
    OffscreenCanvas: undefined,
    createImageBitmap: undefined,
    crossOriginIsolated: true,
  };
}

describe('runtime initialization', () => {
  it('emits structured probeAttempt progress updates during live capability probing', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    let probeListener = null;
    const resolveGainMapCapability = vi.fn(async () => {
      probeListener?.({
        provider: 'webgpu',
        candidate: 2048,
        phase: 'testing',
      });
      probeListener?.({
        provider: 'webgpu',
        candidate: 2048,
        phase: 'passed',
      });
      return {
        provider: 'webgpu',
        gainMapMaxLongEdge: 2048,
        outputMaxLongEdge: 4096,
        source: 'probe',
        attempts: [
          { provider: 'webgpu', candidateLongEdge: 2048, status: 'passed' },
        ],
      };
    });
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      run: vi.fn(async () => createSmokeOutputRgba()),
      resolveGainMapCapability,
      on: vi.fn((event, callback) => {
        if (event === 'capability-probe') {
          probeListener = callback;
        }
      }),
      off: vi.fn((event, callback) => {
        if (event === 'capability-probe' && probeListener === callback) {
          probeListener = null;
        }
      }),
      activeExecutionProvider: 'webgpu',
    };
    const progressEvents = [];

    await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      onProgress: (event) => progressEvents.push(event),
    });

    const probeEvents = progressEvents.filter(
      (event) => event.stepId === 'gmnet-smoke-run' && event.probeAttempt,
    );
    expect(probeEvents.length).toBeGreaterThanOrEqual(2);
    expect(probeEvents[0].probeAttempt).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        candidateLongEdge: 2048,
        status: 'running',
      }),
    );
    expect(probeEvents[1].probeAttempt).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        candidateLongEdge: 2048,
        status: 'passed',
      }),
    );
  });

  it('emits progress events in checklist order and succeeds with webgpu on first attempt', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const resolveGainMapCapability = vi.fn(async () => ({
      provider: 'webgpu',
      gainMapMaxLongEdge: 3072,
      outputMaxLongEdge: 6144,
      source: 'probe',
      attempts: [{ candidateLongEdge: 3072, status: 'passed' }],
    }));
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
    expect(resolveGainMapCapability).toHaveBeenCalledWith(
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
    const probeRunningNotes = progressEvents
      .filter((event) => event.stepId === 'gmnet-smoke-run' && event.status === 'running')
      .map((event) => String(event.note || ''));

    expect(runningOrderUnique).toEqual(RUNTIME_INIT_STEP_ORDER);
    expect(passedOrder).toEqual(RUNTIME_INIT_STEP_ORDER);
    expect(probeRunningNotes.some((note) => /128x128/i.test(note))).toBe(false);
    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(result.gmnetCapability).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        gainMapMaxLongEdge: 3072,
        outputMaxLongEdge: 6144,
      }),
    );
  });

  it('retries with webgl when webgpu smoke inference fails', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const attemptOrder = [];
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        const provider = options.forceExecutionProviders?.[0];
        attemptOrder.push(provider);
        session.activeExecutionProvider = provider;
      }),
      resolveGainMapCapability: vi.fn(async () => ({
        provider: session.activeExecutionProvider,
        gainMapMaxLongEdge: session.activeExecutionProvider === 'webgpu' ? 2048 : 128,
        outputMaxLongEdge: session.activeExecutionProvider === 'webgpu' ? 4096 : 256,
        source: session.activeExecutionProvider === 'webgpu' ? 'probe' : 'fixed-model',
        attempts: [{ candidateLongEdge: session.activeExecutionProvider === 'webgpu' ? 2048 : 128, status: 'passed' }],
      })),
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

    expect(attemptOrder).toEqual(['webgpu', 'webgl']);
    expect(result.resolvedExecutionProvider).toBe('webgl');
    expect(result.gmnetCapability).toEqual(
      expect.objectContaining({
        provider: 'webgl',
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
      }),
    );
  });

  it('fails with NO_COMPATIBLE_GPU_PROVIDER when neither webgpu nor webgl is available', async () => {
    const runtime = {
      navigator: {
        gpu: undefined,
      },
      document: undefined,
      OffscreenCanvas: undefined,
      createImageBitmap: undefined,
      crossOriginIsolated: true,
    };

    await expect(
      initializeRuntime({
        runtime,
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
      resolveGainMapCapability: vi.fn(async () => ({
        provider: session.activeExecutionProvider,
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'probe',
        attempts: [],
      })),
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
      resolveGainMapCapability: vi.fn(async () => ({
        provider: session.activeExecutionProvider,
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'probe',
        attempts: [],
      })),
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

  it('fails with RUNTIME_INIT_SMOKE_ASSET_FAILED when forceSmokeFailure is enabled', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(async () => ({
        provider: session.activeExecutionProvider,
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'probe',
        attempts: [],
      })),
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

  it('fails with RUNTIME_INIT_SMOKE_INFERENCE_FAILED when smoke inference output is flat', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    runtime.document = undefined;
    runtime.OffscreenCanvas = undefined;
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || null;
      }),
      resolveGainMapCapability: vi.fn(async () => ({
        provider: session.activeExecutionProvider,
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'probe',
        attempts: [],
      })),
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
      code: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
      stepId: 'gmnet-smoke-run',
    });
  });

  it('reuses cached startup capability hint and emits probeAttempts snapshot without re-probing', async () => {
    const runtime = createRuntimeWithGpuAndWebGl();
    const session = {
      init: vi.fn(async (_variant, options = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      resolveGainMapCapability: vi.fn(async () => ({
        provider: 'webgpu',
        gainMapMaxLongEdge: 4096,
        outputMaxLongEdge: 8192,
        source: 'probe',
        attempts: [],
      })),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };
    const progressEvents = [];
    const cachedCapability = {
      provider: 'webgpu',
      gainMapMaxLongEdge: 3072,
      outputMaxLongEdge: 6144,
      source: 'cache',
      attempts: [
        { provider: 'webgpu', candidateLongEdge: 3072, status: 'passed' },
      ],
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      gmnetCapabilityHintsByProvider: {
        webgpu: cachedCapability,
      },
      onProgress: (event) => progressEvents.push(event),
    });

    expect(session.resolveGainMapCapability).not.toHaveBeenCalled();
    expect(result.gmnetCapability).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        gainMapMaxLongEdge: 3072,
        outputMaxLongEdge: 6144,
        source: 'cache',
      }),
    );

    const snapshotEvent = progressEvents.find(
      (event) => event.stepId === 'gmnet-smoke-run' && Array.isArray(event.probeAttempts),
    );
    expect(snapshotEvent?.probeAttempts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          candidateLongEdge: 3072,
          status: 'passed',
        }),
      ]),
    );
    expect(snapshotEvent?.gmnetCapabilitySource).toBe('cache');
  });
});
