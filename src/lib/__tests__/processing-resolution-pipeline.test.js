/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  gmnetCalls,
  jpegEncodeCanvasSizes,
  encoderSpies,
  decodeDimensions,
} = vi.hoisted(() => ({
  gmnetCalls: [],
  jpegEncodeCanvasSizes: [],
  decodeDimensions: { width: 12000, height: 9000 },
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
    async resolveCapability(options = {}) {
      if (options?.capabilityHint) {
        return options.capabilityHint;
      }
      return {
        provider: 'webgpu',
        gainMapMaxLongEdge: 4096,
        outputMaxLongEdge: 8192,
        source: 'probe',
        attempts: [{ candidateLongEdge: 4096, status: 'passed' }],
      };
    }

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
  UHDRDecoder: vi.fn(),
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
    return {
      drawImage: vi.fn(),
      putImageData: vi.fn(),
      getImageData: vi.fn(() => {
        const pixelCount = this.width * this.height;
        const data = new Uint8ClampedArray(pixelCount * 4).fill(120);
        for (let i = 3; i < data.length; i += 4) {
          data[i] = 255;
        }
        return new ImageData(data, this.width, this.height);
      }),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
    };
  }

  async convertToBlob() {
    jpegEncodeCanvasSizes.push({ width: this.width, height: this.height });
    return new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' });
  }
}

describe('processing fixed-resolution generated pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    gmnetCalls.length = 0;
    jpegEncodeCanvasSizes.length = 0;
    decodeDimensions.width = 12000;
    decodeDimensions.height = 9000;

    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = MockOffscreenCanvas;
    globalThis.createImageBitmap = vi.fn(async (input) => {
      if (input instanceof ImageData) {
        return {
          width: input.width,
          height: input.height,
          close: vi.fn(),
        };
      }
      return {
        width: decodeDimensions.width,
        height: decodeDimensions.height,
        close: vi.fn(),
      };
    });
  });

  it('clamps, rotates up front, and feeds half-resolution image to GMNet', async () => {
    const { processImage } = await import('../processing-core.js');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const stages = [];
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 90,
      stripExif: true,
      discardGainMap: true,
      onProgress: (event) => {
        stages.push(event.stage);
      },
    });

    expect(gmnetCalls).toHaveLength(1);
    expect(gmnetCalls[0]).toEqual({ width: 3072, height: 4096 });

    expect(jpegEncodeCanvasSizes).toEqual(
      expect.arrayContaining([
        { width: 6144, height: 8192 },
        { width: 3072, height: 4096 },
      ]),
    );

    expect(stages).not.toContain('rotate-sdr-image');
    expect(stages).not.toContain('rotate-gain-map-image');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Process] Gain map decision: generating new gain map with GMNet'
    );
  });

  it('uses exact half-resolution GMNet input when source is below 8192', async () => {
    decodeDimensions.width = 6000;
    decodeDimensions.height = 4000;

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
    });

    expect(gmnetCalls).toHaveLength(1);
    expect(gmnetCalls[0]).toEqual({ width: 3000, height: 2000 });
  });

  it('applies capability-driven output clamp using 2x long-edge rule', async () => {
    decodeDimensions.width = 6000;
    decodeDimensions.height = 4000;

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      gmnetCapabilityHint: {
        provider: 'webgpu',
        gainMapMaxLongEdge: 1000,
        outputMaxLongEdge: 2000,
        source: 'cache',
        attempts: [],
      },
    });

    expect(gmnetCalls).toHaveLength(1);
    expect(gmnetCalls[0]).toEqual({ width: 1000, height: 666 });
    expect(jpegEncodeCanvasSizes).toEqual(
      expect.arrayContaining([
        { width: 2000, height: 1333 },
        { width: 1000, height: 666 },
      ]),
    );
  });

  it('emits probe-gmnet-capability stage before constrain-sdr-image', async () => {
    decodeDimensions.width = 6000;
    decodeDimensions.height = 4000;
    const onProgress = vi.fn();
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      gmnetCapabilityHint: {
        provider: 'webgpu',
        gainMapMaxLongEdge: 1000,
        outputMaxLongEdge: 2000,
        source: 'cache',
        attempts: [],
      },
      onProgress,
    });

    const stageEvents = onProgress.mock.calls
      .map(([event]) => event)
      .filter((event) => event?.phase === 'stage-start')
      .map((event) => event.stage);
    const probeIndex = stageEvents.indexOf('probe-gmnet-capability');
    const constrainIndex = stageEvents.indexOf('constrain-sdr-image');
    expect(probeIndex).toBeGreaterThanOrEqual(0);
    expect(constrainIndex).toBeGreaterThanOrEqual(0);
    expect(probeIndex).toBeLessThan(constrainIndex);
  });
});
