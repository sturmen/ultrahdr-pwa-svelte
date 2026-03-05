/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../offline-runtime-bundle.js', () => ({
  BUNDLE_STATES: {
    EMPTY: 'EMPTY',
    PREPARING: 'PREPARING',
    READY: 'READY',
    STALE: 'STALE',
    CORRUPT: 'CORRUPT',
    REPAIRING: 'REPAIRING',
    FAILED: 'FAILED',
  },
  ensureBundleReady: vi.fn(async () => ({
    ready: true,
    blocked: false,
    state: 'READY',
    bundleVersion: 'test-bundle',
    validatedAtMs: Date.now(),
  })),
  setBundleProviderHint: vi.fn(async () => {}),
}));

class PolicyWorker {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  emit(type, event) {
    const callbacks = this.listeners.get(type) || [];
    for (const callback of callbacks) {
      callback(event);
    }
  }

  postMessage(message) {
    if (message.type === 'init') {
      queueMicrotask(() => {
        this.emit('message', {
          data: {
            type: 'ready',
            runtime: {
              resolvedExecutionProvider: 'webgpu',
            },
          },
        });
      });
    }
  }

  terminate() {}
}

describe('processing runtime bundle policy', () => {
  const originalWorker = globalThis.Worker;
  const originalOffscreenCanvas = globalThis.OffscreenCanvas;
  const originalCreateImageBitmap = globalThis.createImageBitmap;

  beforeEach(() => {
    vi.resetModules();
    globalThis.Worker = PolicyWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    globalThis.OffscreenCanvas = originalOffscreenCanvas;
    globalThis.createImageBitmap = originalCreateImageBitmap;
  });

  it('throws explicit hard-block error when bundle is not ready offline', async () => {
    const bundleModule = await import('../offline-runtime-bundle.js');
    bundleModule.ensureBundleReady.mockResolvedValueOnce({
      ready: false,
      blocked: true,
      state: 'EMPTY',
      diagnostics: { reason: 'missing-readiness' },
    });

    const { initializeRuntime } = await import('../processing.js');

    await expect(initializeRuntime()).rejects.toMatchObject({
      code: 'RUNTIME_INIT_OFFLINE_BUNDLE_NOT_READY',
      stepId: 'onnx-load',
    });
  });

  it('returns bundle metadata and persists provider hint after init succeeds', async () => {
    const bundleModule = await import('../offline-runtime-bundle.js');
    bundleModule.ensureBundleReady.mockResolvedValueOnce({
      ready: true,
      blocked: false,
      state: 'READY',
      bundleVersion: 'bundle-v1',
      validatedAtMs: 123,
    });

    const { initializeRuntime } = await import('../processing.js');
    const result = await initializeRuntime();

    expect(result.bundleState).toBe('READY');
    expect(result.bundleVersion).toBe('bundle-v1');
    expect(result.bundleValidatedAtMs).toBe(123);
    expect(bundleModule.setBundleProviderHint).toHaveBeenCalledWith('webgpu', expect.any(Object));
  });
});
