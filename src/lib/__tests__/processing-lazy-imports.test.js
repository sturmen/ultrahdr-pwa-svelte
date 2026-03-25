/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { encoderSpies } = vi.hoisted(() => ({
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

vi.mock('../heic-processing.js', () => {
  throw new Error('HEIC module should not be imported for JPEG processing');
});

vi.mock('../tiff-processing.js', () => ({
  processTiff: vi.fn(async (file) => file),
}));

vi.mock('../gain-map-generator.js', () => {
  class GmnetGainMapGenerator {
    async generate(imageData) {
      const size = imageData.width * imageData.height * 4;
      const data = new Uint8ClampedArray(size).fill(120);
      for (let i = 3; i < size; i += 4) {
        data[i] = 255;
      }
      return {
        gainMapImageData: new ImageData(data, imageData.width, imageData.height),
        metadata: {
          gainMapMin: [1.0, 1.0, 1.0],
          gainMapMax: [8.0, 8.0, 8.0],
          gamma: [1.0, 1.0, 1.0],
          offsetSdr: [0, 0, 0],
          offsetHdr: [0, 0, 0],
          hdrCapacityMin: 1.0,
          hdrCapacityMax: 8.0,

        },
      };
    }
  }

  return { GmnetGainMapGenerator };
});

vi.mock('../input-exif.js', () => ({
  extractExifApp1PayloadFromInput: vi.fn(() => null),
}));

vi.mock('../ultrahdr-wasm.js', () => ({
  isWasmLoaded: vi.fn(() => true),
  isAvailable: vi.fn(async () => true),
  isUhdrImage: vi.fn(async () => false),
  UHDRDecoder: vi.fn(),
  UHDREncoder: vi.fn().mockImplementation(function () {
    return encoderSpies;
  }),
}));

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  decodeJpegli: vi.fn(async () => ({
    width: 4,
    height: 4,
    data: new Uint8ClampedArray(4 * 4 * 4).fill(127),
  })),
}));

class MockOffscreenCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    const { width, height } = this;
    return {
      drawImage: vi.fn(),
      putImageData: vi.fn(),
      getImageData: vi.fn(() => new ImageData(new Uint8ClampedArray(width * height * 4).fill(127), width, height)),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
    };
  }

  async convertToBlob() {
    return new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' });
  }
}

describe('processing-core lazy imports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.OffscreenCanvas = MockOffscreenCanvas;
    globalThis.createImageBitmap = vi.fn(async (input) => {
      const canvas = document.createElement('canvas');
      canvas.width = input instanceof ImageData ? input.width : 4;
      canvas.height = input instanceof ImageData ? input.height : 4;
      if (input instanceof ImageData) {
        const context = canvas.getContext('2d');
        context?.putImageData(input, 0, 0);
      }
      return canvas;
    });
  });

  it('processes JPEG inputs without importing HEIC module', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'input.jpg', { type: 'image/jpeg' });

    const result = await processImage(file, {
      stripExif: true,
      discardGainMap: true,
    });

    expect(result).toBeInstanceOf(Blob);
    expect(encoderSpies.encode).toHaveBeenCalledTimes(1);
  });
});
