// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureRuntimeGateReady, getRuntimeGateFailure, installStartupRuntimeOverride } from './runtime-gate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDR_IMAGE = path.resolve(__dirname, '../../media/test_sdr2.jpg');
const SDR_IMAGE_SMALL = path.resolve(__dirname, '../../media/sdr_demo_image.jpg');
const PROCESSING_TIMEOUT = 120_000;
const PROCESSING_TIMEOUT_FALLBACK_MS = 240_000;
const POLL_INTERVAL = 250;
const MOBILE_TEST_TIMEOUT = PROCESSING_TIMEOUT + 30_000;

function resolveRuntimeGateExpectations(projectName) {
  const normalizedProjectName = String(projectName || '').toLowerCase();
  if (normalizedProjectName.includes('mobile-chromium-android-fallback')) {
    return {
      expectedProviders: ['webgl', 'wasm'],
      forbiddenProviders: ['webgpu'],
    };
  }
  if (normalizedProjectName.includes('mobile-chromium-android-gpu')) {
    return {
      expectedProviders: ['webgpu', 'webgl'],
    };
  }
  if (normalizedProjectName.includes('webkit')) {
    return {
      expectedProviders: ['wasm', 'webgl'],
    };
  }
  return {};
}

async function uploadSingleFile(page, filePath) {
  await page.waitForFunction(() =>
    Boolean(document.querySelector('#file-upload') || document.querySelector('#add-files')),
  );
  const targetSelector = await page.evaluate(() => {
    if (document.querySelector('#file-upload')) {
      return '#file-upload';
    }
    if (document.querySelector('#add-files')) {
      return '#add-files';
    }
    return null;
  });

  if (!targetSelector) {
    throw new Error('No upload input is available for mobile test flow.');
  }

  await page.locator(targetSelector).setInputFiles(filePath);
}

async function waitForProcessing(page, expectedResults = 1) {
  return waitForProcessingWithTimeout(page, expectedResults, PROCESSING_TIMEOUT);
}

async function waitForProcessingWithTimeout(
  page,
  expectedResults = 1,
  timeoutMs = PROCESSING_TIMEOUT,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = await page.evaluate(() => {
      const results = document.querySelectorAll('.result-card').length;
      const loading = document.querySelector('.results-container')?.classList.contains('loading') || false;
      const errorText = document.querySelector('.error p')?.textContent || null;
      return { results, loading, errorText };
    });

    if (snapshot.errorText) {
      throw new Error(`Processing failed: ${snapshot.errorText}`);
    }

    if (snapshot.results >= expectedResults && !snapshot.loading) {
      await dismissWasmRecommendationIfVisible(page);
      return;
    }

    await page.waitForTimeout(POLL_INTERVAL);
  }

  throw new Error(`Processing timed out after ${timeoutMs}ms`);
}

async function dismissWasmRecommendationIfVisible(page) {
  const modal = page.getByTestId('wasm-recommendation-modal');
  if (await modal.count()) {
    if (await modal.first().isVisible().catch(() => false)) {
      await page.getByTestId('wasm-recommendation-dismiss').click();
      await expect(page.getByTestId('wasm-recommendation-modal')).toHaveCount(0);
    }
  }
}

test.describe('Mobile smoke tests', () => {
  test.describe.configure({ mode: 'serial', timeout: MOBILE_TEST_TIMEOUT });
  let processingTimeoutMs = PROCESSING_TIMEOUT;
  let uploadImagePath = SDR_IMAGE;

  test.beforeEach(async ({ page }, testInfo) => {
    const failureReason = getRuntimeGateFailure(testInfo.project.name);
    test.skip(Boolean(failureReason), failureReason || '');
    const runtimeGateExpectations = resolveRuntimeGateExpectations(testInfo.project.name);
    const isFallbackProject = String(testInfo.project.name)
      .toLowerCase()
      .includes('mobile-chromium-android-fallback');
    processingTimeoutMs = isFallbackProject ? PROCESSING_TIMEOUT_FALLBACK_MS : PROCESSING_TIMEOUT;
    uploadImagePath = isFallbackProject ? SDR_IMAGE_SMALL : SDR_IMAGE;
    testInfo.setTimeout(processingTimeoutMs + 60_000);
    await installStartupRuntimeOverride(page, {
      projectName: testInfo.project.name,
      ...(runtimeGateExpectations.runtimeInitOptions
        ? { runtimeInitOptions: runtimeGateExpectations.runtimeInitOptions }
        : {}),
    });
    await page.goto('/');
    try {
      await ensureRuntimeGateReady(page, testInfo, {
        ...(runtimeGateExpectations.expectedProvider
          ? { expectedProvider: runtimeGateExpectations.expectedProvider }
          : {}),
        ...(runtimeGateExpectations.expectedProviders
          ? { expectedProviders: runtimeGateExpectations.expectedProviders }
          : {}),
        ...(runtimeGateExpectations.forbiddenProviders
          ? { forbiddenProviders: runtimeGateExpectations.forbiddenProviders }
          : {}),
      });
    } catch (error) {
      const message = String(error?.message || '');
      if (
        testInfo.project.name.includes('webkit')
        && /cannot resolve operator 'GatherND'/i.test(message)
      ) {
        test.skip(
          true,
          'Playwright WebKit cannot initialize GMNet WebGL (GatherND v18 unsupported). Validate Safari via WebGPU-specific runs.',
        );
        return;
      }
      throw error;
    }
  });

  test('processes one image, keeps mobile UI usable, and avoids horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await uploadSingleFile(page, uploadImagePath);
    await waitForProcessingWithTimeout(page, 1, processingTimeoutMs);

    await expect(page.getByTestId('tab-convert')).toBeVisible();
    await expect(page.getByTestId('tab-results')).toBeVisible();
    await expect(page.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('floating-gear')).toBeVisible();
    await expect(page.getByTestId('mobile-action-bar')).toBeVisible();
    await expect(
      page.getByTestId('mobile-action-bar').getByRole('button', { name: /Export/i }),
    ).toBeVisible();
    await expect(
      page.getByTestId('mobile-action-bar').getByRole('button', { name: /^Discard all$/i }),
    ).toBeVisible();
    await expect(page.getByTestId('mobile-results-tools')).toBeVisible();
    await expect(page.getByTestId('results-rotate-left')).toBeVisible();
    await expect(page.getByTestId('results-rotate-right')).toBeVisible();
    await expect(page.getByTestId('results-reprocess-btn')).toHaveCount(0);
    await page.getByTestId('results-rotate-right').click();
    await expect(page.getByTestId('results-reprocess-btn')).toBeVisible();

    await page.getByTestId('tab-convert').click();
    await expect(page.getByRole('button', { name: 'Add Images' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Discard all$/i })).toHaveCount(0);

    await page.getByTestId('tab-results').click();
    await expect(page.locator('.result-card')).toHaveCount(1);

    const viewportFits = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth <= window.innerWidth;
    });
    expect(viewportFits).toBe(true);
  });

  test('gracefully degrades outbound share controls when canShare is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        Object.defineProperty(window.navigator, 'canShare', {
          configurable: true,
          value: undefined
        });
      } catch {
        // If this cannot be overridden in a browser, the test falls back to asserting button absence only.
      }
    });

    await page.goto('/');
    await uploadSingleFile(page, uploadImagePath);
    await waitForProcessingWithTimeout(page, 1, processingTimeoutMs);
    await dismissWasmRecommendationIfVisible(page);

    await page.getByTestId('mobile-action-bar').getByRole('button', { name: /export/i }).click();
    await expect(page.getByTestId('export-sheet')).toBeVisible();
    await expect(page.getByText(/1 item\(s\) selected/i)).toBeVisible();
    await expect(page.locator('.share-btn')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Download/i })).toBeVisible();
  });

  test('does not render capability restriction UI, even when legacy override payload is injected', async ({ page }, testInfo) => {
    await page.evaluate(() => {
      window.__ULTRAHDR_TEST_GMNET_CAPABILITY_OVERRIDE = {
        provider: 'webgl',
        gainMapMaxLongEdge: 128,
        outputMaxLongEdge: 256,
        source: 'test-override',
        attempts: [],
      };
    });

    const overrideProcessingTimeoutMs = String(testInfo.project.name).includes('webkit')
      ? PROCESSING_TIMEOUT_FALLBACK_MS
      : processingTimeoutMs;

    await uploadSingleFile(page, uploadImagePath);
    await waitForProcessingWithTimeout(page, 1, overrideProcessingTimeoutMs);
    await dismissWasmRecommendationIfVisible(page);

    await page.getByTestId('tab-convert').click();
    await expect(page.getByTestId('capability-restriction-banner')).toHaveCount(0);

    await page.getByTestId('tab-results').click();
    await page.getByTestId('mobile-action-bar').getByRole('button', { name: /export/i }).click();
    await expect(page.getByTestId('export-capability-restriction')).toHaveCount(0);
  });
});
