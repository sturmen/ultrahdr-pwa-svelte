/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BUNDLE_STATES,
  OFFLINE_BUNDLE_STORAGE_KEY,
  decideRuntimeStartup,
  ensureBundleReady,
  validateBundle,
} from '../offline-runtime-bundle.js';
import { buildRuntimeBundleCacheNames } from '../runtime-bundle-asset-map.js';

class MemoryCache {
  constructor() {
    this.entries = new Map();
  }

  normalizeKey(request) {
    const rawKey = typeof request === 'string' ? request : request.url;
    try {
      const url = new URL(rawKey, 'https://ultrahdr.invalid');
      return `${url.pathname}${url.search}`;
    } catch {
      return rawKey;
    }
  }

  async put(request, response) {
    const key = this.normalizeKey(request);
    this.entries.set(key, response.clone());
  }

  async match(request) {
    const key = this.normalizeKey(request);
    return this.entries.get(key)?.clone() || undefined;
  }
}

class MemoryCacheStorage {
  constructor() {
    this.caches = new Map();
  }

  async open(name) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MemoryCache());
    }
    return this.caches.get(name);
  }
}

function createStorage() {
  const data = new Map();
  return {
    getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
    setItem: vi.fn((key, value) => {
      data.set(String(key), String(value));
    }),
    removeItem: vi.fn((key) => {
      data.delete(String(key));
    }),
    clear: vi.fn(() => data.clear()),
  };
}

class FakeMessageChannel {
  constructor() {
    this.port1 = { onmessage: null, _peer: null };
    this.port2 = { onmessage: null, _peer: this.port1 };
    this.port1._peer = this.port2;
  }
}

describe('offline runtime bundle', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('decides to hard-block when offline and bundle is not ready', () => {
    const decision = decideRuntimeStartup({
      online: false,
      bundleState: BUNDLE_STATES.EMPTY,
      capabilities: { webgpu: true, webgl: true, wasm: true },
    });

    expect(decision).toEqual({
      startupMode: 'blocked',
      allowRuntimeInit: false,
      blockReason: 'offline-bundle-not-ready',
      repairAction: 'required-before-start',
    });
  });

  it('validates cached bundle assets against manifest hashes', async () => {
    const cacheStorage = new MemoryCacheStorage();
    const candidateCacheNames = new Set([
      'uhdr-ai-models-test',
      buildRuntimeBundleCacheNames('dev-unversioned-app').aiModels,
      buildRuntimeBundleCacheNames(import.meta.env.VITE_APP_ASSET_VERSION || '').aiModels,
    ]);
    const manifest = {
      bundleVersion: '1|a|b',
      requiredAssets: [
        {
          id: 'gmnet-smoke',
          url: '/models/gmnet-smoke-128.png',
          cacheName: 'uhdr-ai-models-test',
          sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          byteLength: 4,
          kind: 'smoke',
        },
      ],
    };

    for (const cacheName of candidateCacheNames) {
      const cache = await cacheStorage.open(cacheName);
      await cache.put(
        '/models/gmnet-smoke-128.png',
        new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }),
      );
      await cache.put(
        '/ultrahdr-pwa-svelte/models/gmnet-smoke-128.png',
        new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }),
      );
    }

    const result = await validateBundle({
      runtime: {
        caches: cacheStorage,
        fetch: vi.fn(),
        localStorage: createStorage(),
      },
      manifest,
      hashBuffer: async () => 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });
    expect(result.ready).toBe(true);
    expect(result.state).toBe(BUNDLE_STATES.READY);
  });

  it('treats both jpegli runtime assets as required bundle members during validation', async () => {
    const cacheStorage = new MemoryCacheStorage();
    const candidateCacheNames = new Set([
      'uhdr-wasm-assets-test',
      buildRuntimeBundleCacheNames('dev-unversioned-app').wasmAssets,
      buildRuntimeBundleCacheNames(import.meta.env.VITE_APP_ASSET_VERSION || '').wasmAssets,
    ]);
    const manifest = {
      bundleVersion: '1|jpegli',
      requiredAssets: [
        {
          id: 'jpegli-wasm-js',
          url: 'assets/jpegli_wasm.js?v=test',
          cacheName: 'uhdr-wasm-assets-test',
          sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          byteLength: 4,
          kind: 'runtime-script',
        },
        {
          id: 'jpegli-wasm-bin',
          url: 'assets/jpegli_wasm.wasm?v=test',
          cacheName: 'uhdr-wasm-assets-test',
          sha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          byteLength: 4,
          kind: 'wasm',
        },
      ],
    };

    for (const cacheName of candidateCacheNames) {
      const cache = await cacheStorage.open(cacheName);
      await cache.put(
        '/ultrahdr-pwa-svelte/assets/jpegli_wasm.js?v=test',
        new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }),
      );
    }

    const result = await validateBundle({
      runtime: {
        caches: cacheStorage,
        fetch: vi.fn(),
        localStorage: createStorage(),
      },
      manifest,
      hashBuffer: async (buffer) => {
        const bytes = new Uint8Array(buffer);
        if (bytes[0] === 1) {
          return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        }
        return 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
      },
    });

    expect(result.ready).toBe(false);
    expect(result.state).toBe(BUNDLE_STATES.EMPTY);
    expect(result.diagnostics).toMatchObject({
      missingAssetIds: expect.arrayContaining(['jpegli-wasm-bin']),
    });
  });

  it('repairs missing jpegli runtime assets into the offline bundle cache', async () => {
    const cacheStorage = new MemoryCacheStorage();
    const localStorage = createStorage();
    const manifest = {
      bundleVersion: '1|jpegli',
      requiredAssets: [
        {
          id: 'jpegli-wasm-js',
          url: 'assets/jpegli_wasm.js?v=test',
          cacheName: 'uhdr-wasm-assets-test',
          sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          byteLength: 4,
          kind: 'runtime-script',
        },
        {
          id: 'jpegli-wasm-bin',
          url: 'assets/jpegli_wasm.wasm?v=test',
          cacheName: 'uhdr-wasm-assets-test',
          sha256: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          byteLength: 4,
          kind: 'wasm',
        },
      ],
    };

    const fetchMock = vi.fn(async (input) => {
      const url = String(input);
      if (url.includes('jpegli_wasm.js')) {
        return new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 });
      }
      if (url.includes('jpegli_wasm.wasm')) {
        return new Response(new Uint8Array([5, 6, 7, 8]), { status: 200 });
      }
      throw new Error(`Unexpected fetch for ${url}`);
    });

    const { repairBundle } = await import('../offline-runtime-bundle.js');
    const result = await repairBundle({
      runtime: {
        navigator: { onLine: true, serviceWorker: { controller: null, ready: Promise.resolve(null) } },
        localStorage,
        caches: cacheStorage,
        fetch: fetchMock,
      },
      manifest,
      hashBuffer: async (buffer) => {
        const bytes = new Uint8Array(buffer);
        if (bytes[0] === 1) {
          return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        }
        return 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
      },
    });

    expect(result.ready).toBe(true);
    expect(result.state).toBe(BUNDLE_STATES.READY);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual(
      expect.arrayContaining([
        expect.stringContaining('jpegli_wasm.js?v=test'),
        expect.stringContaining('jpegli_wasm.wasm?v=test'),
      ]),
    );
  });

  it('hard-blocks ensureBundleReady when offline and readiness record is missing', async () => {
    const localStorage = createStorage();

    const result = await ensureBundleReady({
      runtime: {
        navigator: { onLine: false },
        localStorage,
        caches: new MemoryCacheStorage(),
        fetch: vi.fn(),
      },
      loadManifest: vi.fn(async () => ({
        bundleVersion: 'test',
        requiredAssets: [],
      })),
    });

    expect(result.ready).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.state).toBe(BUNDLE_STATES.EMPTY);
    expect(localStorage.getItem).toHaveBeenCalledWith(OFFLINE_BUNDLE_STORAGE_KEY);
  });

  it('reuses the last ready offline record without fetching the manifest again', async () => {
    const localStorage = createStorage();
    localStorage.setItem(OFFLINE_BUNDLE_STORAGE_KEY, JSON.stringify({
      bundleVersion: 'cached-ready-version',
      ready: true,
      state: BUNDLE_STATES.READY,
      validatedAtMs: 1234,
      manifestDigest: 'fnv32:12345678',
      diagnosticsSummary: {
        missingAssetCount: 0,
        mismatchedAssetCount: 0,
      },
    }));
    const fetch = vi.fn(() => {
      throw new Error('offline fetch should not be used when a ready record already exists');
    });

    const result = await ensureBundleReady({
      runtime: {
        navigator: {
          onLine: false,
          serviceWorker: {
            controller: null,
            ready: Promise.resolve(null),
          },
        },
        localStorage,
        caches: new MemoryCacheStorage(),
        fetch,
      },
    });

    expect(result.ready).toBe(true);
    expect(result.blocked).toBe(false);
    expect(result.state).toBe(BUNDLE_STATES.READY);
    expect(result.bundleVersion).toBe('cached-ready-version');
    expect(result.diagnostics).toMatchObject({
      offlineFallbackUsed: true,
      fallbackReason: 'service-worker-validation-not-ready',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('falls back to the last ready offline record when service-worker validation reports not-ready', async () => {
    const localStorage = createStorage();
    localStorage.setItem(OFFLINE_BUNDLE_STORAGE_KEY, JSON.stringify({
      bundleVersion: 'cached-ready-version',
      ready: true,
      state: BUNDLE_STATES.READY,
      validatedAtMs: 1234,
      manifestDigest: 'fnv32:12345678',
      diagnosticsSummary: {
        missingAssetCount: 0,
        mismatchedAssetCount: 0,
      },
    }));

    const runtime = {
      navigator: {
        onLine: false,
        serviceWorker: {
          controller: {
            postMessage: (_message, ports) => {
              setTimeout(() => {
                ports[0]?._peer?.onmessage?.({
                  data: {
                    ok: true,
                    messageId: _message.messageId,
                    result: {
                      ready: false,
                      state: BUNDLE_STATES.EMPTY,
                      bundleVersion: 'cached-ready-version',
                      validatedAtMs: 5678,
                      diagnostics: {
                        missingAssetCount: 1,
                      },
                    },
                  },
                });
              }, 0);
            },
          },
        },
      },
      localStorage,
      caches: new MemoryCacheStorage(),
      fetch: vi.fn(),
      MessageChannel: FakeMessageChannel,
    };

    const originalMessageChannel = globalThis.MessageChannel;
    globalThis.MessageChannel = FakeMessageChannel;

    try {
      const result = await ensureBundleReady({ runtime });

      expect(result.ready).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.state).toBe(BUNDLE_STATES.READY);
      expect(result.bundleVersion).toBe('cached-ready-version');
      expect(result.diagnostics).toMatchObject({
        offlineFallbackUsed: true,
        fallbackReason: 'service-worker-validation-not-ready',
        serviceWorkerValidation: {
          ready: false,
          state: BUNDLE_STATES.EMPTY,
          diagnostics: {
            missingAssetCount: 1,
          },
        },
      });
    } finally {
      globalThis.MessageChannel = originalMessageChannel;
    }
  });

  it('preserves service-worker validation command failures when falling back to local cache validation', async () => {
    const localStorage = createStorage();
    const cacheStorage = new MemoryCacheStorage();
    const candidateCacheNames = new Set([
      'uhdr-ai-models-test',
      buildRuntimeBundleCacheNames('dev-unversioned-app').aiModels,
      buildRuntimeBundleCacheNames(import.meta.env.VITE_APP_ASSET_VERSION || '').aiModels,
    ]);
    const manifest = {
      bundleVersion: '1|a|b',
      requiredAssets: [
        {
          id: 'gmnet-smoke',
          url: '/models/gmnet-smoke-128.png',
          cacheName: 'uhdr-ai-models-test',
          sha256: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          byteLength: 4,
          kind: 'smoke',
        },
      ],
    };

    for (const cacheName of candidateCacheNames) {
      const cache = await cacheStorage.open(cacheName);
      await cache.put(
        '/models/gmnet-smoke-128.png',
        new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }),
      );
      await cache.put(
        '/ultrahdr-pwa-svelte/models/gmnet-smoke-128.png',
        new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }),
      );
    }

    const runtime = {
      navigator: {
        onLine: true,
        serviceWorker: {
          controller: {
            postMessage: (message, ports) => {
              setTimeout(() => {
                ports[0]?._peer?.onmessage?.({
                  data: {
                    ok: false,
                    messageId: message.messageId,
                    error: {
                      type: 'ServiceWorkerBundleCommandError',
                      code: 'RUNTIME_INIT_OFFLINE_BUNDLE_COMMAND_FAILED',
                      message: 'validate failed in service worker',
                      diagnostics: {
                        swState: 'redundant',
                      },
                    },
                  },
                });
              }, 0);
            },
          },
        },
      },
      localStorage,
      caches: cacheStorage,
      fetch: vi.fn(),
      MessageChannel: FakeMessageChannel,
    };

    const originalMessageChannel = globalThis.MessageChannel;
    globalThis.MessageChannel = FakeMessageChannel;

    try {
      const result = await validateBundle({
        runtime,
        manifest,
        hashBuffer: async () => 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      });

      expect(result.ready).toBe(true);
      expect(result.diagnostics).toMatchObject({
        serviceWorkerValidationError: {
          message: 'validate failed in service worker',
          code: 'RUNTIME_INIT_OFFLINE_BUNDLE_COMMAND_FAILED',
          diagnostics: {
            swState: 'redundant',
          },
          swCommand: {
            type: 'UHDR_VALIDATE_BUNDLE',
            responseOk: false,
          },
        },
      });
    } finally {
      globalThis.MessageChannel = originalMessageChannel;
    }
  });
});
