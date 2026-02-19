/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const {
  gmnetCalls,
  encoderSpies,
} = vi.hoisted(() => ({
  gmnetCalls: [],
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

vi.mock('../gain-map-generator.js', () => {
  class GmnetGainMapGenerator {
    async generate(imageData) {
      gmnetCalls.push({ width: imageData.width, height: imageData.height });
      const size = imageData.width * imageData.height * 4;
      const data = new Uint8ClampedArray(size).fill(160);
      for (let i = 3; i < size; i += 4) {
        data[i] = 255;
      }
      return {
        gainMapImageData: new ImageData(data, imageData.width, imageData.height),
        metadata: {
          gainMapMin: [1.0, 1.0, 1.0],
          gainMapMax: [2.3, 2.3, 2.3],
          gamma: [1.0, 1.0, 1.0],
          offsetSdr: [0, 0, 0],
          offsetHdr: [0, 0, 0],
          hdrCapacityMin: 1.0,
          hdrCapacityMax: 2.3,
        },
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
      probe: vi.fn(() => {
        throw new Error('decoder probe failed');
      }),
      getBaseImage: vi.fn(() => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
      getGainMapImage: vi.fn(() => {
        throw new Error('no gain map image');
      }),
      getGainMapMetadata: vi.fn(() => ({})),
    };
  }),
  UHDREncoder: vi.fn().mockImplementation(function () {
    return encoderSpies;
  }),
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
      getImageData: vi.fn(() => {
        const data = new Uint8ClampedArray(width * height * 4).fill(127);
        for (let i = 3; i < data.length; i += 4) {
          data[i] = 255;
        }
        return new ImageData(data, width, height);
      }),
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

function fixtureFileNamesByGlob(prefixRegex) {
  const mediaPath = path.resolve(process.cwd(), 'media');
  return fs
    .readdirSync(mediaPath)
    .filter((name) => prefixRegex.test(name))
    .sort();
}

function loadJpegFixture(filename) {
  const fixturePath = path.resolve(process.cwd(), 'media', filename);
  const bytes = fs.readFileSync(fixturePath);
  return new File([bytes], filename, { type: 'image/jpeg' });
}

function extractStages(onProgressSpy) {
  return onProgressSpy.mock.calls
    .map(([event]) => event?.stage)
    .filter(Boolean);
}

function extractCompletionMode(onProgressSpy) {
  const completionEvents = onProgressSpy.mock.calls
    .map(([event]) => event)
    .filter((event) => event?.phase === 'pipeline-complete');
  return completionEvents[completionEvents.length - 1]?.mode;
}

describe('processImage gain map decision (fixture driven)', () => {
  const bfFixtures = fixtureFileNamesByGlob(/^BF.*\.JPG$/);

  beforeEach(() => {
    vi.clearAllMocks();
    gmnetCalls.length = 0;
    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = MockOffscreenCanvas;
    globalThis.createImageBitmap = vi.fn(async () => ({
      width: 8,
      height: 8,
      close: vi.fn(),
    }));
  });

  it('uses generated path for test_sdr.jpg', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = loadJpegFixture('test_sdr.jpg');
    const onProgress = vi.fn();
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await processImage(file, {
      discardGainMap: false,
      stripExif: true,
      onProgress,
    });

    expect(extractCompletionMode(onProgress)).toBe('generated');
    expect(extractStages(onProgress)).toContain('generate-gain-map');
    expect(gmnetCalls.length).toBeGreaterThan(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Process] Gain map decision: generating new gain map with GMNet'
    );
    consoleLogSpy.mockRestore();
  });

  it('uses preserve path for test_hdr_jpeg_gainmap.jpg', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = loadJpegFixture('test_hdr_jpeg_gainmap.jpg');
    const onProgress = vi.fn();
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await processImage(file, {
      discardGainMap: false,
      stripExif: true,
      onProgress,
    });

    expect(extractCompletionMode(onProgress)).toBe('preserve');
    expect(extractStages(onProgress)).not.toContain('generate-gain-map');
    expect(gmnetCalls).toHaveLength(0);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Process] Gain map decision: preserving existing gain map from source input'
    );
    consoleLogSpy.mockRestore();
  });

  it('uses preserve-with-rotation path when decoder extraction fails but marker fallback is available', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = loadJpegFixture('test_hdr_jpeg_gainmap.jpg');
    const onProgress = vi.fn();

    await processImage(file, {
      discardGainMap: false,
      stripExif: true,
      rotation: 90,
      onProgress,
    });

    expect(extractStages(onProgress)).not.toContain('generate-gain-map');
    expect(gmnetCalls).toHaveLength(0);
    expect(extractCompletionMode(onProgress)).toBe('preserve-with-rotation');
  });

  if (bfFixtures.length === 0) {
    it.skip('skips BF fixture coverage when no media/BF*.JPG files are available', () => {});
  } else {
    it.each(bfFixtures)('uses preserve path for %s', async (fixtureName) => {
      const { processImage } = await import('../processing-core.js');
      const file = loadJpegFixture(fixtureName);
      const onProgress = vi.fn();
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await processImage(file, {
        discardGainMap: false,
        stripExif: true,
        onProgress,
      });

      expect(extractCompletionMode(onProgress)).toBe('preserve');
      expect(extractStages(onProgress)).not.toContain('generate-gain-map');
      expect(gmnetCalls).toHaveLength(0);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Process] Gain map decision: preserving existing gain map from source input'
      );
      consoleLogSpy.mockRestore();
    });

    it.each(bfFixtures)('uses preserve-with-rotation path for %s', async (fixtureName) => {
      const { processImage } = await import('../processing-core.js');
      const file = loadJpegFixture(fixtureName);
      const onProgress = vi.fn();

      await processImage(file, {
        discardGainMap: false,
        stripExif: true,
        rotation: 90,
        onProgress,
      });

      expect(extractStages(onProgress)).not.toContain('generate-gain-map');
      expect(gmnetCalls).toHaveLength(0);
      expect(extractCompletionMode(onProgress)).toBe('preserve-with-rotation');
    });
  }
});
