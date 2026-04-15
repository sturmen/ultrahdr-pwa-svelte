export type RuntimeAssetVersionKind = 'app' | 'wasm' | 'none';
export type RuntimeAssetResponseKind = 'text' | 'arrayBuffer' | 'response';
export type RuntimeAssetCacheKey = 'wasmAssets' | 'libheifAssets' | 'onnxWasmAssets' | null;
export type RuntimeAssetKind = 'runtime-script' | 'wasm';

export interface RuntimeAssetDescriptor {
  id: string;
  path: string;
  sourcePath: string;
  bundleCacheName: string;
  cacheKey: RuntimeAssetCacheKey;
  kind: RuntimeAssetKind;
  versionKind: RuntimeAssetVersionKind;
  responseKind: RuntimeAssetResponseKind;
  manifestRequired: boolean;
}

function createRuntimeAssetDescriptor(
  descriptor: RuntimeAssetDescriptor,
): RuntimeAssetDescriptor {
  return Object.freeze({ ...descriptor });
}

export const ULTRAHDR_WASM_SCRIPT_ASSET = createRuntimeAssetDescriptor({
  id: 'ultrahdr-wasm-js',
  path: 'assets/ultrahdr_wasm.js',
  sourcePath: 'public/assets/ultrahdr_wasm.js',
  bundleCacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheKey: 'wasmAssets',
  kind: 'runtime-script',
  versionKind: 'wasm',
  responseKind: 'text',
  manifestRequired: true,
});

export const ULTRAHDR_WASM_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'ultrahdr-wasm-bin',
  path: 'assets/ultrahdr_wasm.wasm',
  sourcePath: 'public/assets/ultrahdr_wasm.wasm',
  bundleCacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheKey: 'wasmAssets',
  kind: 'wasm',
  versionKind: 'wasm',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const JPEGLI_WASM_SCRIPT_ASSET = createRuntimeAssetDescriptor({
  id: 'jpegli-wasm-js',
  path: 'assets/jpegli_wasm.js',
  sourcePath: 'public/assets/jpegli_wasm.js',
  bundleCacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheKey: 'wasmAssets',
  kind: 'runtime-script',
  versionKind: 'wasm',
  responseKind: 'text',
  manifestRequired: true,
});

export const JPEGLI_WASM_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'jpegli-wasm-bin',
  path: 'assets/jpegli_wasm.wasm',
  sourcePath: 'public/assets/jpegli_wasm.wasm',
  bundleCacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheKey: 'wasmAssets',
  kind: 'wasm',
  versionKind: 'wasm',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const JPEGTRAN_WASM_SCRIPT_ASSET = createRuntimeAssetDescriptor({
  id: 'jpegtran-wasm-js',
  path: 'assets/jpegtran_wasm.js',
  sourcePath: 'public/assets/jpegtran_wasm.js',
  bundleCacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheKey: 'wasmAssets',
  kind: 'runtime-script',
  versionKind: 'wasm',
  responseKind: 'text',
  manifestRequired: true,
});

export const JPEGTRAN_WASM_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'jpegtran-wasm-bin',
  path: 'assets/jpegtran_wasm.wasm',
  sourcePath: 'public/assets/jpegtran_wasm.wasm',
  bundleCacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheKey: 'wasmAssets',
  kind: 'wasm',
  versionKind: 'wasm',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const LIBHEIF_WASM_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'libheif-wasm-bin',
  path: 'assets/libheif.wasm',
  sourcePath: 'node_modules/libheif-js/libheif-wasm/libheif.wasm',
  bundleCacheName: 'uhdr-libheif-assets-runtime-bundle',
  cacheKey: 'libheifAssets',
  kind: 'wasm',
  versionKind: 'app',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_MJS_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-mjs',
  path: 'assets/ort-wasm-simd-threaded.mjs',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'runtime-script',
  versionKind: 'none',
  responseKind: 'text',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_ASYNCIFY_MJS_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-asyncify-mjs',
  path: 'assets/ort-wasm-simd-threaded.asyncify.mjs',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.mjs',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'runtime-script',
  versionKind: 'none',
  responseKind: 'text',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_JSEP_MJS_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-jsep-mjs',
  path: 'assets/ort-wasm-simd-threaded.jsep.mjs',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'runtime-script',
  versionKind: 'none',
  responseKind: 'text',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_JSPI_MJS_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-jspi-mjs',
  path: 'assets/ort-wasm-simd-threaded.jspi.mjs',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jspi.mjs',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'runtime-script',
  versionKind: 'none',
  responseKind: 'text',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_ASYNCIFY_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-asyncify',
  path: 'assets/ort-wasm-simd-threaded.asyncify.wasm',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'wasm',
  versionKind: 'none',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_JSEP_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-jsep',
  path: 'assets/ort-wasm-simd-threaded.jsep.wasm',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'wasm',
  versionKind: 'none',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_JSPI_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded-jspi',
  path: 'assets/ort-wasm-simd-threaded.jspi.wasm',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jspi.wasm',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'wasm',
  versionKind: 'none',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const ORT_WASM_SIMD_THREADED_BINARY_ASSET = createRuntimeAssetDescriptor({
  id: 'ort-wasm-simd-threaded',
  path: 'assets/ort-wasm-simd-threaded.wasm',
  sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
  bundleCacheName: 'uhdr-onnx-wasm-runtime-bundle',
  cacheKey: 'onnxWasmAssets',
  kind: 'wasm',
  versionKind: 'none',
  responseKind: 'arrayBuffer',
  manifestRequired: true,
});

export const REQUIRED_RUNTIME_ASSET_DESCRIPTORS: readonly RuntimeAssetDescriptor[] = Object.freeze([
  ULTRAHDR_WASM_SCRIPT_ASSET,
  ULTRAHDR_WASM_BINARY_ASSET,
  JPEGLI_WASM_SCRIPT_ASSET,
  JPEGLI_WASM_BINARY_ASSET,
  JPEGTRAN_WASM_SCRIPT_ASSET,
  JPEGTRAN_WASM_BINARY_ASSET,
  LIBHEIF_WASM_BINARY_ASSET,
  ORT_WASM_SIMD_THREADED_MJS_ASSET,
  ORT_WASM_SIMD_THREADED_ASYNCIFY_MJS_ASSET,
  ORT_WASM_SIMD_THREADED_JSEP_MJS_ASSET,
  ORT_WASM_SIMD_THREADED_JSPI_MJS_ASSET,
  ORT_WASM_SIMD_THREADED_ASYNCIFY_BINARY_ASSET,
  ORT_WASM_SIMD_THREADED_JSEP_BINARY_ASSET,
  ORT_WASM_SIMD_THREADED_JSPI_BINARY_ASSET,
  ORT_WASM_SIMD_THREADED_BINARY_ASSET,
]);

function normalizeAssetPath(assetUrl: unknown): string {
  const normalized = String(assetUrl || '').trim();
  if (!normalized) {
    return '';
  }

  try {
    return new URL(normalized, 'https://ultrahdr.invalid').pathname.replace(/^\/+/, '');
  } catch {
    return normalized.replace(/^\/+/, '');
  }
}

export function findRuntimeAssetDescriptorByPath(assetUrl: unknown): RuntimeAssetDescriptor | null {
  const normalizedPath = normalizeAssetPath(assetUrl);
  if (!normalizedPath) {
    return null;
  }

  return REQUIRED_RUNTIME_ASSET_DESCRIPTORS.find((descriptor) => descriptor.path === normalizedPath) ?? null;
}
