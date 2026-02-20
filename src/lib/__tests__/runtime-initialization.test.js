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

function createRuntimeWithGpu() {
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
    OffscreenCanvas: undefined,
    createImageBitmap: undefined,
    crossOriginIsolated: true,
  };
}

describe('runtime initialization', () => {
  it('emits progress events in checklist order and succeeds with strict webgpu', async () => {
    const runtime = createRuntimeWithGpu();
    const init = vi.fn(async () => {});
    const run = vi.fn(async () => new Uint8ClampedArray(128 * 128 * 4));
    const session = {
      init,
      run,
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
    expect(run).toHaveBeenCalledWith(expect.any(ImageData), {
      gmnetModelVariant: 'realworld',
    });

    const runningOrder = progressEvents
      .filter((event) => event.status === 'running')
      .map((event) => event.stepId);
    const passedOrder = progressEvents
      .filter((event) => event.status === 'passed')
      .map((event) => event.stepId);

    expect(runningOrder).toEqual(RUNTIME_INIT_STEP_ORDER);
    expect(passedOrder).toEqual(RUNTIME_INIT_STEP_ORDER);
    expect(result.resolvedExecutionProvider).toBe('webgpu');
  });

  it('fails with RUNTIME_INIT_WEBGPU_UNAVAILABLE when navigator.gpu is missing', async () => {
    const runtime = {
      navigator: {
        gpu: undefined,
      },
    };

    await expect(
      initializeRuntime({
        runtime,
        sessionFactory: () => ({
          init: vi.fn(),
          run: vi.fn(),
          activeExecutionProvider: null,
        }),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.WEBGPU_UNAVAILABLE,
      stepId: 'webgpu-check',
    });
  });

  it('fails with RUNTIME_INIT_PROVIDER_MISMATCH when gmnet resolves non-webgpu provider', async () => {
    const runtime = createRuntimeWithGpu();
    const session = {
      init: vi.fn(async () => {}),
      run: vi.fn(async () => new Uint8ClampedArray(128 * 128 * 4)),
      activeExecutionProvider: 'wasm',
    };

    await expect(
      initializeRuntime({
        runtime,
        sessionFactory: () => session,
        loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
      }),
    ).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: RUNTIME_INIT_ERROR_CODES.PROVIDER_MISMATCH,
      stepId: 'gmnet-provider-verify',
    });
  });

  it('fails with RUNTIME_INIT_SMOKE_ASSET_FAILED when smoke asset loading fails', async () => {
    const runtime = createRuntimeWithGpu();
    const session = {
      init: vi.fn(async () => {}),
      run: vi.fn(async () => new Uint8ClampedArray(128 * 128 * 4)),
      activeExecutionProvider: 'webgpu',
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

  it('fails with RUNTIME_INIT_SMOKE_INFERENCE_FAILED when smoke output shape is invalid', async () => {
    const runtime = createRuntimeWithGpu();
    const session = {
      init: vi.fn(async () => {}),
      run: vi.fn(async () => new Uint8ClampedArray(10)),
      activeExecutionProvider: 'webgpu',
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
});
