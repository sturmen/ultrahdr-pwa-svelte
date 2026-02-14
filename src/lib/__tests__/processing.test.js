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

    // For white pixel with max brightness, gain map should have significant boost
    expect(result.gainMapImageData.data[0]).toBeGreaterThan(100);
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

    // For bright pixel with full boost, gain map should be high
    expect(result.gainMapImageData.data[0]).toBeGreaterThan(100);
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
      shadowCutoff: 0.5, // 50% cutoff - this pixel is well below
    };

    const result = generateGainMapData(imageData, options);

    // Below cutoff means no boost, so gain map should be 0
    expect(result.gainMapImageData.data[0]).toBe(0);
  });

  it('should produce monotonically increasing gain for brighter pixels', () => {
    // Test that brighter pixels get more boost than darker ones
    const darkPixel = new ImageData(
      new Uint8ClampedArray([64, 64, 64, 255]),
      1, 1
    );
    const midPixel = new ImageData(
      new Uint8ClampedArray([128, 128, 128, 255]),
      1, 1
    );
    const brightPixel = new ImageData(
      new Uint8ClampedArray([240, 240, 240, 255]),
      1, 1
    );

    const options = {
      maxContentBoost: 4.0,
      highlightExponent: 2.0,
      shadowCutoff: 0.01,
    };

    const darkResult = generateGainMapData(darkPixel, options);
    const midResult = generateGainMapData(midPixel, options);
    const brightResult = generateGainMapData(brightPixel, options);

    // Brighter pixels should consistently get more gain
    expect(brightResult.gainMapImageData.data[0]).toBeGreaterThan(midResult.gainMapImageData.data[0]);
    expect(midResult.gainMapImageData.data[0]).toBeGreaterThan(darkResult.gainMapImageData.data[0]);
  });

  it('should produce correct metadata structure', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([128, 128, 128, 255]),
      1, 1
    );

    const options = { maxContentBoost: 4.0 };
    const result = generateGainMapData(imageData, options);

    // Verify metadata has all required fields
    expect(result.metadata.gainMapMin).toEqual([1.0, 1.0, 1.0]);
    expect(result.metadata.gainMapMax).toEqual([4.0, 4.0, 4.0]);
    expect(result.metadata.gamma).toEqual([1.0, 1.0, 1.0]);
    expect(result.metadata.offsetSdr).toEqual([0, 0, 0]);
    expect(result.metadata.offsetHdr).toEqual([0, 0, 0]);
    expect(result.metadata.hdrCapacityMin).toBe(1.0);
    expect(result.metadata.hdrCapacityMax).toBe(4.0);
    expect(result.metadata.parsedGainMapMax).toEqual([2, 2, 2]); // log2(4) = 2
    expect(result.metadata.parsedHdrCapacityMax).toBe(2); // log2(4) = 2
  });

  it('should handle local adaptation with multi-pixel images', () => {
    // Create a 4x4 image with a bright center and dark surroundings
    // This tests that local adaptation actually modulates the boost
    const size = 4;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        // Center 2x2 pixels are bright (200), edges are dark (40)
        const isBright = x >= 1 && x <= 2 && y >= 1 && y <= 2;
        const val = isBright ? 200 : 40;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    const imageData = new ImageData(data, size, size);

    const options = {
      maxContentBoost: 4.0,
      highlightExponent: 2.0,
      shadowCutoff: 0.01,
      localAdaptationStrength: 0.8,
    };

    const result = generateGainMapData(imageData, options);

    // The bright center pixels should have gain map values
    const centerIdx = (1 * size + 1) * 4; // pixel (1,1)
    const edgeIdx = (0 * size + 0) * 4;   // pixel (0,0)

    // Both should be valid (0-255), center should have higher gain
    expect(result.gainMapImageData.data[centerIdx]).toBeGreaterThan(0);
    expect(result.gainMapImageData.data[centerIdx]).toBeLessThanOrEqual(255);
    expect(result.gainMapImageData.data[centerIdx]).toBeGreaterThan(
      result.gainMapImageData.data[edgeIdx]
    );
  });

  it('should preserve alpha channel', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([128, 128, 128, 255]),
      1, 1
    );

    const options = { maxContentBoost: 4.0 };
    const result = generateGainMapData(imageData, options);

    // Alpha channel should always be 255
    expect(result.gainMapImageData.data[3]).toBe(255);
  });
});
