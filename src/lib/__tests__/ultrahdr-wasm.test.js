/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('WASM Encoder JavaScript Bindings', () => {
  let originalFetch;
  let originalUHDREncoderModule;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      })
    );
    originalUHDREncoderModule = global.window.UHDREncoderModule;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
    if (originalUHDREncoderModule) {
      global.window.UHDREncoderModule = originalUHDREncoderModule;
    } else {
      delete global.window.UHDREncoderModule;
    }
  });

  it('should check WASM module availability', async () => {
    const mockModule = {
      _malloc: vi.fn(),
      _free: vi.fn(),
      HEAPU8: new Uint8Array(1024),
      buffer: new ArrayBuffer(1024),
    };
    let moduleFactoryOptions;

    global.window.UHDREncoderModule = vi.fn((options) => {
      moduleFactoryOptions = options;
      return Promise.resolve(mockModule);
    });

    const { isAvailable } = await import('../ultrahdr-wasm.js');
    const available = await isAvailable();
    expect(available).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/assets/ultrahdr_wasm.wasm?v=test-wasm-version')
    );
    expect(typeof moduleFactoryOptions?.locateFile).toBe('function');
    expect(moduleFactoryOptions.locateFile('ultrahdr_wasm.wasm')).toContain(
      '/assets/ultrahdr_wasm.wasm?v=test-wasm-version'
    );
    expect(moduleFactoryOptions.locateFile('not-wasm.data')).toBe('not-wasm.data');
  });

  it('loads versioned WASM wrapper script URL when factory is not preloaded', async () => {
    const scriptElements = [];
    const headAppendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      scriptElements.push(node);
      global.window.UHDREncoderModule = vi.fn(() =>
        Promise.resolve({
          _malloc: vi.fn(),
          _free: vi.fn(),
          _wasm_create_encoder: vi.fn(() => 1),
          _wasm_release_encoder: vi.fn(),
          HEAPU8: new Uint8Array(4096),
          buffer: new ArrayBuffer(4096),
        })
      );
      setTimeout(() => node.onload?.(), 0);
      return node;
    });

    delete global.window.UHDREncoderModule;
    const { isAvailable } = await import('../ultrahdr-wasm.js');
    const available = await isAvailable();

    expect(available).toBe(true);
    expect(scriptElements).toHaveLength(1);
    expect(scriptElements[0].src).toContain('/assets/ultrahdr_wasm.js?v=test-wasm-version');
    headAppendSpy.mockRestore();
  });

  it('fails fast when WASM wrapper script never resolves', async () => {
    vi.useFakeTimers();
    delete global.window.UHDREncoderModule;

    const headAppendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
    const { isAvailable, getStatus } = await import('../ultrahdr-wasm.js');
    const availabilityPromise = isAvailable();

    await vi.advanceTimersByTimeAsync(3_500);
    await expect(availabilityPromise).resolves.toBe(false);
    expect(getStatus().error?.message).toMatch(/Timed out loading WASM script/);

    headAppendSpy.mockRestore();
    vi.useRealTimers();
  });

  it('falls back to fetch-and-eval when DOM script loading fails', async () => {
    delete global.window.UHDREncoderModule;

    const headAppendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      setTimeout(() => node.onerror?.(new Error('script load failed')), 0);
      return node;
    });

    global.fetch = vi.fn((url) => {
      if (String(url).includes('ultrahdr_wasm.js')) {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(
              'globalThis.UHDREncoderModule = function UHDREncoderModule() {' +
              'return Promise.resolve({' +
              'HEAPU8: new Uint8Array(4096),' +
              '_malloc: function(){ return 0; },' +
              '_free: function(){}' +
              '});' +
              '};'
            ),
        });
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      });
    });

    const { isAvailable } = await import('../ultrahdr-wasm.js');
    const available = await isAvailable();

    expect(available).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/assets/ultrahdr_wasm.js?v=test-wasm-version'),
      expect.objectContaining({ credentials: 'same-origin' }),
    );

    headAppendSpy.mockRestore();
  });

  it('loads the wasm binary from Cache Storage when offline fetch fails', async () => {
    const mockModule = {
      _malloc: vi.fn(),
      _free: vi.fn(),
      HEAPU8: new Uint8Array(1024),
      buffer: new ArrayBuffer(1024),
    };
    let moduleFactoryOptions;

    global.window.UHDREncoderModule = vi.fn((options) => {
      moduleFactoryOptions = options;
      return Promise.resolve(mockModule);
    });

    const cachedBinaryResponse = {
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(2048)),
    };
    global.caches = {
      match: vi.fn(async (url) => {
        if (String(url).includes('ultrahdr_wasm.wasm')) {
          return cachedBinaryResponse;
        }
        return undefined;
      }),
    };
    global.fetch = vi.fn((url) => {
      if (String(url).includes('ultrahdr_wasm.wasm')) {
        return Promise.reject(new Error('offline'));
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      });
    });

    const { isAvailable } = await import('../ultrahdr-wasm.js');
    const available = await isAvailable();

    expect(available).toBe(true);
    expect(global.caches.match).toHaveBeenCalledWith(
      expect.stringContaining('/assets/ultrahdr_wasm.wasm?v=test-wasm-version'),
    );
    expect(moduleFactoryOptions?.wasmBinary).toBeInstanceOf(ArrayBuffer);
    expect(moduleFactoryOptions?.wasmBinary?.byteLength).toBe(2048);

    delete global.caches;
  });

  it('loads WASM factory via eval fallback in worker-like runtime when DOM is unavailable', async () => {
    const originalDocument = global.document;
    const originalImportScripts = global.importScripts;
    const originalFetchForTest = global.fetch;

    delete global.window.UHDREncoderModule;
    delete global.document;
    global.importScripts = vi.fn(() => {
      throw new Error('importScripts should not be used');
    });
    global.fetch = vi.fn((url) => {
      if (String(url).includes('ultrahdr_wasm.js')) {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(
              'globalThis.UHDREncoderModule = function UHDREncoderModule() {' +
              'return Promise.resolve({' +
              'HEAPU8: new Uint8Array(4096),' +
              '_malloc: function(){ return 0; },' +
              '_free: function(){}' +
              '});' +
              '};'
            ),
        });
      }
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      });
    });

    try {
      const { isAvailable } = await import('../ultrahdr-wasm.js');
      const available = await isAvailable();
      expect(available).toBe(true);
      expect(global.importScripts).not.toHaveBeenCalled();
    } finally {
      global.document = originalDocument;
      global.importScripts = originalImportScripts;
      global.fetch = originalFetchForTest;
      delete global.UHDREncoderModule;
    }
  });

  it('should cleanup WASM module state', async () => {
    const { cleanup, isWasmLoaded } = await import('../ultrahdr-wasm.js');

    // Simulate loaded state
    global.window.UHDREncoderModule = () => Promise.resolve({});
    cleanup();

    expect(isWasmLoaded()).toBe(false);
  });
});

describe('UHDREncoder Class', () => {
  let mockModule;
  let mockEncoderHandle;
  let originalFetch;

  beforeEach(() => {
    mockEncoderHandle = 12345;

    mockModule = {
      _malloc: vi.fn(),
      _free: vi.fn(),
      _wasm_create_encoder: vi.fn(() => mockEncoderHandle),
      _wasm_release_encoder: vi.fn(),
      _wasm_enc_set_compressed_base_image: vi.fn(() => 0),
      _wasm_enc_set_exif_data: vi.fn(() => 0),
      _wasm_enc_set_hdr_intent_image: vi.fn(() => 0),
      _wasm_enc_set_gainmap: vi.fn(() => 0),
      _wasm_encode: vi.fn(() => 0),
      _wasm_get_encoded_data: vi.fn(() => 0),
      _wasm_free_encoded_data: vi.fn(),
      _wasm_reset_encoder: vi.fn(),
      _wasm_get_error_message: vi.fn(() => 0),
      HEAPU8: new Uint8Array(64 * 1024 * 1024),
      buffer: new ArrayBuffer(64 * 1024 * 1024),
    };

    global.window = Object.create(window);
    global.window.UHDREncoderModule = vi.fn(() => Promise.resolve(mockModule));
    global.document = {
      head: { appendChild: vi.fn() },
      querySelector: vi.fn(),
    };

    originalFetch = global.fetch;
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      })
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
    delete global.window.UHDREncoderModule;
  });

  it('should initialize encoder successfully', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();

    await encoder.init();

    expect(encoder.isInitialized()).toBe(true);
    expect(mockModule._wasm_create_encoder).toHaveBeenCalled();
  });

  it('should throw error if encoder initialization fails', async () => {
    const failingModule = {
      ...mockModule,
      _wasm_create_encoder: vi.fn(() => 0), // Returns null
    };

    global.window.UHDREncoderModule = vi.fn(() => Promise.resolve(failingModule));

    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();

    await expect(encoder.init()).rejects.toThrow('Failed to create WASM encoder');
  });

  it('should throw error when setting compressed base image before init', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();

    const jpegData = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);

    expect(() => encoder.setCompressedBaseImage(jpegData)).toThrow('Encoder not initialized');
  });

  it('should destroy encoder and release resources', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    encoder.destroy();

    expect(encoder.isInitialized()).toBe(false);
    expect(mockModule._wasm_release_encoder).toHaveBeenCalledWith(mockEncoderHandle);
  });

  it('should reset encoder state', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    encoder.reset();
    expect(mockModule._wasm_reset_encoder).toHaveBeenCalledWith(mockEncoderHandle);
  });

  it('should get error message', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    const errorMsg = encoder.getErrorMessage();
    expect(typeof errorMsg).toBe('string');
  });

  it('should set EXIF payload on encoder', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    mockModule._malloc.mockReturnValueOnce(0x1000);
    const exifPayload = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x49, 0x49, 0x2a, 0x00]);

    encoder.setExifData(exifPayload);

    expect(mockModule._wasm_enc_set_exif_data).toHaveBeenCalledWith(
      mockEncoderHandle,
      0x1000,
      exifPayload.length,
      exifPayload.length
    );
  });

  it('should throw when setExifData is called before init', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    expect(() => encoder.setExifData(new Uint8Array([1, 2, 3]))).toThrow('Encoder not initialized');
  });

  it('reuses the compressed base-image upload buffer across same-sized calls', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    mockModule._malloc.mockReturnValueOnce(0x3000);

    encoder.setCompressedBaseImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]));
    encoder.setCompressedBaseImage(new Uint8Array([0xff, 0xd8, 0xff, 0xdb]));

    expect(mockModule._malloc).toHaveBeenCalledTimes(1);
    expect(mockModule._free).not.toHaveBeenCalledWith(0x3000);
    expect(mockModule._wasm_enc_set_compressed_base_image).toHaveBeenNthCalledWith(
      2,
      mockEncoderHandle,
      0x3000,
      4,
      4,
    );
  });

  it('reuses compressed gain-map upload and metadata buffers across same-sized calls', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    mockModule._malloc
      .mockReturnValueOnce(0x3800)
      .mockReturnValueOnce(0x3900);

    const metadata = {
      gainMapMax: [1, 1, 1],
      gainMapMin: [1, 1, 1],
      gamma: [1, 1, 1],
      offsetSdr: [0, 0, 0],
      offsetHdr: [0, 0, 0],
      hdrCapacityMin: 1,
      hdrCapacityMax: 1,
    };

    encoder.setCompressedGainMapImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), metadata);
    encoder.setCompressedGainMapImage(new Uint8Array([0xff, 0xd8, 0xff, 0xdb]), metadata);

    expect(mockModule._malloc).toHaveBeenCalledTimes(2);
    expect(mockModule._free).not.toHaveBeenCalledWith(0x3800);
    expect(mockModule._free).not.toHaveBeenCalledWith(0x3900);
    expect(mockModule._wasm_enc_set_gainmap).toHaveBeenNthCalledWith(
      2,
      mockEncoderHandle,
      0x3800,
      4,
      1,
      4,
      0x3900,
    );
  });

  it('frees reusable upload buffers on destroy', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    mockModule._malloc
      .mockReturnValueOnce(0x4000)
      .mockReturnValueOnce(0x4100)
      .mockReturnValueOnce(0x4200);

    const metadata = {
      gainMapMax: [1, 1, 1],
      gainMapMin: [1, 1, 1],
      gamma: [1, 1, 1],
      offsetSdr: [0, 0, 0],
      offsetHdr: [0, 0, 0],
      hdrCapacityMin: 1,
      hdrCapacityMax: 1,
    };

    encoder.setCompressedBaseImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]));
    encoder.setCompressedGainMapImage(new Uint8Array([0xff, 0xd8, 0xff, 0xdb]), metadata);

    encoder.destroy();

    expect(mockModule._free).toHaveBeenCalledWith(0x4000);
    expect(mockModule._free).toHaveBeenCalledWith(0x4100);
    expect(mockModule._free).toHaveBeenCalledWith(0x4200);
  });

  it('should map HDR-intent image metadata to API-0 RGBA1010102 BT2100/PQ/FULL arguments', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    // Two pixels packed RGBA1010102 LE
    const packed = new Uint8Array([0xff, 0x03, 0x00, 0xc0, 0x00, 0x00, 0xf0, 0x3f]);
    mockModule._malloc.mockReturnValueOnce(0x2000);

    encoder.setHDRIntentImage(packed, 2, 1, {
      strideBytes: 8,
      format: 'rgba1010102',
      cg: 'bt2100',
      ct: 'pq',
      range: 'full',
    });

    expect(mockModule._wasm_enc_set_hdr_intent_image).toHaveBeenCalledWith(
      mockEncoderHandle,
      0x2000,
      2,
      1,
      64,
      5, // UHDR_IMG_FMT_32bppRGBA1010102
      2, // UHDR_CG_BT_2100
      2, // UHDR_CT_PQ
      1  // UHDR_CR_FULL_RANGE
    );
  });

  it('reuses the HDR-intent upload buffer across same-sized calls', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    mockModule._malloc.mockReturnValueOnce(0x4400);

    encoder.setHDRIntentImage(
      new Uint8Array([0xff, 0x03, 0x00, 0xc0, 0x00, 0x00, 0xf0, 0x3f]),
      2,
      1,
      {
        strideBytes: 8,
        format: 'rgba1010102',
        cg: 'bt2100',
        ct: 'pq',
        range: 'full',
      },
    );
    encoder.setHDRIntentImage(
      new Uint8Array([0x00, 0x00, 0xf0, 0x3f, 0xff, 0x03, 0x00, 0xc0]),
      2,
      1,
      {
        strideBytes: 8,
        format: 'rgba1010102',
        cg: 'bt2100',
        ct: 'pq',
        range: 'full',
      },
    );

    expect(mockModule._malloc).toHaveBeenCalledTimes(1);
    expect(mockModule._free).not.toHaveBeenCalledWith(0x4400);
    expect(mockModule._wasm_enc_set_hdr_intent_image).toHaveBeenNthCalledWith(
      2,
      mockEncoderHandle,
      0x4400,
      2,
      1,
      64,
      5,
      2,
      2,
      1,
    );
  });

  it('should map HDR-intent image metadata to API-0 RGBAHalfFloat BT2100/LINEAR/FULL arguments', async () => {
    const { UHDREncoder } = await import('../ultrahdr-wasm.js');
    const encoder = new UHDREncoder();
    await encoder.init();

    // Two pixels packed RGBA f16 LE
    const packed = new Uint8Array([
      0x00, 0x3c, 0x00, 0x3c, 0x00, 0x3c, 0x00, 0x3c,
      0x00, 0x40, 0x00, 0x40, 0x00, 0x40, 0x00, 0x3c,
    ]);
    mockModule._malloc.mockReturnValueOnce(0x2400);

    encoder.setHDRIntentImage(packed, 2, 1, {
      strideBytes: 16,
      format: 'rgbaf16',
      cg: 'bt2100',
      ct: 'linear',
      range: 'full',
    });

    expect(mockModule._wasm_enc_set_hdr_intent_image).toHaveBeenCalledWith(
      mockEncoderHandle,
      0x2400,
      2,
      1,
      64,
      4, // UHDR_IMG_FMT_64bppRGBAHalfFloat
      2, // UHDR_CG_BT_2100
      0, // UHDR_CT_LINEAR
      1, // UHDR_CR_FULL_RANGE
    );
  });
});
