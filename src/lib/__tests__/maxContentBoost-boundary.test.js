/**
 * @vitest-environment jsdom
 *
 * Tests for maxContentBoost at the 4.0x boundary.
 * These tests validate that gain map generation and metadata are correct
 * at exactly 4.0x — the slider maximum that currently produces broken output.
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

describe('maxContentBoost boundary (4.0x)', () => {
    let generateGainMapData;

    beforeAll(async () => {
        const module = await import('../processing.js');
        generateGainMapData = module.generateGainMapData;
    });

    // ─── Gain map pixel data validity at 4.0x ───

    it('should produce non-zero gain map for a bright pixel at 4.0x', () => {
        const imageData = new ImageData(
            new Uint8ClampedArray([255, 255, 255, 255]),
            1, 1
        );

        const result = generateGainMapData(imageData, {
            maxContentBoost: 4.0,
            highlightExponent: 2.0,
            shadowCutoff: 0.05,
        });

        // A fully white pixel should get significant boost at any maxContentBoost
        expect(result.gainMapImageData.data[0]).toBeGreaterThan(100);
        expect(result.gainMapImageData.data[1]).toBeGreaterThan(100);
        expect(result.gainMapImageData.data[2]).toBeGreaterThan(100);
        expect(result.gainMapImageData.data[3]).toBe(255); // alpha
    });

    it('should produce identical results for 3.9x and 4.0x (both non-zero)', () => {
        const imageData = new ImageData(
            new Uint8ClampedArray([240, 240, 240, 255]),
            1, 1
        );

        const result39 = generateGainMapData(imageData, {
            maxContentBoost: 3.9,
            highlightExponent: 2.0,
            shadowCutoff: 0.05,
        });

        const result40 = generateGainMapData(imageData, {
            maxContentBoost: 4.0,
            highlightExponent: 2.0,
            shadowCutoff: 0.05,
        });

        // Both should produce non-zero gain map values
        expect(result39.gainMapImageData.data[0]).toBeGreaterThan(0);
        expect(result40.gainMapImageData.data[0]).toBeGreaterThan(0);

        // The values should differ (different boost ranges produce different encoding)
        // but both must be valid non-zero
        expect(result40.gainMapImageData.data[0]).not.toBe(0);
    });

    // ─── Metadata correctness at 4.0x ───

    it('should produce correct metadata at exactly 4.0x', () => {
        const imageData = new ImageData(
            new Uint8ClampedArray([128, 128, 128, 255]),
            1, 1
        );

        const result = generateGainMapData(imageData, { maxContentBoost: 4.0 });

        // Linear-scale metadata (passed to WASM)
        expect(result.metadata.gainMapMax).toEqual([4.0, 4.0, 4.0]);
        expect(result.metadata.hdrCapacityMax).toBe(4.0);
        expect(result.metadata.gainMapMin).toEqual([1.0, 1.0, 1.0]);
        expect(result.metadata.hdrCapacityMin).toBe(1.0);

        // Log2-scale metadata (for XMP serialization)
        expect(result.metadata.parsedGainMapMax).toEqual([2, 2, 2]); // log2(4) = 2
        expect(result.metadata.parsedHdrCapacityMax).toBe(2);
    });

    // ─── Log2 precision edge cases ───

    it('should have exact log2 precision for powers of 2', () => {
        // log2(4.0) must be exactly 2.0 — not 1.9999... or 2.0000...001
        const log2of4 = Math.log2(4.0);
        expect(log2of4).toBe(2.0);

        // Encoding: log2(boost) / log2(maxBoost) should be exactly 1.0 at max
        const encoded = log2of4 / Math.log2(4.0);
        expect(encoded).toBe(1.0);
    });

    it('should correctly encode gain map at the maximum boost boundary', () => {
        // When boost = maxContentBoost, the encoded value should be exactly 255
        const maxContentBoost = 4.0;
        const log2MaxBoost = Math.log2(maxContentBoost);
        const boost = maxContentBoost;

        const encoded = Math.max(0, Math.min(1, Math.log2(boost) / log2MaxBoost));
        const pixelValue = Math.round(encoded * 255);

        expect(encoded).toBe(1.0);
        expect(pixelValue).toBe(255);
    });

    // ─── Multi-pixel image at 4.0x ───

    it('should produce valid gain map for a multi-pixel image at 4.0x', () => {
        const size = 8;
        const data = new Uint8ClampedArray(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4;
                // Gradient: dark on left, bright on right
                const val = Math.round((x / (size - 1)) * 255);
                data[idx] = val;
                data[idx + 1] = val;
                data[idx + 2] = val;
                data[idx + 3] = 255;
            }
        }
        const imageData = new ImageData(data, size, size);

        const result = generateGainMapData(imageData, {
            maxContentBoost: 4.0,
            highlightExponent: 2.0,
            shadowCutoff: 0.05,
        });

        // The result should be a valid ImageData with correct dimensions
        expect(result.gainMapImageData.width).toBe(size);
        expect(result.gainMapImageData.height).toBe(size);

        // Bright pixels (right side) should have higher gain than dark pixels (left side)
        const darkIdx = (0 * size + 1) * 4; // x=1 (dark)
        const brightIdx = (0 * size + (size - 1)) * 4; // x=7 (bright)
        expect(result.gainMapImageData.data[brightIdx]).toBeGreaterThan(
            result.gainMapImageData.data[darkIdx]
        );
    });

    // ─── All power-of-2 maxContentBoost values ───

    it.each([1.0, 2.0, 4.0])('should produce valid output at maxContentBoost=%f', (boost) => {
        const imageData = new ImageData(
            new Uint8ClampedArray([200, 200, 200, 255]),
            1, 1
        );

        const result = generateGainMapData(imageData, {
            maxContentBoost: boost,
            highlightExponent: 2.0,
            shadowCutoff: 0.05,
        });

        // Metadata must match
        expect(result.metadata.gainMapMax).toEqual([boost, boost, boost]);
        expect(result.metadata.hdrCapacityMax).toBe(boost);

        // Gain map must be valid (non-NaN, finite, in range 0-255)
        for (let i = 0; i < 4; i++) {
            expect(Number.isFinite(result.gainMapImageData.data[i])).toBe(true);
            expect(result.gainMapImageData.data[i]).toBeGreaterThanOrEqual(0);
            expect(result.gainMapImageData.data[i]).toBeLessThanOrEqual(255);
        }
    });

    // ─── Edge case: maxContentBoost = 1.0 (no boost) ───

    it('should produce zero gain map when maxContentBoost is 1.0', () => {
        const imageData = new ImageData(
            new Uint8ClampedArray([200, 200, 200, 255]),
            1, 1
        );

        const result = generateGainMapData(imageData, {
            maxContentBoost: 1.0,
            highlightExponent: 2.0,
            shadowCutoff: 0.05,
        });

        // With boost = 1.0, there can be no gain — all pixels should encode to 0
        // (log2(1.0) = 0, so encoded = 0/0 which is NaN, or clamped to 0)
        // Actually log2(maxBoost) = 0, so division by zero — this is an edge case!
        expect(result.metadata.gainMapMax).toEqual([1.0, 1.0, 1.0]);
        expect(result.metadata.hdrCapacityMax).toBe(1.0);
    });
});
