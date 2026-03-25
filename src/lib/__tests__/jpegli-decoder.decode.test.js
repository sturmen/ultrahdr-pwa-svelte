/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createDecodeCapableWasm() {
  const memory = new ArrayBuffer(16 * 1024 * 1024);
  const heapU8 = new Uint8Array(memory);
  let nextPtr = 1024;
  let nextStateId = 1;
  const states = new Map();

  const malloc = (size) => {
    const ptr = nextPtr;
    nextPtr = (nextPtr + Number(size) + 7) & ~7;
    return ptr;
  };

  return {
    HEAPU8: heapU8,
    _malloc: vi.fn(malloc),
    _free: vi.fn(),
    _jpegli_wasm_decoder_create: vi.fn(() => {
      const stateId = nextStateId++;
      states.set(stateId, {
        outputPtr: 0,
        outputSize: 0,
        width: 0,
        height: 0,
      });
      return stateId;
    }),
    _jpegli_wasm_decoder_destroy: vi.fn((stateId) => {
      states.delete(stateId);
    }),
    _jpegli_wasm_decode: vi.fn((stateId, inputPtr, inputSize) => {
      const state = states.get(stateId);
      if (!state || !inputPtr || !inputSize) {
        return -1;
      }
      const width = 2;
      const height = 1;
      const output = new Uint8Array([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]);
      const outputPtr = malloc(output.length);
      heapU8.set(output, outputPtr);
      state.width = width;
      state.height = height;
      state.outputPtr = outputPtr;
      state.outputSize = output.length;
      return 0;
    }),
    _jpegli_wasm_decoder_get_width: vi.fn((stateId) => states.get(stateId)?.width ?? 0),
    _jpegli_wasm_decoder_get_height: vi.fn((stateId) => states.get(stateId)?.height ?? 0),
    _jpegli_wasm_decoder_get_output_data: vi.fn((stateId) => states.get(stateId)?.outputPtr ?? 0),
    _jpegli_wasm_decoder_get_output_size: vi.fn((stateId) => states.get(stateId)?.outputSize ?? 0),
  };
}

describe('jpegli-decoder decode', () => {
  beforeEach(() => {
    vi.resetModules();
    const wasm = createDecodeCapableWasm();
    window.createJpegliWasm = vi.fn(async () => wasm);
    globalThis.createJpegliWasm = window.createJpegliWasm;
  });

  it('decodes jpeg bytes to rgba raster output without canvas', async () => {
    const { decodeJpegli } = await import('../jpegli-decoder.js');

    const result = await decodeJpegli(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
    expect(Array.from(result.data)).toEqual([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);
  });
});
