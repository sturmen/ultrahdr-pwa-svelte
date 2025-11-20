import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Check if the request is for the share target
    // We check if pathname ends with /_share-target to handle base paths
    if (event.request.method === 'POST' && url.pathname.endsWith('/_share-target')) {
        event.respondWith(
            (async () => {
                try {
                    const formData = await event.request.formData();
                    const files = formData.getAll('file');

                    // Store files in IndexedDB
                    if (files && files.length > 0) {
                        await storeSharedFiles(files);
                    }

                    // Redirect to main page with a query param indicating share
                    // We need to redirect to the root of the app. 
                    // Since we are in the SW, we can try to redirect to './?share-target=true' relative to the SW scope?
                    // Or just use the referrer or origin + base.
                    // Safest is to redirect to the page that handled the share, but stripped of _share-target.
                    // If action was ./_share-target, we are at .../ultrahdr-pwa-svelte/_share-target
                    // We want to go to .../ultrahdr-pwa-svelte/?share-target=true

                    // Construct redirect URL
                    const redirectUrl = new URL(url);
                    redirectUrl.pathname = redirectUrl.pathname.replace(/_share-target$/, '');
                    redirectUrl.searchParams.set('share-target', 'true');

                    return Response.redirect(redirectUrl.href, 303);
                } catch (e) {
                    console.error('Share Target Error:', e);
                    // Fallback redirect
                    const redirectUrl = new URL(url);
                    redirectUrl.pathname = redirectUrl.pathname.replace(/_share-target$/, '');
                    redirectUrl.searchParams.set('error', 'share_failed');
                    return Response.redirect(redirectUrl.href, 303);
                }
            })()
        );
    }
});

// IndexedDB Helper for Service Worker
function storeSharedFiles(files) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ultrahdr-share-store', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('shared-files')) {
                db.createObjectStore('shared-files', { autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['shared-files'], 'readwrite');
            const store = transaction.objectStore('shared-files');

            // Clear old files first? Or just append? 
            // Let's clear to avoid stale shares appearing on next reload if not cleaned up.
            store.clear();

            let count = 0;
            files.forEach(file => {
                store.add(file);
                count++;
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        };

        request.onerror = () => reject(request.error);
    });
}
