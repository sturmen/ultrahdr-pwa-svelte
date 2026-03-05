import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { storeSharedFiles } from './lib/share-store.js';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

const MAX_SHARED_FILES = 32;
const MAX_SHARED_TOTAL_BYTES = 300 * 1024 * 1024;
const APP_ASSET_VERSION = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
    : '';
const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
    : '';
const RESOLVED_APP_ASSET_VERSION = APP_ASSET_VERSION || 'dev-unversioned-app';
const RUNTIME_CACHE_PREFIX = 'uhdr-runtime';
const WASM_ASSET_CACHE_PREFIX = 'uhdr-wasm-assets';
const LIBHEIF_ASSET_CACHE_PREFIX = 'uhdr-libheif-assets';
const AI_MODEL_CACHE_PREFIX = 'uhdr-ai-models';
const RUNTIME_CACHE = `${RUNTIME_CACHE_PREFIX}-${RESOLVED_APP_ASSET_VERSION}`;
const WASM_ASSET_CACHE = `${WASM_ASSET_CACHE_PREFIX}-${RESOLVED_APP_ASSET_VERSION}`;
const LIBHEIF_ASSET_CACHE = `${LIBHEIF_ASSET_CACHE_PREFIX}-${RESOLVED_APP_ASSET_VERSION}`;
const AI_MODEL_CACHE = `${AI_MODEL_CACHE_PREFIX}-${RESOLVED_APP_ASSET_VERSION}`;

function isUltraHdrWasmAssetUrl(url) {
    return /\/assets\/(ultrahdr_wasm|jpegli_wasm|jpegtran_wasm)\.(js|wasm)$/.test(url.pathname);
}

function isLibheifWasmAssetUrl(url) {
    return /\/assets\/libheif\.wasm$/.test(url.pathname);
}

function isAiModelUrl(url) {
    return /\/models\/.*\.onnx(\.data)?$/.test(url.pathname);
}

function isAiModelManifestUrl(url) {
    return /\/models\/.*\.onnx$/.test(url.pathname);
}

function isVersionedCacheName(cacheName, cachePrefix) {
    return cacheName === cachePrefix || cacheName.startsWith(`${cachePrefix}-`);
}

async function pruneOutdatedVersionedCaches() {
    const cacheNames = await caches.keys();
    const ONNX_CACHE = 'uhdr-onnx-wasm-' + RESOLVED_APP_ASSET_VERSION;
    const expectedCacheNames = new Set([RUNTIME_CACHE, WASM_ASSET_CACHE, LIBHEIF_ASSET_CACHE, AI_MODEL_CACHE, ONNX_CACHE]);
    const managedPrefixes = [RUNTIME_CACHE_PREFIX, WASM_ASSET_CACHE_PREFIX, LIBHEIF_ASSET_CACHE_PREFIX, AI_MODEL_CACHE_PREFIX];
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
        if (isAiModelManifestUrl(requestUrl) && requestUrl.searchParams.get('v') !== APP_ASSET_VERSION) {
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
                maxEntries: 2,
                maxAgeSeconds: 30 * 24 * 60 * 60
            })
        ]
    })
);

function isOnnxWasmAssetUrl(url) {
    return /\/assets\/ort-wasm.*\.wasm$/.test(url.pathname);
}

registerRoute(
    ({ url }) => isOnnxWasmAssetUrl(url),
    new CacheFirst({
        cacheName: WASM_ASSET_CACHE, // Share WASM cache or separate? Let's share for simplicity or create new.
        // Actually, let's reuse WASM_ASSET_CACHE for all large WASM binaries to keep it simple, 
        // or separate if we want granular control. 
        // The pruner checks for v param on WASM_ASSET_CACHE.
        // These don't have v param usually.
        // Better to use a separate cache or ensure pruner doesn't delete them aggressively.
        // Let's use AI_MODEL_CACHE logic or just a new one without strict version pruning?
        // Or just put them in WASM_ASSET_CACHE but update pruner.
        // Simpler: Use a dedicated name.
        cacheName: 'uhdr-onnx-wasm-' + RESOLVED_APP_ASSET_VERSION,
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
        !isUltraHdrWasmAssetUrl(url) && !isLibheifWasmAssetUrl(url) && !isAiModelUrl(url) && !isOnnxWasmAssetUrl(url) && (
            request.mode === 'navigate' ||
            request.destination === 'script' ||
            request.destination === 'style' ||
            request.destination === 'image'
        ),
    new StaleWhileRevalidate({
        cacheName: RUNTIME_CACHE
    })
);

function redirectToApp(url, params = {}) {
    const redirectUrl = new URL(url);
    redirectUrl.pathname = redirectUrl.pathname.replace(/_share-target$/, '');
    Object.entries(params).forEach(([key, value]) => {
        redirectUrl.searchParams.set(key, value);
    });
    return Response.redirect(redirectUrl.href, 303);
}

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
                } catch (e) {
                    console.error('Share Target Error:', e);
                    return redirectToApp(url, { error: 'share_failed' });
                }
            })()
        );
    }
});
