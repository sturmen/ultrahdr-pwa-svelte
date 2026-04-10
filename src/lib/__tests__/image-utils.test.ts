/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

const { decodedJpegData } = vi.hoisted(() => ({
  decodedJpegData: new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 0, 255,
  ]),
}));

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  decodeJpegli: vi.fn(async () => ({
    width: 2,
    height: 1,
    data: decodedJpegData,
  })),
}));

import { imageDataToJpegBlob, jpegBytesToImageData, loadImageData, transformImageData } from '../image-utils.js';

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

describe('JPEG decode helpers', () => {
  it('wraps jpegli decoded pixels without an extra full-frame copy', async () => {
    const blob = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' });

    const loaded = await loadImageData(blob);
    const direct = await jpegBytesToImageData(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));

    expect(loaded.imageData.data).toBe(decodedJpegData);
    expect(direct.data).toBe(decodedJpegData);
  });

  it('decodes from preloaded compressed bytes without rereading the source blob', async () => {
    const preloadedBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const blob = new Blob([preloadedBytes], { type: 'image/jpeg' });
    vi.spyOn(blob, 'arrayBuffer').mockRejectedValue(new Error('unexpected reread'));

    const result = await (loadImageData as unknown as (
      source: Blob,
      config: Record<string, unknown>,
      preloadedBytes: Uint8Array,
    ) => ReturnType<typeof loadImageData>)(blob, {}, preloadedBytes);

    expect(result.imageData.data).toBe(decodedJpegData);
    expect(blob.arrayBuffer).not.toHaveBeenCalled();
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
