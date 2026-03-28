import { describe, expect, it } from 'vitest';
import {
  AI_MODEL_CACHE_PREFIX,
  AI_MODEL_CACHE_MAX_ENTRIES,
  buildRuntimeBundleCacheNames,
  resolveRuntimeBundleCacheName,
} from '../runtime-bundle-asset-map.ts';
import { DEFAULT_REQUIRED_ASSET_SPECS } from '../../../scripts/build-runtime-bundle-manifest.ts';

describe('runtime bundle asset map', () => {
  it('maps offline bundle asset URLs to the same caches used by runtime fetch routes', () => {
    const cacheNames = buildRuntimeBundleCacheNames('asset-version-123');

    expect(resolveRuntimeBundleCacheName('assets/jpegli_wasm.wasm', cacheNames))
      .toBe(cacheNames.wasmAssets);
    expect(resolveRuntimeBundleCacheName('assets/libheif.wasm', cacheNames))
      .toBe(cacheNames.libheifAssets);
    expect(resolveRuntimeBundleCacheName('assets/ort-wasm-simd-threaded.wasm', cacheNames))
      .toBe(cacheNames.onnxWasmAssets);
    expect(resolveRuntimeBundleCacheName('assets/ort-wasm-simd-threaded.asyncify.mjs', cacheNames))
      .toBe(cacheNames.onnxWasmAssets);
    expect(resolveRuntimeBundleCacheName('models/gmnet-realworld-global-inline.onnx', cacheNames))
      .toBe(cacheNames.aiModels);
    expect(resolveRuntimeBundleCacheName('models/gmnet-smoke-128.png', cacheNames))
      .toBe(cacheNames.aiModels);
  });

  it('allocates enough AI-model cache entries to retain the default offline bundle assets', () => {
    const requiredAiModelEntries = DEFAULT_REQUIRED_ASSET_SPECS.filter(
      (asset) => asset.cacheName === `${AI_MODEL_CACHE_PREFIX}-runtime-bundle`,
    ).length;

    expect(AI_MODEL_CACHE_MAX_ENTRIES).toBeGreaterThanOrEqual(requiredAiModelEntries);
  });
});
