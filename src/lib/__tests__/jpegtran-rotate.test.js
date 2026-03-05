/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createMockModule,
  getLastCallState,
  setTransformFailure,
} = vi.hoisted(() => {
  let transformFailure = null;
  let lastCallState = null;

  function setCString(heap, offset, text) {
    for (let i = 0; i < text.length; i += 1) {
      heap[offset + i] = text.charCodeAt(i);
    }
    heap[offset + text.length] = 0;
  }

  function createMockModule() {
    const memory = new ArrayBuffer(1024 * 1024);
    const HEAPU8 = new Uint8Array(memory);
    let mallocPtr = 1024;
    let outputPtr = 0;
    let outputSize = 0;

    const module = {
      HEAPU8,
      _malloc: vi.fn((size) => {
        const ptr = mallocPtr;
        mallocPtr += size + 16;
        return ptr;
      }),
      _free: vi.fn(),
      _jpegtran_wasm_create: vi.fn(() => 1),
      _jpegtran_wasm_destroy: vi.fn(),
      _jpegtran_wasm_transform: vi.fn((state, inputPtr, inputSize, transformCode, trim, perfect) => {
        lastCallState = {
          state,
          inputPtr,
          inputSize,
          transformCode,
          trim,
          perfect,
        };

        if (transformFailure) {
          return 1;
        }

        outputPtr = 32 * 1024;
        outputSize = inputSize;
        HEAPU8.set(HEAPU8.slice(inputPtr, inputPtr + inputSize), outputPtr);
        return 0;
      }),
      _jpegtran_wasm_get_output_data: vi.fn(() => outputPtr),
      _jpegtran_wasm_get_output_size: vi.fn(() => outputSize),
      _jpegtran_wasm_get_last_error_code: vi.fn(() => transformFailure?.errorCode ?? 0),
      _jpegtran_wasm_get_last_error_message: vi.fn(() => {
        const ptr = 2 * 1024;
        setCString(HEAPU8, ptr, transformFailure?.message ?? '');
        return ptr;
      }),
      _jpegtran_wasm_get_error_image_width: vi.fn(() => transformFailure?.width ?? 0),
      _jpegtran_wasm_get_error_image_height: vi.fn(() => transformFailure?.height ?? 0),
      _jpegtran_wasm_get_error_mcu_width: vi.fn(() => transformFailure?.mcuWidth ?? 0),
      _jpegtran_wasm_get_error_mcu_height: vi.fn(() => transformFailure?.mcuHeight ?? 0),
      _jpegtran_wasm_get_error_imperfect_mask: vi.fn(() => transformFailure?.imperfectMask ?? 0),
      UTF8ToString: vi.fn((ptr) => {
        let text = '';
        let cursor = ptr;
        while (HEAPU8[cursor] !== 0) {
          text += String.fromCharCode(HEAPU8[cursor]);
          cursor += 1;
        }
        return text;
      }),
    };

    return module;
  }

  return {
    createMockModule,
    getLastCallState: () => lastCallState,
    setTransformFailure: (failure) => {
      transformFailure = failure;
    },
  };
});

describe('jpegtran-rotate', () => {
  beforeEach(() => {
    vi.resetModules();
    setTransformFailure(null);
    if (typeof window !== 'undefined') {
      window.createJpegtranWasm = vi.fn(async () => createMockModule());
    }
  });

  it('rotates JPEG bytes with default reversible options', async () => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const input = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);

    const output = await rotateJpeg(input, '90');

    expect(output).toBeInstanceOf(Uint8Array);
    expect(Array.from(output)).toEqual(Array.from(input));
    expect(getLastCallState()).toMatchObject({
      transformCode: 5,
      trim: 0,
      perfect: 0,
    });
  });

  it('accepts ArrayBuffer input bytes', async () => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const input = new Uint8Array([1, 2, 3, 4]);

    const output = await rotateJpeg(input.buffer, 'flipH', { trim: true });

    expect(Array.from(output)).toEqual([1, 2, 3, 4]);
    expect(getLastCallState()).toMatchObject({
      transformCode: 1,
      trim: 1,
      perfect: 0,
    });
  });

  it('rejects unsupported transforms', async () => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const input = new Uint8Array([1, 2, 3, 4]);

    await expect(rotateJpeg(input, '45')).rejects.toThrow(/Unsupported JPEG transform/i);
  });

  it('throws typed imperfect-transform error when perfect=true cannot be satisfied', async () => {
    const { rotateJpeg, JpegTransformError } = await import('../jpegtran-rotate.js');
    setTransformFailure({
      errorCode: 2,
      message: 'transformation is not perfect',
      width: 227,
      height: 149,
      mcuWidth: 16,
      mcuHeight: 16,
      imperfectMask: 3,
    });

    await expect(
      rotateJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), '90', { perfect: true })
    ).rejects.toBeInstanceOf(JpegTransformError);

    try {
      await rotateJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), '90', { perfect: true });
    } catch (error) {
      expect(error).toMatchObject({
        name: 'JpegTransformError',
        code: 'JPEG_TRANSFORM_IMPERFECT',
        details: {
          transform: '90',
          width: 227,
          height: 149,
          mcuWidth: 16,
          mcuHeight: 16,
          offendingEdges: ['right', 'bottom'],
        },
      });
    }
  });

  it('rejects invalid perfect+trim option combinations', async () => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');

    await expect(
      rotateJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), '90', { perfect: true, trim: true })
    ).rejects.toThrow(/cannot both be true/i);
  });
});
