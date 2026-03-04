import { defineConfig, devices } from '@playwright/test';

const chromiumWebGpuArgs = [
    '--enable-unsafe-webgpu',
    '--ignore-gpu-blocklist',
    '--use-angle=metal',
];

export default defineConfig({
    testDir: './tests/e2e',
    testIgnore: ['**/android-real-webgpu.spec.js'],
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : 2,
    reporter: 'html',
    timeout: 180000,

    use: {
        baseURL: 'http://localhost:4173/ultrahdr-pwa-svelte/',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                headless: process.env.CI ? true : false,
                launchOptions: {
                    args: chromiumWebGpuArgs,
                },
            },
            testIgnore: ['**/mobile.spec.js', '**/android-real-webgpu.spec.js'],
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testIgnore: ['**/mobile.spec.js', '**/android-real-webgpu.spec.js'],
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testIgnore: ['**/mobile.spec.js', '**/android-real-webgpu.spec.js'],
        },
        {
            name: 'mobile-webkit-ios',
            use: { ...devices['iPhone 14'] },
            testMatch: '**/mobile.spec.js',
        },
        {
            name: 'mobile-chromium-android-gpu',
            use: {
                ...devices['Pixel 7'],
                launchOptions: {
                    args: chromiumWebGpuArgs,
                },
            },
            testMatch: '**/mobile.spec.js',
        },
        {
            name: 'mobile-chromium-android-fallback',
            use: { ...devices['Pixel 7'] },
            testMatch: '**/mobile.spec.js',
        },
    ],

    webServer: {
        command: 'npm run build:wasm && npm run build && npm run preview',
        url: 'http://localhost:4173/ultrahdr-pwa-svelte/',
        reuseExistingServer: false,
        timeout: 120 * 1000,
    },
});
