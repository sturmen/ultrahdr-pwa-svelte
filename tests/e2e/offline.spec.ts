import { test, expect, type TestInfo } from '@playwright/test';
import {
    assertOfflineDownload,
    clearOfflineRuntimeBundle,
    gotoApp,
    isOfflineCoverageProject,
    openExportSheet,
    primeOfflineRuntime,
    revisitCurrentAppUrl,
    resolveOfflineProjectConfig,
    uploadSingleFile,
    waitForProcessing,
} from './offline-helpers.ts';

function skipUnsupportedProject(testInfo: TestInfo): void {
    test.skip(
        !isOfflineCoverageProject(testInfo.project.name),
        `Offline coverage is limited to chromium and mobile-webkit-ios; got ${testInfo.project.name}.`,
    );
}

function maybeSkipKnownRuntimeIssue(testInfo: TestInfo, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error ?? '');
    if (
        testInfo.project.name.includes('webkit')
        && /cannot resolve operator 'GatherND'/i.test(message)
    ) {
        test.skip(
            true,
            'Playwright WebKit cannot initialize GMNet WebGL (GatherND v18 unsupported). Validate Safari via WebGPU-specific runs.',
        );
    }
}

function isWebKitOfflineNavigationError(testInfo: TestInfo, error: unknown): boolean {
    return testInfo.project.name === 'mobile-webkit-ios'
        && /webkit encountered an internal error/i.test(
            error instanceof Error ? error.message : String(error ?? ''),
        );
}

function maybeSkipKnownWebKitOfflineProcessingLimitation(testInfo: TestInfo, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error ?? '');
    if (
        testInfo.project.name === 'mobile-webkit-ios'
        && /libultrahdr WASM module failed to load/i.test(message)
    ) {
        test.skip(
            true,
            'Playwright mobile WebKit does not reliably execute cached libultrahdr WASM offline after revisit; Chromium cached-offline processing remains the enforced regression path.',
        );
    }
}

test.describe('Offline Mode', () => {
    test.describe('Cold offline startup', () => {
        test.use({ offline: true });

        test('fails before the uncached app shell can load', async ({ page }, testInfo) => {
            skipUnsupportedProject(testInfo);

            if (testInfo.project.name === 'mobile-webkit-ios') {
                await expect(gotoApp(page)).rejects.toThrow(/internal error|NSURLErrorDomain|offline/i);
                return;
            }

            await expect(gotoApp(page)).rejects.toThrow(/ERR_INTERNET_DISCONNECTED|NSURLErrorDomain|offline/i);
        });
    });

    test('shows blocked startup UI when the cached app shell is offline without a prepared runtime bundle', async ({ page, context }, testInfo) => {
        skipUnsupportedProject(testInfo);
        test.skip(
            testInfo.project.name === 'mobile-webkit-ios',
            'Playwright mobile WebKit throws an internal error on offline navigation before cached blocked-startup UI can be asserted.',
        );

        try {
            await primeOfflineRuntime(page, testInfo);
        } catch (error) {
            maybeSkipKnownRuntimeIssue(testInfo, error);
            throw error;
        }

        await clearOfflineRuntimeBundle(page);
        await context.setOffline(true);
        await revisitCurrentAppUrl(page);

        await expect(page.getByTestId('runtime-init-failure')).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId('runtime-init-offline-bundle-blocked')).toBeVisible();
        await expect(page.getByTestId('upload-drop-zone')).toHaveCount(0);
    });

    test('revisits offline in the same context, processes one image, and opens export flow', async ({ page, context }, testInfo) => {
        skipUnsupportedProject(testInfo);

        let config;
        try {
            config = await primeOfflineRuntime(page, testInfo);
        } catch (error) {
            maybeSkipKnownRuntimeIssue(testInfo, error);
            throw error;
        }

        await context.setOffline(true);
        try {
            await revisitCurrentAppUrl(page);
        } catch (error) {
            if (!isWebKitOfflineNavigationError(testInfo, error)) {
                throw error;
            }
        }

        await expect(page.getByTestId('runtime-init-provider')).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId('runtime-init-failure')).not.toBeVisible();

        await uploadSingleFile(page, config.uploadImagePath);
        try {
            await waitForProcessing(page, config.processingTimeoutMs);
        } catch (error) {
            maybeSkipKnownWebKitOfflineProcessingLimitation(testInfo, error);
            throw error;
        }

        await expect(page.locator('.result-card')).toHaveCount(1);
        await openExportSheet(page);
        await expect(page.getByText(/1 item\(s\) selected\./i)).toBeVisible();

        if (config.shouldAssertDownload) {
            await assertOfflineDownload(page);
        } else {
            await expect(page.getByRole('button', { name: /^Download$/i })).toBeVisible();
        }
    });

    test('keeps a smaller chromium smoke path for cached offline revisit', async ({ page, context }, testInfo) => {
        test.skip(testInfo.project.name !== 'chromium', 'Chromium-only smoke coverage.');

        const config = resolveOfflineProjectConfig(testInfo.project.name);
        await primeOfflineRuntime(page, testInfo);

        await context.setOffline(true);
        await revisitCurrentAppUrl(page);

        await expect(page.getByTestId('runtime-init-provider')).toBeVisible({ timeout: 30_000 });
        await uploadSingleFile(page, config.uploadImagePath);
        await waitForProcessing(page, config.processingTimeoutMs);
        await openExportSheet(page);
        await assertOfflineDownload(page);
    });
});
