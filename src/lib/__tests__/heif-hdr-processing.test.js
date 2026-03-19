/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const decodeMock = vi.fn();
const mockHeifFactory = vi.fn();
const extractExifApp1PayloadFromInputMock = vi.hoisted(() => vi.fn());

vi.mock('../libheif-browser.js', () => ({
  default: (...args) => mockHeifFactory(...args),
}));

vi.mock('../input-exif.js', () => ({
  extractExifApp1PayloadFromInput: extractExifApp1PayloadFromInputMock,
}));

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

function decodeFloat16(uint16) {
  const sign = (uint16 & 0x8000) ? -1 : 1;
  const exponent = (uint16 >> 10) & 0x1f;
  const fraction = uint16 & 0x03ff;

  if (exponent === 0) {
    if (fraction === 0) {
      return sign * 0;
    }
    return sign * (fraction / 1024) * 2 ** -14;
  }

  if (exponent === 0x1f) {
    if (fraction === 0) {
      return sign * Infinity;
    }
    return Number.NaN;
  }

  return sign * (1 + fraction / 1024) * 2 ** (exponent - 15);
}

function makeInterleaved16BitRgba(width, height, pixels, { bitsPerPixel } = {}) {
  const data = new Uint8Array(width * height * 8);
  const view = new DataView(data.buffer);
  for (let i = 0; i < pixels.length; i++) {
    const offset = i * 8;
    const [r, g, b, a = 65535] = pixels[i];
    view.setUint16(offset, r, true);
    view.setUint16(offset + 2, g, true);
    view.setUint16(offset + 4, b, true);
    view.setUint16(offset + 6, a, true);
  }
  return {
    image: { delete: vi.fn() },
    channels: [
      {
        id: 10,
        width,
        height,
        stride: width * 8,
        bits_per_pixel: bitsPerPixel,
        data,
      },
    ],
  };
}

function makeHdrNclxBuffer({
  primaries = 9,
  transfer = 16,
  matrix = 9,
  fullRange = true,
  includeExif = false,
  irotValue = null,
  includeImir = false,
} = {}) {
  const exif = includeExif
    ? [
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x49, 0x49,
        0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
      ]
    : [];
  const irot = irotValue === null
    ? []
    : [0x00, 0x00, 0x00, 0x09, 0x69, 0x72, 0x6f, 0x74, irotValue & 0xff];
  const imir = includeImir
    ? [0x00, 0x00, 0x00, 0x09, 0x69, 0x6d, 0x69, 0x72, 0x00]
    : [];
  return new Uint8Array([
    0, 0, 0, 12, 0x63, 0x6f, 0x6c, 0x72,
    0x6e, 0x63, 0x6c, 0x78,
    (primaries >> 8) & 0xff, primaries & 0xff,
    (transfer >> 8) & 0xff, transfer & 0xff,
    (matrix >> 8) & 0xff, matrix & 0xff,
    fullRange ? 0x80 : 0x00,
    ...irot,
    ...imir,
    ...exif,
  ]);
}

function pqEotfFromCode(codeValue) {
  const y = codeValue / 65535;
  const m1 = 2610 / 16384;
  const m2 = 2523 / 32;
  const c1 = 3424 / 4096;
  const c2 = 2413 / 128;
  const c3 = 2392 / 128;
  const p = y ** (1 / m2);
  const numerator = Math.max(p - c1, 0);
  const denominator = c2 - c3 * p;
  if (denominator <= 0) {
    return 10000 / 203;
  }
  const luminanceNits = (numerator / denominator) ** (1 / m1) * 10000;
  return luminanceNits / 203;
}

function pqEotfFromNormalized(normalizedValue) {
  const y = normalizedValue;
  const m1 = 2610 / 16384;
  const m2 = 2523 / 32;
  const c1 = 3424 / 4096;
  const c2 = 2413 / 128;
  const c3 = 2392 / 128;
  const p = y ** (1 / m2);
  const numerator = Math.max(p - c1, 0);
  const denominator = c2 - c3 * p;
  if (denominator <= 0) {
    return 10000 / 203;
  }
  const luminanceNits = (numerator / denominator) ** (1 / m1) * 10000;
  return luminanceNits / 203;
}

function hlgToLinearFromCode(codeValue) {
  const ePrime = codeValue / 65535;
  const a = 0.17883277;
  const b = 1 - 4 * a;
  const c = 0.5 - a * Math.log(4 * a);
  const scene = ePrime <= 0.5
    ? (ePrime * ePrime) / 3
    : (Math.exp((ePrime - c) / a) + b) / 12;
  return scene;
}

function readHalfFloatPixel(bytes, pixelIndex = 0) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = pixelIndex * 8;
  return {
    r: decodeFloat16(view.getUint16(offset, true)),
    g: decodeFloat16(view.getUint16(offset + 2, true)),
    b: decodeFloat16(view.getUint16(offset + 4, true)),
    a: decodeFloat16(view.getUint16(offset + 6, true)),
  };
}

function readPackedRgba1010102Pixel(bytes, pixelIndex = 0) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const packed = view.getUint32(pixelIndex * 4, true);
  return {
    r: packed & 0x3ff,
    g: (packed >>> 10) & 0x3ff,
    b: (packed >>> 20) & 0x3ff,
    a: (packed >>> 30) & 0x03,
  };
}

describe('heif-hdr-processing.js', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      }),
    );

    mockHeifFactory.mockResolvedValue({
      HeifDecoder: vi.fn().mockImplementation(function () {
        this.decode = decodeMock;
      }),
      heif_colorspace: {
        heif_colorspace_RGB: 1,
      },
      heif_chroma: {
        heif_chroma_interleaved_RRGGBBAA_LE: 15,
      },
      heif_channel: {
        heif_channel_interleaved: 10,
      },
      heif_js_decode_image2: decodeMock,
      heif_image_release: vi.fn(),
    });

    extractExifApp1PayloadFromInputMock.mockReturnValue(makeExifPayloadWithOrientation(1));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns hdr-intent-heif contract with linear rgbaf16 payload for Rec.2020 PQ input', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16 });
    const file = new File([source], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));

    const pqCode = 32768;
    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 1,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(1, 1, [[pqCode, pqCode, pqCode, 65535]]),
    );

    const result = await processHeifHdr(file);

    expect(result.kind).toBe('hdr-intent-heif');
    expect(result.hdrIntent.format).toBe('rgbaf16');
    expect(result.hdrIntent.cg).toBe('bt2100');
    expect(result.hdrIntent.ct).toBe('linear');
    expect(result.hdrIntent.range).toBe('full');
    expect(result.hdrIntent.width).toBe(1);
    expect(result.hdrIntent.height).toBe(1);
    expect(result.hdrIntent.strideBytes).toBe(8);

    const pixel = readHalfFloatPixel(result.hdrIntent.data);
    const expected = Math.min((10000 / 203), pqEotfFromCode(pqCode));
    expect(pixel.r).toBeCloseTo(expected, 3);
    expect(pixel.g).toBeCloseTo(expected, 3);
    expect(pixel.b).toBeCloseTo(expected, 3);
    expect(pixel.a).toBeCloseTo(1, 3);
  });

  it('returns hdr-intent-heif contract with linear rgbaf16 payload for Rec.2020 HLG input', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 18 });
    const file = new File([source], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));

    const hlgCode = 32768;
    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 1,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(1, 1, [[hlgCode, hlgCode, hlgCode, 65535]]),
    );

    const result = await processHeifHdr(file);
    const pixel = readHalfFloatPixel(result.hdrIntent.data);
    const expected = hlgToLinearFromCode(hlgCode);

    expect(result.hdrIntent.format).toBe('rgbaf16');
    expect(result.hdrIntent.ct).toBe('linear');
    expect(pixel.r).toBeCloseTo(expected, 3);
    expect(pixel.g).toBeCloseTo(expected, 3);
    expect(pixel.b).toBeCloseTo(expected, 3);
  });

  it('returns hdr-intent-heif contract with packed rgba1010102 payload for 10-bit Rec.2020 PQ input', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16 });
    const file = new File([source], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));

    const pqCode10Bit = 512;
    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 1,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(
        1,
        1,
        [[pqCode10Bit, pqCode10Bit, pqCode10Bit, 1023]],
        { bitsPerPixel: 10 },
      ),
    );

    const result = await processHeifHdr(file);
    const pixel = readPackedRgba1010102Pixel(result.hdrIntent.data);

    expect(result.hdrIntent.format).toBe('rgba1010102');
    expect(result.hdrIntent.ct).toBe('pq');
    expect(result.hdrIntent.strideBytes).toBe(4);
    expect(pixel.r).toBe(pqCode10Bit);
    expect(pixel.g).toBe(pqCode10Bit);
    expect(pixel.b).toBe(pqCode10Bit);
    expect(pixel.a).toBe(3);
  });

  it('returns hdr-intent-heif contract with packed rgba1010102 payload for 10-bit Rec.2020 HLG input', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 18 });
    const file = new File([source], 'test_hdr_no_gain_map.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));

    const hlgCode10Bit = 700;
    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 1,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(
        1,
        1,
        [[hlgCode10Bit, hlgCode10Bit, hlgCode10Bit, 1023]],
        { bitsPerPixel: 10 },
      ),
    );

    const result = await processHeifHdr(file);
    const pixel = readPackedRgba1010102Pixel(result.hdrIntent.data);

    expect(result.hdrIntent.format).toBe('rgba1010102');
    expect(result.hdrIntent.ct).toBe('hlg');
    expect(result.hdrIntent.strideBytes).toBe(4);
    expect(pixel.r).toBe(hlgCode10Bit);
    expect(pixel.g).toBe(hlgCode10Bit);
    expect(pixel.b).toBe(hlgCode10Bit);
    expect(pixel.a).toBe(3);
  });

  it('applies orientation normalization in pixel space for rotation transforms', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16 });
    const file = new File([source], 'rotated.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));
    extractExifApp1PayloadFromInputMock.mockReturnValue(makeExifPayloadWithOrientation(6));

    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 2,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(2, 1, [
        [1000, 0, 0, 65535],
        [2000, 0, 0, 65535],
      ]),
    );

    const result = await processHeifHdr(file);

    expect(result.hdrIntent.width).toBe(1);
    expect(result.hdrIntent.height).toBe(2);
    expect(result.hdrIntent.strideBytes).toBe(8);

    const topPixel = readHalfFloatPixel(result.hdrIntent.data, 0);
    const bottomPixel = readHalfFloatPixel(result.hdrIntent.data, 1);
    expect(bottomPixel.r).toBeGreaterThan(topPixel.r);
  });

  it('applies orientation normalization in pixel space for mirrored transforms', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16 });
    const file = new File([source], 'mirrored.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));
    extractExifApp1PayloadFromInputMock.mockReturnValue(makeExifPayloadWithOrientation(2));

    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 2,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(2, 1, [
        [1000, 0, 0, 65535],
        [2000, 0, 0, 65535],
      ]),
    );

    const result = await processHeifHdr(file);

    const leftPixel = readHalfFloatPixel(result.hdrIntent.data, 0);
    const rightPixel = readHalfFloatPixel(result.hdrIntent.data, 1);
    expect(leftPixel.r).toBeGreaterThan(rightPixel.r);
  });

  it('does not apply EXIF rotation a second time when HEIF irot metadata is present', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16, irotValue: 3 });
    const file = new File([source], 'test_hdr_no_gain_map_90cw.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));
    extractExifApp1PayloadFromInputMock.mockReturnValue(makeExifPayloadWithOrientation(6));

    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 1,
        get_height: () => 2,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(1, 2, [
        [1000, 0, 0, 65535],
        [2000, 0, 0, 65535],
      ]),
    );

    const result = await processHeifHdr(file);

    expect(result.hdrIntent.width).toBe(1);
    expect(result.hdrIntent.height).toBe(2);
    const topPixel = readHalfFloatPixel(result.hdrIntent.data, 0);
    const bottomPixel = readHalfFloatPixel(result.hdrIntent.data, 1);
    expect(bottomPixel.r).toBeGreaterThan(topPixel.r);
  });

  it('does not apply EXIF rotation a second time when HEIF irot=90 metadata is present', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16, irotValue: 1 });
    const file = new File([source], 'test_hdr_no_gain_map_270cw.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));
    extractExifApp1PayloadFromInputMock.mockReturnValue(makeExifPayloadWithOrientation(8));

    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 1,
        get_height: () => 2,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(1, 2, [
        [1000, 0, 0, 65535],
        [2000, 0, 0, 65535],
      ]),
    );

    const result = await processHeifHdr(file);

    expect(result.hdrIntent.width).toBe(1);
    expect(result.hdrIntent.height).toBe(2);
    const topPixel = readHalfFloatPixel(result.hdrIntent.data, 0);
    const bottomPixel = readHalfFloatPixel(result.hdrIntent.data, 1);
    expect(bottomPixel.r).toBeGreaterThan(topPixel.r);
  });

  it('treats HEIF imir metadata as an already-applied presentation transform', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const source = makeHdrNclxBuffer({ transfer: 16, includeImir: true });
    const file = new File([source], 'mirrored-container.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => source.buffer.slice(0));
    extractExifApp1PayloadFromInputMock.mockReturnValue(makeExifPayloadWithOrientation(2));

    decodeMock.mockReturnValueOnce([
      {
        get_width: () => 2,
        get_height: () => 1,
        handle: { id: 1 },
      },
    ]);
    decodeMock.mockReturnValueOnce(
      makeInterleaved16BitRgba(2, 1, [
        [2000, 0, 0, 65535],
        [1000, 0, 0, 65535],
      ]),
    );

    const result = await processHeifHdr(file);

    const leftPixel = readHalfFloatPixel(result.hdrIntent.data, 0);
    const rightPixel = readHalfFloatPixel(result.hdrIntent.data, 1);
    expect(leftPixel.r).toBeGreaterThan(rightPixel.r);
  });

  it('throws explicit error when supported HDR color metadata is unavailable', async () => {
    const { processHeifHdr } = await import('../heif-hdr-processing.js');
    const nonHdrBuffer = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const file = new File([nonHdrBuffer], 'non_hdr.HIF', { type: 'image/heif' });
    file.arrayBuffer = vi.fn(async () => nonHdrBuffer.buffer.slice(0));

    await expect(processHeifHdr(file)).rejects.toThrow(/HDR HEIF input/);
  });
});
