import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildRuntimeBundleCacheNames } from '../runtime-bundle-asset-map.ts';

describe('runtime-assets', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: new URL('https://ultrahdr.invalid/'),
    });
    delete (globalThis as typeof globalThis & { caches?: CacheStorage }).caches;
  });

  it('resolves versioned runtime asset URLs under the custom-domain site root', async () => {
    const runtimeAssets = await import('../runtime-assets.ts');
    const descriptors = await import('../runtime-asset-definitions.ts');

    expect(runtimeAssets.resolveRuntimeAssetUrl(descriptors.ULTRAHDR_WASM_BINARY_ASSET))
      .toBe('/assets/ultrahdr_wasm.wasm?v=test-wasm-version');
    expect(runtimeAssets.resolveRuntimeAssetUrl(descriptors.LIBHEIF_WASM_BINARY_ASSET))
      .toBe('/assets/libheif.wasm?v=test-app-version');
    expect(runtimeAssets.resolveRuntimeAssetUrl(descriptors.LIBHEIF_BUNDLE_SCRIPT_ASSET))
      .toBe('/assets/libheif-bundle.mjs?v=test-app-version');
    expect(
      runtimeAssets.resolveVersionedRuntimeAssetPath(
        'assets/custom-helper.wasm',
        'wasm',
      ),
    ).toBe('/assets/custom-helper.wasm?v=test-wasm-version');
  });

  it('resolves root-deployment runtime assets from the app root when called inside a bundled worker chunk', async () => {
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: new URL('https://ultrahdr.invalid/assets/processing-worker-BR9vD1QA.js'),
    });
    const runtimeAssets = await import('../runtime-assets.ts');
    const descriptors = await import('../runtime-asset-definitions.ts');

    expect(runtimeAssets.resolveRuntimeAssetUrl(descriptors.JPEGLI_WASM_BINARY_ASSET))
      .toBe('/assets/jpegli_wasm.wasm?v=test-wasm-version');
  });

  it('fetches runtime asset buffers from Cache Storage when network fetch fails', async () => {
    const cachedResponse = new Response(new Uint8Array([1, 2, 3, 4]).buffer, { status: 200 });
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline');
    }));
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: {
        match: vi.fn(async () => cachedResponse),
      },
    });

    const runtimeAssets = await import('../runtime-assets.ts');
    const descriptors = await import('../runtime-asset-definitions.ts');

    const result = await runtimeAssets.fetchRuntimeAssetBuffer(descriptors.JPEGLI_WASM_BINARY_ASSET);

    expect(result.cacheSource).toBe('cache');
    expect(Array.from(new Uint8Array(result.asset))).toEqual([1, 2, 3, 4]);
    expect(globalThis.caches?.match).toHaveBeenCalledWith(
      'https://ultrahdr.invalid/assets/jpegli_wasm.wasm?v=test-wasm-version',
    );
  });

  it('maps canonical runtime asset descriptors onto runtime bundle cache names', async () => {
    const runtimeAssets = await import('../runtime-assets.ts');
    const descriptors = await import('../runtime-asset-definitions.ts');
    const cacheNames = buildRuntimeBundleCacheNames('asset-version-123');

    expect(runtimeAssets.getRuntimeAssetCacheName(descriptors.JPEGLI_WASM_BINARY_ASSET, cacheNames))
      .toBe(cacheNames.wasmAssets);
    expect(runtimeAssets.getRuntimeAssetCacheName(descriptors.LIBHEIF_WASM_BINARY_ASSET, cacheNames))
      .toBe(cacheNames.libheifAssets);
    expect(runtimeAssets.getRuntimeAssetCacheName(descriptors.LIBHEIF_BUNDLE_SCRIPT_ASSET, cacheNames))
      .toBe(cacheNames.libheifAssets);
    expect(runtimeAssets.getRuntimeAssetCacheName(descriptors.ORT_WASM_SIMD_THREADED_MJS_ASSET, cacheNames))
      .toBe(cacheNames.onnxWasmAssets);
  });

  it('builds bounded diagnostics context for runtime asset fetches', async () => {
    const runtimeAssets = await import('../runtime-assets.ts');
    const descriptors = await import('../runtime-asset-definitions.ts');

    expect(
      runtimeAssets.buildRuntimeAssetDiagnosticsContext(descriptors.JPEGTRAN_WASM_SCRIPT_ASSET, {
        cacheSource: 'network',
        byteLength: 1024,
        errorCategory: 'asset-fetch-failed',
      }),
    ).toEqual({
      assetId: 'jpegtran-wasm-js',
      versionKind: 'wasm',
      cacheName: null,
      cacheSource: 'network',
      byteLength: 1024,
      errorCategory: 'asset-fetch-failed',
    });
  });
});
