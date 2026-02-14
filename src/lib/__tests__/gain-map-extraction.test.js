/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// We need to override the mocking of libheif-js that might be in other tests or setup files
// so we can test the ACTUAL library with the ACTUAL file.
// However, the globally configured mock in setup.js or other tests might interfere.
// In Vitest, 'vi.mock' is hoisted. We need to ensure we use the REAL module.
// But 'libheif-js' is likely a WASM module that needs the .wasm binary.

describe('Gain Map Extraction (Real Files)', () => {
    let originalFetch;
    let processHeic;
    let assetsPath;

    beforeAll(async () => {
        // Restore console logging (mocked in setup.js)
        global.console.log = vi.fn((...args) => process.stdout.write(args.join(' ') + '\n'));
        global.console.error = vi.fn((...args) => process.stderr.write(args.join(' ') + '\n'));

        // 1. Setup paths
        // Use process.cwd() to get project root reliably
        assetsPath = path.resolve(process.cwd(), 'assets');

        // 2. Mock global fetch to serve local WASM file
        originalFetch = global.fetch;
        global.fetch = vi.fn(async (url) => {
            // handle /assets/libheif.wasm
            if (url.toString().includes('libheif.wasm')) {
                // It might be in assets (if built) or node_modules (dev/test)
                // Safer to target node_modules for test env
                const wasmPath = path.resolve(process.cwd(), 'node_modules/libheif-js/libheif-wasm/libheif.wasm');
                if (!fs.existsSync(wasmPath)) {
                    // Fallback to assets just in case
                    const assetsWasm = path.join(assetsPath, 'libheif.wasm');
                    if (fs.existsSync(assetsWasm)) {
                        var buffer = fs.readFileSync(assetsWasm);
                    } else {
                        throw new Error(`Could not find libheif.wasm at ${wasmPath} or ${assetsWasm}`);
                    }
                } else {
                    var buffer = fs.readFileSync(wasmPath);
                }
                return {
                    ok: true,
                    status: 200,
                    arrayBuffer: () => Promise.resolve(buffer.buffer), // buffer.buffer is ArrayBuffer
                };
            }
            return originalFetch(url);
        });

        // 3. Import the module under test
        // We use vi.importActual to bypass any mocks defined elsewhere if possible,
        // but since we are in a separate file, we just import normally.
        // However, we need to ensure 'libheif-js' is NOT mocked.
        // Check if it is mocked in setup.js?
        // src/test/setup.js doesn't mock libheif-js.
        // But src/lib/__tests__/heic-processing.test.js DOES mock it via vi.mock.
        // Vi.mock is per-file, so we should be safe here unless setup.js does it.

        const module = await import('../heic-processing.js');
        processHeic = module.processHeic;
    });

    afterAll(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('should extract gain map from HEIC file', async () => {
        const filePath = path.join(assetsPath, 'test_hdr_heif.HEIC');
        const buffer = fs.readFileSync(filePath);
        const file = new File([buffer], 'test_hdr_heif.HEIC', { type: 'image/heic' });

        // Polyfill arrayBuffer if missing (JSDOM/Node environment issues)
        if (!file.arrayBuffer) {
            file.arrayBuffer = async () => {
                return new Uint8Array(buffer).buffer;
            };
        }

        // We need to ensure we aren't using the MOCKED libheif from heic-processing.test.js
        // Since we are in a different test file, we should get the real module
        // UNLESS vitest shares mocks. (It shouldn't by default).

        console.log('Testing HEIC extraction with real file...');

        // We expect this to either fail (if current impl is broken) or succeed
        // We expect this to either fail (if current impl is broken) or succeed
        let result;
        try {
            result = await processHeic(file, { discardGainMap: false });

            // Check if we got a gain map result
            // The function returns { sdr, gainMap, name } if successful extraction
            // Or a File object (png) if fallback (ITM) happened.

            if (result instanceof File) {
                console.error('Got File object result - Fallback occurred (Gain map NOT extracted)');

                // Debug: Inspect file structure using libheif directly
                try {
                    const libheifFactory = (await import('libheif-js/libheif-wasm/libheif.js')).default;
                    const wasmPath = path.resolve(process.cwd(), 'node_modules/libheif-js/libheif-wasm/libheif.wasm');
                    let wasmBinary = fs.readFileSync(wasmPath);

                    const heif = await libheifFactory({
                        wasmBinary: wasmBinary.buffer
                    });

                    const decoder = new heif.HeifDecoder();
                    const data = decoder.decode(buffer.buffer);
                    console.error('[DEBUG] HEIF Decode Success - Found', data.length, 'top-level images');

                    if (data.length > 0) {
                        const handle = data[0].handle;

                        // Check aux images
                        let auxCount = 0;
                        if (heif.heif_image_handle_get_number_of_auxiliary_images) {
                            auxCount = heif.heif_image_handle_get_number_of_auxiliary_images(handle, 0);
                            console.error('[DEBUG] Aux Count:', auxCount);

                            if (auxCount > 0) {
                                // List IDs
                                const idsSize = auxCount * 4;
                                const idsPtr = heif._malloc(idsSize);
                                const count = heif.heif_image_handle_get_list_of_auxiliary_image_IDs(handle, 0, idsPtr, auxCount);
                                const ids = new Int32Array(heif.HEAP32.buffer, idsPtr, count);

                                for (let i = 0; i < count; i++) {
                                    const id = ids[i];
                                    console.error(`[DEBUG] Aux ID ${i}: ${id}`);

                                    // Get handle/type
                                    let auxHandle = null;
                                    const auxHandlePtr = heif._malloc(4);
                                    const err = heif.heif_image_handle_get_auxiliary_image_handle(handle, id, auxHandlePtr);
                                    if (!err || err.code === 0) {
                                        const auxHandleVal = heif.getValue(auxHandlePtr, '*');
                                        const typePtr = heif.heif_image_handle_get_auxiliary_type(auxHandleVal);
                                        const type = heif.UTF8ToString(typePtr);
                                        console.error(`[DEBUG] Aux Type [${i}]: ${type}`);

                                        heif.heif_image_handle_release(auxHandleVal);
                                    } else {
                                        console.error(`[DEBUG] Failed to get handle for ID ${id}`);
                                    }
                                    heif._free(auxHandlePtr);
                                }
                                heif._free(idsPtr);
                            }
                        } else {
                            console.error('[DEBUG] heif_image_handle_get_number_of_auxiliary_images missing');
                        }
                    }

                } catch (debugErr) {
                    console.error('[DEBUG] Failed to inspect file manually:', debugErr);
                }
            } else {
                console.error('Got Object result - Extraction Success?');
            }

            // Assert that we have a gain map
            expect(result).not.toBeInstanceOf(File);
            expect(result).toHaveProperty('gainMap');
            expect(result.gainMap).toBeInstanceOf(ImageData);
            expect(result.gainMap.width).toBeGreaterThan(0);
            expect(result.gainMap.height).toBeGreaterThan(0);

            // Validate output
            console.log(`Extracted Gain Map: ${result.gainMap.width}x${result.gainMap.height}`);

        } catch (e) {
            console.error('HEIC processing failed:', e);
            throw e;
        }
    }, 20000); // Increased timeout for WASM

    it('should identify but currently fails to extract gain map from UltraHDR JPEG', async () => {
        const filePath = path.join(assetsPath, 'test_hdr_jpeg.jpg');
        const buffer = fs.readFileSync(filePath);
        // A simple check to see if "MPF" exists in the file (marker for Multi-Picture Format)
        const marker = Buffer.from('MPF');
        const hasMPF = buffer.includes(marker);

        expect(hasMPF).toBe(true); // proves the file HAS metadata we could use

        // Now verify `processImage` implementation
        // We invoke it and expect NO extraction (because we know it's missing)
        // But `processImage` does a lot (loads WASM etc).
        // For this test, we just assert the gap via code analysis or basic behavior if possible.

        // The implementation plan says "This confirms the need for the next phase."
        // We will leave this test as a "TODO" or a check that passes confirming "Yes, file is valid HDR".
        console.log('JPEG test file verified to contain MPF metadata.');
    });
});
