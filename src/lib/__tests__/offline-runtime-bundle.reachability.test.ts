/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BUNDLE_STATES,
  ensureBundleReady,
  OFFLINE_BUNDLE_STORAGE_KEY,
} from '../offline-runtime-bundle.js';
import { buildRuntimeBundleCacheNames } from '../runtime-bundle-asset-map.js';

class MemoryCache {
  private entries = new Map<string, Response>();

  private normalizeKey(request: Request | string): string {
    const rawKey = typeof request === 'string' ? request : request.url;
    try {
      const url = new URL(rawKey, 'https://ultrahdr.invalid');
      return `${url.pathname}${url.search}`;
    } catch {
      return rawKey;
    }
  }

  async put(request: Request | string, response: Response): Promise<void> {
    const key = this.normalizeKey(request);
    this.entries.set(key, response.clone());
  }

  async match(request: Request | string): Promise<Response | undefined> {
    const key = this.normalizeKey(request);
    return this.entries.get(key)?.clone();
  }
}

class MemoryCacheStorage {
  private caches = new Map<string, MemoryCache>();

  async open(name: string): Promise<MemoryCache> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MemoryCache());
    }
    return this.caches.get(name)!;
  }
}

function createStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(String(key), String(value));
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(String(key));
    }),
    clear: vi.fn(() => {
      data.clear();
    }),
  };
}

describe('offline runtime bundle reachability fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the cached ready record when manifest fetch fails but a prepared bundle already exists', async () => {
    const localStorage = createStorage();
    localStorage.setItem(
      OFFLINE_BUNDLE_STORAGE_KEY,
      JSON.stringify({
        bundleVersion: 'cached-ready-version',
        ready: true,
        state: BUNDLE_STATES.READY,
        validatedAtMs: 1234,
        manifestDigest: 'fnv32:12345678',
        diagnosticsSummary: {
          missingAssetCount: 0,
          mismatchedAssetCount: 0,
        },
      }),
    );
    const loadManifest = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const result = await ensureBundleReady({
      runtime: {
        navigator: { onLine: true, serviceWorker: { controller: null, ready: Promise.resolve(null) } },
        localStorage,
        caches: new MemoryCacheStorage(),
        fetch: vi.fn(),
      },
      loadManifest,
    });

    expect(result.ready).toBe(true);
    expect(result.blocked).toBe(false);
    expect(result.state).toBe(BUNDLE_STATES.READY);
    expect(result.bundleVersion).toBe('cached-ready-version');
    expect(result.diagnostics).toMatchObject({
      offlineFallbackUsed: true,
    });
  });

  it('treats manifest fetch failure as an offline block when no prepared bundle exists', async () => {
    const localStorage = createStorage();
    const loadManifest = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const result = await ensureBundleReady({
      runtime: {
        navigator: { onLine: true, serviceWorker: { controller: null, ready: Promise.resolve(null) } },
        localStorage,
        caches: new MemoryCacheStorage(),
        fetch: vi.fn(),
      },
      loadManifest,
    });

    expect(result.ready).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.state).toBe(BUNDLE_STATES.EMPTY);
    expect(result.diagnostics).toMatchObject({
      reason: 'offline-without-ready-bundle',
    });
  });

  it('validates cached assets from a stored manifest when reachability fails', async () => {
    const localStorage = createStorage();
    const cacheStorage = new MemoryCacheStorage();
    const candidateCacheNames = new Set([
      'uhdr-ai-models-test',
      buildRuntimeBundleCacheNames('dev-unversioned-app').aiModels,
      buildRuntimeBundleCacheNames(import.meta.env.VITE_APP_ASSET_VERSION || '').aiModels,
    ]);
    const cachedManifest = {
      bundleVersion: '1|cached',
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
    localStorage.setItem(
      OFFLINE_BUNDLE_STORAGE_KEY,
      JSON.stringify({
        bundleVersion: '1|cached',
        ready: true,
        state: BUNDLE_STATES.READY,
        validatedAtMs: 1234,
        manifestDigest: 'fnv32:12345678',
        cachedManifest,
        diagnosticsSummary: {
          missingAssetCount: 0,
          mismatchedAssetCount: 0,
        },
      }),
    );
    const loadManifest = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const result = await ensureBundleReady({
      runtime: {
        navigator: { onLine: true, serviceWorker: { controller: null, ready: Promise.resolve(null) } },
        localStorage,
        caches: cacheStorage,
        fetch: vi.fn(),
      },
      loadManifest,
      hashBuffer: async () => 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });

    expect(result.ready).toBe(true);
    expect(result.blocked).toBe(false);
    expect(result.state).toBe(BUNDLE_STATES.READY);
    expect(result.bundleVersion).toBe('1|cached');
  });
});
