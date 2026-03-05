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

class MemoryCache {
  constructor() {
    this.entries = new Map();
  }

  async put(request, response) {
    const key = typeof request === 'string' ? request : request.url;
    this.entries.set(key, response.clone());
  }

  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
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

    const cache = await cacheStorage.open('uhdr-ai-models-test');
    await cache.put(
      '/models/gmnet-smoke-128.png',
      new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 }),
    );

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
});
