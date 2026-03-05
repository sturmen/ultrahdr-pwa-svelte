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
        data: new Uint8Array([255, 3, 0, 0]),
        width: 1,
        height: 1,
        strideBytes: 4,
        format: 'rgba1010102',
        cg: 'bt2100',
        ct: 'pq',
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
    expect(gmnetCalls).toHaveLength(0);
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

