/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const gmnetCalls = vi.hoisted(() => []);
const encoderSpies = vi.hoisted(() => ({
  init: vi.fn(async () => {}),
  setHDRIntentImage: vi.fn(),
  setExifData: vi.fn(),
  encode: vi.fn(),
  getEncodedData: vi.fn(() => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
  destroy: vi.fn(),
}));
const processHeifHdrMock = vi.hoisted(() => vi.fn());

function makeExifPayloadWithOrientation(orientation) {
  return new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01,
    0x03, 0x00,
    0x01, 0x00, 0x00, 0x00,
    orientation & 0xff, (orientation >> 8) & 0xff, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
}

vi.mock('../gain-map-generator.js', () => {
  class GmnetGainMapGenerator {
    async generate() {
      gmnetCalls.push('called');
      return {
        gainMapImageData: new ImageData(new Uint8ClampedArray(4), 1, 1),
        metadata: {
          gainMapMin: [1, 1, 1],
          gainMapMax: [2.3, 2.3, 2.3],
          gamma: [1, 1, 1],
          offsetSdr: [0, 0, 0],
          offsetHdr: [0, 0, 0],
          hdrCapacityMin: 1,
          hdrCapacityMax: 2.3,
        },
      };
    }
  }
  return { GmnetGainMapGenerator };
});

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

vi.mock('../heif-hdr-processing.js', () => ({
  processHeifHdr: processHeifHdrMock,
}));

vi.mock('../heic-processing.js', () => ({
  processHeic: vi.fn(async (file) => file),
}));

vi.mock('../tiff-processing.js', () => ({
  processTiff: vi.fn(async (file) => file),
}));

describe('processImage HDR-intent HEIF branch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gmnetCalls.length = 0;
  });

  it('routes .HIF inputs through HDR-intent API-0 path and bypasses GMNet', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    processHeifHdrMock.mockResolvedValue({
      kind: 'hdr-intent-heif',
      hdrIntent: {
        data: new Uint8Array([0x00, 0x3c, 0x00, 0x3c, 0x00, 0x3c, 0x00, 0x3c]),
        width: 1,
        height: 1,
        strideBytes: 8,
        format: 'rgbaf16',
        cg: 'bt2100',
        ct: 'linear',
        range: 'full',
      },
      sourceExifBytes: null,
    });

    const output = await processImage(file, {
      stripExif: true,
      discardGainMap: false,
    });

    expect(output).toBeInstanceOf(Blob);
    expect(output.type).toBe('image/jpeg');
    expect(processHeifHdrMock).toHaveBeenCalledTimes(1);
    expect(encoderSpies.setHDRIntentImage).toHaveBeenCalledTimes(1);
    expect(encoderSpies.setHDRIntentImage).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      1,
      1,
      expect.objectContaining({
        strideBytes: 8,
        format: 'rgbaf16',
        cg: 'bt2100',
        ct: 'linear',
        range: 'full',
      }),
    );
    expect(gmnetCalls).toHaveLength(0);
  });

  it('forwards raw HDR source EXIF with orientation normalized to 1', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    const sourceExifBytes = makeExifPayloadWithOrientation(6);

    processHeifHdrMock.mockResolvedValue({
      kind: 'hdr-intent-heif',
      hdrIntent: {
        data: new Uint8Array([0x00, 0x3c, 0x00, 0x3c, 0x00, 0x3c, 0x00, 0x3c]),
        width: 1,
        height: 1,
        strideBytes: 8,
        format: 'rgbaf16',
        cg: 'bt2100',
        ct: 'linear',
        range: 'full',
      },
      sourceExifBytes,
    });

    await processImage(file, {
      stripExif: false,
      discardGainMap: false,
    });

    expect(encoderSpies.setExifData).toHaveBeenCalledTimes(1);
    const [normalizedExif] = encoderSpies.setExifData.mock.calls[0];
    expect(normalizedExif).toBeInstanceOf(Uint8Array);
    expect(normalizedExif).not.toEqual(sourceExifBytes);
    expect(normalizedExif[24]).toBe(1);
    expect(normalizedExif[25]).toBe(0);
  });

  it('fails fast when runtime HDR-intent decode is unavailable', async () => {
    const { processImage } = await import('../processing-core.js');
    const file = new File([new Uint8Array([1, 2, 3, 4])], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    processHeifHdrMock.mockRejectedValue(new Error('10-bit HDR Rec.2020 PQ decode unavailable'));

    await expect(processImage(file, {
      stripExif: true,
      discardGainMap: false,
    })).rejects.toThrow(/10-bit HDR Rec\.2020 PQ decode unavailable/i);
  });
});
