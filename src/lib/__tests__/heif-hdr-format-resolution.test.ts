/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { resolveHdrIntentFormat, downscale16BitInterleavedRgba } from '../heif-hdr-processing.ts';

function make16BitInterleavedRgba(width: number, height: number, pixel: (x: number, y: number) => [number, number, number, number]): Uint8Array {
  const stride = width * 8;
  const data = new Uint8Array(width * height * 8);
  const view = new DataView(data.buffer);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixel(x, y);
      const offset = y * stride + x * 8;
      view.setUint16(offset, r, true);
      view.setUint16(offset + 2, g, true);
      view.setUint16(offset + 4, b, true);
      view.setUint16(offset + 6, a, true);
    }
  }
  return data;
}

function readPixel(data: Uint8Array, stride: number, x: number, y: number): [number, number, number, number] {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const offset = y * stride + x * 8;
  return [
    view.getUint16(offset, true),
    view.getUint16(offset + 2, true),
    view.getUint16(offset + 4, true),
    view.getUint16(offset + 6, true),
  ];
}

describe('resolveHdrIntentFormat', () => {
  it('keeps rgba1010102 for <=10 bit inputs regardless of tier', () => {
    expect(resolveHdrIntentFormat({ bitsPerPixel: 10, memoryTier: 'high' })).toEqual({
      format: 'rgba1010102',
      downgraded: false,
      reason: null,
    });
    expect(resolveHdrIntentFormat({ bitsPerPixel: 10, memoryTier: 'low' })).toEqual({
      format: 'rgba1010102',
      downgraded: false,
      reason: null,
    });
  });

  it('selects rgbaf16 for 12 bit inputs on high or mid tier', () => {
    expect(resolveHdrIntentFormat({ bitsPerPixel: 12, memoryTier: 'high' })).toEqual({
      format: 'rgbaf16',
      downgraded: false,
      reason: null,
    });
    expect(resolveHdrIntentFormat({ bitsPerPixel: 12, memoryTier: 'mid' })).toEqual({
      format: 'rgbaf16',
      downgraded: false,
      reason: null,
    });
  });

  it('downgrades 12 bit inputs to rgba1010102 on low tier with low-memory-tier reason', () => {
    expect(resolveHdrIntentFormat({ bitsPerPixel: 12, memoryTier: 'low' })).toEqual({
      format: 'rgba1010102',
      downgraded: true,
      reason: 'low-memory-tier',
    });
  });

  it('downgrades 16 bit inputs on low tier as well', () => {
    expect(resolveHdrIntentFormat({ bitsPerPixel: 16, memoryTier: 'low' })).toEqual({
      format: 'rgba1010102',
      downgraded: true,
      reason: 'low-memory-tier',
    });
  });

  it('treats non-integer bits_per_pixel as the float16 branch on non-low tier', () => {
    expect(resolveHdrIntentFormat({ bitsPerPixel: NaN, memoryTier: 'high' })).toEqual({
      format: 'rgbaf16',
      downgraded: false,
      reason: null,
    });
  });
});

describe('downscale16BitInterleavedRgba', () => {
  it('returns a tightly-packed buffer at target dims', () => {
    const src = make16BitInterleavedRgba(4, 4, () => [1000, 2000, 3000, 65535]);
    const result = downscale16BitInterleavedRgba(src, 4, 4, 4 * 8, 2, 2);
    expect(result.strideBytes).toBe(2 * 8);
    expect(result.data.byteLength).toBe(2 * 2 * 8);
  });

  it('preserves uniform values through bilinear downscale', () => {
    const src = make16BitInterleavedRgba(8, 8, () => [10000, 20000, 30000, 65535]);
    const result = downscale16BitInterleavedRgba(src, 8, 8, 8 * 8, 4, 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const [r, g, b, a] = readPixel(result.data, result.strideBytes, x, y);
        expect(r).toBe(10000);
        expect(g).toBe(20000);
        expect(b).toBe(30000);
        expect(a).toBe(65535);
      }
    }
  });

  it('interpolates between two distinct columns', () => {
    // Left half = (0, 0, 0, 65535), right half = (60000, 60000, 60000, 65535)
    const src = make16BitInterleavedRgba(8, 1, (x) => (x < 4 ? [0, 0, 0, 65535] : [60000, 60000, 60000, 65535]));
    const result = downscale16BitInterleavedRgba(src, 8, 1, 8 * 8, 4, 1);
    const samples = [0, 1, 2, 3].map((x) => readPixel(result.data, result.strideBytes, x, 0)[0]);
    expect(samples[0]).toBeLessThan(samples[3]);
    expect(samples[3]).toBeGreaterThan(samples[0]);
  });

  it('clamps coordinates at edges (does not read out-of-bounds)', () => {
    const src = make16BitInterleavedRgba(2, 2, (x, y) => [x * 10000, y * 10000, 5000, 65535]);
    const result = downscale16BitInterleavedRgba(src, 2, 2, 2 * 8, 1, 1);
    const [r, g, b, a] = readPixel(result.data, result.strideBytes, 0, 0);
    // Center sample of 2x2 = mean of four corners
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(10000);
    expect(g).toBeGreaterThanOrEqual(0);
    expect(g).toBeLessThanOrEqual(10000);
    expect(b).toBe(5000);
    expect(a).toBe(65535);
  });
});
