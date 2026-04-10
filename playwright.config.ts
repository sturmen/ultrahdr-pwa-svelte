import { defineConfig, devices } from '@playwright/test';

const chromiumWebGpuArgs = [
    '--enable-unsafe-webgpu',
    '--ignore-gpu-blocklist',
    '--use-angle=metal',
];

export default defineConfig({
    testDir: './tests/e2e',
    testIgnore: ['**/android-real-webgpu.spec.ts'],
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
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
            testIgnore: ['**/mobile.spec.ts', '**/android-real-webgpu.spec.ts'],
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testIgnore: ['**/mobile.spec.ts', '**/android-real-webgpu.spec.ts'],
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testIgnore: ['**/mobile.spec.ts', '**/android-real-webgpu.spec.ts'],
        },
        {
            name: 'mobile-webkit-ios',
            use: { ...devices['iPhone 14'] },
            testMatch: ['**/mobile.spec.ts', '**/offline.spec.ts'],
        },
        {
            name: 'mobile-chromium-android-gpu',
            use: {
                ...devices['Pixel 7'],
                launchOptions: {
                    args: chromiumWebGpuArgs,
                },
            },
            testMatch: '**/mobile.spec.ts',
        },
        {
            name: 'mobile-chromium-android-fallback',
            use: { ...devices['Pixel 7'] },
            testMatch: '**/mobile.spec.ts',
        },
    ],

    webServer: {
        command: 'npm run build:wasm && npm run build && npm run preview',
        url: 'http://localhost:4173/ultrahdr-pwa-svelte/',
        reuseExistingServer: false,
        timeout: 600 * 1000,
    },
});
