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

type JpegliDecodedImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

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

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  decodeJpegli: vi.fn(async (): Promise<JpegliDecodedImage> => ({
    width: 16,
    height: 16,
    data: new Uint8ClampedArray(16 * 16 * 4).fill(127),
  })),
}));

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
