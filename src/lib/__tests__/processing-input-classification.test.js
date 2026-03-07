/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const processHeicMock = vi.hoisted(() => vi.fn(async (file) => file));
const processHeifHdrMock = vi.hoisted(() => vi.fn());
const processTiffMock = vi.hoisted(() => vi.fn(async (file) => file));

vi.mock('../gain-map-generator.js', () => ({
  GmnetGainMapGenerator: vi.fn(),
}));

vi.mock('../heic-processing.js', () => ({
  processHeic: processHeicMock,
}));

vi.mock('../heif-hdr-processing.js', () => ({
  processHeifHdr: processHeifHdrMock,
}));

vi.mock('../tiff-processing.js', () => ({
  processTiff: processTiffMock,
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
  UHDREncoder: vi.fn(),
}));

function makeFile(name, type, bytes = [1, 2, 3, 4]) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('classifyInputProcessingPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    processHeicMock.mockImplementation(async (file) => file);
    processHeifHdrMock.mockReset();
    processTiffMock.mockImplementation(async (file) => file);
  });

  it('classifies SDR JPEG input as generated', async () => {
    const { classifyInputProcessingPath } = await import('../processing-core.js');

    await expect(
      classifyInputProcessingPath(makeFile('test_sdr.jpg', 'image/jpeg')),
    ).resolves.toBe('generated');
  });

  it('classifies UltraHDR JPEG input with existing gain map as preserved', async () => {
    const { classifyInputProcessingPath } = await import('../processing-core.js');
    const { isUhdrImage } = await import('../ultrahdr-wasm.js');
    isUhdrImage.mockResolvedValue(true);

    await expect(
      classifyInputProcessingPath(makeFile('test_hdr_jpeg_gainmap.jpg', 'image/jpeg')),
    ).resolves.toBe('preserved');
  });

  it('classifies HEIC input with native gain map as preserved', async () => {
    const { classifyInputProcessingPath } = await import('../processing-core.js');
    processHeicMock.mockResolvedValue({
      sdr: new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1),
      gainMap: new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1),
      name: 'test_hdr_heif_gainmap.HEIC',
    });

    await expect(
      classifyInputProcessingPath(makeFile('test_hdr_heif_gainmap.HEIC', 'image/heic')),
    ).resolves.toBe('preserved');
  });

  it('classifies HDR-intent HIF input as hdr-intent', async () => {
    const { classifyInputProcessingPath } = await import('../processing-core.js');
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

    await expect(
      classifyInputProcessingPath(makeFile('test_hdr_no_gain_map.HIF', 'image/heif')),
    ).resolves.toBe('hdr-intent');
  });

  it('classifies SDR PNG, WebP, TIFF, and HEIC-without-gain-map inputs as generated', async () => {
    const { classifyInputProcessingPath } = await import('../processing-core.js');
    const cases = [
      makeFile('plain.png', 'image/png'),
      makeFile('plain.webp', 'image/webp'),
      makeFile('plain.tiff', 'image/tiff'),
      makeFile('plain.heic', 'image/heic'),
    ];

    await expect(
      Promise.all(cases.map((file) => classifyInputProcessingPath(file))),
    ).resolves.toEqual(['generated', 'generated', 'generated', 'generated']);
  });
});
