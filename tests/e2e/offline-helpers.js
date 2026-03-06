// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';
import { expect } from '@playwright/test';
import { ensureRuntimeGateReady, installStartupRuntimeOverride } from './runtime-gate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OFFLINE_BUNDLE_STORAGE_KEY = 'ultrahdr:offline-bundle:v1';
const APP_PATH = '/ultrahdr-pwa-svelte/';
const SDR_IMAGE = path.resolve(__dirname, '../../media/test_sdr2.jpg');
const SDR_IMAGE_SMALL = path.resolve(__dirname, '../../media/sdr_demo_image.jpg');
const PROCESSING_TIMEOUT = 120_000;
const PROCESSING_TIMEOUT_FALLBACK_MS = 240_000;
const POLL_INTERVAL = 250;

export function isOfflineCoverageProject(projectName) {
  return projectName === 'chromium' || projectName === 'mobile-webkit-ios';
}

export function resolveOfflineProjectConfig(projectName) {
  const normalizedProjectName = String(projectName || '').toLowerCase();
  const isMobileWebkit = normalizedProjectName.includes('mobile-webkit-ios');

  return {
    uploadImagePath: isMobileWebkit ? SDR_IMAGE_SMALL : SDR_IMAGE,
    processingTimeoutMs: isMobileWebkit ? PROCESSING_TIMEOUT_FALLBACK_MS : PROCESSING_TIMEOUT,
    shouldAssertDownload: !isMobileWebkit,
    runtimeGateOptions: isMobileWebkit
      ? { expectedProviders: ['wasm', 'webgl'] }
      : {},
  };
}

export async function dismissWasmRecommendationIfVisible(page) {
  const modal = page.getByTestId('wasm-recommendation-modal');
  if (await modal.count()) {
    if (await modal.first().isVisible().catch(() => false)) {
      await page.getByTestId('wasm-recommendation-dismiss').click();
      await expect(page.getByTestId('wasm-recommendation-modal')).toHaveCount(0);
    }
  }
}

export async function uploadSingleFile(page, filePath) {
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
    throw new Error('No upload input is available for offline test flow.');
  }

  await page.locator(targetSelector).setInputFiles(filePath);
}

export async function waitForProcessing(page, timeoutMs) {
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

    if (snapshot.results >= 1 && !snapshot.loading) {
      await dismissWasmRecommendationIfVisible(page);
      return;
    }

    await page.waitForTimeout(POLL_INTERVAL);
  }

  throw new Error(`Processing timed out after ${timeoutMs}ms`);
}

export async function waitForServiceWorkerControl(page) {
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are unavailable in this browser context.');
    }

    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) {
      return;
    }

    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        reject(new Error('Timed out waiting for service worker control.'));
      }, 30_000);

      const handleControllerChange = () => {
        if (!navigator.serviceWorker.controller) {
          return;
        }
        clearTimeout(timeoutId);
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        resolve();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    });
  });
}

export async function waitForBundleReady(page) {
  await page.waitForFunction((storageKey) => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      return parsed?.ready === true && parsed?.state === 'READY';
    } catch {
      return false;
    }
  }, OFFLINE_BUNDLE_STORAGE_KEY);
}

export async function gotoApp(page) {
  await page.goto(APP_PATH);
}

export async function revisitCurrentAppUrl(page) {
  await page.goto(page.url(), { waitUntil: 'domcontentloaded' });
}

export async function primeOfflineRuntime(page, testInfo) {
  const config = resolveOfflineProjectConfig(testInfo.project.name);
  await installStartupRuntimeOverride(page, { projectName: testInfo.project.name });
  await gotoApp(page);
  await ensureRuntimeGateReady(page, testInfo, config.runtimeGateOptions);
  await waitForServiceWorkerControl(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await ensureRuntimeGateReady(page, testInfo, config.runtimeGateOptions);
  await waitForServiceWorkerControl(page);
  await waitForBundleReady(page);
  return config;
}

export async function clearOfflineRuntimeBundle(page) {
  await page.evaluate(async (storageKey) => {
    window.localStorage.removeItem(storageKey);
    const prefixes = [
      'uhdr-runtime',
      'uhdr-wasm-assets',
      'uhdr-libheif-assets',
      'uhdr-ai-models',
      'uhdr-onnx-wasm',
    ];
    const cacheNames = await window.caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => prefixes.some((prefix) => cacheName.startsWith(prefix)))
        .map((cacheName) => window.caches.delete(cacheName)),
    );
  }, OFFLINE_BUNDLE_STORAGE_KEY);
}

export async function ensureSelectedResults(page) {
  const toggleSelectionButton = page.getByRole('button', { name: /^(Select All|Clear Selection)$/i }).first();
  if (!await toggleSelectionButton.isVisible()) {
    return;
  }

  const label = (await toggleSelectionButton.textContent())?.trim().toLowerCase();
  if (label === 'select all') {
    await toggleSelectionButton.click();
  }
}

export async function openExportSheet(page) {
  await ensureSelectedResults(page);
  const mobileActionBar = page.getByTestId('mobile-action-bar');
  if (await mobileActionBar.count()) {
    await mobileActionBar.getByRole('button', { name: /Export/i }).click();
  } else {
    await page.getByRole('button', { name: /^Export/i }).first().click();
  }

  await expect(page.getByTestId('export-sheet')).toBeVisible();
}

export async function assertOfflineDownload(page) {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-sheet').getByRole('button', { name: /^Download$/i }).click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toMatch(/\.jpg$/i);
}
