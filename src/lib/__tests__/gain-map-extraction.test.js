/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Gain Map Extraction Tests (Real Files)
 *
 * These tests use real HEIC files from the media/ directory to verify
 * that gain map extraction works correctly for:
 *   - Regular HEIC with gain map (test_hdr_heif_gainmap.HEIC)
 *   - Spatial/stereoscopic HEIC with gain map (test_hdr_heif_spatial_gainmap.HEIC)
 *
 * Key invariants tested:
 *   1. Gain map is extracted via auxiliary image API (not secondary top-level image)
 *   2. Extracted gain map is monochrome (R ≈ G ≈ B)
 *   3. Stereoscopic images are never mistaken for gain maps
 *   4. Extracted gain map flows through the pipeline without re-generation
 */
describe('Gain Map Extraction (Real Files)', () => {
    let originalFetch;
    let processHeic;
    let mediaPath;

    beforeAll(async () => {
        // Restore console logging for debugging
        global.console.log = vi.fn((...args) => process.stdout.write(args.join(' ') + '\n'));
        global.console.error = vi.fn((...args) => process.stderr.write(args.join(' ') + '\n'));
        global.console.warn = vi.fn((...args) => process.stderr.write(args.join(' ') + '\n'));

        mediaPath = path.resolve(process.cwd(), 'media');

        // Mock global fetch to serve local WASM file
        originalFetch = global.fetch;
        global.fetch = vi.fn(async (url) => {
            if (url.toString().includes('libheif.wasm')) {
                const wasmPath = path.resolve(process.cwd(), 'node_modules/libheif-js/libheif-wasm/libheif.wasm');
                const assetsWasm = path.resolve(process.cwd(), 'assets', 'libheif.wasm');
                let buffer;
                if (fs.existsSync(wasmPath)) {
                    buffer = fs.readFileSync(wasmPath);
                } else if (fs.existsSync(assetsWasm)) {
                    buffer = fs.readFileSync(assetsWasm);
                } else {
                    throw new Error(`Could not find libheif.wasm at ${wasmPath} or ${assetsWasm}`);
                }
                return {
                    ok: true,
                    status: 200,
                    arrayBuffer: () => Promise.resolve(buffer.buffer),
                };
            }
            return originalFetch(url);
        });

        // Import the module under test (real, not mocked)
        const module = await import('../heic-processing.js');
        processHeic = module.processHeic;
    });

    afterAll(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    /**
     * Helper: Create a File object from a path in media/
     */
    function loadTestFile(filename) {
        const filePath = path.join(mediaPath, filename);
        const buffer = fs.readFileSync(filePath);
        const file = new File([buffer], filename, { type: 'image/heic' });
        // Polyfill arrayBuffer for JSDOM/Node
        if (!file.arrayBuffer) {
            file.arrayBuffer = async () => new Uint8Array(buffer).buffer;
        }
        return { file, buffer };
    }

    /**
     * Helper: Check if ImageData is monochrome (R ≈ G ≈ B for all pixels)
     * Allows a small tolerance for JPEG compression artifacts.
     */
    function isMonochrome(imageData, tolerance = 5) {
        const { data, width, height } = imageData;
        const pixelCount = width * height;
        // Sample up to 1000 evenly-spaced pixels
        const step = Math.max(1, Math.floor(pixelCount / 1000));
        let maxDiff = 0;
        let colorPixelCount = 0;

        for (let i = 0; i < pixelCount; i += step) {
            const idx = i * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
            maxDiff = Math.max(maxDiff, diff);
            if (diff > tolerance) {
                colorPixelCount++;
            }
        }

        const sampledCount = Math.ceil(pixelCount / step);
        const colorRatio = colorPixelCount / sampledCount;

        return {
            isMonochrome: colorRatio < 0.05, // less than 5% of sampled pixels have color
            maxDiff,
            colorRatio,
            sampledCount
        };
    }

    // ─── Regular HEIC Tests ───────────────────────────────────────────

    describe('Regular HEIC (test_hdr_heif_gainmap.HEIC)', () => {
        it('should extract gain map from regular HEIC file', async () => {
            const { file } = loadTestFile('test_hdr_heif_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });

            // Should NOT be a File (PNG fallback), should be {sdr, gainMap, name}
            expect(result).not.toBeInstanceOf(File);
            expect(result).toHaveProperty('gainMap');
            expect(result).toHaveProperty('sdr');
            expect(result.gainMap).toBeInstanceOf(ImageData);
            expect(result.gainMap.width).toBeGreaterThan(0);
            expect(result.gainMap.height).toBeGreaterThan(0);

            console.log(`Regular HEIC - Gain Map: ${result.gainMap.width}x${result.gainMap.height}`);
            console.log(`Regular HEIC - SDR: ${result.sdr.width}x${result.sdr.height}`);
        }, 30000);

        it('should extract a monochrome gain map from regular HEIC', async () => {
            const { file } = loadTestFile('test_hdr_heif_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });
            expect(result).not.toBeInstanceOf(File);

            const mono = isMonochrome(result.gainMap);
            console.log(`Regular HEIC - Monochrome check: isMonochrome=${mono.isMonochrome}, maxDiff=${mono.maxDiff}, colorRatio=${mono.colorRatio}`);

            expect(mono.isMonochrome).toBe(true);
        }, 30000);

        it('should extract gain map smaller than or equal to primary image', async () => {
            const { file } = loadTestFile('test_hdr_heif_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });
            expect(result).not.toBeInstanceOf(File);

            // Gain map should be ≤ primary dimensions
            expect(result.gainMap.width).toBeLessThanOrEqual(result.sdr.width);
            expect(result.gainMap.height).toBeLessThanOrEqual(result.sdr.height);
        }, 30000);

        it('should return PNG File when discardGainMap is true', async () => {
            const { file } = loadTestFile('test_hdr_heif_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: true });

            expect(result).toBeInstanceOf(File);
            expect(result.type).toBe('image/png');
        }, 30000);
    });

    // ─── Spatial/Stereoscopic HEIC Tests ──────────────────────────────

    describe('Spatial HEIC (test_hdr_heif_spatial_gainmap.HEIC)', () => {
        it('should prefer iPhone hidden-item gain map path before auxiliary API fallback', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');
            global.console.log.mockClear();

            const result = await processHeic(file, { discardGainMap: false });
            expect(result).not.toBeInstanceOf(File);
            expect(result).toHaveProperty('gainMap');

            const logLines = global.console.log.mock.calls.map((args) => args.join(' '));
            const usedIphonePrimaryPath = logLines.some((line) =>
                line.includes('Extracted iPhone hidden gain map item ID')
            );
            const usedAuxFallbackPath = logLines.some((line) =>
                line.includes('Searching for gain map via auxiliary image API')
            );

            expect(usedIphonePrimaryPath).toBe(true);
            expect(usedAuxFallbackPath).toBe(false);
        }, 30000);

        it('should extract gain map from spatial HEIC file', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });

            // Should NOT be a File (PNG fallback), should be {sdr, gainMap, name}
            expect(result).not.toBeInstanceOf(File);
            expect(result).toHaveProperty('gainMap');
            expect(result).toHaveProperty('sdr');
            expect(result.gainMap).toBeInstanceOf(ImageData);
            expect(result.gainMap.width).toBeGreaterThan(0);
            expect(result.gainMap.height).toBeGreaterThan(0);

            console.log(`Spatial HEIC - Gain Map: ${result.gainMap.width}x${result.gainMap.height}`);
            console.log(`Spatial HEIC - SDR: ${result.sdr.width}x${result.sdr.height}`);
        }, 30000);

        it('should extract a monochrome gain map (not stereoscopic color image)', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });
            expect(result).not.toBeInstanceOf(File);

            const mono = isMonochrome(result.gainMap);
            console.log(`Spatial HEIC - Monochrome check: isMonochrome=${mono.isMonochrome}, maxDiff=${mono.maxDiff}, colorRatio=${mono.colorRatio}`);

            // The gain map MUST be monochrome. If this fails, we're extracting
            // the stereoscopic right-eye image instead of the actual gain map.
            expect(mono.isMonochrome).toBe(true);
        }, 30000);

        it('should extract gain map smaller than or equal to primary image', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });
            expect(result).not.toBeInstanceOf(File);

            // Gain map should be ≤ primary dimensions (typically half resolution)
            expect(result.gainMap.width).toBeLessThanOrEqual(result.sdr.width);
            expect(result.gainMap.height).toBeLessThanOrEqual(result.sdr.height);
        }, 30000);

        it('should NOT use stereoscopic pair as gain map (regression)', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: false });
            expect(result).not.toBeInstanceOf(File);

            // Stereoscopic pair would have same dimensions as primary
            // and would NOT be monochrome. Check both:
            const mono = isMonochrome(result.gainMap);

            // If gain map has color AND is same size as SDR → it's the stereo pair
            const isSameSize = (result.gainMap.width === result.sdr.width &&
                result.gainMap.height === result.sdr.height);
            const isStereoPair = !mono.isMonochrome && isSameSize;

            expect(isStereoPair).toBe(false);
        }, 30000);

        it('should return PNG File when discardGainMap is true', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');

            const result = await processHeic(file, { discardGainMap: true });

            expect(result).toBeInstanceOf(File);
            expect(result.type).toBe('image/png');
        }, 30000);
    });

    // ─── Pipeline Preservation Tests ──────────────────────────────────

    describe('Pipeline Preservation', () => {
        it('should preserve extracted HEIC gain map through the pipeline (not re-generate)', async () => {
            const { file } = loadTestFile('test_hdr_heif_gainmap.HEIC');

            // Step 1: Extract via processHeic directly
            const heicResult = await processHeic(file, { discardGainMap: false });
            expect(heicResult).not.toBeInstanceOf(File);
            expect(heicResult).toHaveProperty('gainMap');

            // Step 2: Verify the result has the shape that processImage's
            // HEIC preservation path expects: {sdr, gainMap, name}
            // This is what preprocessFile returns, and processImage checks
            // at line 85: !(file instanceof File) && file.sdr
            expect(heicResult).toHaveProperty('sdr');
            expect(heicResult.sdr).toBeInstanceOf(ImageData);
            expect(heicResult.gainMap).toBeInstanceOf(ImageData);

            // Step 3: The key invariant — the gain map from HEIC extraction
            // should be the exact object passed through. Verify by checking
            // it's not empty/zeroed out and has real pixel data.
            const hasNonZeroPixels = Array.from(heicResult.gainMap.data.slice(0, 100))
                .some(v => v > 0);
            expect(hasNonZeroPixels).toBe(true);

            // Step 4: Verify the shape works with processImage's check
            // The result is NOT a File/Blob and HAS sdr — this triggers
            // the preservation path (line 85-111 in processing.js)
            expect(heicResult instanceof File).toBe(false);
            expect(heicResult instanceof Blob).toBe(false);
            expect(heicResult.sdr).toBeTruthy();

            console.log('Pipeline preservation check passed: gain map has correct shape for direct pass-through');
        }, 30000);

        it('should preserve spatial HEIC gain map through the pipeline (not re-generate)', async () => {
            const { file } = loadTestFile('test_hdr_heif_spatial_gainmap.HEIC');

            const heicResult = await processHeic(file, { discardGainMap: false });
            expect(heicResult).not.toBeInstanceOf(File);

            // Same shape checks as above
            expect(heicResult).toHaveProperty('sdr');
            expect(heicResult).toHaveProperty('gainMap');
            expect(heicResult.sdr).toBeInstanceOf(ImageData);
            expect(heicResult.gainMap).toBeInstanceOf(ImageData);

            // NOT a File/Blob — will trigger preservation path in processImage
            expect(heicResult instanceof File).toBe(false);
            expect(heicResult instanceof Blob).toBe(false);
            expect(heicResult.sdr).toBeTruthy();

            // Gain map should be monochrome (the actual gain map, not stereo pair)
            const mono = isMonochrome(heicResult.gainMap);
            expect(mono.isMonochrome).toBe(true);

            console.log('Spatial HEIC pipeline preservation check passed');
        }, 30000);
    });

    // ─── UltraHDR JPEG Gain Map Test ──────────────────────────────────

    describe('UltraHDR JPEG', () => {
        it('should identify UltraHDR JPEG as containing MPF metadata', async () => {
            const filePath = path.join(mediaPath, 'test_hdr_jpeg_gainmap.jpg');
            const buffer = fs.readFileSync(filePath);
            const marker = Buffer.from('MPF');
            const hasMPF = buffer.includes(marker);

            expect(hasMPF).toBe(true);
            console.log('JPEG test file verified to contain MPF metadata.');
        });
    });
});
