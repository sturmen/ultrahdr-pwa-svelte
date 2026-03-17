import { expect, test, type Page } from '@playwright/test';

const MAX_ABS_DIFF_TOLERANCE = 2;
const MEAN_ABS_DIFF_TOLERANCE = 0.25;
const GAIN_MAP_TEST_API_KEY = '__ULTRAHDR_TEST_GAIN_MAP_API';

type BackendName = 'webgpu' | 'webgl' | 'wasm';

type GainMapCapture = {
  provider: BackendName | string | null;
  width: number;
  height: number;
  pixels: number[];
};

type GainMapDiffStats = {
  width: number;
  height: number;
  comparedPixels: number;
  maxAbsDiff: number;
  meanAbsDiff: number;
};

async function waitForGainMapTestApi(page: Page): Promise<void> {
  await page.waitForFunction((apiKey) => {
    const api = (window as Record<string, unknown>)[apiKey];
    return Boolean(api && typeof api === 'object');
  }, GAIN_MAP_TEST_API_KEY);
}

async function processWithBackend(page: Page, backend: BackendName): Promise<GainMapCapture> {
  return await page.evaluate(async ({ apiKey, provider }) => {
    const api = (window as Record<string, unknown>)[apiKey] as {
      generateGainMap: (request: { provider: BackendName; width?: number; height?: number }) => Promise<GainMapCapture>;
    } | null;
    if (!api || typeof api.generateGainMap !== 'function') {
      throw new Error('Gain-map test API is unavailable.');
    }
    return await api.generateGainMap({
      provider,
      width: 160,
      height: 120,
    });
  }, {
    apiKey: GAIN_MAP_TEST_API_KEY,
    provider: backend,
  });
}

async function evaluateProviderAvailability(page: Page): Promise<Record<BackendName, boolean>> {
  return await page.evaluate((apiKey) => {
    const api = (window as Record<string, unknown>)[apiKey] as {
      getAvailability: () => Record<BackendName, boolean>;
    } | null;
    if (!api || typeof api.getAvailability !== 'function') {
      throw new Error('Gain-map test API is unavailable.');
    }
    return api.getAvailability();
  }, GAIN_MAP_TEST_API_KEY);
}

function computeGainMapDiffStats(left: GainMapCapture, right: GainMapCapture): GainMapDiffStats {
  expect(
    { width: left.width, height: left.height },
    'Compared gain maps must share the same dimensions.',
  ).toEqual({
    width: right.width,
    height: right.height,
  });

  let maxAbsDiff = 0;
  let sumAbsDiff = 0;
  const comparedPixels = left.width * left.height;
  expect(left.pixels.length).toBe(comparedPixels);
  expect(right.pixels.length).toBe(comparedPixels);

  for (let pixelIndex = 0; pixelIndex < comparedPixels; pixelIndex += 1) {
    const leftValue = left.pixels[pixelIndex] ?? 0;
    const rightValue = right.pixels[pixelIndex] ?? 0;
    const absDiff = Math.abs(leftValue - rightValue);
    if (absDiff > maxAbsDiff) {
      maxAbsDiff = absDiff;
    }
    sumAbsDiff += absDiff;
  }

  return {
    width: left.width,
    height: left.height,
    comparedPixels,
    maxAbsDiff,
    meanAbsDiff: comparedPixels > 0 ? sumAbsDiff / comparedPixels : 0,
  };
}

function expectGainMapsWithinTolerance(
  pairLabel: string,
  left: GainMapCapture,
  right: GainMapCapture,
): void {
  const stats = computeGainMapDiffStats(left, right);
  expect(
    stats.maxAbsDiff,
    `${pairLabel} max_abs_diff exceeded tolerance (${stats.maxAbsDiff} > ${MAX_ABS_DIFF_TOLERANCE}) for ${stats.width}x${stats.height} gain map.`,
  ).toBeLessThanOrEqual(MAX_ABS_DIFF_TOLERANCE);
  expect(
    stats.meanAbsDiff,
    `${pairLabel} mean_abs_diff exceeded tolerance (${stats.meanAbsDiff} > ${MEAN_ABS_DIFF_TOLERANCE}) for ${stats.width}x${stats.height} gain map.`,
  ).toBeLessThanOrEqual(MEAN_ABS_DIFF_TOLERANCE);
}

test.describe('GMNet backend parity', () => {
  test('generates matching pre-encode gain maps across webgpu, webgl, and wasm', async ({ page, browserName }) => {
    await page.goto('/');
    await waitForGainMapTestApi(page);

    const availability = await evaluateProviderAvailability(page);
    const missingProviders = (Object.entries(availability) as Array<[BackendName, boolean]>)
      .filter(([, isAvailable]) => !isAvailable)
      .map(([provider]) => provider);
    test.skip(
      missingProviders.length > 0,
      `${browserName} runtime is missing required providers: ${missingProviders.join(', ')}`,
    );

    const captures: Record<BackendName, GainMapCapture> = {
      webgpu: await processWithBackend(page, 'webgpu'),
      webgl: await processWithBackend(page, 'webgl'),
      wasm: await processWithBackend(page, 'wasm'),
    };

    expectGainMapsWithinTolerance('webgpu vs webgl', captures.webgpu, captures.webgl);
    expectGainMapsWithinTolerance('webgpu vs wasm', captures.webgpu, captures.wasm);
    expectGainMapsWithinTolerance('webgl vs wasm', captures.webgl, captures.wasm);
  });

  test('produces deterministic pre-encode gain maps for repeated wasm runs', async ({ page, browserName }) => {
    await page.goto('/');
    await waitForGainMapTestApi(page);

    const availability = await evaluateProviderAvailability(page);
    test.skip(!availability.wasm, `WASM backend is unavailable in this ${browserName} runtime.`);

    const firstCapture = await processWithBackend(page, 'wasm');
    const secondCapture = await processWithBackend(page, 'wasm');
    expectGainMapsWithinTolerance('wasm deterministic replay', firstCapture, secondCapture);
  });
});
