/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const previewCodecMocks = vi.hoisted(() => ({
  decodeJpegliMock: vi.fn(),
  encodeJpegliMock: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
}));

vi.mock('../jpegli-decoder.js', () => ({
  decodeJpegli: previewCodecMocks.decodeJpegliMock,
  encodeJpegli: previewCodecMocks.encodeJpegliMock,
}));

describe('input preview JPEG orientation', () => {
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
    vi.clearAllMocks();
    previewCodecMocks.decodeJpegliMock.mockResolvedValue({
      width: 4,
      height: 2,
      data: new Uint8ClampedArray(4 * 2 * 4).fill(128),
    });
  });

  it('creates previews from display-oriented JPEG pixels by default', async () => {
    const { createPreviewBlobFromImageBlob } = await import('../input-preview.ts');
    const orientedJpeg = buildJpegWithExif(buildExifPayload(6));
    const blob = new Blob([orientedJpeg], { type: 'image/jpeg' });

    await createPreviewBlobFromImageBlob(blob);

    expect(previewCodecMocks.encodeJpegliMock).toHaveBeenCalledTimes(1);
    const [previewImageData] = previewCodecMocks.encodeJpegliMock.mock.calls[0];
    expect(previewImageData).toMatchObject({
      width: 2,
      height: 4,
    });
  });
});
