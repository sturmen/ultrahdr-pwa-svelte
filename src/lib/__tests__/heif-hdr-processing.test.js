/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const decodeMock = vi.fn();
const displayMock = vi.fn((imageData, callback) => callback(true));
const mockHeifFactory = vi.fn();

vi.mock('libheif-js/libheif-wasm/libheif.js', () => ({
  default: (...args) => mockHeifFactory(...args),
}));

vi.mock('../input-exif.js', () => ({
  extractExifApp1PayloadFromInput: vi.fn(() => new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00])),
}));

describe('heif-hdr-processing.js', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      })
    );

    mockHeifFactory.mockResolvedValue({
      HeifDecoder: vi.fn().mockImplementation(function () {
        this.decode = decodeMock;
      }),
      HeifImage: vi.fn().mockImplementation(function () {
        this.display = displayMock;
      }),
    });

    decodeMock.mockReturnValue([
      {
        get_width: () => 2,
        get_height: () => 1,
        display: displayMock,
      },
    ]);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns hdr-intent-heif contract with rgba1010102 payload', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const nclxRec2020Pq = new Uint8Array([
      0, 0, 0, 12, 0x63, 0x6f, 0x6c, 0x72, // box + "colr"
      0x6e, 0x63, 0x6c, 0x78,               // "nclx"
      0x00, 0x09,                           // primaries 9 (BT.2020)
      0x00, 0x10,                           // transfer 16 (PQ)
      0x00, 0x09,                           // matrix 9 (BT.2020 non-constant luminance)
      0x80                                  // full range flag
    ]);
    const file = new File([nclxRec2020Pq], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => nclxRec2020Pq.buffer.slice(0));

    const result = await processHeifHdr(file);

    expect(result.kind).toBe('hdr-intent-heif');
    expect(result.hdrIntent.format).toBe('rgba1010102');
    expect(result.hdrIntent.cg).toBe('bt2100');
    expect(result.hdrIntent.ct).toBe('pq');
    expect(result.hdrIntent.range).toBe('full');
    expect(result.hdrIntent.width).toBe(2);
    expect(result.hdrIntent.height).toBe(1);
    expect(result.hdrIntent.data).toBeInstanceOf(Uint8Array);
    expect(result.hdrIntent.data.byteLength).toBeGreaterThan(0);
  });

  it('throws explicit error when Rec.2020 PQ color metadata is unavailable', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const nonHdrBuffer = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const file = new File([nonHdrBuffer], 'non_hdr.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => nonHdrBuffer.buffer.slice(0));

    await expect(processHeifHdr(file)).rejects.toThrow(/10-bit HDR Rec\.2020 PQ decode unavailable/i);
  });
});

