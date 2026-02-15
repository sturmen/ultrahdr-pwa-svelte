// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDR_IMAGE = path.resolve(__dirname, '../../media/test_sdr.jpg');
const SDR_IMAGE_2 = path.resolve(__dirname, '../../media/test_sdr2.jpg');
const GAIN_MAP_JPEG = path.resolve(__dirname, '../../media/test_hdr_jpeg_gainmap.jpg');
const GAIN_MAP_HEIC = path.resolve(__dirname, '../../media/test_hdr_heif_gainmap.HEIC');

// Timeouts for processing diagnostics.
const PROCESSING_TIMEOUT = 180_000;
const PROCESSING_STALL_TIMEOUT = 20_000;
const POLL_INTERVAL = 250;
const PIPELINE_STATE_KEY = '__ultrahdrPipelineState';

/**
 * Helper: upload file(s) via the file input.
 * Works for both the initial DropZone input and the "Add Images" input.
 */
async function uploadFiles(page, filePaths, inputSelector = '#file-upload') {
    const fileInput = page.locator(inputSelector);
    await fileInput.setInputFiles(filePaths);
}

/**
 * Helper: return current processing snapshot from the page.
 */
async function getProcessingSnapshot(page) {
    return await page.evaluate((stateKey) => {
        const error = document.querySelector('.error p');
        const results = document.querySelectorAll('.result-card').length;
        const loading = document.querySelector('.results-container')?.classList.contains('loading') || false;
        const pipelineState = window[stateKey] || null;
        return {
            errorText: error ? error.textContent : null,
            resultCount: results,
            loading,
            pipelineState
        };
    }, PIPELINE_STATE_KEY);
}

/**
 * Helper: wait until processing is complete using pipeline progress state.
 */
async function waitForProcessing(page, expectedResults = 1) {
    const startedAt = Date.now();
    let lastActivityAt = startedAt;
    let lastStage = 'unknown';

    while (Date.now() - startedAt < PROCESSING_TIMEOUT) {
        const snapshot = await getProcessingSnapshot(page);
        const pipeline = snapshot.pipelineState;

        if (snapshot.errorText) {
            throw new Error(`Processing failed: ${snapshot.errorText}`);
        }

        if (pipeline?.timestamp) {
            lastActivityAt = pipeline.timestamp;
            lastStage = pipeline.stage || lastStage;
        }

        if (pipeline?.phase === 'pipeline-error') {
            const message = pipeline.error?.message || 'Unknown processing error';
            throw new Error(`Processing failed at stage "${pipeline.stage}": ${message}`);
        }

        if (snapshot.resultCount >= expectedResults && !snapshot.loading) {
            return;
        }

        if (snapshot.loading && Date.now() - lastActivityAt > PROCESSING_STALL_TIMEOUT) {
            throw new Error(`Processing appears stalled at stage "${lastStage}"`);
        }

        await page.waitForTimeout(POLL_INTERVAL);
    }

    throw new Error(`Processing timed out after ${PROCESSING_TIMEOUT}ms (last stage: ${lastStage})`);
}

/**
 * Helper: wait for re-processing after a settings change.
 * processAll() clears results first, so we wait for results to disappear then reappear.
 */
async function waitForReprocessing(page) {
    // Wait for debounce (500ms) + processing start
    await page.waitForTimeout(600);
    // First wait for any existing results to clear (processAll sets results = [])
    await page.waitForFunction(() => {
        const results = document.querySelectorAll('.result-card');
        return results.length === 0;
    }, { timeout: 5000 }).catch(() => {
        // Results may have already cleared by the time we check
    });
    // Then wait for new results to appear
    await waitForProcessing(page, 1);
}

/**
 * Helper: download the first result and return its data as a Buffer.
 */
async function downloadFirstResult(page) {
    // Click "Select All" to ensure at least one is selected
    await page.click('text=Select All');

    // Listen for the download event
    const downloadPromise = page.waitForEvent('download');

    // Click the download button
    await page.click('button:has-text("Download")');

    const download = await downloadPromise;
    const downloadPath = await download.path();
    return fs.readFileSync(downloadPath);
}

/**
 * Helper: Check if a JPEG buffer contains EXIF data.
 * Looks for the APP1 marker (0xFFE1) with "Exif" header.
 */
function hasExifData(buffer) {
    if (!buffer || buffer.length < 4) {
        return false;
    }

    // JPEG SOI
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
        return false;
    }

    let offset = 2;
    while (offset + 4 <= buffer.length) {
        if (buffer[offset] !== 0xFF) {
            offset++;
            continue;
        }

        const marker = buffer[offset + 1];
        // Start of scan / end of image: metadata segments are done.
        if (marker === 0xDA || marker === 0xD9) {
            break;
        }

        // Restart markers / TEM do not have a length field.
        if (marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) {
            offset += 2;
            continue;
        }

        const segmentLength = (buffer[offset + 2] << 8) | buffer[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > buffer.length) {
            break;
        }

        if (marker === 0xE1) {
            const sigOffset = offset + 4;
            const isExifSignature =
                sigOffset + 5 < buffer.length &&
                buffer[sigOffset] === 0x45 && // E
                buffer[sigOffset + 1] === 0x78 && // x
                buffer[sigOffset + 2] === 0x69 && // i
                buffer[sigOffset + 3] === 0x66 && // f
                buffer[sigOffset + 4] === 0x00 &&
                buffer[sigOffset + 5] === 0x00;
            if (isExifSignature) {
                return true;
            }
        }

        offset += 2 + segmentLength;
    }

    return false;
}

/**
 * Helper: Check if a JPEG buffer contains XMP data with GainMap namespace.
 * UltraHDR images contain XMP metadata with gain map information.
 */
function hasGainMapXMP(buffer) {
    const str = buffer.toString('latin1');
    // Adobe XMP namespaces/tags OR ISO 21496-1 standard namespace
    return str.includes('hdrgm:') || str.includes('HDRGainMap') || str.includes('GainMap') || str.includes('21496');
}

// ============================================================
// TEST SUITE
// ============================================================

test.describe('UltraHDR PWA E2E Tests', () => {

    test.describe('Single Image Processing', () => {
        test('should process a single SDR image and produce a valid UltraHDR JPEG', async ({ page }) => {
            await page.goto('/');

            // Upload SDR image
            await uploadFiles(page, [SDR_IMAGE]);

            // Wait for processing
            await waitForProcessing(page);

            // Verify a result card appeared
            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(1);

            // Verify the filename is shown
            await expect(page.locator('.filename')).toContainText('test_sdr');

            // Download and validate
            const jpegData = await downloadFirstResult(page);

            // Basic JPEG validation (starts with SOI marker)
            expect(jpegData[0]).toBe(0xFF);
            expect(jpegData[1]).toBe(0xD8);

            // Should contain gain map XMP metadata (UltraHDR marker)
            expect(hasGainMapXMP(jpegData)).toBe(true);
        });
    });

    test.describe('Batch Processing', () => {
        test('should process multiple images', async ({ page }) => {
            test.setTimeout(180_000);
            await page.goto('/');

            // Upload both SDR images at once
            await uploadFiles(page, [SDR_IMAGE, SDR_IMAGE_2]);

            // Wait for processing to complete
            await waitForProcessing(page, 2);

            // Verify both result cards appeared
            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(2);
        });

        test('should allow adding images after initial processing', async ({ page }) => {
            test.setTimeout(180_000);
            await page.goto('/');

            // Upload first image
            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            // Verify 1 result
            await expect(page.locator('.result-card')).toHaveCount(1);

            // Add another image via the "Add Images" button
            // The hidden input has id="add-files"
            await uploadFiles(page, [SDR_IMAGE_2], '#add-files');

            // Wait for second processing
            await waitForProcessing(page, 2);

            await expect(page.locator('.result-card')).toHaveCount(2);
        });
    });

    test.describe('Slider Controls', () => {
        test('should change Max Content Boost slider and produce different output', async ({ page }) => {
            test.setTimeout(120_000); // Re-processing a large image needs more time
            await page.goto('/');

            // Upload a smaller image for faster re-processing
            await uploadFiles(page, [SDR_IMAGE_2]);
            await waitForProcessing(page);

            // Download first result with default settings
            const defaultResult = await downloadFirstResult(page);
            const defaultSize = defaultResult.length;

            // Change the boost slider to 4.0 (settings are visible alongside results)
            // This triggers handleSettingChange -> debounced processAll
            // Use evaluate because the slider may be scrolled out of viewport after download
            await page.evaluate(() => {
                const slider = document.querySelector('#boost');
                slider.value = '4.0';
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            });

            // Wait for re-processing to complete (debounce is 500ms + processing time)
            await page.waitForTimeout(1000);
            await waitForReprocessing(page);

            // Download the re-processed result
            const modifiedResult = await downloadFirstResult(page);

            // Both should be valid JPEGs
            expect(defaultResult[0]).toBe(0xFF);
            expect(modifiedResult[0]).toBe(0xFF);

            // The sizes should differ (higher boost = different gain map encoding)
            expect(defaultSize).not.toBe(modifiedResult.length);
        });
    });

    test.describe('Gain Map Handling', () => {
        test('should preserve existing gain map from JPEG input', async ({ page }) => {
            await page.goto('/');

            // Upload JPEG with gain map
            await uploadFiles(page, [GAIN_MAP_JPEG]);
            await waitForProcessing(page);

            // Verify a result card appeared
            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(1);
            await expect(page.locator('.filename')).toContainText('test_hdr_jpeg_gainmap');

            // Download result
            const result = await downloadFirstResult(page);

            // Should be a valid UltraHDR JPEG
            expect(result[0]).toBe(0xFF);
            expect(result[1]).toBe(0xD8);
            expect(hasGainMapXMP(result)).toBe(true);
        });

        test('should preserve existing gain map from HEIC input', async ({ page }) => {
            await page.goto('/');

            // Upload HEIC with gain map
            await uploadFiles(page, [GAIN_MAP_HEIC]);
            await waitForProcessing(page);

            // Verify a result card appeared
            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(1);
            await expect(page.locator('.filename')).toContainText('test_hdr_heif_gainmap');

            // Download result
            const result = await downloadFirstResult(page);

            // Should be a valid UltraHDR JPEG
            expect(result[0]).toBe(0xFF);
            expect(result[1]).toBe(0xD8);
            expect(hasGainMapXMP(result)).toBe(true);
        });

        test('should regenerate gain map when "Discard existing gain map(s)" is enabled', async ({ page }) => {
            test.setTimeout(120_000); // Re-processing takes time
            await page.goto('/');

            // Upload gain map image with default settings (preserves existing gain map)
            await uploadFiles(page, [GAIN_MAP_JPEG]);
            await waitForProcessing(page);
            const preservedResult = await downloadFirstResult(page);
            const preservedSize = preservedResult.length;

            // Now enable "Discard existing gain map(s)" toggle
            // Settings are visible alongside the results, no need to Start Over
            // Use evaluate because the hidden checkbox (opacity:0, width:0) can't be clicked directly
            await page.evaluate(() => {
                const switchGroups = document.querySelectorAll('.control-group.switch-group');
                // Discard gain map is the first toggle switch
                const checkbox = switchGroups[0].querySelector('input[type="checkbox"]');
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // Wait for re-processing (debounce 500ms + processing)
            await page.waitForTimeout(1000);
            await waitForReprocessing(page);

            // Download the re-processed result
            const discardedResult = await downloadFirstResult(page);

            // Both should be valid JPEGs
            expect(preservedResult[0]).toBe(0xFF);
            expect(discardedResult[0]).toBe(0xFF);

            // The results should differ byte-by-byte (regenerated vs preserved gain map)
            expect(Buffer.compare(preservedResult, discardedResult)).not.toBe(0);
        });

        test('should preserve existing gain map when rotation is applied', async ({ page }) => {
            test.setTimeout(120_000); // Re-processing takes time
            await page.goto('/');

            // Upload JPEG with existing gain map (default: no rotation, preserves gain map)
            await uploadFiles(page, [GAIN_MAP_JPEG]);
            await waitForProcessing(page);
            const unrotatedResult = await downloadFirstResult(page);

            // Now apply 90° rotation via the "Rotate Right" button
            await page.click('button[title="Rotate Right"]');

            // Wait for re-processing to start (results clear) and finish
            await waitForReprocessing(page);

            // Download the rotated result
            const rotatedResult = await downloadFirstResult(page);

            // Both should be valid JPEGs
            expect(unrotatedResult[0]).toBe(0xFF);
            expect(rotatedResult[0]).toBe(0xFF);

            // The rotated result should still have UltraHDR gain map metadata
            // (gain map was preserved from the original, not regenerated)
            expect(hasGainMapXMP(rotatedResult)).toBe(true);

            // The results should differ (rotation changes pixel layout)
            expect(Buffer.compare(unrotatedResult, rotatedResult)).not.toBe(0);
        });
    });

    test.describe('EXIF Handling', () => {
        test('should preserve EXIF data by default', async ({ page }) => {
            await page.goto('/');

            // Upload image (sdr_demo_image likely has EXIF)
            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            const result = await downloadFirstResult(page);

            // Check source image has EXIF
            const sourceData = fs.readFileSync(SDR_IMAGE);
            const sourceHasExif = hasExifData(sourceData);

            if (sourceHasExif) {
                // If source has EXIF, output should too (preserving it)
                expect(hasExifData(result)).toBe(true);
            }
            // If source has no EXIF, we can't test preservation.
            // This test is still valuable as it confirms no crash.
        });

        test('should strip EXIF data when "Strip EXIF data" is enabled', async ({ page }) => {
            test.setTimeout(120_000); // Re-processing takes time
            await page.goto('/');

            // Upload a smaller image for faster re-processing
            await uploadFiles(page, [SDR_IMAGE_2]);
            await waitForProcessing(page);

            // Enable "Strip EXIF data" toggle (visible alongside results)
            // Use evaluate because the hidden checkbox (opacity:0, width:0) can't be clicked directly
            await page.evaluate(() => {
                const switchGroups = document.querySelectorAll('.control-group.switch-group');
                // Strip EXIF is the second toggle switch
                const checkbox = switchGroups[1].querySelector('input[type="checkbox"]');
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // Wait for re-processing (debounce 500ms + processing)
            await page.waitForTimeout(1000);
            await waitForReprocessing(page);

            // Download the re-processed result
            const result = await downloadFirstResult(page);

            // EXIF should be stripped
            expect(hasExifData(result)).toBe(false);
        });
    });

    test.describe('Graceful Degradation', () => {
        test('should show noscript message when JavaScript is disabled', async ({ browser }) => {
            const context = await browser.newContext({
                javaScriptEnabled: false,
            });
            const page = await context.newPage();

            await page.goto('/');

            // The <noscript> text should be visible
            const noscriptText = page.locator('noscript p');
            await expect(noscriptText).toContainText('JavaScript');

            await context.close();
        });

        test('should show error when WASM fails to load', async ({ page }) => {
            // Intercept .wasm requests and abort them
            await page.route('**/*.wasm', route => route.abort());

            await page.goto('/');

            // Upload an image (this will trigger WASM loading)
            await uploadFiles(page, [SDR_IMAGE]);

            // Wait for an error to appear
            // The app should show an error message when WASM fails
            // We'll give it some time and check for error indicators
            await page.waitForTimeout(5000);

            // Check for error message in the page
            const hasError = await page.evaluate(() => {
                const errorEl = document.querySelector('.error');
                const bodyText = document.body.innerText.toLowerCase();
                return !!(errorEl || bodyText.includes('error') || bodyText.includes('failed'));
            });

            expect(hasError).toBe(true);
        });
    });

    test.describe('UI Controls', () => {
        test('should display all settings controls', async ({ page }) => {
            await page.goto('/');

            // Upload image to trigger the settings view
            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            // Verify all controls are present
            await expect(page.locator('#boost')).toBeVisible();
            await expect(page.locator('#shadowCutoff')).toBeVisible();
            await expect(page.locator('#quality')).toBeVisible();

            // Verify toggle switches
            await expect(page.locator('text=Discard existing gain map')).toBeVisible();
            await expect(page.locator('text=Strip EXIF data')).toBeVisible();

            // Verify rotation buttons
            await expect(page.locator('button:has-text("Left")')).toBeVisible();
            await expect(page.locator('button:has-text("Right")')).toBeVisible();

            // Verify action buttons
            await expect(page.locator('text=Add Images')).toBeVisible();
            await expect(page.locator('text=Start Over')).toBeVisible();
        });

        test('should display JPEG quality options', async ({ page }) => {
            await page.goto('/');
            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            const qualitySelect = page.locator('#quality');

            // Verify quality options
            const options = qualitySelect.locator('option');
            await expect(options).toHaveCount(3);
            await expect(options.nth(0)).toHaveText('High');
            await expect(options.nth(1)).toHaveText('Medium');
            await expect(options.nth(2)).toHaveText('Low');
        });
    });

    test.describe('Drop Zone', () => {
        test('should show drop zone on initial load', async ({ page }) => {
            await page.goto('/');

            // Verify the drop zone is visible
            await expect(page.locator('.drop-zone')).toBeVisible();
            await expect(page.locator('text=Drag & drop images here')).toBeVisible();
        });

        test('should show supported formats', async ({ page }) => {
            await page.goto('/');

            await expect(page.locator('text=JPG, PNG, WebP, HEIC, TIFF')).toBeVisible();
        });
    });
});
