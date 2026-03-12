/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

describe('Debug canvas', () => {
  it('derives a working ImageData constructor for tests', async () => {
    const canvas = await import('canvas');
    const derived = canvas.createCanvas(1, 1).getContext('2d').createImageData(1, 1);

    expect(typeof derived.constructor).toBe('function');
    expect(typeof globalThis.ImageData).toBe('function');
    expect(new globalThis.ImageData(new Uint8ClampedArray(4), 1, 1)).toBeInstanceOf(derived.constructor);
  });
  
  it('should have window available', () => {
    console.log('window:', typeof window);
    expect(window).toBeDefined();
  });
});
