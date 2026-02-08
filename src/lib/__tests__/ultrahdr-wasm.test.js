/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('WASM Encoder JavaScript Bindings', () => {
  let originalFetch;

  beforeEach(() => {
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

  it('should check WASM module availability', async () => {
    const mockModule = {
      _malloc: vi.fn(),
      _free: vi.fn(),
      HEAPU8: new Uint8Array(1024),
      buffer: new ArrayBuffer(1024),
    };

    global.window.UHDREncoderModule = vi.fn(() => Promise.resolve(mockModule));

    const { isAvailable } = await import('../ultrahdr-wasm.js');
    const available = await isAvailable();
    expect(available).toBe(true);
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
});
