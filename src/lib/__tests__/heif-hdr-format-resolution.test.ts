/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { resolveHdrIntentFormat } from '../heif-hdr-processing.ts';

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
