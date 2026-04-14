/**
 * @vitest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
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

vi.mock('../input-exif.js', async () => {
  const actual = await vi.importActual('../input-exif.js');
  return {
    ...actual,
    extractExifApp1PayloadFromInput: vi.fn(() => null),
  };
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
  UHDREncoder: vi.fn(),
}));

function makeFile(name, type, bytes = [1, 2, 3, 4]) {
  return new File([new Uint8Array(bytes)], name, { type });
}

function loadMediaFile(relativePath, type) {
  const absolutePath = path.resolve(relativePath);
  const bytes = fs.readFileSync(absolutePath);
  return new File([bytes], path.basename(relativePath), { type });
}

function makeImageDataLike(rgba) {
  return {
    data: new Uint8ClampedArray(rgba),
    width: 1,
    height: 1,
  };
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
      sdr: makeImageDataLike([0, 0, 0, 255]),
      gainMap: makeImageDataLike([255, 255, 255, 255]),
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

describe('probeInputProcessingPathFromHeaders', () => {
  it('classifies HIF HDR headers as hdr-intent without decoding image planes', async () => {
    const { probeInputProcessingPathFromHeaders } = await import('../processing-core.js');

    await expect(
      probeInputProcessingPathFromHeaders(
        loadMediaFile('fixtures/test_hdr_no_gain_map.HIF', 'image/heif'),
      ),
    ).resolves.toBe('hdr-intent');
  });

  it('classifies HEIC headers with native gain-map markers as preserved', async () => {
    const { probeInputProcessingPathFromHeaders } = await import('../processing-core.js');

    await expect(
      probeInputProcessingPathFromHeaders(
        loadMediaFile('fixtures/test_hdr_heif_gainmap.HEIC', 'image/heic'),
      ),
    ).resolves.toBe('preserved');
  });

  it('classifies SDR HEIC headers without gain-map markers as generated', async () => {
    const { probeInputProcessingPathFromHeaders } = await import('../processing-core.js');
    const sdrHeic = makeFile('plain.heic', 'image/heic', [
      0x00, 0x00, 0x00, 0x18,
      0x66, 0x74, 0x79, 0x70,
      0x6d, 0x69, 0x66, 0x31,
      0x00, 0x00, 0x00, 0x00,
      0x6d, 0x69, 0x66, 0x31,
      0x68, 0x65, 0x69, 0x63,
      0x00, 0x00, 0x00, 0x15,
      0x63, 0x6f, 0x6c, 0x72,
      0x6e, 0x63, 0x6c, 0x78,
      0x00, 0x01, 0x00, 0x01,
      0x00, 0x01, 0x80,
    ]);

    await expect(
      probeInputProcessingPathFromHeaders(sdrHeic),
    ).resolves.toBe('generated');
  });

  it('returns unknown for HEIF-family files without decisive header markers', async () => {
    const { probeInputProcessingPathFromHeaders } = await import('../processing-core.js');
    const ambiguousHeif = makeFile('ambiguous.heif', 'image/heif', [
      0x00, 0x00, 0x00, 0x18,
      0x66, 0x74, 0x79, 0x70,
      0x6d, 0x69, 0x66, 0x31,
      0x00, 0x00, 0x00, 0x00,
      0x6d, 0x69, 0x66, 0x31,
      0x68, 0x65, 0x69, 0x63,
    ]);

    await expect(
      probeInputProcessingPathFromHeaders(ambiguousHeif),
    ).resolves.toBe('unknown');
  });

  it('returns unknown for malformed truncated HEIF headers', async () => {
    const { probeInputProcessingPathFromHeaders } = await import('../processing-core.js');

    await expect(
      probeInputProcessingPathFromHeaders(makeFile('broken.hif', 'image/heif', [0x00, 0x00, 0x00])),
    ).resolves.toBe('unknown');
  });
});
