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

    class FakeMessageChannel {
      constructor() {
        this.port1 = { onmessage: null, _peer: null };
        this.port2 = { onmessage: null, _peer: this.port1 };
        this.port1._peer = this.port2;
      }
    }

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
    } finally {
      globalThis.MessageChannel = originalMessageChannel;
    }
  });
});
