/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRuntimeFixture } from './fixtures/createRuntimeFixture.js';

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

describe('processing probe-free runtime init and process options', () => {
  const originalWorker = globalThis.Worker;
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
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    globalThis.localStorage = originalLocalStorage;
  });

  it('does not inject gmnetCapabilityHint into process requests from runtime metadata or legacy cache', async () => {
    localStorage.setItem(
      'ultrahdr:gmnet-capability:v1:legacy',
      JSON.stringify({
        byProvider: {
          webgpu: {
            provider: 'webgpu',
            gainMapMaxLongEdge: 720,
            outputMaxLongEdge: 1440,
            source: 'cache',
            attempts: [],
          },
        },
      }),
    );

    CapabilityWorker.readyRuntime = {
      resolvedExecutionProvider: 'webgpu',
      gmnetCapability: {
        provider: 'webgpu',
        gainMapMaxLongEdge: 2048,
        outputMaxLongEdge: 4096,
        source: 'startup-probe',
        attempts: [],
      },
    };

    const { initialize, process } = await createRuntimeFixture();
    await initialize();

    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', {
      type: 'image/jpeg',
    });
    await process(file, {});

    const worker = CapabilityWorker.instances[0];
    const processMessage = worker.posted.find((message) => message.type === 'process');
    expect(processMessage?.options?.gmnetCapabilityHint).toBeUndefined();
  });

  it('does not persist gmnet capability payloads emitted from worker progress events', async () => {
    const { process } = await createRuntimeFixture();

    CapabilityWorker.onProcess = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-progress',
              stage: 'generate-gain-map',
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

    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', {
      type: 'image/jpeg',
    });
    await process(file, {});

    const diagnosticsWrites = localStorage.setItem.mock.calls
      .filter(([key]) => key === '__ultrahdrDiagnosticsReports')
      .map(([, value]) => String(value));

    expect(diagnosticsWrites.length).toBeGreaterThan(0);
    expect(diagnosticsWrites.join('\n')).not.toContain('gmnetCapability');
    expect(diagnosticsWrites.join('\n')).not.toContain('gmnetCapabilitySource');
    expect(diagnosticsWrites.join('\n')).not.toContain('gainMapMaxLongEdge');
  });

  it('does not forward gmnetCapabilityHintsByProvider in initializeRuntime init options', async () => {
    const { initialize } = await createRuntimeFixture();

    await initialize({
      runtimeInitOptions: {
        gmnetCapabilityHintsByProvider: {
          webgpu: {
            provider: 'webgpu',
            gainMapMaxLongEdge: 4094,
            outputMaxLongEdge: 8192,
            source: 'cache',
            attempts: [{ candidateLongEdge: 4094, status: 'passed' }],
          },
        },
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
    expect(initMessage?.options?.gmnetCapabilityHintsByProvider).toBeUndefined();
  });

  it('forwards test runtime init options to worker initialization payload', async () => {
    globalThis.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS = {
      smokeAssetPath: 'models/does-not-exist.png',
    };

    try {
      const { initialize } = await createRuntimeFixture();
      await initialize();
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

    const { initialize } = await createRuntimeFixture();
    await initialize();

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeAssetPath: 'models/gmnet-smoke-128-missing.png',
      }),
    );
  });

  it('hydrates runtime init smokeBypassProviders from cached startup runtime metadata', async () => {
    localStorage.setItem(
      'ultrahdr:runtime-startup-cache:v1',
      JSON.stringify({
        updatedAtMs: Date.now(),
        userAgent: window.navigator.userAgent,
        appVersion: 'dev',
        assetVersion: 'test-app-version',
        wasmAssetVersion: 'test-wasm-version',
        resolvedExecutionProvider: 'webgpu',
      }),
    );

    const { initialize } = await createRuntimeFixture();
    await initialize();

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeBypassProviders: ['webgpu'],
      }),
    );
  });

  it('forwards runtime init forceSmokeFailure override from URL query params', async () => {
    window.history.replaceState(
      {},
      'test',
      '/?__uhdr_test_force_smoke_failure=1',
    );

    const { initialize } = await createRuntimeFixture();
    await initialize();

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        forceSmokeFailure: true,
      }),
    );
  });

  it('forwards explicit runtimeInitOptions from initializeRuntime', async () => {
    const { initialize } = await createRuntimeFixture();
    await initialize({
      runtimeInitOptions: {
        smokeAssetPath: 'models/gmnet-smoke-explicit.png',
        forceExecutionProviders: ['webgl'],
      },
    });

    const worker = CapabilityWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeAssetPath: 'models/gmnet-smoke-explicit.png',
        forceExecutionProviders: ['webgl'],
      }),
    );
  });
});
