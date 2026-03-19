/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Shared mocks to allow override in tests
const decodeMock = vi.fn();
const rawDecodeMock = vi.fn();
const displayMock = vi.fn((imageData, callback) => callback(true));
const processHeifHdrMock = vi.hoisted(() => vi.fn());
const getImageHandleMock = vi.hoisted(() => vi.fn((_ctx, itemId) => {
  if (itemId === 1) return { itemId: 1, constructor: { name: 'heif_image_handle' } };
  if (itemId === 2) return { itemId: 2, constructor: { name: 'heif_image_handle' } };
  return { code: 1, subcode: 0, message: 'mock-error' };
}));
const getWidthMock = vi.hoisted(() => vi.fn((handle) => (handle?.itemId === 2 ? 50 : 100)));
const getHeightMock = vi.hoisted(() => vi.fn((handle) => (handle?.itemId === 2 ? 50 : 100)));

// Mock libheif before importing
vi.mock('../libheif-browser.js', () => {
  const mockHeif = {
    HeifDecoder: vi.fn().mockImplementation(function () {
      this.decode = decodeMock;
    }),
    HeifImage: vi.fn().mockImplementation(function () {
      this.get_width = () => 100;
      this.get_height = () => 100;
      this.display = displayMock;
    }),
    heif_colorspace: {
      heif_colorspace_RGB: 1,
    },
    heif_chroma: {
      heif_chroma_interleaved_RGBA: 11,
    },
    heif_channel: {
      heif_channel_interleaved: 10,
    },
    _malloc: vi.fn().mockReturnValue(0),
    _free: vi.fn(),
    heif_js_context_get_list_of_top_level_image_IDs: vi.fn().mockReturnValue([1]),
    heif_js_context_get_image_handle: getImageHandleMock,
    heif_image_handle_get_width: getWidthMock,
    heif_image_handle_get_height: getHeightMock,
    heif_js_decode_image2: rawDecodeMock,
    heif_image_handle_release: vi.fn(),
    getValue: vi.fn(),
    UTF8ToString: vi.fn().mockReturnValue('urn:apple:gainmap'),
  };
  return {
    default: vi.fn().mockResolvedValue(mockHeif),
  };
});

vi.mock('../heif-hdr-processing.js', () => ({
  processHeifHdr: processHeifHdrMock,
}));

describe('heic-processing.js', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      })
    );

    // Default decode behavior: return one image
    decodeMock.mockReturnValue([{
      get_width: () => 100,
      get_height: () => 100,
      handle: { itemId: 1, constructor: { name: 'heif_image_handle' } },
      display: displayMock,
    }]);
    rawDecodeMock.mockReset();
    processHeifHdrMock.mockReset();
    displayMock.mockClear();
    getImageHandleMock.mockImplementation((_ctx, itemId) => {
      if (itemId === 1) return { itemId: 1, constructor: { name: 'heif_image_handle' } };
      if (itemId === 2) return { itemId: 2, constructor: { name: 'heif_image_handle' } };
      return { code: 1, subcode: 0, message: 'mock-error' };
    });
    getWidthMock.mockImplementation((handle) => (handle?.itemId === 2 ? 50 : 100));
    getHeightMock.mockImplementation((handle) => (handle?.itemId === 2 ? 50 : 100));
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
  });

  describe('processHeic', () => {
    it('should be defined', async () => {
      const module = await import('../heic-processing.js');
      expect(module.processHeic).toBeDefined();
    });

    it('should process HEIC files and return PNG', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));
      getImageHandleMock.mockImplementation((_ctx, itemId) => {
        if (itemId === 1) return { itemId: 1, constructor: { name: 'heif_image_handle' } };
        return { code: 1, subcode: 0, message: 'mock-error' };
      });

      const { processHeic } = await import('../heic-processing.js');

      const result = await processHeic(mockFile);

      expect(result).toBeInstanceOf(File);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/assets/libheif.wasm?v=')
      );
    });

    it('should discard gain map when option is set', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processHeic } = await import('../heic-processing.js');

      const options = { discardGainMap: true };
      const result = await processHeic(mockFile, options);

      expect(result).toBeInstanceOf(File);
    });

    it('extracts full preserved gain-map metadata from embedded HDR gain-map XMP', async () => {
      const xmp = `<?xpacket begin=""?><x:xmpmeta><rdf:RDF><rdf:Description hdrgm:Version="1"><hdrgm:GainMapMin><rdf:Seq><rdf:li>1</rdf:li><rdf:li>1</rdf:li><rdf:li>1</rdf:li></rdf:Seq></hdrgm:GainMapMin><hdrgm:GainMapMax><rdf:Seq><rdf:li>7.5</rdf:li><rdf:li>7.5</rdf:li><rdf:li>7.5</rdf:li></rdf:Seq></hdrgm:GainMapMax><hdrgm:Gamma><rdf:Seq><rdf:li>1.2</rdf:li><rdf:li>1.2</rdf:li><rdf:li>1.2</rdf:li></rdf:Seq></hdrgm:Gamma><rdf:Description hdrgm:OffsetSDR="0.125" hdrgm:OffsetHDR="0.25" hdrgm:HDRCapacityMin="1" hdrgm:HDRCapacityMax="7.5" /></rdf:Description></rdf:RDF></x:xmpmeta>`;
      const { parseHdrGainMapMetadataFromText } = await import('../gain-map-metadata.js');
      const result = parseHdrGainMapMetadataFromText(`heic-prefix ${xmp} heic-suffix`);

      expect(result).toMatchObject({
        gainMapMin: [1, 1, 1],
        gainMapMax: [7.5, 7.5, 7.5],
        gamma: [1.2, 1.2, 1.2],
        offsetSdr: [0.125, 0.125, 0.125],
        offsetHdr: [0.25, 0.25, 0.25],
        hdrCapacityMin: 1,
        hdrCapacityMax: 7.5,
      });
    });

    it('returns hdr-intent-heif for raw HDR HEIC inputs without a native SDR intent', async () => {
      const hdrBytes = new Uint8Array([
        0, 0, 0, 12, 0x63, 0x6f, 0x6c, 0x72,
        0x6e, 0x63, 0x6c, 0x78,
        0x00, 0x09,
        0x00, 0x10,
        0x00, 0x09,
        0x80,
      ]);
      const mockFile = new File([hdrBytes], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(hdrBytes.buffer.slice(0)));
      getImageHandleMock.mockImplementation((_ctx, itemId) => {
        if (itemId === 1) return { itemId: 1, constructor: { name: 'heif_image_handle' } };
        return { code: 1, subcode: 0, message: 'mock-error' };
      });
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

      const { processHeic } = await import('../heic-processing.js');
      const result = await processHeic(mockFile);

      expect(processHeifHdrMock).toHaveBeenCalledTimes(1);
      expect(result?.kind).toBe('hdr-intent-heif');
      expect(result?.hdrIntent?.format).toBe('rgbaf16');
    });

    it('routes raw HDR HEIC inputs to hdr-intent before allocating SDR display buffers', async () => {
      const hdrBytes = new Uint8Array([
        0, 0, 0, 12, 0x63, 0x6f, 0x6c, 0x72,
        0x6e, 0x63, 0x6c, 0x78,
        0x00, 0x09,
        0x00, 0x10,
        0x00, 0x09,
        0x80,
      ]);
      const mockFile = new File([hdrBytes], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(hdrBytes.buffer.slice(0)));
      displayMock.mockClear();
      getImageHandleMock.mockImplementation((_ctx, itemId) => {
        if (itemId === 1) return { itemId: 1, constructor: { name: 'heif_image_handle' } };
        return { code: 1, subcode: 0, message: 'mock-error' };
      });
      processHeifHdrMock.mockResolvedValue({
        kind: 'hdr-intent-heif',
        hdrIntent: {
          data: new Uint8Array([0xff, 0x01, 0x08, 0xe0]),
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

      const { processHeic } = await import('../heic-processing.js');
      const result = await processHeic(mockFile);

      expect(processHeifHdrMock).toHaveBeenCalledTimes(1);
      expect(displayMock).not.toHaveBeenCalled();
      expect(result?.kind).toBe('hdr-intent-heif');
      expect(result?.hdrIntent?.format).toBe('rgba1010102');
    });

    it('should handle error when no images found', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processHeic } = await import('../heic-processing.js');

      // Override shared decode mock to return empty array for this test
      decodeMock.mockReturnValue([]);

      await expect(processHeic(mockFile)).rejects.toThrow('No images found in HEIC file');
    });

    it('returns bytes-first preserved components without using image.display when native gain map is found', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));
      displayMock.mockClear();

      rawDecodeMock.mockImplementation((handle) => {
        if (handle?.itemId === 1) {
          return {
            channels: [{
              id: 10,
              stride: 400,
              width: 100,
              height: 100,
              bits_per_pixel: 8,
              data: new Uint8Array(100 * 100 * 4).fill(200),
            }],
          };
        }
        if (handle?.itemId === 2) {
          const data = new Uint8Array(50 * 50 * 4);
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 127;
            data[i + 1] = 127;
            data[i + 2] = 127;
            data[i + 3] = 255;
          }
          return {
            channels: [{
              id: 10,
              stride: 200,
              width: 50,
              height: 50,
              bits_per_pixel: 8,
              data,
            }],
          };
        }
        return { code: 1 };
      });

      const { processHeic } = await import('../heic-processing.js');
      const result = await processHeic(mockFile);

      expect(result).toMatchObject({
        name: 'test.heic',
        sdr: {
          width: 100,
          height: 100,
          strideBytes: 400,
          pixelFormat: 'rgba8',
          bitDepth: 8,
        },
        gainMap: {
          width: 50,
          height: 50,
          strideBytes: 200,
          pixelFormat: 'rgba8',
          bitDepth: 8,
        },
      });
      expect(result.sdr.data).toBeInstanceOf(Uint8Array);
      expect(result.gainMap.data).toBeInstanceOf(Uint8Array);
      expect(displayMock).not.toHaveBeenCalled();
    });
  });
});
