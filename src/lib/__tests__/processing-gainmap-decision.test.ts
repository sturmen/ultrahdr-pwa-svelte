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
    setHDRIntentImage: vi.fn(),
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
  const mediaPath = path.resolve(process.cwd(), 'fixtures');
  return fs
    .readdirSync(mediaPath)
    .filter((name) => prefixRegex.test(name))
    .sort();
}

function loadJpegFixture(filename) {
  const fixturePath = path.resolve(process.cwd(), 'fixtures', filename);
  const bytes = fs.readFileSync(fixturePath);
  return new File([bytes], filename, { type: 'image/jpeg' });
}

function asciiBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function fakeJpeg(width: number, height: number, app1Payload: Uint8Array | null = null): Uint8Array {
  const segments: Uint8Array[] = [new Uint8Array([0xff, 0xd8])];
  if (app1Payload) {
    const length = app1Payload.length + 2;
    segments.push(new Uint8Array([0xff, 0xe1, (length >> 8) & 0xff, length & 0xff]));
    segments.push(app1Payload);
  }
  segments.push(new Uint8Array([
    0xff, 0xc0, 0x00, 0x11,
    0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xff, 0xd9,
  ]));
  return concatBytes(...segments);
}

function malformedGainMapXmp(gainMapLength: number): Uint8Array {
  return asciiBytes([
    'http://ns.adobe.com/xap/1.0/\0',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '<rdf:Description xmlns:hdrgm="http://ns.adobe.com/hdr-gain-map/1.0/" xmlns:Container="http://ns.google.com/photos/1.0/container/" xmlns:Item="http://ns.google.com/photos/1.0/container/item/" hdrgm:Version="1" hdrgm:HDRCapacityMax="3">',
    '<Container:Directory><rdf:Seq>',
    '<rdf:li rdf:parseType="Resource"><Container:Item Item:Semantic="Primary" Item:Mime="image/jpeg"/></rdf:li>',
    `<rdf:li rdf:parseType="Resource"><Container:Item Item:Semantic="GainMap" Item:Mime="image/jpeg" Item:Length="${gainMapLength}"/></rdf:li>`,
    '</rdf:Seq></Container:Directory>',
    '</rdf:Description>',
    '</rdf:RDF>',
    '</x:xmpmeta>',
  ].join(''));
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

  it('routes test_hdr_jpeg_davinci_resolve.jpg through the HDR-intent-only path', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = loadJpegFixture('test_hdr_jpeg_davinci_resolve.jpg');
    const onProgress = vi.fn();
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await processImage(file, {
      discardGainMap: false,
      stripExif: true,
      onProgress,
    });

    expect(extractCompletionMode(onProgress)).toBe('hdr-intent-only');
    expect(extractStages(onProgress)).toContain('encode-set-hdr-intent-image');
    expect(extractStages(onProgress)).not.toContain('generate-gain-map');
    expect(gmnetCalls).toHaveLength(0);
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

  it('regenerates instead of preserving marker-detected gain maps with invalid metadata', async () => {
    const { processImage } = await import('../processing-core.js');
    const gainMapBytes = fakeJpeg(20, 20);
    const baseBytes = fakeJpeg(10, 10, malformedGainMapXmp(gainMapBytes.length));
    const fileBytes = concatBytes(baseBytes, gainMapBytes);
    const file = new File([fileBytes], 'malformed-legacy-gainmap.jpg', { type: 'image/jpeg' });
    file.arrayBuffer = vi.fn(async () => fileBytes.buffer.slice(0));
    const onProgress = vi.fn();

    await processImage(file, {
      discardGainMap: false,
      stripExif: true,
      onProgress,
    });

    expect(extractCompletionMode(onProgress)).toBe('generated');
    expect(extractStages(onProgress)).toContain('generate-gain-map');
    expect(gmnetCalls.length).toBeGreaterThan(0);
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      phase: 'preservation-fallback',
      reason: 'invalid-gain-map-metadata',
    }));
  });

  if (bfFixtures.length === 0) {
    it.skip('skips BF fixture coverage when no fixtures/BF*.JPG files are available', () => {});
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
