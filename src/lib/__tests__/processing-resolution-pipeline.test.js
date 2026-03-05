import { IMAGE_MAX_LONG_EDGE } from '../constants.js';
/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  gmnetCalls,
  jpegEncodeCanvasSizes,
  jpegBitstreamRotations,
  encoderSpies,
  decodeDimensions,
} = vi.hoisted(() => ({
  gmnetCalls: [],
  jpegEncodeCanvasSizes: [],
  jpegBitstreamRotations: [],
  decodeDimensions: { width: 12000, height: 9000 },
  encoderSpies: {
    init: vi.fn(async () => { }),
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
  UHDRDecoder: vi.fn(),
  UHDREncoder: vi.fn().mockImplementation(function () {
    return encoderSpies;
  }),
}));

vi.mock('../jpegli-decoder.js', () => ({
  encodeJpegli: vi.fn(async (imageData, quality, options = {}) => {
    options?.onProgress?.(20, {
      jpegliRowsEncoded: 2,
      jpegliTotalRows: 10,
      jpegliChunkRows: 2,
    });
    options?.onProgress?.(70, {
      jpegliRowsEncoded: 7,
      jpegliTotalRows: 10,
      jpegliChunkRows: 2,
    });
    options?.onProgress?.(100, {
      jpegliRowsEncoded: 10,
      jpegliTotalRows: 10,
      jpegliChunkRows: 2,
    });
    jpegEncodeCanvasSizes.push({ width: imageData.width, height: imageData.height });
    return new Uint8Array([0xff, 0xd8, 0xff, 0xd9]); // Fake JPEG bytes
  })
}));

vi.mock('../jpegtran-rotate.js', () => ({
  rotateJpeg: vi.fn(async (inputBytes, transform, options = {}) => {
    const normalizedInput = inputBytes instanceof Uint8Array
      ? new Uint8Array(inputBytes)
      : new Uint8Array(inputBytes);
    jpegBitstreamRotations.push({
      inputBytes: normalizedInput,
      transform,
      options: { ...options },
    });
    return normalizedInput;
  }),
}));

const exifPayloadOrientation6 = new Uint8Array([
  0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
  0x01, 0x00,
  0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00,
  0x06, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
]);

function buildJpegWithExif(exifPayload, imageData = new Uint8Array([0x11, 0x22, 0x33])) {
  const exifLength = exifPayload.length + 2;
  const segments = [
    new Uint8Array([0xff, 0xd8]),
    new Uint8Array([0xff, 0xe0, 0x00, 0x05, 0x4a, 0x46, 0x49]), // JFI
    new Uint8Array([0xff, 0xe1, (exifLength >> 8) & 0xff, exifLength & 0xff]),
    exifPayload,
    new Uint8Array([0xff, 0xda, 0x00, 0x08, 1, 2, 3, 4, 5, 6]),
    imageData,
    new Uint8Array([0xff, 0xd9]),
  ];

  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const bytes = new Uint8Array(totalLength);
  let offset = 0;
  for (const segment of segments) {
    bytes.set(segment, offset);
    offset += segment.length;
  }
  return bytes;
}

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
    jpegBitstreamRotations.length = 0;
    decodeDimensions.width = 12000;
    decodeDimensions.height = 9000;

    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = MockOffscreenCanvas;
    globalThis.createImageBitmap = vi.fn(async (input) => {
      const canvas = document.createElement('canvas');
      if (input instanceof ImageData) {
        canvas.width = input.width;
        canvas.height = input.height;
        const context = canvas.getContext('2d');
        context?.putImageData(input, 0, 0);
        return canvas;
      }
      canvas.width = decodeDimensions.width;
      canvas.height = decodeDimensions.height;
      return canvas;
    });
  });

  it('clamps, rotates up front, and feeds full-resolution image to GMNet', async () => {
    const { processImage } = await import('../processing-core.js');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
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
    expect(gmnetCalls[0]).toEqual({ width: 9000, height: 12000 });

    expect(stages).not.toContain('rotate-sdr-image');
    expect(stages).not.toContain('rotate-gain-map-image');
    expect(jpegBitstreamRotations).toHaveLength(1);
    expect(jpegBitstreamRotations[0]).toMatchObject({
      transform: '90',
      options: { trim: false, perfect: false },
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Process] Gain map decision: generating new gain map with GMNet'
    );
  });

  it('normalizes orientation-tagged JPEG EXIF and avoids lossless bitstream rotate', async () => {
    const { processImage } = await import('../processing-core.js');
    const { extractExifApp1PayloadFromInput } = await import('../input-exif.js');
    extractExifApp1PayloadFromInput.mockReturnValueOnce(exifPayloadOrientation6);
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 90,
      stripExif: false,
      discardGainMap: true,
    });

    expect(jpegBitstreamRotations).toHaveLength(0);
    expect(encoderSpies.setExifData).toHaveBeenCalledTimes(1);
    const [normalizedExif] = encoderSpies.setExifData.mock.calls[0];
    expect(normalizedExif).toBeInstanceOf(Uint8Array);
    expect(normalizedExif[24]).toBe(1);
    expect(normalizedExif[25]).toBe(0);
  });

  it('lossless-normalizes EXIF-oriented JPEG before zero-rotation SDR bypass when stripExif=false', async () => {
    const { processImage } = await import('../processing-core.js');
    const { extractExifApp1PayloadFromInput } = await import('../input-exif.js');
    extractExifApp1PayloadFromInput.mockReturnValueOnce(exifPayloadOrientation6);
    const orientedJpeg = buildJpegWithExif(exifPayloadOrientation6);
    const file = new File([orientedJpeg], 'oriented.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: false,
      discardGainMap: true,
    });

    expect(jpegBitstreamRotations).toHaveLength(1);
    expect(jpegBitstreamRotations[0]).toMatchObject({
      transform: '90',
      options: { trim: false, perfect: true },
    });
  });

  it('detects EXIF orientation from JPEG bytes and normalizes when stripExif=true', async () => {
    const { processImage } = await import('../processing-core.js');
    const orientedJpeg = buildJpegWithExif(exifPayloadOrientation6);
    const file = new File([orientedJpeg], 'oriented.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      useJpegli: true,
    });

    expect(jpegBitstreamRotations).toHaveLength(1);
    expect(jpegBitstreamRotations[0]).toMatchObject({
      transform: '90',
      options: { trim: false, perfect: true },
    });
    expect(encoderSpies.setCompressedBaseImage).toHaveBeenCalledTimes(1);
    const [baseBytes] = encoderSpies.setCompressedBaseImage.mock.calls[0];
    expect(baseBytes).toBeInstanceOf(Uint8Array);
    expect(baseBytes.length).toBeGreaterThan(4);
    expect(encoderSpies.setExifData).not.toHaveBeenCalled();
  });

  it('falls back to decode/re-encode path when lossless orientation normalization fails', async () => {
    const { processImage } = await import('../processing-core.js');
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    rotateJpeg.mockImplementationOnce(async () => {
      throw new Error('imperfect-transform');
    });
    const orientedJpeg = buildJpegWithExif(exifPayloadOrientation6);
    const file = new File([orientedJpeg], 'oriented.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      useJpegli: true,
    });

    expect(rotateJpeg).toHaveBeenCalledTimes(1);
    expect(rotateJpeg).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      '90',
      { trim: false, perfect: true },
    );
    expect(encoderSpies.setCompressedBaseImage).toHaveBeenCalledTimes(1);
    const [baseBytes] = encoderSpies.setCompressedBaseImage.mock.calls[0];
    expect(baseBytes).toBeInstanceOf(Uint8Array);
    expect(baseBytes.length).toBe(4);
  });

  it('uses full-resolution GMNet input when source is below IMAGE_MAX_LONG_EDGE', async () => {
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
    expect(gmnetCalls[0]).toEqual({ width: 6000, height: 4000 });
  });

  it('ignores legacy outputMaxLongEdge capability hints for split-tiled GMNet', async () => {
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
    expect(gmnetCalls[0]).toEqual({ width: 6000, height: 4000 });
  });

  it('does not emit probe-gmnet-capability stage and still prepares gmnet input', async () => {
    decodeDimensions.width = 6000;
    decodeDimensions.height = 4000;
    const onProgress = vi.fn();
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      onProgress,
    });

    const stageEvents = onProgress.mock.calls
      .map(([event]) => event)
      .filter((event) => event?.phase === 'stage-start')
      .map((event) => event.stage);
    expect(stageEvents).not.toContain('probe-gmnet-capability');
    expect(stageEvents).toContain('prepare-gmnet-input');
  });

  it('emits stage-progress updates for both jpegli encode stages when useJpegli=true', async () => {
    decodeDimensions.width = 3200;
    decodeDimensions.height = 2400;
    const onProgress = vi.fn();
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.png', { type: 'image/png' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      useJpegli: true,
      onProgress,
    });

    const stageProgressEvents = onProgress.mock.calls
      .map(([event]) => event)
      .filter((event) => event?.phase === 'stage-progress');

    expect(
      stageProgressEvents.some((event) => event?.stage === 'encode-sdr-to-jpeg'),
    ).toBe(true);
    expect(
      stageProgressEvents.some((event) => event?.stage === 'encode-gain-map-to-jpeg'),
    ).toBe(true);
  });

  it('does not apply GPU capability clamp when wasm backend is explicitly forced', async () => {
    decodeDimensions.width = 6000;
    decodeDimensions.height = 4000;

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.png', { type: 'image/png' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      forceExecutionProviders: ['wasm'],
    });

    expect(gmnetCalls).toHaveLength(1);
    expect(gmnetCalls[0]).toEqual({ width: 6000, height: 4000 });
  });

  it('does not clamp generated path to 8192 for 12000x9000 inputs', async () => {
    decodeDimensions.width = 12000;
    decodeDimensions.height = 9000;

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
    });

    expect(gmnetCalls).toHaveLength(1);
    expect(gmnetCalls[0]).toEqual({ width: 12000, height: 9000 });
  });

  it('preserves dimensions when long edge is exactly 16384 and short edge is above 8192', async () => {
    decodeDimensions.width = 16384;
    decodeDimensions.height = 8193;

    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'boundary.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
    });

    expect(gmnetCalls).toHaveLength(1);
    expect(gmnetCalls[0]).toEqual({ width: 16384, height: 8193 });
  });

  it('emits processingPath=generated for GMNet-generated pipeline events', async () => {
    decodeDimensions.width = 4000;
    decodeDimensions.height = 3000;
    const onProgress = vi.fn();
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });

    await processImage(file, {
      rotation: 0,
      stripExif: true,
      discardGainMap: true,
      onProgress,
    });

    const generatedEvents = onProgress.mock.calls
      .map(([event]) => event)
      .filter((event) => event?.processingPath === 'generated');
    expect(generatedEvents.length).toBeGreaterThan(0);
    expect(
      onProgress.mock.calls.some(([event]) => event?.processingPath === 'preserved'),
    ).toBe(false);
  });
});
