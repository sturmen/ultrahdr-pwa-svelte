/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

describe('Debug canvas', () => {
  it('should import canvas', async () => {
    const canvas = await import('canvas');
    console.log('canvas module:', Object.keys(canvas));
    console.log('ImageData:', canvas.ImageData);
    expect(typeof canvas.ImageData).toBe('function');
  });
  
  it('should have window available', () => {
    console.log('window:', typeof window);
    expect(window).toBeDefined();
  });
});
