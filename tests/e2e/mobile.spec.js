// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureRuntimeGateReady, getRuntimeGateFailure } from './runtime-gate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDR_IMAGE = path.resolve(__dirname, '../../media/test_sdr2.jpg');
const PROCESSING_TIMEOUT = 120_000;
const POLL_INTERVAL = 250;

async function uploadSingleFile(page, filePath) {
  await page.locator('#file-upload').setInputFiles(filePath);
}

async function readRuntimeProvider(page) {
  const marker = await page.getByTestId('runtime-init-provider').textContent();
  const match = /runtime provider:\s*([a-z0-9_-]+)/i.exec(marker || '');
  return (match?.[1] || '').trim().toLowerCase() || null;
}

async function setCapabilityOverride(page, override) {
  await page.evaluate((value) => {
    window.__ULTRAHDR_TEST_GMNET_CAPABILITY_OVERRIDE = value;
  }, override);
}

async function waitForProcessing(page, expectedResults = 1) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < PROCESSING_TIMEOUT) {
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
      return;
    }

    await page.waitForTimeout(POLL_INTERVAL);
  }

  throw new Error(`Processing timed out after ${PROCESSING_TIMEOUT}ms`);
}

test.describe('Mobile smoke tests', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }, testInfo) => {
    const failureReason = getRuntimeGateFailure(testInfo.project.name);
    test.skip(Boolean(failureReason), failureReason || '');
    await page.goto('/');
    try {
      await ensureRuntimeGateReady(page, testInfo);
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
    await uploadSingleFile(page, SDR_IMAGE);
    await waitForProcessing(page, 1);

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
    await uploadSingleFile(page, SDR_IMAGE);
    await waitForProcessing(page, 1);

    await page.getByTestId('mobile-action-bar').getByRole('button', { name: /export/i }).click();
    await expect(page.getByTestId('export-sheet')).toBeVisible();
    await expect(page.getByText(/1 item\(s\) selected/i)).toBeVisible();
    await expect(page.locator('.share-btn')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Download/i })).toBeVisible();
  });

  test('shows capability restriction banner and export warning when capped by override', async ({ page }) => {
    const runtimeProvider = await readRuntimeProvider(page);
    await setCapabilityOverride(page, {
      provider: runtimeProvider || 'webgl',
      gainMapMaxLongEdge: 128,
      outputMaxLongEdge: 256,
      source: 'test-override',
      attempts: [],
    });

    await uploadSingleFile(page, SDR_IMAGE);
    await waitForProcessing(page, 1);

    await page.getByTestId('tab-convert').click();
    await expect(page.getByTestId('capability-restriction-banner')).toBeVisible();
    await expect(page.getByTestId('capability-restriction-banner')).toContainText('256');

    await page.getByTestId('tab-results').click();
    await page.getByTestId('mobile-action-bar').getByRole('button', { name: /export/i }).click();
    await expect(page.getByTestId('export-capability-restriction')).toBeVisible();
  });
});
