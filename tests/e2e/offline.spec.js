// @ts-check
import { test, expect } from '@playwright/test';
import { installStartupProbeBypass } from './runtime-gate.js';

test.describe('Offline Mode', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        // We need to bypass the startup probe mechanism that might rely on network
        // if we want to test purely offline behavior, OR we want to ensure it works
        // even when offline if the asset IS cached.
        // For this test, we want to ensure the app works offline, which implies
        // the probe asset should be cached.
        await installStartupProbeBypass(page, { projectName: testInfo.project.name });
        await page.goto('/');

        // Wait for service worker to be ready
        // We can't easily wait for SW readiness from the page side without a helper,
        // but we can wait for the app to be stable.
        const providerLocator = page.getByTestId('runtime-init-provider');
        await expect(providerLocator).toBeVisible({ timeout: 30000 });
    });

    test('should load and pass startup checks when offline', async ({ page, context }) => {
        // 1. Ensure we are online first and assets are cached
        // The beforeEach ensures we loaded the page once.
        // Let's reload to be sure SW is active and taking control.
        await page.reload();
        await expect(page.getByTestId('runtime-init-provider')).toBeVisible();
        // Give Service Worker a moment to finish caching runtime/WASM assets
        await page.waitForTimeout(1500);

        // 2. Go offline
        await context.setOffline(true);
        await page.waitForTimeout(500);

        // 3. Navigate to root instead of reload, as WebKit .reload() can crash when offline
        await page.goto('/');

        // 4. Verify app loads and startup passes
        // If the probe asset is missing, this will likely fail or show an error.
        await expect(page.getByTestId('runtime-init-provider')).toBeVisible({ timeout: 30000 });

        // Use a more specific check if possible, e.g. no error message
        await expect(page.getByTestId('runtime-init-failure')).not.toBeVisible();
    });
});
