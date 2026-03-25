/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  decodeJpegli: vi.fn(async () => ({
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]),
  })),
}));

import { imageDataToJpegBlob, transformImageData } from '../image-utils.js';

describe('imageDataToJpegBlob', () => {
  it('returns a jpeg blob without requiring legacy browser export shims', async () => {
    const imageData = {
      width: 2,
      height: 1,
      colorSpace: 'display-p3',
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]),
    };

    const result = await imageDataToJpegBlob(imageData, 0.8);

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
  });
});

describe('transformImageData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes image-data-shaped inputs before running raster transforms', async () => {
    const foreignImageData = {
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]),
      colorSpace: 'srgb',
    };

    const result = await transformImageData(foreignImageData, { width: 2, height: 1, degrees: 90 });

    expect(result).toBeInstanceOf(ImageData);
    expect(result.width).toBe(1);
    expect(result.height).toBe(2);
  });
});
