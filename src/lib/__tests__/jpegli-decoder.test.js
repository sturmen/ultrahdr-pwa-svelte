/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMockChunkCapableWasm() {
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

  const free = vi.fn();

  return {
    HEAPU8: heapU8,
    _malloc: vi.fn(malloc),
    _free: free,

    _jpegli_wasm_encoder_create: vi.fn(() => {
      const stateId = nextStateId++;
      states.set(stateId, {
        inputPtr: 0,
        width: 0,
        height: 0,
        nextScanline: 0,
        outputPtr: 0,
        outputSize: 0,
      });
      return stateId;
    }),
    _jpegli_wasm_encoder_destroy: vi.fn((stateId) => {
      states.delete(stateId);
    }),

    _jpegli_wasm_encoder_start: vi.fn((stateId, inputPtr, width, height) => {
      const state = states.get(stateId);
      if (!state) return -1;
      state.inputPtr = Number(inputPtr);
      state.width = Number(width);
      state.height = Number(height);
      state.nextScanline = 0;
      return 0;
    }),
    _jpegli_wasm_encoder_process_rows: vi.fn((stateId, maxRows) => {
      const state = states.get(stateId);
      if (!state) return -1;
      const remaining = state.height - state.nextScanline;
      if (remaining <= 0) return 0;
      const rows = Math.max(1, Math.min(remaining, Math.floor(Number(maxRows) || 1)));
      state.nextScanline += rows;
      return rows;
    }),
    _jpegli_wasm_encoder_finish: vi.fn((stateId) => {
      const state = states.get(stateId);
      if (!state) return -1;
      const byteLength = 64;
      const outputPtr = malloc(byteLength);
      for (let i = 0; i < byteLength; i += 1) {
        heapU8[outputPtr + i] = (state.width + state.height + i) % 256;
      }
      state.outputPtr = outputPtr;
      state.outputSize = byteLength;
      return 0;
    }),
    _jpegli_wasm_encoder_get_next_scanline: vi.fn((stateId) => {
      const state = states.get(stateId);
      return state ? state.nextScanline : 0;
    }),
    _jpegli_wasm_encoder_get_image_height: vi.fn((stateId) => {
      const state = states.get(stateId);
      return state ? state.height : 0;
    }),

    _jpegli_wasm_encode: vi.fn((stateId, inputPtr, width, height) => {
      const state = states.get(stateId);
      if (!state) return -1;
      state.inputPtr = Number(inputPtr);
      state.width = Number(width);
      state.height = Number(height);
      state.nextScanline = Number(height);
      const byteLength = 64;
      const outputPtr = malloc(byteLength);
      for (let i = 0; i < byteLength; i += 1) {
        heapU8[outputPtr + i] = (state.width + state.height + i) % 256;
      }
      state.outputPtr = outputPtr;
      state.outputSize = byteLength;
      return 0;
    }),
    _jpegli_wasm_get_output_data: vi.fn((stateId) => {
      const state = states.get(stateId);
      return state ? state.outputPtr : 0;
    }),
    _jpegli_wasm_get_output_size: vi.fn((stateId) => {
      const state = states.get(stateId);
      return state ? state.outputSize : 0;
    }),
  };
}

function createImageData(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = i % 251;
    data[i + 1] = (i * 3) % 251;
    data[i + 2] = (i * 7) % 251;
    data[i + 3] = 255;
  }
  return { width, height, data };
}

describe('jpegli-decoder chunked progress', () => {
  beforeEach(() => {
    vi.resetModules();
    const wasm = createMockChunkCapableWasm();
    window.createJpegliWasm = vi.fn(async () => wasm);
    globalThis.createJpegliWasm = window.createJpegliWasm;
  });

  it('emits incremental monotonic progress and reaches 100 for chunked encoding', async () => {
    const { encodeJpegli } = await import('../jpegli-decoder.js');
    const progress = [];

    const result = await encodeJpegli(createImageData(8, 11), 92, {
      chunkRows: 2,
      onProgress: (value) => progress.push(Number(value)),
    });

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
    expect(progress.length).toBeGreaterThan(2);
    expect(progress[0]).toBe(0);
    expect(progress[progress.length - 1]).toBe(100);
    for (let i = 1; i < progress.length; i += 1) {
      expect(progress[i]).toBeGreaterThanOrEqual(progress[i - 1]);
    }
  });

  it('handles chunkRows edge cases without skipping completion progress', async () => {
    const { encodeJpegli } = await import('../jpegli-decoder.js');
    const zeroChunkProgress = [];
    const hugeChunkProgress = [];

    await encodeJpegli(createImageData(5, 3), 90, {
      chunkRows: 0,
      onProgress: (value) => zeroChunkProgress.push(Number(value)),
    });
    await encodeJpegli(createImageData(5, 3), 90, {
      chunkRows: 999,
      onProgress: (value) => hugeChunkProgress.push(Number(value)),
    });

    expect(zeroChunkProgress[0]).toBe(0);
    expect(zeroChunkProgress[zeroChunkProgress.length - 1]).toBe(100);
    expect(hugeChunkProgress[0]).toBe(0);
    expect(hugeChunkProgress[hugeChunkProgress.length - 1]).toBe(100);
  });

  it('supports single-row images and undefined progress callback', async () => {
    const { encodeJpegli } = await import('../jpegli-decoder.js');

    const encoded = await encodeJpegli(createImageData(7, 1), 88, {
      chunkRows: 64,
    });

    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('exports a legacy encode path for deterministic bytestream comparison', async () => {
    const { encodeJpegliLegacyForTests } = await import('../jpegli-decoder.js');
    const encoded = await encodeJpegliLegacyForTests(createImageData(6, 4), 95);

    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);
  });
});
