import { beforeEach, describe, expect, it, vi } from 'vitest';

const processingOrientationMocks = vi.hoisted(() => ({
  gmnetCalls: [] as Array<{ width: number; height: number }>,
  encodedJpegDimensions: [] as Array<{ width: number; height: number }>,
  decodeDimensions: { width: 4, height: 2 },
  encoderSpies: {
    init: vi.fn(async () => {}),
    setCompressedBaseImage: vi.fn(),
    setCompressedGainMapImage: vi.fn(),
    setExifData: vi.fn(),
    encode: vi.fn(),
    getEncodedData: vi.fn(() => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
    destroy: vi.fn(),
  },
}));

type JpegliDecodedImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

vi.mock('../gain-map-generator.js', () => {
  class GmnetGainMapGenerator {
    async generate(imageData: ImageData) {
      processingOrientationMocks.gmnetCalls.push({
        width: imageData.width,
        height: imageData.height,
      });
      return {
        gainMapImageData: new ImageData(
          new Uint8ClampedArray(imageData.width * imageData.height * 4).fill(128),
          imageData.width,
          imageData.height,
        ),
        metadata: {
          gainMapMin: [1, 1, 1],
          gainMapMax: [2, 2, 2],
          gamma: [1, 1, 1],
          offsetSdr: [0, 0, 0],
          offsetHdr: [0, 0, 0],
          hdrCapacityMin: 1,
          hdrCapacityMax: 2,
        },
      };
    }
  }

  return { GmnetGainMapGenerator };
});

vi.mock('../heic-processing.js', () => ({
  processHeic: vi.fn(async (file: File) => file),
}));

vi.mock('../tiff-processing.js', () => ({
  processTiff: vi.fn(async (file: File) => file),
}));

vi.mock('../input-exif.js', () => ({
  extractExifApp1PayloadFromInput: vi.fn(() => null),
}));

vi.mock('../ultrahdr-wasm.js', () => ({
  isWasmLoaded: vi.fn(() => true),
  isAvailable: vi.fn(async () => true),
  isUhdrImage: vi.fn(async () => false),
  UHDRDecoder: vi.fn(),
  UHDREncoder: vi.fn().mockImplementation(function MockEncoder() {
    return processingOrientationMocks.encoderSpies;
  }),
}));

vi.mock('../jpegli-decoder.js', () => ({
  decodeJpegli: vi.fn(async (): Promise<JpegliDecodedImage> => ({
    width: processingOrientationMocks.decodeDimensions.width,
    height: processingOrientationMocks.decodeDimensions.height,
    data: new Uint8ClampedArray(
      processingOrientationMocks.decodeDimensions.width
      * processingOrientationMocks.decodeDimensions.height
      * 4,
    ).fill(128),
  })),
  encodeJpegli: vi.fn(async (imageData: { width: number; height: number }) => {
    processingOrientationMocks.encodedJpegDimensions.push({
      width: imageData.width,
      height: imageData.height,
    });
    return new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
  }),
}));

vi.mock('../jpegtran-rotate.js', () => ({
  rotateJpeg: vi.fn(async (inputBytes: Uint8Array) => new Uint8Array(inputBytes)),
}));

describe('processImage generated-path EXIF orientation', () => {
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
    processingOrientationMocks.gmnetCalls.length = 0;
    processingOrientationMocks.encodedJpegDimensions.length = 0;
    processingOrientationMocks.decodeDimensions.width = 4;
    processingOrientationMocks.decodeDimensions.height = 2;
    Object.values(processingOrientationMocks.encoderSpies).forEach((spy) => {
      if ('mockClear' in spy) {
        spy.mockClear();
      }
    });
  });

  it('feeds GMNet oriented pixels when the source JPEG is EXIF-rotated', async () => {
    const { processImage } = await import('../processing-core.js');
    const orientedJpeg = buildJpegWithExif(buildExifPayload(6));
    const file = new File([orientedJpeg], 'oriented.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: false,
      discardGainMap: true,
    });

    expect(processingOrientationMocks.gmnetCalls).toEqual([{ width: 2, height: 4 }]);
    expect(processingOrientationMocks.encodedJpegDimensions).toEqual([
      { width: 2, height: 4 },
    ]);
    expect(processingOrientationMocks.encoderSpies.setCompressedBaseImage).toHaveBeenCalledTimes(1);
    expect(processingOrientationMocks.encoderSpies.setCompressedGainMapImage).toHaveBeenCalledTimes(1);
  });
});
