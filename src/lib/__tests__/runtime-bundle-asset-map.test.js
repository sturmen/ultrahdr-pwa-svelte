import { describe, expect, it } from 'vitest';
import {
  buildRuntimeBundleCacheNames,
  resolveRuntimeBundleCacheName,
} from '../runtime-bundle-asset-map.js';

describe('runtime bundle asset map', () => {
  it('maps offline bundle asset URLs to the same caches used by runtime fetch routes', () => {
    const cacheNames = buildRuntimeBundleCacheNames('asset-version-123');

    expect(resolveRuntimeBundleCacheName('assets/jpegli_wasm.wasm', cacheNames))
      .toBe(cacheNames.wasmAssets);
    expect(resolveRuntimeBundleCacheName('assets/libheif.wasm', cacheNames))
      .toBe(cacheNames.libheifAssets);
    expect(resolveRuntimeBundleCacheName('assets/ort-wasm-simd-threaded.wasm', cacheNames))
      .toBe(cacheNames.onnxWasmAssets);
    expect(resolveRuntimeBundleCacheName('models/gmnet-realworld-global-inline.onnx', cacheNames))
      .toBe(cacheNames.aiModels);
    expect(resolveRuntimeBundleCacheName('models/gmnet-smoke-128.png', cacheNames))
      .toBe(cacheNames.aiModels);
  });
});

