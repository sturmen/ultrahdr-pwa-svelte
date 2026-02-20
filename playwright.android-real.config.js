import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/android-real-webgpu.spec.js',
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: 'line',
    timeout: 90_000,

    use: {
        baseURL: 'http://localhost:4173/ultrahdr-pwa-svelte/',
        trace: 'on-first-retry',
    },

    webServer: {
        command: 'npm run build:wasm && npm run build && npm run preview',
        url: 'http://localhost:4173/ultrahdr-pwa-svelte/',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
