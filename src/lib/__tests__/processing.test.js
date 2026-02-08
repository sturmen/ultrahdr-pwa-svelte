/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock piexifjs
vi.mock('piexifjs', () => ({
  default: {
    load: vi.fn(),
    dump: vi.fn(),
    insert: vi.fn(),
    ImageIFD: { Orientation: 0x0112 },
  },
}));

describe('generateGainMapData function', () => {
  let generateGainMapData;

  beforeAll(async () => {
    const module = await import('../processing.js');
    generateGainMapData = module.generateGainMapData;
  });

  it('should generate gain map from ImageData', () => {
    // Create mock ImageData (1x1 pixel, white)
    const imageData = new ImageData(
      new Uint8ClampedArray([255, 255, 255, 255]), // White pixel
      1,
      1
    );

    const options = {
      maxContentBoost: 2.0,
      highlightExponent: 2.0,
      shadowCutoff: 0.05,
    };

    const result = generateGainMapData(imageData, options);

    expect(result).toHaveProperty('gainMapImageData');
    expect(result).toHaveProperty('metadata');
    expect(result.gainMapImageData.width).toBe(1);
    expect(result.gainMapImageData.height).toBe(1);

    // For white pixel with max brightness, gain map should be near max (full gain)
    expect(result.gainMapImageData.data[0]).toBeGreaterThan(200);
  });

  it('should apply max content boost correctly', () => {
    // Create bright pixel (should get boost)
    const imageData = new ImageData(
      new Uint8ClampedArray([255, 255, 255, 255]), // Bright pixel
      1,
      1
    );

    const options = {
      maxContentBoost: 4.0,
      highlightExponent: 2.0,
      shadowCutoff: 0.0,
    };

    const result = generateGainMapData(imageData, options);

    // For dark pixel with boost (shadowCutoff=0), gain map should be at max
    expect(result.gainMapImageData.data[0]).toBe(255);
  });

  it('should respect shadow cutoff', () => {
    // Create pixel below shadow cutoff
    const imageData = new ImageData(
      new Uint8ClampedArray([10, 10, 10, 255]), // Very dark
      1,
      1
    );

    const options = {
      maxContentBoost: 4.0,
      highlightExponent: 2.0,
      shadowCutoff: 0.5, // 50% cutoff - this pixel is below
    };

    const result = generateGainMapData(imageData, options);

    // Below cutoff means no boost, so gain map should be 0
    expect(result.gainMapImageData.data[0]).toBe(0);
  });
});
