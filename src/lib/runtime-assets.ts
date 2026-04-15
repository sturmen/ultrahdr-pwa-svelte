import type { RuntimeBundleCacheNames } from './runtime-bundle-asset-map.ts';
import { resolveRuntimeBundleCacheName } from './runtime-bundle-asset-map.ts';
import type {
  RuntimeAssetDescriptor,
  RuntimeAssetVersionKind,
} from './runtime-asset-definitions.ts';

export type RuntimeAssetCacheSource = 'network' | 'cache';

type RuntimeAssetRuntime = typeof globalThis & {
  location?: Location | URL;
  fetch?: typeof fetch;
  caches?: CacheStorage;
};

const APP_ASSET_VERSION = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
  ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
  : '';

const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
  ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
  : '';

function resolveRuntimeAssetBaseUrl(): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  if (baseUrl !== '/') {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  const pathname = globalThis.location?.pathname || '/';
  if (!pathname || pathname === '/') {
    return '/';
  }

  const normalizedPath = pathname.endsWith('/')
    ? pathname
    : pathname.replace(/\/[^/]*$/, '/');
  return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
}

function resolveRuntimeAssetVersion(versionKind: RuntimeAssetVersionKind): string {
  if (versionKind === 'app') {
    return APP_ASSET_VERSION;
  }
  if (versionKind === 'wasm') {
    return WASM_ASSET_VERSION;
  }
  return '';
}

function appendVersionQuery(url: string, versionKind: RuntimeAssetVersionKind): string {
  const version = resolveRuntimeAssetVersion(versionKind);
  if (!version) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

export function resolveVersionedRuntimeAssetPath(
  assetPath: string,
  versionKind: RuntimeAssetVersionKind,
): string {
  const normalizedPath = String(assetPath || '').replace(/^\/+/, '');
  return appendVersionQuery(`${resolveRuntimeAssetBaseUrl()}${normalizedPath}`, versionKind);
}

export function resolveRuntimeAssetUrl(descriptor: RuntimeAssetDescriptor): string {
  return resolveVersionedRuntimeAssetPath(descriptor.path, descriptor.versionKind);
}

export function resolveFetchableRuntimeAssetUrl(
  descriptor: RuntimeAssetDescriptor,
  runtime: RuntimeAssetRuntime = globalThis,
): string {
  const assetUrl = resolveRuntimeAssetUrl(descriptor);
  try {
    return new URL(assetUrl, runtime.location?.href || 'https://ultrahdr.invalid/').toString();
  } catch {
    return assetUrl;
  }
}

export async function fetchRuntimeAsset(
  descriptor: RuntimeAssetDescriptor,
  runtime: RuntimeAssetRuntime = globalThis,
): Promise<{ response: Response; cacheSource: RuntimeAssetCacheSource }> {
  const requestUrl = resolveFetchableRuntimeAssetUrl(descriptor, runtime);
  const fetchFn = runtime.fetch || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    throw new Error(`fetch is unavailable for runtime asset ${descriptor.id}`);
  }

  try {
    const response = await fetchFn.call(runtime, requestUrl, { credentials: 'same-origin' });
    if (!response?.ok) {
      throw new Error(`Failed to fetch runtime asset ${descriptor.id}: ${response?.status || 'unknown'}`);
    }
    return { response, cacheSource: 'network' };
  } catch (fetchError) {
    const cacheStorage = runtime.caches;
    if (!cacheStorage || typeof cacheStorage.match !== 'function') {
      throw fetchError;
    }

    const cachedResponse = await cacheStorage.match(requestUrl) || await cacheStorage.match(resolveRuntimeAssetUrl(descriptor));
    if (!cachedResponse) {
      throw fetchError;
    }
    return { response: cachedResponse, cacheSource: 'cache' };
  }
}

export async function fetchRuntimeAssetText(
  descriptor: RuntimeAssetDescriptor,
  runtime: RuntimeAssetRuntime = globalThis,
): Promise<{ asset: string; cacheSource: RuntimeAssetCacheSource }> {
  const { response, cacheSource } = await fetchRuntimeAsset(descriptor, runtime);
  return {
    asset: await response.text(),
    cacheSource,
  };
}

export async function fetchRuntimeAssetBuffer(
  descriptor: RuntimeAssetDescriptor,
  runtime: RuntimeAssetRuntime = globalThis,
): Promise<{ asset: ArrayBuffer; cacheSource: RuntimeAssetCacheSource }> {
  const { response, cacheSource } = await fetchRuntimeAsset(descriptor, runtime);
  return {
    asset: await response.arrayBuffer(),
    cacheSource,
  };
}

export function getRuntimeAssetCacheName(
  descriptor: RuntimeAssetDescriptor,
  cacheNames?: Partial<RuntimeBundleCacheNames> | null,
): string | null {
  return resolveRuntimeBundleCacheName(descriptor.path, cacheNames);
}

export function buildRuntimeAssetDiagnosticsContext(
  descriptor: RuntimeAssetDescriptor,
  extras: {
    cacheSource?: RuntimeAssetCacheSource | null;
    byteLength?: number | null;
    errorCategory?: string | null;
    cacheName?: string | null;
  } = {},
): Record<string, unknown> {
  return {
    assetId: descriptor.id,
    versionKind: descriptor.versionKind,
    cacheName: extras.cacheName ?? null,
    cacheSource: extras.cacheSource ?? null,
    byteLength: typeof extras.byteLength === 'number' ? extras.byteLength : null,
    errorCategory: typeof extras.errorCategory === 'string' ? extras.errorCategory : null,
  };
}
