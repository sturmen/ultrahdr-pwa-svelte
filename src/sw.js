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
const WASM_ASSET_CACHE = 'uhdr-wasm-assets';
const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
    : '';

function isUltraHdrWasmAssetUrl(url) {
    return /\/assets\/ultrahdr_wasm\.(js|wasm)$/.test(url.pathname);
}

async function pruneOutdatedWasmAssets() {
    if (!WASM_ASSET_VERSION) {
        return;
    }
    const cache = await caches.open(WASM_ASSET_CACHE);
    const cachedRequests = await cache.keys();
    await Promise.all(cachedRequests.map(async (request) => {
        const requestUrl = new URL(request.url);
        if (!isUltraHdrWasmAssetUrl(requestUrl)) {
            return;
        }
        if (requestUrl.searchParams.get('v') !== WASM_ASSET_VERSION) {
            await cache.delete(request);
        }
    }));
}

self.addEventListener('activate', (event) => {
    event.waitUntil(pruneOutdatedWasmAssets());
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
    ({ request, url }) =>
        !isUltraHdrWasmAssetUrl(url) && (
            request.mode === 'navigate' ||
            request.destination === 'script' ||
            request.destination === 'style' ||
            request.destination === 'image'
        ),
    new StaleWhileRevalidate({
        cacheName: 'uhdr-runtime'
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
