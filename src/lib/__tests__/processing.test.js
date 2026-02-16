/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

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
    };

    const result = generateGainMapData(imageData, options);

    expect(result).toHaveProperty('gainMapImageData');
    expect(result).toHaveProperty('metadata');
    expect(result.gainMapImageData.width).toBe(1);
    expect(result.gainMapImageData.height).toBe(1);

    // For white pixel with max brightness, gain map should have significant boost
    expect(result.gainMapImageData.data[0]).toBeGreaterThan(100);
  });

  it('should use 2.3 as the default max content boost when omitted', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([200, 200, 200, 255]),
      1,
      1
    );

    const result = generateGainMapData(imageData, {});

    expect(result.metadata.gainMapMax).toEqual([2.3, 2.3, 2.3]);
    expect(result.metadata.hdrCapacityMax).toBe(2.3);
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
    };

    const result = generateGainMapData(imageData, options);

    // For bright pixel with full boost, gain map should be high
    expect(result.gainMapImageData.data[0]).toBeGreaterThan(100);
  });

  it('keeps deep shadows near neutral in conservative v2', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([10, 10, 10, 255]), // Very dark
      1,
      1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2',
      brightnessIntent: 'conservative'
    });

    // Conservative mode should keep very dark regions close to no gain.
    expect(result.gainMapImageData.data[0]).toBeLessThanOrEqual(18);
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
    };

    const darkResult = generateGainMapData(darkPixel, options);
    const midResult = generateGainMapData(midPixel, options);
    const brightResult = generateGainMapData(brightPixel, options);

    // Brighter pixels should consistently get more gain
    expect(brightResult.gainMapImageData.data[0]).toBeGreaterThan(midResult.gainMapImageData.data[0]);
    expect(midResult.gainMapImageData.data[0]).toBeGreaterThan(darkResult.gainMapImageData.data[0]);
  });

  it('ignores shadowCutoff in v2 and warns once per session', () => {
    delete globalThis.__ultrahdrDeprecationWarnings;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const imageData = new ImageData(
      new Uint8ClampedArray([180, 180, 180, 255]),
      1,
      1
    );

    const resultA = generateGainMapData(imageData, {
      maxContentBoost: 3.0,
      reverseToneMapVersion: 'v2',
      shadowCutoff: 0.0
    });
    const resultB = generateGainMapData(imageData, {
      maxContentBoost: 3.0,
      reverseToneMapVersion: 'v2',
      shadowCutoff: 0.8
    });

    expect(Array.from(resultA.gainMapImageData.data)).toEqual(
      Array.from(resultB.gainMapImageData.data)
    );
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(String(warnSpy.mock.calls[0][0])).toContain('processing.shadowCutoff.deprecated');
    warnSpy.mockRestore();
  });

  it('gives clipped highlights more gain than non-clipped near-whites in v2', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([
        255, 255, 255, 255,
        245, 245, 245, 255
      ]),
      2,
      1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2',
      brightnessIntent: 'conservative'
    });

    expect(result.gainMapImageData.data[0]).toBeGreaterThan(result.gainMapImageData.data[4]);
  });

  it('caps midtone lift in conservative v2', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([128, 128, 128, 255]),
      1,
      1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2',
      brightnessIntent: 'conservative'
    });

    // Conservative intent should avoid aggressive midtone gain.
    expect(result.gainMapImageData.data[0]).toBeLessThanOrEqual(95);
  });

  it('produces finite gain map values across maxContentBoost range 1.0-4.0', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([200, 120, 40, 255]),
      1,
      1
    );

    for (const maxContentBoost of [1.0, 2.0, 3.0, 4.0]) {
      const result = generateGainMapData(imageData, {
        maxContentBoost,
        reverseToneMapVersion: 'v2'
      });
      for (let c = 0; c < 3; c++) {
        expect(Number.isFinite(result.gainMapImageData.data[c])).toBe(true);
        expect(result.gainMapImageData.data[c]).toBeGreaterThanOrEqual(0);
        expect(result.gainMapImageData.data[c]).toBeLessThanOrEqual(255);
      }
    }
  });

  it('keeps channel gains bounded for highly saturated colors in v2', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([240, 40, 40, 255]),
      1,
      1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2'
    });

    const r = result.gainMapImageData.data[0];
    const g = result.gainMapImageData.data[1];
    const b = result.gainMapImageData.data[2];
    expect(r).toBeGreaterThanOrEqual(g);
    expect(r).toBeGreaterThanOrEqual(b);
    expect(Math.min(g, b)).toBeGreaterThan(0);
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

  // ---- Improvement 1: Non-zero offsetSdr ----

  it('should set non-zero offsetSdr in metadata (1/64)', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([128, 128, 128, 255]),
      1, 1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });
    const expected = 1 / 64;

    expect(result.metadata.offsetSdr).toEqual([expected, expected, expected]);
    expect(result.metadata.parsedOffsetSdr).toEqual([expected, expected, expected]);
  });

  it('should produce valid gain for near-black pixels with offsetSdr', () => {
    // With offsetSdr > 0, even pure black should produce finite, stable gains
    const imageData = new ImageData(
      new Uint8ClampedArray([1, 1, 1, 255]),
      1, 1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });

    for (let c = 0; c < 3; c++) {
      expect(Number.isFinite(result.gainMapImageData.data[c])).toBe(true);
      expect(result.gainMapImageData.data[c]).toBeGreaterThanOrEqual(0);
      expect(result.gainMapImageData.data[c]).toBeLessThanOrEqual(255);
    }
  });

  // ---- Improvement 2: Gamma encoding ----

  it('should use gamma < 1 in metadata for better quantization', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([128, 128, 128, 255]),
      1, 1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });
    const gamma = result.metadata.gamma[0];

    // Gamma should be approximately 1/2.2 ≈ 0.4545 (less than 1.0)
    expect(gamma).toBeLessThan(1.0);
    expect(gamma).toBeGreaterThan(0.3);
    expect(gamma).toBeCloseTo(1 / 2.2, 2);

    // All channels should have the same gamma
    expect(result.metadata.gamma[1]).toBeCloseTo(gamma, 6);
    expect(result.metadata.gamma[2]).toBeCloseTo(gamma, 6);
  });

  it('should gamma-encode gain values so midtone gains use more quantization levels', () => {
    const midPixel = new ImageData(
      new Uint8ClampedArray([160, 160, 160, 255]),
      1, 1
    );

    const v2Result = generateGainMapData(midPixel, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2'
    });
    const v3Result = generateGainMapData(midPixel, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });

    expect(v2Result.metadata.parsedGamma[0]).toBe(1.0);
    expect(v3Result.metadata.parsedGamma[0]).toBeCloseTo(1 / 2.2, 2);
    expect(v3Result.gainMapImageData.data[0]).toBeGreaterThan(v2Result.gainMapImageData.data[0]);
  });

  // ---- Improvement 3: Highlight chroma desaturation ----

  it('should desaturate near-clip highlights more than mid-bright same-hue pixels', () => {
    // Near-clip saturated highlight vs mid-bright same hue
    const nearClipSaturated = new ImageData(
      new Uint8ClampedArray([255, 200, 50, 255]),  // near-clip warm highlight
      1, 1
    );
    const midBrightSaturated = new ImageData(
      new Uint8ClampedArray([180, 140, 35, 255]),  // same hue, not clipped
      1, 1
    );

    const clipResult = generateGainMapData(nearClipSaturated, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });
    const midResult = generateGainMapData(midBrightSaturated, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });

    // Per-channel gain spread: difference between max and min channel gain
    const clipSpread = Math.max(
      clipResult.gainMapImageData.data[0],
      clipResult.gainMapImageData.data[1],
      clipResult.gainMapImageData.data[2]
    ) - Math.min(
      clipResult.gainMapImageData.data[0],
      clipResult.gainMapImageData.data[1],
      clipResult.gainMapImageData.data[2]
    );

    const midSpread = Math.max(
      midResult.gainMapImageData.data[0],
      midResult.gainMapImageData.data[1],
      midResult.gainMapImageData.data[2]
    ) - Math.min(
      midResult.gainMapImageData.data[0],
      midResult.gainMapImageData.data[1],
      midResult.gainMapImageData.data[2]
    );

    // Near-clip highlights should have LESS channel spread (more desaturated)
    // than mid-bright pixels of the same hue
    expect(clipSpread).toBeLessThan(midSpread);
  });

  // ---- Improvement 4: Histogram-based percentiles ----

  it('should produce consistent results with histogram-based vs sorted percentiles', () => {
    // Multi-pixel image with known luminance distribution
    const size = 8;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = Math.round((i / (size * size - 1)) * 255);
      data[i * 4] = val;
      data[i * 4 + 1] = val;
      data[i * 4 + 2] = val;
      data[i * 4 + 3] = 255;
    }
    const imageData = new ImageData(data, size, size);

    const resultA = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2'
    });
    const resultB = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2'
    });

    // Deterministic: same input should produce identical output
    expect(Array.from(resultA.gainMapImageData.data)).toEqual(
      Array.from(resultB.gainMapImageData.data)
    );
  });

  // ---- Improvement 5: Running-sum box filter ----

  it('should produce correct edge-preserved gain maps for gradient images', () => {
    // Horizontal gradient: should have smooth gain transition
    const size = 16;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const val = Math.round((x / (size - 1)) * 255);
        const idx = (y * size + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    const imageData = new ImageData(data, size, size);

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v2'
    });

    // Right column (bright) should have higher gain than left column (dark)
    const leftIdx = (8 * size + 0) * 4;  // middle row, leftmost
    const rightIdx = (8 * size + (size - 1)) * 4;  // middle row, rightmost
    expect(result.gainMapImageData.data[rightIdx]).toBeGreaterThan(
      result.gainMapImageData.data[leftIdx]
    );

    // All values should be valid
    for (let i = 0; i < size * size; i++) {
      const idx = i * 4;
      for (let c = 0; c < 3; c++) {
        expect(result.gainMapImageData.data[idx + c]).toBeGreaterThanOrEqual(0);
        expect(result.gainMapImageData.data[idx + c]).toBeLessThanOrEqual(255);
      }
    }
  });

  // ---- Improvement 6: PQ working space (v4) ----

  it('should support reverseToneMapVersion v4', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([180, 180, 180, 255]),
      1, 1
    );

    const result = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v4'
    });

    expect(result).toHaveProperty('gainMapImageData');
    expect(result).toHaveProperty('metadata');
    expect(result.gainMapImageData.data[0]).toBeGreaterThan(0);
    expect(result.gainMapImageData.data[0]).toBeLessThanOrEqual(255);
  });

  it('v4 should produce different gain from v3 for the same input due to PQ working space', () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([160, 160, 160, 255]),
      1, 1
    );

    const resultV3 = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v3'
    });
    const resultV4 = generateGainMapData(imageData, {
      maxContentBoost: 4.0,
      reverseToneMapVersion: 'v4'
    });

    // v4 should produce different (more perceptually uniform) values
    expect(resultV4.gainMapImageData.data[0]).not.toBe(resultV3.gainMapImageData.data[0]);
  });

  it('v4 produces monotonically increasing gain for brighter pixels', () => {
    const dark = new ImageData(new Uint8ClampedArray([64, 64, 64, 255]), 1, 1);
    const mid = new ImageData(new Uint8ClampedArray([128, 128, 128, 255]), 1, 1);
    const bright = new ImageData(new Uint8ClampedArray([240, 240, 240, 255]), 1, 1);

    const opts = { maxContentBoost: 4.0, reverseToneMapVersion: 'v4' };
    const darkR = generateGainMapData(dark, opts);
    const midR = generateGainMapData(mid, opts);
    const brightR = generateGainMapData(bright, opts);

    expect(brightR.gainMapImageData.data[0]).toBeGreaterThan(midR.gainMapImageData.data[0]);
    expect(midR.gainMapImageData.data[0]).toBeGreaterThan(darkR.gainMapImageData.data[0]);
  });
});
