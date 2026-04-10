/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { storeSharedFiles } from './lib/share-store.js';
import {
    AI_MODEL_CACHE_PREFIX,
    AI_MODEL_CACHE_MAX_ENTRIES,
    LIBHEIF_ASSET_CACHE_PREFIX,
    ONNX_WASM_CACHE_PREFIX,
    RUNTIME_CACHE_PREFIX,
    WASM_ASSET_CACHE_PREFIX,
    buildRuntimeBundleCacheNames,
    type RuntimeBundleCacheNames,
    resolveRuntimeBundleCacheName,
} from './lib/runtime-bundle-asset-map.js';
import type { PrecacheEntry } from 'workbox-precaching';

type ServiceWorkerGlobalScopeWithManifest = ServiceWorkerGlobalScope & typeof globalThis & {
    __WB_MANIFEST: Array<PrecacheEntry | string>;
};

type RuntimeBundleAssetRecord = {
    id: string;
    url: string;
    cacheName: string;
    byteLength: number;
    sha256: string;
};

type RuntimeBundleManifest = {
    bundleVersion: string;
    requiredAssets: RuntimeBundleAssetRecord[];
};

type RuntimeBundleDiagnostics = {
    missingAssetCount?: number;
    mismatchedAssetCount?: number;
    missingAssetIds?: string[];
    mismatchedAssetIds?: string[];
    failedAssetId?: string;
    failedAssetUrl?: string;
    failedAssetStatus?: number | null;
};

type RuntimeBundleState = 'READY' | 'CORRUPT' | 'EMPTY' | 'FAILED';

type RuntimeBundleValidationResult = {
    ready: boolean;
    blocked: boolean;
    state: RuntimeBundleState;
    bundleVersion: string;
    validatedAtMs: number;
    manifestDigest: string;
    diagnostics: RuntimeBundleDiagnostics;
};

type ServiceWorkerMessageType =
    | 'UHDR_PREPARE_BUNDLE'
    | 'UHDR_VALIDATE_BUNDLE'
    | 'UHDR_REPAIR_BUNDLE'
    | 'UHDR_GET_APP_ASSET_VERSION';

type ServiceWorkerRequestMessage = {
    type: ServiceWorkerMessageType;
    messageId?: string | null;
};

type ServiceWorkerErrorPayload = {
    type: string;
    code: string;
    message: string;
    stackSnippet: string | null;
};

declare const self: ServiceWorkerGlobalScopeWithManifest;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const MAX_SHARED_FILES = 32;
const MAX_SHARED_TOTAL_BYTES = 300 * 1024 * 1024;
const APP_ASSET_VERSION = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
    : '';
const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
    : '';
const RESOLVED_APP_ASSET_VERSION = APP_ASSET_VERSION || 'dev-unversioned-app';
const OFFLINE_BUNDLE_MANIFEST_PATH = 'models/runtime-bundle-manifest.json';
const UHDR_PREPARE_BUNDLE = 'UHDR_PREPARE_BUNDLE';
const UHDR_VALIDATE_BUNDLE = 'UHDR_VALIDATE_BUNDLE';
const UHDR_REPAIR_BUNDLE = 'UHDR_REPAIR_BUNDLE';
const UHDR_GET_APP_ASSET_VERSION = 'UHDR_GET_APP_ASSET_VERSION';
const CACHE_NAMES = buildRuntimeBundleCacheNames(RESOLVED_APP_ASSET_VERSION);
const RUNTIME_CACHE = CACHE_NAMES.runtime;
const WASM_ASSET_CACHE = CACHE_NAMES.wasmAssets;
const LIBHEIF_ASSET_CACHE = CACHE_NAMES.libheifAssets;
const AI_MODEL_CACHE = CACHE_NAMES.aiModels;
const ONNX_WASM_CACHE = CACHE_NAMES.onnxWasmAssets;

self.addEventListener('message', (event) => {
    const message = event.data as { type?: unknown } | null;
    if (message?.type === 'SKIP_WAITING') {
        void self.skipWaiting();
    }
});

function resolveBasePath(): string {
    const scope = self.registration?.scope || self.location?.origin || '/';
    const scopeUrl = new URL(scope, self.location.origin);
    return scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : `${scopeUrl.pathname}/`;
}

function resolveRuntimeBundleAssetUrl(assetPath: string): string {
    const normalized = String(assetPath || '').replace(/^\/+/, '');
    const absolute = new URL(`${resolveBasePath()}${normalized}`, self.location.origin);
    return absolute.href;
}

function createRuntimeBundleDigest(manifest: RuntimeBundleManifest): string {
    const payload = JSON.stringify(manifest || {});
    let hash = 2166136261;
    for (let index = 0; index < payload.length; index += 1) {
        hash ^= payload.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return `fnv32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

async function sha256HexFromBuffer(buffer: BufferSource): Promise<string> {
    if (!self.crypto?.subtle?.digest) {
        throw new Error('crypto.subtle.digest is unavailable in service worker runtime.');
    }
    const digest = await self.crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function isRuntimeBundleAssetRecord(value: unknown): value is RuntimeBundleAssetRecord {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<RuntimeBundleAssetRecord>;
    return typeof candidate.id === 'string'
        && typeof candidate.url === 'string'
        && typeof candidate.cacheName === 'string'
        && typeof candidate.sha256 === 'string'
        && Number.isFinite(Number(candidate.byteLength));
}

function isRuntimeBundleManifest(value: unknown): value is RuntimeBundleManifest {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<RuntimeBundleManifest>;
    return typeof candidate.bundleVersion === 'string'
        && Array.isArray(candidate.requiredAssets)
        && candidate.requiredAssets.every((asset) => isRuntimeBundleAssetRecord(asset));
}

async function loadRuntimeBundleManifest(): Promise<RuntimeBundleManifest> {
    const manifestUrl = resolveRuntimeBundleAssetUrl(OFFLINE_BUNDLE_MANIFEST_PATH);
    const response = await fetch(manifestUrl, { credentials: 'same-origin' });
    if (!response?.ok) {
        throw new Error(`Failed to load runtime bundle manifest (${response?.status || 'unknown'}).`);
    }
    const manifest = await response.json();
    if (!isRuntimeBundleManifest(manifest)) {
        throw new Error('Runtime bundle manifest payload is invalid.');
    }
    return manifest;
}

async function validateRuntimeBundleFromManifest(
    manifest: RuntimeBundleManifest,
): Promise<RuntimeBundleValidationResult> {
    const missingAssets: Array<Pick<RuntimeBundleAssetRecord, 'id' | 'url'>> = [];
    const mismatchedAssets: Array<Pick<RuntimeBundleAssetRecord, 'id' | 'url'> & { reason: 'byteLength' | 'sha256' }> = [];

    for (const requiredAsset of manifest.requiredAssets) {
        const cacheName = resolveRuntimeBundleCacheName(requiredAsset.url, CACHE_NAMES) || requiredAsset.cacheName;
        const cache = await caches.open(cacheName);
        const assetUrl = resolveRuntimeBundleAssetUrl(requiredAsset.url);
        const response = await cache.match(assetUrl);
        if (!response) {
            missingAssets.push({ id: requiredAsset.id, url: requiredAsset.url });
            continue;
        }

        const bytes = await response.arrayBuffer();
        if (
            Number.isFinite(Number(requiredAsset.byteLength))
            && Number(requiredAsset.byteLength) !== bytes.byteLength
        ) {
            mismatchedAssets.push({ id: requiredAsset.id, url: requiredAsset.url, reason: 'byteLength' });
            continue;
        }

        const digest = await sha256HexFromBuffer(bytes);
        if (digest !== requiredAsset.sha256) {
            mismatchedAssets.push({ id: requiredAsset.id, url: requiredAsset.url, reason: 'sha256' });
        }
    }

    const ready = missingAssets.length === 0 && mismatchedAssets.length === 0;
    const state = ready
        ? 'READY'
        : mismatchedAssets.length > 0
            ? 'CORRUPT'
            : 'EMPTY';
    return {
        ready,
        blocked: false,
        state,
        bundleVersion: manifest.bundleVersion,
        validatedAtMs: Date.now(),
        manifestDigest: createRuntimeBundleDigest(manifest),
        diagnostics: {
            missingAssetCount: missingAssets.length,
            mismatchedAssetCount: mismatchedAssets.length,
            missingAssetIds: missingAssets.map((asset) => asset.id),
            mismatchedAssetIds: mismatchedAssets.map((asset) => asset.id),
        },
    };
}

async function prepareRuntimeBundleInSw(
    { force = false }: { force?: boolean } = {},
): Promise<RuntimeBundleValidationResult> {
    const manifest = await loadRuntimeBundleManifest();
    if (!force) {
        const preValidation = await validateRuntimeBundleFromManifest(manifest);
        if (preValidation.ready) {
            return preValidation;
        }
    }

    for (const requiredAsset of manifest.requiredAssets) {
        const assetUrl = resolveRuntimeBundleAssetUrl(requiredAsset.url);
        const response = await fetch(assetUrl, { credentials: 'same-origin' });
        if (!response?.ok) {
            return {
                ready: false,
                blocked: false,
                state: 'FAILED',
                bundleVersion: manifest.bundleVersion,
                validatedAtMs: Date.now(),
                manifestDigest: createRuntimeBundleDigest(manifest),
                diagnostics: {
                    failedAssetId: requiredAsset.id,
                    failedAssetUrl: requiredAsset.url,
                    failedAssetStatus: response?.status || null,
                },
            };
        }
        const cacheName = resolveRuntimeBundleCacheName(requiredAsset.url, CACHE_NAMES) || requiredAsset.cacheName;
        const cache = await caches.open(cacheName);
        await cache.put(assetUrl, response.clone());
    }

    return validateRuntimeBundleFromManifest(manifest);
}

function postMessageResponse(event: ExtendableMessageEvent, payload: unknown): void {
    if (event.ports?.[0]) {
        event.ports[0].postMessage(payload);
        return;
    }
    if (event.source && typeof event.source.postMessage === 'function') {
        event.source.postMessage(payload);
    }
}

function isUltraHdrWasmAssetUrl(url: URL): boolean {
    return /\/assets\/(ultrahdr_wasm|jpegli_wasm|jpegtran_wasm)\.(js|wasm)$/.test(url.pathname);
}

function isLibheifWasmAssetUrl(url: URL): boolean {
    return /\/assets\/libheif\.wasm$/.test(url.pathname);
}

function isAiModelUrl(url: URL): boolean {
    return /\/models\/.*\.onnx(\.data)?$/.test(url.pathname);
}

function isAiModelManifestUrl(url: URL): boolean {
    return /\/models\/.*\.onnx$/.test(url.pathname);
}

function isSmokeAssetUrl(url: URL): boolean {
    return /\/models\/gmnet-smoke-128\.png$/.test(url.pathname);
}

function isVersionedCacheName(cacheName: string, cachePrefix: string): boolean {
    return cacheName === cachePrefix || cacheName.startsWith(`${cachePrefix}-`);
}

async function pruneOutdatedVersionedCaches() {
    const cacheNames = await caches.keys();
    const expectedCacheNames = new Set([RUNTIME_CACHE, WASM_ASSET_CACHE, LIBHEIF_ASSET_CACHE, AI_MODEL_CACHE, ONNX_WASM_CACHE]);
    const managedPrefixes = [
        RUNTIME_CACHE_PREFIX,
        WASM_ASSET_CACHE_PREFIX,
        LIBHEIF_ASSET_CACHE_PREFIX,
        AI_MODEL_CACHE_PREFIX,
        ONNX_WASM_CACHE_PREFIX,
    ];
    await Promise.all(cacheNames.map(async (cacheName) => {
        const managed = managedPrefixes.some((prefix) => isVersionedCacheName(cacheName, prefix));
        if (!managed) {
            return;
        }
        if (!expectedCacheNames.has(cacheName)) {
            await caches.delete(cacheName);
        }
    }));
}

async function pruneOutdatedBinaryAssets() {
    const wasmCache = await caches.open(WASM_ASSET_CACHE);
    const libheifCache = await caches.open(LIBHEIF_ASSET_CACHE);
    const [wasmRequests, libheifRequests] = await Promise.all([wasmCache.keys(), libheifCache.keys()]);

    await Promise.all(wasmRequests.map(async (request) => {
        if (!WASM_ASSET_VERSION) {
            return;
        }
        const requestUrl = new URL(request.url);
        if (isUltraHdrWasmAssetUrl(requestUrl) && requestUrl.searchParams.get('v') !== WASM_ASSET_VERSION) {
            await wasmCache.delete(request);
        }
    }));

    await Promise.all(libheifRequests.map(async (request) => {
        if (!APP_ASSET_VERSION) {
            return;
        }
        const requestUrl = new URL(request.url);
        if (isLibheifWasmAssetUrl(requestUrl) && requestUrl.searchParams.get('v') !== APP_ASSET_VERSION) {
            await libheifCache.delete(request);
        }
    }));

    const aiModelCache = await caches.open(AI_MODEL_CACHE);
    const aiModelRequests = await aiModelCache.keys();
    await Promise.all(aiModelRequests.map(async (request) => {
        if (!APP_ASSET_VERSION) {
            return;
        }
        const requestUrl = new URL(request.url);
        if ((isAiModelManifestUrl(requestUrl) || isSmokeAssetUrl(requestUrl)) && requestUrl.searchParams.get('v') !== APP_ASSET_VERSION) {
            await aiModelCache.delete(request);
        }
    }));
}

async function enableNavigationPreload() {
    const registration = self.registration;
    if (
        registration?.navigationPreload
        && typeof registration.navigationPreload.enable === 'function'
    ) {
        await registration.navigationPreload.enable();
    }
}

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            enableNavigationPreload(),
            pruneOutdatedVersionedCaches(),
            pruneOutdatedBinaryAssets(),
        ])
    );
});

registerRoute(
    ({ url }) => isUltraHdrWasmAssetUrl(url),
    new CacheFirst({
        cacheName: WASM_ASSET_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 12,
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);

registerRoute(
    ({ url }) => isLibheifWasmAssetUrl(url),
    new CacheFirst({
        cacheName: LIBHEIF_ASSET_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 4,
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);

registerRoute(
    ({ url }) => isAiModelUrl(url),
    new CacheFirst({
        cacheName: AI_MODEL_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: AI_MODEL_CACHE_MAX_ENTRIES,
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);

registerRoute(
    ({ url }) => isSmokeAssetUrl(url),
    new CacheFirst({
        cacheName: AI_MODEL_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: AI_MODEL_CACHE_MAX_ENTRIES,
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);

function isOnnxWasmAssetUrl(url: URL): boolean {
    return /\/assets\/ort-wasm.*\.wasm$/.test(url.pathname);
}

registerRoute(
    ({ url }) => isOnnxWasmAssetUrl(url),
    new CacheFirst({
        cacheName: ONNX_WASM_CACHE,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);

registerRoute(
    ({ request, url }) =>
        !isUltraHdrWasmAssetUrl(url)
        && !isLibheifWasmAssetUrl(url)
        && !isAiModelUrl(url)
        && !isSmokeAssetUrl(url)
        && !isOnnxWasmAssetUrl(url) && (
            request.mode === 'navigate' ||
            request.destination === 'script' ||
            request.destination === 'style' ||
            request.destination === 'image'
        ),
    new StaleWhileRevalidate({
        cacheName: RUNTIME_CACHE
    })
);

function redirectToApp(url: URL, params: Record<string, string> = {}): Response {
    const redirectUrl = new URL(url);
    redirectUrl.pathname = redirectUrl.pathname.replace(/_share-target$/, '');
    Object.entries(params).forEach(([key, value]) => {
        redirectUrl.searchParams.set(key, value);
    });
    return Response.redirect(redirectUrl.href, 303);
}

function mapStatusMessage(error: unknown = null): ServiceWorkerErrorPayload {
    const candidate = error as Partial<Error & { code?: string }>;
    return {
        type: candidate?.name || 'Error',
        code: candidate?.code || 'SW_BUNDLE_COMMAND_FAILED',
        message: String(candidate?.message || error || 'Service worker command failed.'),
        stackSnippet: typeof candidate?.stack === 'string'
            ? candidate.stack.split('\n').slice(0, 6).join('\n')
            : null,
    };
}

self.addEventListener('message', (event) => {
    const message = event.data as ServiceWorkerRequestMessage | null;
    if (!message || typeof message !== 'object') {
        return;
    }

    const messageType = message.type;
    const messageId = message.messageId || null;
    if (
        messageType !== UHDR_PREPARE_BUNDLE
        && messageType !== UHDR_VALIDATE_BUNDLE
        && messageType !== UHDR_REPAIR_BUNDLE
        && messageType !== UHDR_GET_APP_ASSET_VERSION
    ) {
        return;
    }

    event.waitUntil((async () => {
        try {
            let result: RuntimeBundleValidationResult | { appAssetVersion: string };
            if (messageType === UHDR_VALIDATE_BUNDLE) {
                const manifest = await loadRuntimeBundleManifest();
                result = await validateRuntimeBundleFromManifest(manifest);
            } else if (messageType === UHDR_GET_APP_ASSET_VERSION) {
                result = {
                    appAssetVersion: RESOLVED_APP_ASSET_VERSION,
                };
            } else if (messageType === UHDR_REPAIR_BUNDLE) {
                result = await prepareRuntimeBundleInSw({ force: true });
            } else {
                result = await prepareRuntimeBundleInSw({ force: false });
            }

            postMessageResponse(event, {
                type: `${messageType}_RESULT`,
                messageId,
                ok: true,
                result,
            });
        } catch (error) {
            postMessageResponse(event, {
                type: `${messageType}_RESULT`,
                messageId,
                ok: false,
                error: mapStatusMessage(error),
            });
        }
    })());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith('/_share-target') && event.request.method === 'GET') {
        event.respondWith(redirectToApp(url, { error: 'share_get_unsupported' }));
        return;
    }

    // We check if pathname ends with /_share-target to handle base paths.
    if (event.request.method === 'POST' && url.pathname.endsWith('/_share-target')) {
        event.respondWith(
            (async () => {
                try {
                    const formData = await event.request.formData();
                    const files = formData
                        .getAll('file')
                        .filter((item) => item instanceof Blob);

                    if (files.length === 0) {
                        return redirectToApp(url, { error: 'share_empty' });
                    }

                    if (files.length > MAX_SHARED_FILES) {
                        return redirectToApp(url, { error: 'share_too_many' });
                    }

                    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
                    if (totalBytes > MAX_SHARED_TOTAL_BYTES) {
                        return redirectToApp(url, { error: 'share_too_large' });
                    }

                    await storeSharedFiles(files);
                    return redirectToApp(url, { 'share-target': 'true' });
                } catch (error: unknown) {
                    console.error('Share Target Error:', error);
                    return redirectToApp(url, { error: 'share_failed' });
                }
            })()
        );
    }
});
