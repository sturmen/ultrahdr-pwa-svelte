/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateGainMapDataMock = vi.fn();

vi.mock('../processing-core.js', () => ({
  generateGainMapData: generateGainMapDataMock,
}));

describe('gain-map test API', () => {
  beforeEach(() => {
    vi.resetModules();
    generateGainMapDataMock.mockReset();
    delete (window as Record<string, unknown>).__ULTRAHDR_TEST_GAIN_MAP_API;
  });

  it('installs a browser API that generates a single-channel capture for a forced backend', async () => {
    generateGainMapDataMock.mockResolvedValue({
      gainMapImageData: new ImageData(new Uint8ClampedArray([
        10, 10, 10, 255,
        20, 20, 20, 255,
        30, 30, 30, 255,
        40, 40, 40, 255,
      ]), 2, 2),
      metadata: {},
    });

    const { GAIN_MAP_TEST_API_KEY, installGainMapTestApi } = await import('../gain-map-test-api.ts');
    const api = installGainMapTestApi(window);

    expect(api).not.toBeNull();
    expect(window[GAIN_MAP_TEST_API_KEY]).toBe(api);

    const result = await api!.generateGainMap({ provider: 'wasm', width: 64, height: 64 });

    expect(generateGainMapDataMock).toHaveBeenCalledWith(
      expect.any(ImageData),
      expect.objectContaining({
        forceExecutionProviders: ['wasm'],
      }),
    );
    expect(result).toEqual({
      provider: 'wasm',
      width: 2,
      height: 2,
      pixels: [10, 20, 30, 40],
    });
  });
});
