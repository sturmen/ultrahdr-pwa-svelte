/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MAX_CONTENT_BOOST } from '../max-content-boost.js';

const { encoderSpies, forwardedMetadata } = vi.hoisted(() => ({
  encoderSpies: {
    init: vi.fn(async () => {}),
    setCompressedBaseImage: vi.fn(),
    setCompressedGainMapImage: vi.fn(),
    setExifData: vi.fn(),
    encode: vi.fn(),
    getEncodedData: vi.fn(() => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
    destroy: vi.fn(),
  },
  forwardedMetadata: {
    gainMapMin: [1.0, 1.0, 1.0],
    gainMapMax: [9.9, 9.9, 9.9],
    gamma: [1.1, 1.1, 1.1],
    offsetSdr: [0.01, 0.01, 0.01],
    offsetHdr: [0.02, 0.02, 0.02],
    hdrCapacityMin: 1.0,
    hdrCapacityMax: 9.9,
  },
}));

type JpegliDecodedImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

vi.mock('../gain-map-generator.js', () => {
  class GmnetGainMapGenerator {
    constructor() {}

    async generate(imageData) {
      const size = imageData.width * imageData.height * 4;
      const data = new Uint8ClampedArray(size).fill(128);
      for (let i = 3; i < size; i += 4) {
        data[i] = 255;
      }
      return {
        gainMapImageData: new ImageData(data, imageData.width, imageData.height),
        metadata: forwardedMetadata,
      };
    }
  }

  return {
    GmnetGainMapGenerator,
  };
});

vi.mock('../heic-processing.js', () => ({
  processHeic: vi.fn(async (file) => file),
}));

vi.mock('../tiff-processing.js', () => ({
  processTiff: vi.fn(async (file) => file),
}));

vi.mock('../input-exif.js', () => ({
  extractExifApp1PayloadFromInput: vi.fn(() => null),
  setInputExifProbeSink: vi.fn(),
}));

vi.mock('../ultrahdr-wasm.js', () => ({
  isWasmLoaded: vi.fn(() => true),
  isAvailable: vi.fn(async () => true),
  isUhdrImage: vi.fn(async () => false),
  UHDRDecoder: vi.fn().mockImplementation(function () {
    return {
      init: vi.fn(async () => {}),
      destroy: vi.fn(),
      setImage: vi.fn(),
      probe: vi.fn(),
      getBaseImage: vi.fn(() => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
      getGainMapImage: vi.fn(() => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
      getGainMapMetadata: vi.fn(() => forwardedMetadata),
    };
  }),
  UHDREncoder: vi.fn().mockImplementation(function () {
    return encoderSpies;
  }),
}));

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  decodeJpegli: vi.fn(async (): Promise<JpegliDecodedImage> => ({
    width: 8,
    height: 8,
    data: new Uint8ClampedArray(8 * 8 * 4).fill(127),
  })),
}));

describe('processImage metadata forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.Worker = undefined;
  });

  it('uses generated gain-map metadata when encoding compressed gain map', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      maxContentBoost: 4.0,
      stripExif: true,
      discardGainMap: true,
    });

    expect(encoderSpies.setCompressedGainMapImage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        gainMapMax: [9.9, 9.9, 9.9],
        hdrCapacityMax: 9.9,
        gamma: [1.1, 1.1, 1.1],
      }),
    );
  });

  it('preserves imported gain-map metadata unchanged for preserved HEIC inputs', async () => {
    const { processHeic } = await import('../heic-processing.js');
    const preservedMetadata = {
      gainMapMin: [1.2, 1.2, 1.2],
      gainMapMax: [12.3, 12.3, 12.3],
      gamma: [1.05, 1.05, 1.05],
      offsetSdr: [0.03, 0.03, 0.03],
      offsetHdr: [0.04, 0.04, 0.04],
      hdrCapacityMin: 1.1,
      hdrCapacityMax: 12.3,
    };
    processHeic.mockResolvedValueOnce({
      kind: 'preserved-heic',
      sdr: new ImageData(new Uint8ClampedArray(4), 1, 1),
      gainMap: new ImageData(new Uint8ClampedArray(4), 1, 1),
      gainMapMetadata: preservedMetadata,
      name: 'input.heic',
    });

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'input.heic', { type: 'image/heic' });

    await processImage(file, {
      maxContentBoost: 32,
      stripExif: true,
      discardGainMap: false,
    });

    expect(encoderSpies.setCompressedGainMapImage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining(preservedMetadata),
    );
  });

  it('falls back to synthesized metadata from imported gain-map headroom when full metadata is absent', async () => {
    const { processHeic } = await import('../heic-processing.js');
    processHeic.mockResolvedValueOnce({
      kind: 'preserved-heic',
      sdr: new ImageData(new Uint8ClampedArray(4), 1, 1),
      gainMap: new ImageData(new Uint8ClampedArray(4), 1, 1),
      gainMapHeadroom: 6.5,
      name: 'input.heic',
    });

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'input.heic', { type: 'image/heic' });

    await processImage(file, {
      maxContentBoost: 32,
      stripExif: true,
      discardGainMap: false,
    });

    expect(encoderSpies.setCompressedGainMapImage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        gainMapMax: [6.5, 6.5, 6.5],
        hdrCapacityMax: 6.5,
      }),
    );
  });

  it('uses generated metadata when a preserved HEIC gain map is discarded', async () => {
    const { processHeic } = await import('../heic-processing.js');
    processHeic.mockResolvedValueOnce({
      data: new Uint8Array(8 * 8 * 4).fill(127),
      width: 8,
      height: 8,
      strideBytes: 32,
      pixelFormat: 'rgba8',
      bitDepth: 8,
    });

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'input.heic', { type: 'image/heic' });

    await processImage(file, {
      maxContentBoost: DEFAULT_MAX_CONTENT_BOOST,
      stripExif: true,
      discardGainMap: true,
    });

    expect(encoderSpies.setCompressedGainMapImage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        gainMapMax: [9.9, 9.9, 9.9],
        hdrCapacityMax: 9.9,
      }),
    );
  });
});
