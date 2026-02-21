/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class CapabilityWorker {
  static instances = [];
  static onProcess = null;
  static readyRuntime = null;

  constructor() {
    this.listeners = new Map();
    this.posted = [];
    CapabilityWorker.instances.push(this);
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
    this.posted.push(message);
    if (message.type === 'init') {
      queueMicrotask(() => {
        this.emit('message', {
          data: {
            type: 'ready',
            runtime: CapabilityWorker.readyRuntime || undefined,
          },
        });
      });
      return;
    }
    if (message.type === 'process') {
      if (typeof CapabilityWorker.onProcess === 'function') {
        CapabilityWorker.onProcess(this, message);
        return;
      }
      queueMicrotask(() => {
        const buffer = new Uint8Array([9, 8, 7]).buffer;
        this.emit('message', {
          data: {
            type: 'result',
            jobId: message.jobId,
            mimeType: 'image/jpeg',
            buffer,
          },
        });
      });
    }
  }

  terminate() {
    // no-op
  }
}

describe('processing capability cache', () => {
  const originalWorker = globalThis.Worker;
  const originalOffscreenCanvas = globalThis.OffscreenCanvas;
  const originalCreateImageBitmap = globalThis.createImageBitmap;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    vi.resetModules();
    CapabilityWorker.instances = [];
    CapabilityWorker.onProcess = null;
    CapabilityWorker.readyRuntime = null;
    window.history.replaceState({}, 'test', '/');
    const storage = new Map();
    globalThis.localStorage = {
      getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
      setItem: vi.fn((key, value) => {
        storage.set(String(key), String(value));
      }),
      removeItem: vi.fn((key) => {
        storage.delete(String(key));
      }),
      clear: vi.fn(() => {
        storage.clear();
      }),
    };
    globalThis.localStorage.clear();
    globalThis.Worker = CapabilityWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    globalThis.OffscreenCanvas = originalOffscreenCanvas;
    globalThis.createImageBitmap = originalCreateImageBitmap;
    globalThis.localStorage = originalLocalStorage;
  });

  it('injects cached gmnet capability hint into worker process requests', async () => {
    const {
      processImage,
      __getCapabilityCacheStorageKeyForTests,
    } = await import('../processing.js');

    const storageKey = __getCapabilityCacheStorageKeyForTests();
    localStorage.setItem(storageKey, JSON.stringify({
      byProvider: {
        webgpu: {
          provider: 'webgpu',
          gainMapMaxLongEdge: 720,
          outputMaxLongEdge: 1440,
          source: 'cache',
          attempts: [],
        },
      },
    }));

    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    await processImage(file, {});

    const worker = CapabilityWorker.instances[0];
    const processMessage = worker.posted.find((message) => message.type === 'process');
    expect(processMessage?.options?.gmnetCapabilityHint).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        gainMapMaxLongEdge: 720,
        outputMaxLongEdge: 1440,
      }),
    );
  });

  it('persists capability payloads emitted from worker progress events', async () => {
    const {
      processImage,
      __getCapabilityCacheStorageKeyForTests,
    } = await import('../processing.js');
    CapabilityWorker.onProcess = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-progress',
              stage: 'probe-gmnet-capability',
              gmnetExecutionProvider: 'webgl',
              gmnetCapabilitySource: 'probe',
              gmnetCapability: {
                provider: 'webgl',
                gainMapMaxLongEdge: 128,
                outputMaxLongEdge: 256,
                source: 'fixed-model',
                attempts: [{ candidateLongEdge: 128, status: 'passed' }],
              },
            },
          },
        });
      });
      queueMicrotask(() => {
        const buffer = new Uint8Array([9, 8, 7]).buffer;
        worker.emit('message', {
          data: {
            type: 'result',
            jobId: message.jobId,
            mimeType: 'image/jpeg',
            buffer,
          },
        });
      });
    };

    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    await processImage(file, {});

    const storageKey = __getCapabilityCacheStorageKeyForTests();
    const cached = JSON.parse(localStorage.getItem(storageKey) || '{}');
    expect(cached.byProvider?.webgl).toEqual(
      expect.objectContaining({
        provider: 'webgl',
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
      }),
    );
  });

  it('prefers test capability override over cached capability hints', async () => {
    const {
      processImage,
      __getCapabilityCacheStorageKeyForTests,
    } = await import('../processing.js');

    const storageKey = __getCapabilityCacheStorageKeyForTests();
    localStorage.setItem(storageKey, JSON.stringify({
      byProvider: {
        webgpu: {
          provider: 'webgpu',
          gainMapMaxLongEdge: 2048,
          outputMaxLongEdge: 4096,
          source: 'cache',
          attempts: [],
        },
      },
    }));

    globalThis.__ULTRAHDR_TEST_GMNET_CAPABILITY_OVERRIDE = {
      provider: 'webgl',
      gainMapMaxLongEdge: 128,
      outputMaxLongEdge: 256,
      source: 'test-override',
      attempts: [],
    };

    try {
      const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
      await processImage(file, {});
    } finally {
      delete globalThis.__ULTRAHDR_TEST_GMNET_CAPABILITY_OVERRIDE;
    }

    const worker = CapabilityWorker.instances[0];
    const processMessage = worker.posted.find((message) => message.type === 'process');
    expect(processMessage?.options?.gmnetCapabilityHint).toEqual(
      expect.objectContaining({
        provider: 'webgl',
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'test-override',
      }),
    );
  });

  it('persists startup gmnet capability from worker ready metadata and reuses it for processing', async () => {
    CapabilityWorker.readyRuntime = {
      resolvedExecutionProvider: 'webgpu',
      gmnetCapability: {
        provider: 'webgpu',
        gainMapMaxLongEdge: 4096,
        outputMaxLongEdge: 8192,
        source: 'startup-probe',
        attempts: [{ candidateLongEdge: 4096, status: 'passed' }],
      },
    };

    const {
      initializeRuntime,
      processImage,
      __getCapabilityCacheStorageKeyForTests,
    } = await import('../processing.js');

    await initializeRuntime();

    const storageKey = __getCapabilityCacheStorageKeyForTests();
    const cached = JSON.parse(localStorage.getItem(storageKey) || '{}');
    expect(cached.byProvider?.webgpu).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        gainMapMaxLongEdge: 4096,
        outputMaxLongEdge: 8192,
      }),
    );

    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    await processImage(file, {});

    const worker = CapabilityWorker.instances[0];
    const processMessage = worker.posted.find((message) => message.type === 'process');
    expect(processMessage?.options?.gmnetCapabilityHint).toEqual(
      expect.objectContaining({
        provider: 'webgpu',
        gainMapMaxLongEdge: 4096,
        outputMaxLongEdge: 8192,
      }),
    );
  });

  it('forwards test runtime init options to worker initialization payload', async () => {
    globalThis.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS = {
      smokeAssetPath: 'models/does-not-exist.png',
    };

    try {
      const { initializeRuntime } = await import('../processing.js');
      await initializeRuntime();
    } finally {
      delete globalThis.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS;
    }

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeAssetPath: 'models/does-not-exist.png',
      }),
    );
  });

  it('forwards runtime init smoke asset override from URL query params', async () => {
    window.history.replaceState(
      {},
      'test',
      '/?__uhdr_test_smoke_asset_path=models/gmnet-smoke-128-missing.png',
    );

    const { initializeRuntime } = await import('../processing.js');
    await initializeRuntime();

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeAssetPath: 'models/gmnet-smoke-128-missing.png',
      }),
    );
  });

  it('forwards runtime init forceSmokeFailure override from URL query params', async () => {
    window.history.replaceState(
      {},
      'test',
      '/?__uhdr_test_force_smoke_failure=1',
    );

    const { initializeRuntime } = await import('../processing.js');
    await initializeRuntime();

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        forceSmokeFailure: true,
      }),
    );
  });

  it('forwards explicit runtimeInitOptions from initializeRuntime', async () => {
    const { initializeRuntime } = await import('../processing.js');
    await initializeRuntime({
      runtimeInitOptions: {
        smokeAssetPath: 'models/gmnet-smoke-explicit.png',
      },
    });

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeAssetPath: 'models/gmnet-smoke-explicit.png',
      }),
    );
  });
});
