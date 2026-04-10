// @ts-check
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';
import { extractExifApp1PayloadFromInput } from '../../src/lib/input-exif.js';
import { ensureRuntimeGateReady, getRuntimeGateFailure, installStartupRuntimeOverride } from './runtime-gate.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SDR_IMAGE = path.resolve(__dirname, '../../media/sdr_demo_image.jpg');
const SDR_IMAGE_2 = path.resolve(__dirname, '../../media/gain_map_demo_image.jpg');
const EXIF_RICH_IMAGE = path.resolve(__dirname, '../../media/exif_matrix.jpg');
const GAIN_MAP_JPEG = path.resolve(__dirname, '../../media/test_hdr_jpeg_gainmap.jpg');
const GAIN_MAP_HEIC = path.resolve(__dirname, '../../media/test_hdr_heif_gainmap.HEIC');
const HDR_INTENT_HIF = path.resolve(__dirname, '../../media/test_hdr_no_gain_map.HIF');
const UNROTATED_SDR_FIXTURES = [
    path.resolve(__dirname, '../../media/test_sdr.jpg'),
    path.resolve(__dirname, '../../media/test_sdr2.jpg'),
];
const EXIF_MATRIX_FIXTURES = [
    path.resolve(__dirname, '../../media/exif_matrix.jpg'),
    path.resolve(__dirname, '../../media/exif_matrix.png'),
    path.resolve(__dirname, '../../media/exif_matrix.heif'),
    path.resolve(__dirname, '../../media/exif_matrix.tiff')
];

// Timeouts for processing diagnostics. Give very generous buffers for slow CI.
const PROCESSING_TIMEOUT = 300_000;
const PROCESSING_STALL_TIMEOUT = 240_000;
const SLOW_BROWSER_PROCESSING_TIMEOUT = 600_000;
const SLOW_BROWSER_MATRIX_TIMEOUT = 1_800_000;
const POLL_INTERVAL = 250;
const PIPELINE_STATE_KEY = '__ultrahdrPipelineState';
const MOBILE_INFERENCE_ACKNOWLEDGEMENT =
    'I will also try Chrome on Windows or macOS';

/**
 * Helper: upload file(s) via the file input.
 * Works for both the initial DropZone input and the "Add Images" input.
 */
async function uploadFiles(page, filePaths, inputSelector = '#file-upload') {
    await page.waitForFunction(
        (preferredSelector) =>
            Boolean(document.querySelector(preferredSelector) || document.querySelector('#add-files')),
        inputSelector,
    );
    const targetSelector = await page.evaluate((preferredSelector) => {
        if (document.querySelector(preferredSelector)) return preferredSelector;
        if (document.querySelector('#add-files')) return '#add-files';
        return null;
    }, inputSelector);

    if (!targetSelector) {
        throw new Error(`No usable file input found (tried: ${inputSelector}, #add-files)`);
    }

    await page.locator(targetSelector).setInputFiles(filePaths);
}

/**
 * Helper: return current processing snapshot from the page.
 */
async function getProcessingSnapshot(page) {
    return await page.evaluate((stateKey) => {
        const error = document.querySelector('.error p');
        const resultCards = Array.from(document.querySelectorAll('.result-card'));
        const completedResults = resultCards.filter(
            (card) =>
                !card.classList.contains('pending') && !card.classList.contains('failed')
        ).length;
        const pendingResults = resultCards.filter((card) => card.classList.contains('pending')).length;
        const pipelineState = window[stateKey] || null;
        const mobileInferenceWarningOpen = Boolean(
            document.querySelector('[data-testid="mobile-inference-warning-dialog"]')
        );
        return {
            errorText: error ? error.textContent : null,
            completedResultCount: completedResults,
            pendingResultCount: pendingResults,
            mobileInferenceWarningOpen,
            pipelineState
        };
    }, PIPELINE_STATE_KEY);
}

async function acknowledgeMobileInferenceWarningIfVisible(page) {
    const dialog = page.getByTestId('mobile-inference-warning-dialog');
    if (!await dialog.count()) {
        return false;
    }
    if (!await dialog.first().isVisible().catch(() => false)) {
        return false;
    }

    await page.getByTestId('mobile-inference-warning-input').fill(
        MOBILE_INFERENCE_ACKNOWLEDGEMENT
    );
    await page.getByTestId('mobile-inference-warning-proceed').click();
    await expect(dialog).toHaveCount(0);
    return true;
}

async function clickAfterAcknowledgingInferenceWarning(page, locator) {
    try {
        await locator.click();
        return;
    } catch (error) {
        if (!await acknowledgeMobileInferenceWarningIfVisible(page)) {
            throw error;
        }
    }

    await locator.click();
}

/**
 * Helper: wait until processing is complete using pipeline progress state.
 */
async function waitForProcessing(page, expectedResults = 1, options = {}) {
    const {
        acknowledgeInferenceWarning = true,
        timeoutMs = PROCESSING_TIMEOUT,
        stallTimeoutMs = PROCESSING_STALL_TIMEOUT
    } = options;
    const startedAt = Date.now();
    let lastActivityAt = startedAt;
    let lastStage = 'unknown';

    while (Date.now() - startedAt < timeoutMs) {
        const snapshot = await getProcessingSnapshot(page);
        const pipeline = snapshot.pipelineState;

        if (acknowledgeInferenceWarning && snapshot.mobileInferenceWarningOpen) {
            await acknowledgeMobileInferenceWarningIfVisible(page);
            lastActivityAt = Date.now();
            continue;
        }

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

        if (
            snapshot.completedResultCount >= expectedResults &&
            snapshot.pendingResultCount === 0
        ) {
            await dismissWasmRecommendationIfVisible(page);
            return;
        }

        if (
            snapshot.pendingResultCount > 0 &&
            Date.now() - lastActivityAt > stallTimeoutMs
        ) {
            throw new Error(`Processing appears stalled at stage "${lastStage}"`);
        }

        await page.waitForTimeout(POLL_INTERVAL);
    }

    throw new Error(`Processing timed out after ${timeoutMs}ms (last stage: ${lastStage})`);
}

/**
 * Helper: wait for re-processing after a settings change.
 * processAll() clears results first, so we wait for results to disappear then reappear.
 */
async function waitForReprocessing(page, options = {}) {
    await dismissWasmRecommendationIfVisible(page);
    const prompt = page.getByTestId('stale-reprocess-prompt');
    if (await prompt.count()) {
        await prompt.getByRole('button', { name: /^Reprocess$/i }).click();
    } else {
        const fallback = page.getByRole('button', { name: /^Reprocess$/i });
        if (await fallback.count()) {
            await fallback.first().click();
        }
    }
    await dismissWasmRecommendationIfVisible(page);
    await waitForProcessing(page, 1, options);
}

async function dismissWasmRecommendationIfVisible(page) {
    const modal = page.getByTestId('wasm-recommendation-modal');
    if (await modal.count()) {
        if (await modal.first().isVisible().catch(() => false)) {
            await page.getByTestId('wasm-recommendation-dismiss').click();
            await expect(page.getByTestId('wasm-recommendation-modal')).toHaveCount(0);
        }
    }
}

async function setStripExifToggle(page, enabled) {
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('.switch-label'))
            .some((el) => el.textContent?.includes('Strip EXIF data'))
    );
    await page.evaluate((nextValue) => {
        const label = Array.from(document.querySelectorAll('.switch-label'))
            .find((el) => el.textContent?.includes('Strip EXIF data'));
        const container = label?.closest('.control-group.switch-group');
        const checkbox = container?.querySelector('input[type="checkbox"]');
        if (!checkbox) throw new Error('Strip EXIF toggle not found');
        checkbox.checked = nextValue;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }, enabled);
}

/**
 * Helper: download the first result and return its data as a Buffer.
 */
async function downloadFirstResult(page) {
    await dismissWasmRecommendationIfVisible(page);
    // Ensure at least one result is selected before export.
    const selectAll = page.getByRole('button', { name: /Select All/i });
    if (await selectAll.count()) {
        await selectAll.first().click();
    }
    await page.getByRole('button', { name: /^Export/i }).first().click();

    // Listen for the download event
    const downloadPromise = page.waitForEvent('download');

    // Click the download button
    await page.getByTestId('export-sheet').getByRole('button', { name: /^Download$/i }).click();

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
 * Helper: extract EXIF APP1 payload bytes (starts with "Exif\\0\\0") from JPEG.
 * Returns null when EXIF is not present or data is invalid.
 */
function extractExifSegmentBytes(buffer) {
    if (!buffer || buffer.length < 4) {
        return null;
    }

    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
        return null;
    }

    let offset = 2;
    while (offset + 4 <= buffer.length) {
        if (buffer[offset] !== 0xFF) {
            offset++;
            continue;
        }

        const marker = buffer[offset + 1];
        if (marker === 0xDA || marker === 0xD9) {
            break;
        }

        if (marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) {
            offset += 2;
            continue;
        }

        const segmentLength = (buffer[offset + 2] << 8) | buffer[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > buffer.length) {
            break;
        }

        const segmentEnd = offset + 2 + segmentLength;
        if (
            marker === 0xE1 &&
            offset + 10 <= buffer.length &&
            buffer[offset + 4] === 0x45 &&
            buffer[offset + 5] === 0x78 &&
            buffer[offset + 6] === 0x69 &&
            buffer[offset + 7] === 0x66 &&
            buffer[offset + 8] === 0x00 &&
            buffer[offset + 9] === 0x00
        ) {
            return buffer.subarray(offset + 4, segmentEnd);
        }

        offset = segmentEnd;
    }

    return null;
}

function writeTempJpeg(buffer, tempDir, name) {
    const outputPath = path.join(tempDir, name);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
}

function readExifTags(filePath) {
    const output = execFileSync(
        'exiftool',
        ['-G1', '-a', '-s', '-n', '-json', '-EXIF:all', filePath],
        { stdio: 'pipe' }
    ).toString('utf8');
    const parsed = JSON.parse(output);
    const tags = parsed[0] || {};
    delete tags.SourceFile;
    return tags;
}

function normalizeExifForComparison(tags) {
    const normalized = { ...tags };
    for (const key of Object.keys(normalized)) {
        if (key.endsWith(':Orientation')) {
            delete normalized[key];
        }
    }
    return normalized;
}

const TIFF_STRUCTURAL_EXIF_KEYS = new Set([
    'IFD0:ImageWidth',
    'IFD0:ImageHeight',
    'IFD0:BitsPerSample',
    'IFD0:Compression',
    'IFD0:PhotometricInterpretation',
    'IFD0:FillOrder',
    'IFD0:StripOffsets',
    'IFD0:SamplesPerPixel',
    'IFD0:RowsPerStrip',
    'IFD0:StripByteCounts',
    'IFD0:PlanarConfiguration',
    'IFD0:XPosition',
    'IFD0:YPosition',
    'IFD0:PageNumber',
    'IFD0:TileWidth',
    'IFD0:TileLength',
    'IFD0:TileOffsets',
    'IFD0:TileByteCounts',
    'IFD0:JPEGInterchangeFormat',
    'IFD0:JPEGInterchangeFormatLength',
    'IFD0:PreviewImage',
    'IFD0:PreviewImageStart',
    'IFD0:PreviewImageLength',
]);

function normalizeTiffExifForComparison(tags, { removeOrientation = false } = {}) {
    const normalized = {};
    for (const [key, value] of Object.entries(tags || {})) {
        if (TIFF_STRUCTURAL_EXIF_KEYS.has(key)) {
            continue;
        }
        if (removeOrientation && key.endsWith(':Orientation')) {
            continue;
        }
        normalized[key] = value;
    }
    return normalized;
}

function isJpegFixture(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.jpg' || ext === '.jpeg';
}

function isTiffFixture(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.tif' || ext === '.tiff';
}

function readExifOrientation(filePath) {
    const output = execFileSync(
        'exiftool',
        ['-n', '-s3', '-Orientation', filePath],
        { stdio: 'pipe' }
    ).toString('utf8').trim();
    const orientation = Number.parseInt(output, 10);
    if (!Number.isFinite(orientation)) {
        throw new Error(`Unable to parse Orientation value for ${filePath}: "${output}"`);
    }
    return orientation;
}

function readCanonicalSourceExifPayload(filePath) {
    const sourceBytes = new Uint8Array(fs.readFileSync(filePath));
    return extractExifApp1PayloadFromInput(sourceBytes, path.basename(filePath), '');
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

function extractHeicGainMapJpeg(heicPath, tempDir) {
    const primaryOut = path.join(tempDir, 'heic-primary.jpg');
    execFileSync('heif-convert', ['--quiet', '--with-aux', heicPath, primaryOut], { stdio: 'pipe' });

    const auxFile = fs.readdirSync(tempDir).find((name) =>
        name.toLowerCase().includes('hdrgainmap') && name.toLowerCase().endsWith('.jpg')
    );

    if (!auxFile) {
        throw new Error('Failed to extract HEIC auxiliary gain map JPEG');
    }

    return path.join(tempDir, auxFile);
}

function extractUltraHdrGainMapJpeg(ultraHdrPath, tempDir) {
    const gainMapOut = path.join(tempDir, 'output-gainmap.jpg');
    const bytes = execFileSync('exiftool', ['-b', '-MPImage2', ultraHdrPath], {
        stdio: 'pipe',
        // MPImage2 can be several MB; default Node execFileSync maxBuffer can overflow.
        maxBuffer: 64 * 1024 * 1024
    });
    if (!bytes || bytes.length === 0) {
        throw new Error('Failed to extract MPImage2 gain map from output UltraHDR JPEG');
    }
    fs.writeFileSync(gainMapOut, bytes);
    return gainMapOut;
}

async function loadBitmap(imagePath) {
    const image = await Jimp.read(fs.readFileSync(imagePath));
    const { data, width, height } = image.bitmap;

    return {
        width,
        height,
        data: new Uint8ClampedArray(data)
    };
}

function compareBitmapLuma(inputBitmap, outputBitmap) {
    if (inputBitmap.width !== outputBitmap.width || inputBitmap.height !== outputBitmap.height) {
        throw new Error(`Bitmap size mismatch: input=${inputBitmap.width}x${inputBitmap.height} output=${outputBitmap.width}x${outputBitmap.height}`);
    }

    const pixelCount = inputBitmap.width * inputBitmap.height;
    const diffHistogram = new Uint32Array(256);
    let sumAbs = 0;
    let sumSq = 0;

    for (let i = 0; i < pixelCount; i++) {
        const idx = i * 4;
        const inputLuma =
            (0.2126 * inputBitmap.data[idx]) +
            (0.7152 * inputBitmap.data[idx + 1]) +
            (0.0722 * inputBitmap.data[idx + 2]);
        const outputLuma =
            (0.2126 * outputBitmap.data[idx]) +
            (0.7152 * outputBitmap.data[idx + 1]) +
            (0.0722 * outputBitmap.data[idx + 2]);
        const absDiff = Math.abs(outputLuma - inputLuma);
        sumAbs += absDiff;
        sumSq += absDiff * absDiff;
        const bucket = Math.min(255, Math.round(absDiff));
        diffHistogram[bucket]++;
    }

    const mae = sumAbs / pixelCount;
    const rmse = Math.sqrt(sumSq / pixelCount);

    const p99Target = Math.ceil(pixelCount * 0.99);
    let cumulative = 0;
    let p99Abs = 0;
    for (let i = 0; i < diffHistogram.length; i++) {
        cumulative += diffHistogram[i];
        if (cumulative >= p99Target) {
            p99Abs = i;
            break;
        }
    }

    return {
        mae,
        rmse,
        p99Abs
    };
}

function computeGrayscaleStats(bitmap) {
    const pixelCount = bitmap.width * bitmap.height;
    let min = 255;
    let max = 0;
    let sum = 0;
    let sumSq = 0;

    for (let i = 0; i < pixelCount; i++) {
        const value = bitmap.data[i * 4];
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        sumSq += value * value;
    }

    const mean = sum / pixelCount;
    const variance = Math.max(0, (sumSq / pixelCount) - (mean * mean));
    const stdDev = Math.sqrt(variance);

    return {
        min,
        max,
        mean,
        stdDev,
        dynamicRange: max - min,
    };
}

function relativeDelta(a, b) {
    const denom = Math.max(1e-6, Math.abs(b));
    return Math.abs(a - b) / denom;
}

function extractHeicHeadroom(heicPath) {
    const xmpXml = execFileSync('exiftool', ['-a', '-b', '-XMP', heicPath], { stdio: 'pipe' }).toString('utf8');
    const match = xmpXml.match(/<HDRGainMap:HDRGainMapHeadroom>\s*([0-9.+\-eE]+)\s*<\/HDRGainMap:HDRGainMapHeadroom>/i)
        || xmpXml.match(/HDRGainMapHeadroom="([0-9.+\-eE]+)"/i);
    if (!match) {
        throw new Error('Failed to find HDRGainMapHeadroom in HEIC XMP metadata');
    }
    const headroom = Number.parseFloat(match[1]);
    if (!Number.isFinite(headroom) || headroom <= 0) {
        throw new Error(`Invalid HEIC HDRGainMapHeadroom value: ${match[1]}`);
    }
    return headroom;
}

function extractOutputHeadroom(ultraHdrPath, tempDir) {
    const gainMapPath = extractUltraHdrGainMapJpeg(ultraHdrPath, tempDir);
    const xmpXml = execFileSync('exiftool', ['-b', '-XMP', gainMapPath], { stdio: 'pipe' }).toString('utf8');
    const match = xmpXml.match(/hdrgm:HDRCapacityMax="([0-9.+\-eE]+)"/i);
    if (!match) {
        throw new Error('Failed to find hdrgm:HDRCapacityMax in output gain map XMP');
    }
    const hdrCapacityMaxLog2 = Number.parseFloat(match[1]);
    if (!Number.isFinite(hdrCapacityMaxLog2)) {
        throw new Error(`Invalid output hdrgm:HDRCapacityMax value: ${match[1]}`);
    }
    return Math.pow(2, hdrCapacityMaxLog2);
}

function expectedStartupRuntimePolicyForProject(projectName) {
    const enforceChromiumWebGpu = process.env.ULTRAHDR_EXPECT_CHROMIUM_WEBGPU === '1';
    if (projectName === 'chromium' && enforceChromiumWebGpu) {
        return { expectedProvider: 'webgpu' };
    }
    if (projectName === 'firefox') {
        return {
            expectedProviders: ['webgpu', 'webgl'],
            forbiddenProviders: ['wasm'],
        };
    }
    if (projectName === 'webkit') {
        return { expectedProvider: 'webgl' };
    }
    return {};
}

// ============================================================
// TEST SUITE
// ============================================================

test.describe('UltraHDR PWA E2E Tests', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }, testInfo) => {
        testInfo.setTimeout(Math.max(testInfo.timeout, 300_000));
        const failureReason = getRuntimeGateFailure(testInfo.project.name);
        test.skip(Boolean(failureReason), failureReason || '');
        await page.addInitScript((projectName) => {
            try {
                window.localStorage.removeItem('ultrahdr:backend-preference:v1');
                if (projectName === 'webkit') {
                    window.localStorage.setItem(
                        'ultrahdr:processing-preferences:v1',
                        JSON.stringify({
                            gmnetCheckpointingPreference: 'off',
                        }),
                    );
                } else {
                    window.localStorage.removeItem('ultrahdr:processing-preferences:v1');
                }
            } catch {
                // Ignore storage availability issues in automation.
            }
            window.__ULTRAHDR_BACKEND_PREFERENCE = 'auto';
            window.__ULTRAHDR_UNDER_TEST__ = true;
        }, testInfo.project.name);
        await installStartupRuntimeOverride(page, { projectName: testInfo.project.name });
        await page.goto('/');
        try {
            const runtimePolicy = expectedStartupRuntimePolicyForProject(testInfo.project.name);
            await ensureRuntimeGateReady(page, testInfo, {
                ...runtimePolicy,
            });
        } catch (error) {
            const message = String(error?.message || '');
            if (
                testInfo.project.name === 'webkit'
                && /cannot resolve operator 'GatherND'/i.test(message)
            ) {
                test.skip(
                    true,
                    'Playwright WebKit cannot initialize GMNet WebGL (GatherND v18 unsupported). Validate Safari via WebGPU-specific runs.',
                );
                return;
            }
            throw error;
        }
    });

    test.describe('Single Image Processing', () => {
        test('should process a single SDR image using the standard SDR path', async ({ page }) => {
            test.setTimeout(180_000);
            await page.goto('/');

            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(1);
            await expect(page.locator('.filename')).toContainText(path.parse(SDR_IMAGE).name);

            const jpegData = await downloadFirstResult(page);
            expect(jpegData[0]).toBe(0xFF);
            expect(jpegData[1]).toBe(0xD8);
            expect(hasGainMapXMP(jpegData)).toBe(true);
        });

        test('should process a single SDR image without exposing the removed Jpegli toggle', async ({ page }) => {
            test.setTimeout(180_000);
            await page.goto('/');

            const floatingGear = page.getByTestId('floating-gear');
            if (await floatingGear.count()) {
                await floatingGear.click();
            }
            await expect(
                page.locator('.switch-label').filter({ hasText: /High-(Quality|Efficiency) JPEG Encoding/ }),
            ).toHaveCount(0);
            const doneButton = page.getByRole('button', { name: /^Done$/i });
            if (await doneButton.count()) {
                await doneButton.click();
            }

            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(1);
            await expect(page.locator('.filename')).toContainText(path.parse(SDR_IMAGE).name);

            const jpegData = await downloadFirstResult(page);
            expect(jpegData[0]).toBe(0xFF);
            expect(jpegData[1]).toBe(0xD8);
            expect(hasGainMapXMP(jpegData)).toBe(true);
        });

        test.describe('fixture orientation regressions', () => {
            for (const fixturePath of UNROTATED_SDR_FIXTURES) {
                test(`should not unexpectedly rotate ${path.basename(fixturePath)} during default processing`, async ({ page }, testInfo) => {
                    const isWebKit = testInfo.project.name === 'webkit';
                    const processingTimeoutMs = isWebKit ? 600_000 : PROCESSING_TIMEOUT;
                    test.setTimeout(isWebKit ? 660_000 : 180_000);
                    const fixtureName = path.basename(fixturePath);
                    const tempDir = fs.mkdtempSync(
                        path.join(os.tmpdir(), `uhdr-unexpected-rotation-${testInfo.project.name}-`)
                    );

                    try {
                        await page.goto('/');
                        await uploadFiles(page, [fixturePath]);
                        await waitForProcessing(page, 1, { timeoutMs: processingTimeoutMs });

                        const result = await downloadFirstResult(page);
                        const outputPath = writeTempJpeg(result, tempDir, `${fixtureName}-output.jpg`);
                        const sourceBitmap = await loadBitmap(fixturePath);
                        const outputBitmap = await loadBitmap(outputPath);

                        expect(
                            {
                                width: outputBitmap.width,
                                height: outputBitmap.height,
                            },
                            `${fixtureName}: output dimensions should match source dimensions`,
                        ).toEqual({
                            width: sourceBitmap.width,
                            height: sourceBitmap.height,
                        });
                    } finally {
                        fs.rmSync(tempDir, { recursive: true, force: true });
                    }
                });
            }
        });

        test('should enforce explicit WebGL backend behavior across browsers', async ({ page, browserName }) => {
            const isFirefox = browserName === 'firefox';
            test.setTimeout(isFirefox ? 180_000 : 180_000);
            await page.addInitScript(() => {
                try {
                    window.localStorage.setItem('ultrahdr:backend-preference:v1', 'webgl');
                    window.localStorage.removeItem('ultrahdr:runtime-startup-cache:v1');
                } catch {
                    window.__ULTRAHDR_BACKEND_PREFERENCE = 'webgl';
                }
            });
            await page.goto('/');

            const expectedBackendPreference = browserName === 'firefox' ? 'webgl' : 'auto';
            await expect(page.getByTestId('backend-preference-select')).toHaveValue(expectedBackendPreference);
            if (isFirefox) {
                const storedBackendPreference = await page.evaluate(() =>
                    window.localStorage.getItem('ultrahdr:backend-preference:v1')
                );
                expect(storedBackendPreference).toBe('webgl');
                return;
            }
            await uploadFiles(page, [SDR_IMAGE]);

            await waitForProcessing(page, 1, {
                timeoutMs: PROCESSING_TIMEOUT,
                stallTimeoutMs: PROCESSING_STALL_TIMEOUT
            });
            await expect(page.locator('.result-card')).toHaveCount(1);
            const jpegData = await downloadFirstResult(page);
            expect(jpegData[0]).toBe(0xFF);
            expect(jpegData[1]).toBe(0xD8);
            expect(hasGainMapXMP(jpegData)).toBe(true);
        });

        test('should preserve full gain-map resolution for processed SDR inputs', async ({ page, browserName }) => {
            test.setTimeout(180_000);
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `uhdr-gm-scale-${browserName}-`));
            try {
                await page.goto('/');
                await uploadFiles(page, [SDR_IMAGE]);
                await waitForProcessing(page);

                const outputBuffer = await downloadFirstResult(page);
                const outputJpegPath = path.join(tempDir, 'output-ultrahdr.jpg');
                fs.writeFileSync(outputJpegPath, outputBuffer);

                const outputGainMapPath = extractUltraHdrGainMapJpeg(outputJpegPath, tempDir);
                const outputSdrBitmap = await loadBitmap(outputJpegPath);
                const outputGainMapBitmap = await loadBitmap(outputGainMapPath);

                expect(outputGainMapBitmap.width).toBe(outputSdrBitmap.width);
                expect(outputGainMapBitmap.height).toBe(outputSdrBitmap.height);

                const gainMapStats = computeGrayscaleStats(outputGainMapBitmap);
                expect(gainMapStats.dynamicRange).toBeGreaterThanOrEqual(2);
                expect(gainMapStats.stdDev).toBeGreaterThan(0.25);
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        test('shows the expected inference warning behavior during normal processing', async ({ page, browserName }) => {
            test.setTimeout(180_000);
            await page.goto('/');
            await uploadFiles(page, [SDR_IMAGE]);
            const warningDialog = page.getByTestId('mobile-inference-warning-dialog');

            if (browserName === 'chromium') {
                await waitForProcessing(page, 1, { acknowledgeInferenceWarning: false });
                await expect(warningDialog).toHaveCount(0);
                await expect(page.getByTestId('capability-restriction-banner')).toHaveCount(0);
                await page.getByRole('button', { name: /^Export/i }).first().click();
                await expect(page.getByTestId('export-capability-restriction')).toHaveCount(0);
                return;
            }

            await expect(warningDialog).toBeVisible();
            await acknowledgeMobileInferenceWarningIfVisible(page);
            await waitForProcessing(page, 1, { acknowledgeInferenceWarning: false });
            await expect(page.getByTestId('capability-restriction-banner')).toHaveCount(0);
            await page.getByRole('button', { name: /^Export/i }).first().click();
            await expect(page.getByTestId('export-capability-restriction')).toHaveCount(0);
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

        test('should pause after current file and resume remaining queue items', async ({ page, browserName }) => {
            test.skip(
                browserName === 'webkit' || browserName === 'firefox',
                'Queue pause/resume is only enforced on Chromium; non-Chromium runs are timing-flaky with the inference warning gate.',
            );
            test.setTimeout(180_000);
            await page.goto('/');

            await uploadFiles(page, [SDR_IMAGE, SDR_IMAGE_2]);
            await clickAfterAcknowledgingInferenceWarning(
                page,
                page.getByTestId('queue-smart-control'),
            );

            await expect(page.getByTestId('queue-smart-control')).toHaveText(/Resume/i, {
                timeout: PROCESSING_TIMEOUT
            });

            await clickAfterAcknowledgingInferenceWarning(
                page,
                page.getByTestId('queue-smart-control'),
            );
            await waitForProcessing(page, 2);
            await expect(page.locator('.result-card')).toHaveCount(2);
        });
    });

    test.describe('Slider Controls', () => {
        test('should change Max Content Boost slider and produce different output', async ({ page }, testInfo) => {
            test.setTimeout(240_000); // Re-processing + startup gate can be slow in CI.
            await page.goto('/');
            await ensureRuntimeGateReady(page, testInfo, {
                ...expectedStartupRuntimePolicyForProject(testInfo.project.name),
            });

            // Upload a smaller SDR image for faster re-processing
            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            // Download first result with default settings
            const defaultResult = await downloadFirstResult(page);

            // Change the boost slider to 4.0 (settings are visible alongside results)
            // This triggers handleSettingChange -> debounced processAll
            // Use evaluate because the slider may be scrolled out of viewport after download
            await page.evaluate(() => {
                const slider = document.querySelector('#boost');
                slider.value = '4.0';
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            });

            await waitForReprocessing(page);

            // Download the re-processed result
            const modifiedResult = await downloadFirstResult(page);

            // Both should be valid JPEGs
            expect(defaultResult[0]).toBe(0xFF);
            expect(modifiedResult[0]).toBe(0xFF);

            // Higher boost should produce a different encoded output.
            expect(Buffer.compare(defaultResult, modifiedResult)).not.toBe(0);
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

        test('should encode HDR-intent HIF input into UltraHDR JPEG', async ({ page }) => {
            await page.goto('/');
            await uploadFiles(page, [HDR_INTENT_HIF]);
            await waitForProcessing(page);

            const resultCards = page.locator('.result-card');
            await expect(resultCards).toHaveCount(1);
            await expect(page.locator('.filename')).toContainText('test_hdr_no_gain_map');

            const result = await downloadFirstResult(page);
            expect(result[0]).toBe(0xFF);
            expect(result[1]).toBe(0xD8);
            expect(hasGainMapXMP(result)).toBe(true);
        });

        test('should keep HEIC gain map bitmap close to source after processing', async ({ page, browserName }) => {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `uhdr-gm-compare-${browserName}-`));

            try {
                await page.goto('/');
                await uploadFiles(page, [GAIN_MAP_HEIC]);
                await waitForProcessing(page);

                const outputJpegData = await downloadFirstResult(page);
                const outputJpegPath = path.join(tempDir, 'output-ultrahdr.jpg');
                fs.writeFileSync(outputJpegPath, outputJpegData);

                const inputGainMapPath = extractHeicGainMapJpeg(GAIN_MAP_HEIC, tempDir);
                const outputGainMapPath = extractUltraHdrGainMapJpeg(outputJpegPath, tempDir);

                const inputBitmap = await loadBitmap(inputGainMapPath);
                const outputBitmap = await loadBitmap(outputGainMapPath);

                const comparison = compareBitmapLuma(inputBitmap, outputBitmap);
                console.log(
                    `[GainMapCompare:${browserName}] mae=${comparison.mae.toFixed(6)} rmse=${comparison.rmse.toFixed(6)} p99Abs=${comparison.p99Abs}`
                );

                expect(comparison.mae).toBeLessThan(1.0);
                expect(comparison.rmse).toBeLessThan(2.0);
                expect(comparison.p99Abs).toBeLessThanOrEqual(8);
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        test('should preserve HEIC gain map headroom metadata in output', async ({ page, browserName }) => {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `uhdr-gm-headroom-${browserName}-`));

            try {
                await page.goto('/');
                await uploadFiles(page, [GAIN_MAP_HEIC]);
                await waitForProcessing(page);

                const outputJpegData = await downloadFirstResult(page);
                const outputJpegPath = path.join(tempDir, 'output-ultrahdr.jpg');
                fs.writeFileSync(outputJpegPath, outputJpegData);

                const inputHeadroom = extractHeicHeadroom(GAIN_MAP_HEIC);
                const outputHeadroom = extractOutputHeadroom(outputJpegPath, tempDir);
                const headroomDelta = relativeDelta(outputHeadroom, inputHeadroom);

                console.log(`[GainMapHeadroom:${browserName}] input=${inputHeadroom.toFixed(6)} output=${outputHeadroom.toFixed(6)} delta=${headroomDelta.toFixed(6)}`);

                expect(headroomDelta).toBeLessThan(0.03);
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        test('should regenerate gain map when "Discard existing gain map(s)" is enabled', async ({ page, browserName }) => {
            const processingTimeoutMs = browserName === 'webkit' ? 600_000 : PROCESSING_TIMEOUT;
            test.setTimeout(browserName === 'webkit' ? 660_000 : 120_000); // Re-processing takes time
            await page.goto('/');

            // Upload gain map image with default settings (preserves existing gain map)
            await uploadFiles(page, [GAIN_MAP_JPEG]);
            await waitForProcessing(page, 1, { timeoutMs: processingTimeoutMs });
            const preservedResult = await downloadFirstResult(page);
            const preservedSize = preservedResult.length;

            // Now enable "Discard existing gain map(s)" toggle by label text.
            await page.evaluate(() => {
                const label = Array.from(document.querySelectorAll('.switch-label'))
                    .find((el) => el.textContent?.includes('Discard existing gain map(s)'));
                const container = label?.closest('.control-group.switch-group');
                const checkbox = container?.querySelector('input[type="checkbox"]');
                if (!checkbox) throw new Error('Discard gain map toggle not found');
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            });

            await waitForReprocessing(page, { timeoutMs: processingTimeoutMs });

            // Download the re-processed result
            const discardedResult = await downloadFirstResult(page);

            // Both should be valid JPEGs
            expect(preservedResult[0]).toBe(0xFF);
            expect(discardedResult[0]).toBe(0xFF);

            // The results should differ byte-by-byte (regenerated vs preserved gain map)
            expect(Buffer.compare(preservedResult, discardedResult)).not.toBe(0);
        });

        test('should preserve existing gain map when rotation is applied', async ({ page, browserName }) => {
            const processingTimeoutMs = browserName === 'webkit' ? 600_000 : PROCESSING_TIMEOUT;
            test.setTimeout(browserName === 'webkit' ? 660_000 : 120_000); // Re-processing takes time
            await page.goto('/');

            // Upload JPEG with existing gain map (default: no rotation, preserves gain map)
            await uploadFiles(page, [GAIN_MAP_JPEG]);
            await waitForProcessing(page, 1, { timeoutMs: processingTimeoutMs });
            const unrotatedResult = await downloadFirstResult(page);

            // Now apply 90° rotation via the "Rotate Right" button
            await page.click('button[title="Rotate Right"]');

            // Wait for re-processing to start (results clear) and finish
            await waitForReprocessing(page, { timeoutMs: processingTimeoutMs });

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
        test('should preserve EXIF metadata by default across all supported input formats', async ({ page, browserName }) => {
            test.skip(
                browserName === 'webkit',
                'Playwright WebKit stalls on the full EXIF-preservation matrix; Chromium and Firefox remain the enforced paths.',
            );
            test.setTimeout(600_000);
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `uhdr-exif-matrix-default-${browserName}-`));

            try {
                for (const fixturePath of EXIF_MATRIX_FIXTURES) {
                    const fixtureName = path.basename(fixturePath);
                    await page.goto('/');
                    await uploadFiles(page, [fixturePath]);
                    await waitForProcessing(page);

                    const result = await downloadFirstResult(page);
                    const outputExif = extractExifSegmentBytes(result);
                    expect(outputExif, `${fixtureName}: output is missing APP1 EXIF payload`).not.toBeNull();

                    if (isTiffFixture(fixturePath)) {
                        const outputPath = writeTempJpeg(result, tempDir, `${fixtureName}-default-output.jpg`);
                        const sourceTags = normalizeTiffExifForComparison(readExifTags(fixturePath));
                        const outputTags = normalizeTiffExifForComparison(readExifTags(outputPath));
                        expect(Object.keys(sourceTags).length, `${fixtureName}: source TIFF EXIF tags were empty`).toBeGreaterThan(0);
                        expect(outputTags).toEqual(sourceTags);
                        continue;
                    }

                    const sourceExif = isJpegFixture(fixturePath)
                        ? extractExifSegmentBytes(fs.readFileSync(fixturePath))
                        : readCanonicalSourceExifPayload(fixturePath);
                    expect(sourceExif, `${fixtureName}: source fixture is missing canonical EXIF payload`).not.toBeNull();
                    expect(Buffer.compare(outputExif, sourceExif)).toBe(0);
                }
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        test('should strip EXIF metadata across all supported input formats', async ({ page, browserName }) => {
            const processingTimeoutMs = browserName === 'firefox' || browserName === 'webkit'
                ? SLOW_BROWSER_PROCESSING_TIMEOUT
                : PROCESSING_TIMEOUT;
            test.setTimeout(browserName === 'firefox' || browserName === 'webkit' ? SLOW_BROWSER_MATRIX_TIMEOUT : 600_000);
            for (const fixturePath of EXIF_MATRIX_FIXTURES) {
                const fixtureName = path.basename(fixturePath);
                await page.goto('/');
                await uploadFiles(page, [fixturePath]);
                await waitForProcessing(page, 1, { timeoutMs: processingTimeoutMs });

                if (isTiffFixture(fixturePath)) {
                    const sourceTags = normalizeTiffExifForComparison(readExifTags(fixturePath));
                    expect(Object.keys(sourceTags).length, `${fixtureName}: source TIFF EXIF tags were empty`).toBeGreaterThan(0);
                } else {
                    const sourceExif = isJpegFixture(fixturePath)
                        ? extractExifSegmentBytes(fs.readFileSync(fixturePath))
                        : readCanonicalSourceExifPayload(fixturePath);
                    expect(sourceExif, `${fixtureName}: source fixture is missing canonical EXIF payload`).not.toBeNull();
                }

                await setStripExifToggle(page, true);
                await waitForReprocessing(page, { timeoutMs: processingTimeoutMs });

                const strippedResult = await downloadFirstResult(page);
                expect(extractExifSegmentBytes(strippedResult), `${fixtureName}: output still contains APP1 EXIF payload`).toBeNull();
                expect(hasExifData(strippedResult), `${fixtureName}: output still reports EXIF APP1 marker`).toBe(false);
            }
        });

        test('should normalize EXIF Orientation=1 when rotation is applied for all supported input formats', async ({ page, browserName }) => {
            const processingTimeoutMs = browserName === 'firefox' || browserName === 'webkit'
                ? SLOW_BROWSER_PROCESSING_TIMEOUT
                : PROCESSING_TIMEOUT;
            test.setTimeout(browserName === 'firefox' || browserName === 'webkit' ? SLOW_BROWSER_MATRIX_TIMEOUT : 600_000);
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `uhdr-exif-matrix-rotation-${browserName}-`));

            try {
                for (const fixturePath of EXIF_MATRIX_FIXTURES) {
                    const fixtureName = path.basename(fixturePath);
                    await page.goto('/');
                    await uploadFiles(page, [fixturePath]);
                    await waitForProcessing(page, 1, { timeoutMs: processingTimeoutMs });

                    await page.click('button[title="Rotate Right"]');
                    await waitForReprocessing(page, { timeoutMs: processingTimeoutMs });

                    const rotatedResult = await downloadFirstResult(page);
                    const outputPath = writeTempJpeg(rotatedResult, tempDir, `${fixtureName}-rotated-output.jpg`);
                    expect(readExifOrientation(outputPath), `${fixtureName}: rotated output orientation should be 1`).toBe(1);

                    if (isTiffFixture(fixturePath)) {
                        const sourceTags = normalizeTiffExifForComparison(readExifTags(fixturePath), { removeOrientation: true });
                        const outputTags = normalizeTiffExifForComparison(readExifTags(outputPath), { removeOrientation: true });
                        expect(outputTags).toEqual(sourceTags);
                        continue;
                    }

                    const sourceTags = normalizeExifForComparison(readExifTags(fixturePath));
                    const outputTags = normalizeExifForComparison(readExifTags(outputPath));
                    expect(outputTags).toEqual(sourceTags);
                }
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        });

        test('HEIC regression: default processing should preserve canonical EXIF payload', async ({ page }) => {
            await page.goto('/');
            const heicFixture = path.resolve(__dirname, '../../media/exif_matrix.heic');
            await uploadFiles(page, [heicFixture]);
            await waitForProcessing(page);

            const result = await downloadFirstResult(page);
            const outputExif = extractExifSegmentBytes(result);
            expect(outputExif, 'HEIC output is missing APP1 EXIF payload').not.toBeNull();

            const sourceExif = readCanonicalSourceExifPayload(heicFixture);
            expect(sourceExif, 'HEIC source fixture is missing canonical EXIF payload').not.toBeNull();

            expect(Buffer.compare(outputExif, sourceExif)).toBe(0);
        });

        test('should preserve all EXIF tags except orientation for a source with Orientation=6', async ({ page, browserName }) => {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `uhdr-exif-orientation6-${browserName}-`));

            try {
                const orientedInput = path.join(tempDir, 'input-orientation-6.jpg');
                fs.copyFileSync(EXIF_RICH_IMAGE, orientedInput);
                execFileSync(
                    'exiftool',
                    ['-overwrite_original', '-n', '-Orientation=6', orientedInput],
                    { stdio: 'pipe' }
                );
                expect(readExifOrientation(orientedInput)).toBe(6);

                await page.goto('/');
                await uploadFiles(page, [orientedInput]);
                await waitForProcessing(page);

                const result = await downloadFirstResult(page);
                const outputPath = writeTempJpeg(result, tempDir, 'output-orientation-normalized.jpg');

                expect(readExifOrientation(outputPath)).toBe(1);

                const sourceTags = normalizeExifForComparison(readExifTags(orientedInput));
                const outputTags = normalizeExifForComparison(readExifTags(outputPath));
                expect(outputTags).toEqual(sourceTags);
            } finally {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
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

        test('should fail loudly during startup when GMNet smoke asset cannot be loaded', async ({ browser }) => {
            test.skip(
                true,
                'The smoke-asset startup failure path is covered by unit tests; browser-level interception is not deterministic across Playwright engines.',
            );
            const context = await browser.newContext({ serviceWorkers: 'block' });
            const page = await context.newPage();

            await page.route('**/models/gmnet-smoke-128.png*', async (route) => {
                await route.abort('failed');
            });
            await page.goto('/ultrahdr-pwa-svelte/');
            const failureCard = page.getByTestId('runtime-init-failure');
            await expect(failureCard).toBeVisible({ timeout: 30_000 });
            await expect(
                failureCard.locator('p').filter({
                    hasText: /Error code:\s*RUNTIME_INIT_SMOKE_ASSET_FAILED/i,
                }),
            ).toBeVisible();
            await expect(page.getByTestId('upload-drop-zone')).toHaveCount(0);

            await context.close();
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
            await expect(page.locator('#boost')).toHaveValue('3');
            await expect(page.locator('#boost')).toHaveAttribute('min', /^(0|0\.0)$/);
            await expect(page.locator('#boost')).toHaveAttribute('max', /^(5|5\.0)$/);
            await expect(page.locator('#quality')).toBeVisible();
            await expect(page.getByLabel(/performance mode/i)).toHaveCount(0);

            // Verify toggle switches
            await expect(page.locator('.switch-label').filter({ hasText: 'Discard existing gain map(s)' })).toBeVisible();
            await expect(page.locator('.switch-label').filter({ hasText: 'Strip EXIF data' })).toBeVisible();

            // Verify rotation buttons
            await expect(page.locator('button:has-text("Left")')).toBeVisible();
            await expect(page.locator('button:has-text("Right")')).toBeVisible();

            // Verify action buttons
            await expect(page.locator('text=Add Images')).toBeVisible();
            await expect(page.getByRole('button', { name: /^Clear$/i })).toBeVisible();
            await expect(page.locator('text=Start Over')).toHaveCount(0);
            await expect(page.getByRole('button', { name: /Discard all/i })).toHaveCount(0);
            await expect(page.getByRole('button', { name: /Settings/i })).toHaveCount(0);
            await expect(page.getByRole('button', { name: /Start Over/i })).toHaveCount(0);
        });

        test('should display JPEG quality options', async ({ page }) => {
            await page.goto('/');
            await uploadFiles(page, [SDR_IMAGE]);
            await waitForProcessing(page);

            const qualitySelect = page.locator('#quality');

            // Verify quality options
            const options = qualitySelect.locator('option');
            await expect(options).toHaveCount(4);
            await expect(options.nth(0)).toHaveText('Lossless');
            await expect(options.nth(1)).toHaveText('High');
            await expect(options.nth(2)).toHaveText('Medium');
            await expect(options.nth(3)).toHaveText('Low');
        });
    });

    test.describe('Drop Zone', () => {
        test('should show drop zone on initial load', async ({ page }, testInfo) => {
            test.setTimeout(180_000);
            await page.goto('/');
            await ensureRuntimeGateReady(page, testInfo, {
                ...expectedStartupRuntimePolicyForProject(testInfo.project.name),
            });

            // Verify the drop zone is visible
            await expect(page.getByTestId('upload-drop-zone')).toBeVisible();
            await expect(
                page.getByText(/drag and drop images, or click to upload|tap to upload images/i),
            ).toBeVisible();
        });

        test('should show supported formats', async ({ page }, testInfo) => {
            test.setTimeout(180_000);
            await page.goto('/');
            await ensureRuntimeGateReady(page, testInfo, {
                ...expectedStartupRuntimePolicyForProject(testInfo.project.name),
            });

            await expect(page.getByText('Supports JPG, PNG, WebP, HEIC, HEIF, HIF, and TIFF')).toBeVisible();
        });
    });
});

test.describe('Runtime Startup Gate', () => {
    test('reaches runtime-ready without rendering probe-attempt rows', async ({ page, browserName }, testInfo) => {
        const failureReason = getRuntimeGateFailure(testInfo.project.name);
        test.skip(Boolean(failureReason), failureReason || '');
        test.setTimeout(240_000);
        await installStartupRuntimeOverride(page, {
            projectName: testInfo.project.name,
        });
        await page.addInitScript(() => {
            window.__ULTRAHDR_UNDER_TEST__ = true;
        });

        await page.goto('/');

        await expect(page.locator('[data-testid^=\"runtime-step-gmnet-smoke-run-attempt-\"]')).toHaveCount(0);
        try {
            await ensureRuntimeGateReady(page, testInfo, {
                ...expectedStartupRuntimePolicyForProject(testInfo.project.name),
            });
        } catch (error) {
            const message = String(error?.message || '');
            if (
                browserName === 'webkit'
                && /cannot resolve operator 'GatherND'/i.test(message)
            ) {
                test.skip(
                    true,
                    'Playwright WebKit cannot initialize GMNet WebGL (GatherND v18 unsupported). Validate Safari via WebGPU-specific runs.',
                );
                return;
            }
            throw error;
        }
    });
});
