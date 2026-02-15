// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDR_IMAGE = path.resolve(__dirname, '../../media/test_sdr2.jpg');
const PROCESSING_TIMEOUT = 120_000;
const POLL_INTERVAL = 250;

async function uploadSingleFile(page, filePath) {
  await page.locator('#file-upload').setInputFiles(filePath);
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
  test('processes one image, keeps mobile UI usable, and avoids horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await uploadSingleFile(page, SDR_IMAGE);
    await page.getByTestId('tab-results').click();
    await waitForProcessing(page, 1);

    await expect(page.getByTestId('tab-convert')).toBeVisible();
    await expect(page.getByTestId('tab-results')).toBeVisible();
    await expect(page.getByTestId('tab-settings')).toBeVisible();

    await page.getByTestId('tab-convert').click();
    await expect(page.getByRole('button', { name: 'Add Images' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Over' })).toBeVisible();

    await page.getByTestId('tab-results').click();
    await expect(page.locator('.result-card')).toHaveCount(1);
    await expect(page.getByTestId('mobile-action-bar')).toBeVisible();
    await expect(
      page.getByTestId('mobile-action-bar').getByRole('button', { name: /Download/ }),
    ).toBeVisible();

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
    await page.getByTestId('tab-results').click();
    await waitForProcessing(page, 1);

    await expect(page.locator('.share-btn')).toHaveCount(0);
    await expect(
      page.getByTestId('mobile-action-bar').getByRole('button', { name: /Download/ }),
    ).toBeVisible();
  });
});
