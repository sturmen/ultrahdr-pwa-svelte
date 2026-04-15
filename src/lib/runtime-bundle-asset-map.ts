import { findRuntimeAssetDescriptorByPath } from './runtime-asset-definitions.ts';

const DEFAULT_APP_ASSET_VERSION = 'dev-unversioned-app';

export const RUNTIME_CACHE_PREFIX = 'uhdr-runtime';
export const WASM_ASSET_CACHE_PREFIX = 'uhdr-wasm-assets';
export const LIBHEIF_ASSET_CACHE_PREFIX = 'uhdr-libheif-assets';
export const AI_MODEL_CACHE_PREFIX = 'uhdr-ai-models';
export const ONNX_WASM_CACHE_PREFIX = 'uhdr-onnx-wasm';
export const AI_MODEL_CACHE_MAX_ENTRIES = 32;

export type RuntimeBundleCacheNames = {
  runtime: string;
  wasmAssets: string;
  libheifAssets: string;
  aiModels: string;
  onnxWasmAssets: string;
};

function normalizeAppAssetVersion(appAssetVersion: unknown): string {
  if (typeof appAssetVersion !== 'string') {
    return DEFAULT_APP_ASSET_VERSION;
  }
  const normalized = appAssetVersion.trim();
  return normalized || DEFAULT_APP_ASSET_VERSION;
}

function normalizeAssetPath(assetUrl: unknown): string {
  const normalized = String(assetUrl || '').trim();
  if (!normalized) {
    return '';
  }

  try {
    return new URL(normalized, 'https://ultrahdr.invalid').pathname;
  } catch {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
}

export function buildRuntimeBundleCacheNames(appAssetVersion: unknown): RuntimeBundleCacheNames {
  const resolvedAppAssetVersion = normalizeAppAssetVersion(appAssetVersion);
  return {
    runtime: `${RUNTIME_CACHE_PREFIX}-${resolvedAppAssetVersion}`,
    wasmAssets: `${WASM_ASSET_CACHE_PREFIX}-${resolvedAppAssetVersion}`,
    libheifAssets: `${LIBHEIF_ASSET_CACHE_PREFIX}-${resolvedAppAssetVersion}`,
    aiModels: `${AI_MODEL_CACHE_PREFIX}-${resolvedAppAssetVersion}`,
    onnxWasmAssets: `${ONNX_WASM_CACHE_PREFIX}-${resolvedAppAssetVersion}`,
  };
}

export function resolveRuntimeBundleCacheName(
  assetUrl: unknown,
  cacheNames?: Partial<RuntimeBundleCacheNames> | null,
): string | null {
  const pathname = normalizeAssetPath(assetUrl);
  if (!pathname) {
    return null;
  }

  const runtimeAsset = findRuntimeAssetDescriptorByPath(pathname);
  if (runtimeAsset?.cacheKey === 'wasmAssets') {
    return cacheNames?.wasmAssets || null;
  }
  if (runtimeAsset?.cacheKey === 'libheifAssets') {
    return cacheNames?.libheifAssets || null;
  }
  if (runtimeAsset?.cacheKey === 'onnxWasmAssets') {
    return cacheNames?.onnxWasmAssets || null;
  }

  if (/\/models\/gmnet-smoke-128\.png$/.test(pathname)) {
    return cacheNames?.aiModels || null;
  }

  if (/\/models\/.*\.onnx(\.data)?$/.test(pathname)) {
    return cacheNames?.aiModels || null;
  }

  return null;
}
