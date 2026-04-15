/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { decodedJpegData } = vi.hoisted(() => ({
  decodedJpegData: new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 0, 255,
  ]),
}));

const decodeJpegliMock = vi.hoisted(() => vi.fn());

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  decodeJpegli: decodeJpegliMock,
}));

import { imageDataToJpegBlob, jpegBytesToImageData, loadImageData, transformImageData } from '../image-utils.js';

describe('imageDataToJpegBlob', () => {
  beforeEach(() => {
    decodeJpegliMock.mockReset();
    decodeJpegliMock.mockResolvedValue({
      width: 2,
      height: 1,
      data: decodedJpegData,
    });
  });

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
  function buildExifPayload(orientation: number): Uint8Array {
    return new Uint8Array([
      0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00,
      0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00,
      orientation, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);
  }

  function buildJpegWithExif(exifPayload: Uint8Array): Uint8Array {
    const app1Length = exifPayload.length + 2;
    return new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe1,
      (app1Length >> 8) & 0xff,
      app1Length & 0xff,
      ...exifPayload,
      0xff, 0xd9,
    ]);
  }

  beforeEach(() => {
    decodeJpegliMock.mockReset();
    decodeJpegliMock.mockResolvedValue({
      width: 2,
      height: 1,
      data: decodedJpegData,
    });
  });

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

  it('applies EXIF orientation when decoding JPEG blobs by default', async () => {
    decodeJpegliMock.mockResolvedValueOnce({
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 0, 255, 255,
      ]),
    });
    const orientedJpeg = buildJpegWithExif(buildExifPayload(6));
    const blob = new Blob([orientedJpeg], { type: 'image/jpeg' });

    const decoded = await loadImageData(blob);

    expect(decoded.width).toBe(1);
    expect(decoded.height).toBe(2);
  });

  it('can opt out of EXIF orientation when decoding JPEG blobs', async () => {
    decodeJpegliMock.mockResolvedValueOnce({
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 0, 255, 255,
      ]),
    });
    const orientedJpeg = buildJpegWithExif(buildExifPayload(6));
    const blob = new Blob([orientedJpeg], { type: 'image/jpeg' });

    const decoded = await loadImageData(blob, { imageOrientation: 'none' });

    expect(decoded.width).toBe(2);
    expect(decoded.height).toBe(1);
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
