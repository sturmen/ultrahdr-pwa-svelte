import { processHeic } from './heic-processing.js';
import { createPipelineTelemetry } from './pipeline-telemetry.js';
import { processTiff } from './tiff-processing.js';
import { UHDREncoder, UHDRDecoder, isWasmLoaded, isAvailable, getStatus, isUhdrImage } from './ultrahdr-wasm.js';
import {
    insertExifSegment,
    stripExifSegments,
    normalizeExifOrientationTo1
} from './exif-utils.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;
const DEFAULT_BRIGHTNESS_INTENT = 'conservative';
const SHADOW_CUTOFF_DEPRECATION_KEY = 'processing.shadowCutoff.deprecated';
const GAIN_MAP_GAMMA_LINEAR = 1.0;
const GAIN_MAP_OFFSET_SDR_LINEAR = 0.0;

const DEFAULT_PROCESS_OPTIONS = {
    maxContentBoost: DEFAULT_MAX_CONTENT_BOOST,
    rotation: 0,
    quality: 0.95,
    discardGainMap: false,
    stripExif: false,
    highlightExponent: 2.0,
    brightnessIntent: DEFAULT_BRIGHTNESS_INTENT,
    safeMode: false,
    maxOutputMegapixels: null,
    gainMapScale: 0.5,
    abortSignal: null
};

function getDeprecationWarningStore() {
    if (!globalThis.__ultrahdrDeprecationWarnings) {
        globalThis.__ultrahdrDeprecationWarnings = new Set();
    }
    return globalThis.__ultrahdrDeprecationWarnings;
}

function warnDeprecationOnce(key, message) {
    const warningStore = getDeprecationWarningStore();
    if (warningStore.has(key)) {
        return;
    }
    warningStore.add(key);
    console.warn(`${key}: ${message}`);
}

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

function smoothstep(edge0, edge1, x) {
    if (edge0 === edge1) {
        return x >= edge1 ? 1 : 0;
    }
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

function estimatePercentiles(values, percentiles, bins = 256) {
    if (!values?.length) {
        return percentiles.map(() => 0);
    }

    const histogram = new Uint32Array(bins);
    const maxBinIndex = bins - 1;
    for (let i = 0; i < values.length; i++) {
        const v = clamp01(values[i]);
        const bin = Math.min(maxBinIndex, Math.floor(v * maxBinIndex));
        histogram[bin]++;
    }

    const targets = percentiles.map((p) => Math.floor((values.length - 1) * clamp01(p)));
    const results = new Array(percentiles.length).fill(0);
    let cumulative = 0;
    let targetIndex = 0;

    for (let bin = 0; bin < bins && targetIndex < targets.length; bin++) {
        cumulative += histogram[bin];
        while (targetIndex < targets.length && cumulative > targets[targetIndex]) {
            results[targetIndex] = bin / maxBinIndex;
            targetIndex++;
        }
    }

    while (targetIndex < targets.length) {
        results[targetIndex] = 1;
        targetIndex++;
    }

    return results;
}


function createAbortError() {
    if (typeof DOMException !== 'undefined') {
        return new DOMException('Operation aborted', 'AbortError');
    }
    const error = new Error('Operation aborted');
    error.name = 'AbortError';
    return error;
}

export function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw createAbortError();
    }
}

export function getConstrainedDimensions(width, height, maxMegapixels) {
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    const maxMp = Number(maxMegapixels);

    if (!Number.isFinite(maxMp) || maxMp <= 0) {
        return { width: w, height: h, changed: false };
    }

    const currentPixels = w * h;
    const maxPixels = maxMp * 1_000_000;
    if (currentPixels <= maxPixels) {
        return { width: w, height: h, changed: false };
    }

    const scale = Math.sqrt(maxPixels / currentPixels);
    let constrainedWidth = Math.max(1, Math.floor(w * scale));
    let constrainedHeight = Math.max(1, Math.floor(h * scale));

    // Ensure we're under the max pixel budget after integer rounding.
    while (constrainedWidth * constrainedHeight > maxPixels) {
        if (constrainedWidth >= constrainedHeight && constrainedWidth > 1) {
            constrainedWidth--;
        } else if (constrainedHeight > 1) {
            constrainedHeight--;
        } else {
            break;
        }
    }

    return {
        width: constrainedWidth,
        height: constrainedHeight,
        changed: constrainedWidth !== w || constrainedHeight !== h
    };
}

/**
 * Check if WASM encoder is available
 * @returns {Promise<boolean>}
 */
export async function isWasmAvailable() {
    return await isAvailable();
}

/**
 * Get WASM encoder status
 * @returns {Object}
 */
export function getWasmStatus() {
    return getStatus();
}

/**
 * Ensure WASM encoder is loaded
 * @returns {Promise<void>}
 */
async function ensureWasmLoaded() {
    if (!isWasmLoaded()) {
        console.log('[WASM] Loading libultrahdr WASM module...');
        await isAvailable();
    }
    if (!isWasmLoaded()) {
        throw new Error('libultrahdr WASM module failed to load');
    }
    console.log('[WASM] libultrahdr WASM module loaded');
}

function buildGainMapMetadata(maxContentBoost) {
    const safeMaxContentBoost = Number.isFinite(maxContentBoost) && maxContentBoost > 0
        ? maxContentBoost
        : DEFAULT_MAX_CONTENT_BOOST;
    const normalizedMaxContentBoost = Math.max(1.0, safeMaxContentBoost);
    const log2MaxBoost = Math.log2(normalizedMaxContentBoost);
    const gamma = GAIN_MAP_GAMMA_LINEAR;
    const offsetSdr = GAIN_MAP_OFFSET_SDR_LINEAR;

    return {
        gainMapMin: [1.0, 1.0, 1.0],
        gainMapMax: [normalizedMaxContentBoost, normalizedMaxContentBoost, normalizedMaxContentBoost],
        gamma: [gamma, gamma, gamma],
        offsetSdr: [offsetSdr, offsetSdr, offsetSdr],
        offsetHdr: [0, 0, 0],
        hdrCapacityMin: 1.0,
        hdrCapacityMax: normalizedMaxContentBoost,
        parsedGainMapMin: [0, 0, 0],
        parsedGainMapMax: [log2MaxBoost, log2MaxBoost, log2MaxBoost],
        parsedGamma: [gamma, gamma, gamma],
        parsedOffsetSdr: [offsetSdr, offsetSdr, offsetSdr],
        parsedOffsetHdr: [0, 0, 0],
        parsedHdrCapacityMin: 0,
        parsedHdrCapacityMax: log2MaxBoost
    };
}

/**
 * Processes an image file to create an UltraHDR JPEG.
 * @param {File} file - The input image file.
 * @param {Object} options - Processing options.
 * @param {number} options.maxContentBoost - Max content boost for gain map.
 * @param {number} options.rotation - Rotation in degrees.
 * @param {number} options.quality - JPEG quality (0-1).
 * @param {boolean} options.discardGainMap - Whether to discard existing gain map and regenerate.
 * @param {boolean} options.stripExif - Whether to strip EXIF data.
 * @param {number} options.highlightExponent - Exponent for highlight boost curve.
 * @param {"conservative" | "balanced" | "vibrant"} [options.brightnessIntent] - Brightness profile.
 * @param {number} [options.shadowCutoff] - Deprecated (accepted as no-op for compatibility).
 * @param {(event: Object) => void} [options.onProgress] - Optional telemetry callback.
 * @param {number} [options.fileIndex] - Optional file index in current batch.
 * @param {number} [options.totalFiles] - Optional total files in current batch.
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = DEFAULT_PROCESS_OPTIONS) {
    const mergedOptions = { ...DEFAULT_PROCESS_OPTIONS, ...(options || {}) };
    console.log('[Process] Starting processing for:', file.name);
    throwIfAborted(mergedOptions.abortSignal);
    const sourceInputFile = file;
    let sourceInputBytes = null;

    const telemetry = createPipelineTelemetry({
        fileName: file.name,
        fileSize: file.size,
        fileIndex: mergedOptions.fileIndex,
        totalFiles: mergedOptions.totalFiles,
        onProgress: mergedOptions.onProgress
    });

    try {
        await telemetry.runStage('wasm-load', async () => {
            throwIfAborted(mergedOptions.abortSignal);
            await ensureWasmLoaded();
        });

        const sourceExifBytes = await telemetry.runStage('extract-source-exif', async () => {
            if (mergedOptions.stripExif || !(sourceInputFile instanceof Blob)) {
                return null;
            }
            sourceInputBytes = await blobToUint8Array(sourceInputFile);
            return extractExifApp1PayloadFromInput(
                sourceInputBytes,
                sourceInputFile.name || '',
                sourceInputFile.type || ''
            );
        });

        file = await telemetry.runStage('preprocess-file', async () => {
            throwIfAborted(mergedOptions.abortSignal);
            return preprocessFile(file, mergedOptions);
        });

        // Check if JPEG already has a gain map (UltraHDR)
        // When discardGainMap is false, preserve the original gain map.
        if (!mergedOptions.discardGainMap && file instanceof File) {
            try {
                const fileBuffer = await telemetry.runStage('read-source-buffer', async () =>
                    sourceInputBytes && file === sourceInputFile
                        ? sourceInputBytes
                        : new Uint8Array(await file.arrayBuffer())
                );
                throwIfAborted(mergedOptions.abortSignal);

                const isUhdr = await telemetry.runStage('detect-ultrahdr', async () => isUhdrImage(fileBuffer));
                if (isUhdr) {
                    if (mergedOptions.rotation === 0) {
                        console.log('[Process] Input is already UltraHDR JPEG — preserving existing gain map');
                        const blob = await telemetry.runStage('finalize-preserved', async () =>
                            finalizeUltraHDR({}, fileBuffer, new Uint8Array(0), mergedOptions.stripExif)
                        );
                        telemetry.complete({ outputBytes: blob.size, mode: 'preserve' });
                        return blob;
                    }

                    console.log('[Process] UltraHDR JPEG with rotation — extracting and rotating gain map');
                    const blob = await telemetry.runStage('rotate-preserved-ultrahdr', async () =>
                        processUhdrWithRotation(file, fileBuffer, mergedOptions, telemetry, sourceExifBytes)
                    );
                    telemetry.complete({ outputBytes: blob.size, mode: 'preserve-with-rotation' });
                    return blob;
                }
            } catch (e) {
                console.warn('[Process] UltraHDR detection/preservation failed, proceeding with normal processing:', e);
                telemetry.emit('preservation-fallback', {
                    stage: 'detect-ultrahdr',
                    warning: String(e?.message || e)
                });
            }
        }

        // If file is an object with raw data from HEIC preservation, handle it.
        if (!(file instanceof File) && !(file instanceof Blob) && file.sdr) {
            console.log('[Process] Using pre-decoded components (likely HEIC with native gain map)');
            let imageData = file.sdr;
            let gainMapImageData = file.gainMap;
            // Preserve source gain-map metadata when provided by the preprocessor.
            // This avoids re-scaling preserved gain maps based on UI maxContentBoost.
            const metadata = file.gainMapMetadata
                || (Number.isFinite(file.gainMapHeadroom) && file.gainMapHeadroom > 0
                    ? buildGainMapMetadata(file.gainMapHeadroom)
                    : buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST));

            if (mergedOptions.safeMode) {
                const constrainedDimensions = getConstrainedDimensions(
                    imageData.width,
                    imageData.height,
                    mergedOptions.maxOutputMegapixels
                );
                if (constrainedDimensions.changed) {
                    imageData = await telemetry.runStage('safe-mode-resize-sdr', async () =>
                        resizeImageData(imageData, constrainedDimensions.width, constrainedDimensions.height)
                    );
                }

                const constrainedGainDimensions = getPreservedGainMapConstrainedDimensions(
                    gainMapImageData,
                    imageData
                );
                if (constrainedGainDimensions.changed) {
                    gainMapImageData = await telemetry.runStage('safe-mode-clamp-preserved-gain-map', async () =>
                        resizeImageData(
                            gainMapImageData,
                            constrainedGainDimensions.width,
                            constrainedGainDimensions.height
                        )
                    );
                }
            }

            const { sdr, gainMap } = await telemetry.runStage('compress-components', async () =>
                compressImages(imageData, gainMapImageData, mergedOptions, metadata, telemetry, sourceExifBytes)
            );
            const blob = await telemetry.runStage('finalize-output', async () =>
                finalizeUltraHDR(metadata, sdr, gainMap, mergedOptions.stripExif)
            );

            telemetry.complete({ outputBytes: blob.size, mode: 'pre-decoded-components' });
            return blob;
        }

        // Load Data
        const dataUrl = await telemetry.runStage('read-input-data-url', async () => readFileAsDataURL(file));
        console.log('[Process] File loaded and EXIF extraction complete');
        throwIfAborted(mergedOptions.abortSignal);

        // Load image pixels
        const { imageData } = await telemetry.runStage('decode-image-data', async () => loadImageData(dataUrl));
        let workingImageData = imageData;
        console.log('[Process] Image data retrieved');

        if (mergedOptions.safeMode) {
            const constrainedDimensions = getConstrainedDimensions(
                workingImageData.width,
                workingImageData.height,
                mergedOptions.maxOutputMegapixels
            );
            if (constrainedDimensions.changed) {
                workingImageData = await telemetry.runStage('safe-mode-resize-sdr', async () =>
                    resizeImageData(
                        workingImageData,
                        constrainedDimensions.width,
                        constrainedDimensions.height
                    )
                );
            }
        }

        let gainMapSourceImageData = workingImageData;
        const constrainedGainDimensions = getGainMapConstrainedDimensions(
            gainMapSourceImageData,
            mergedOptions.gainMapScale
        );
        if (constrainedGainDimensions.changed) {
            gainMapSourceImageData = await telemetry.runStage('safe-mode-resize-gain-map', async () =>
                resizeImageData(
                    gainMapSourceImageData,
                    constrainedGainDimensions.width,
                    constrainedGainDimensions.height
                )
            );
        }

        throwIfAborted(mergedOptions.abortSignal);

        // Generate gain map data
        const { gainMapImageData, metadata } = await telemetry.runStage('generate-gain-map', async () =>
            generateGainMapData(gainMapSourceImageData, {
                ...mergedOptions,
                onStageProgress: (stageProgress, note) => {
                    telemetry.emitStageProgress('generate-gain-map', stageProgress, { note });
                }
            })
        );
        console.log('[Process] GainMap generated manually');
        throwIfAborted(mergedOptions.abortSignal);

        // Compress and encode to UltraHDR
        const { sdr, gainMap } = await telemetry.runStage('compress-components', async () =>
            compressImages(workingImageData, gainMapImageData, mergedOptions, metadata, telemetry, sourceExifBytes)
        );
        console.log('[Process] Compression complete');

        // Finalize UltraHDR
        const blob = await telemetry.runStage('finalize-output', async () =>
            finalizeUltraHDR(metadata, sdr, gainMap, mergedOptions.stripExif)
        );
        console.log('[Process] Processing complete, returning Blob');

        telemetry.complete({ outputBytes: blob.size, mode: 'generated' });
        return blob;
    } catch (error) {
        telemetry.fail(error);
        throw error;
    }
}

/**
 * Process an UltraHDR JPEG with rotation, preserving the original gain map.
 * Extracts compressed base/gain-map components and re-encodes once with the
 * encoder's built-in rotation effect and original gain-map metadata.
 * @param {File} file - The input file
 * @param {Uint8Array} fileBuffer - The raw file bytes
 * @param {Object} options - Processing options (rotation, quality, stripExif)
 * @returns {Promise<Blob>} - The rotated UltraHDR JPEG
 */
async function processUhdrWithRotation(file, fileBuffer, options, telemetry = null, sourceExifBytes = null) {
    const decoder = new UHDRDecoder();
    if (telemetry) {
        await telemetry.runStage('rotation-init-decoder', async () => decoder.init());
    } else {
        await decoder.init();
    }

    try {
        // 1. Probe the UltraHDR JPEG and extract original compressed components.
        // This preserves source quality by avoiding decode/re-encode before final output.
        if (telemetry) {
            await telemetry.runStage('rotation-probe-source', async () => {
                decoder.setImage(fileBuffer);
                decoder.probe();
            });
        } else {
            decoder.setImage(fileBuffer);
            decoder.probe();
        }

        const baseJpegBytes = telemetry
            ? await telemetry.runStage('rotation-extract-base', async () => decoder.getBaseImage())
            : decoder.getBaseImage();
        const gainMapJpegBytes = telemetry
            ? await telemetry.runStage('rotation-extract-gain-map', async () => decoder.getGainMapImage())
            : decoder.getGainMapImage();
        const gainMapMetadata = telemetry
            ? await telemetry.runStage('rotation-extract-metadata', async () => decoder.getGainMapMetadata())
            : decoder.getGainMapMetadata();
        console.log('[Process] Extracted compressed components. Base:', baseJpegBytes.length, 'GainMap:', gainMapJpegBytes.length);

        const quality = options.quality !== undefined ? options.quality : 0.95;
        const rotation = ((options.rotation || 0) % 360 + 360) % 360;
        const exifBytes = options.stripExif ? null : sourceExifBytes;

        // Effects on compressed inputs are not supported by libultrahdr. Decode both
        // compressed components to ImageData, rotate in JS, then re-encode with the
        // original gain-map metadata.
        const baseImageData = telemetry
            ? await telemetry.runStage('rotation-decode-base-image', async () => jpegBytesToImageData(baseJpegBytes))
            : await jpegBytesToImageData(baseJpegBytes);
        const gainMapImageData = telemetry
            ? await telemetry.runStage('rotation-decode-gain-map-image', async () => jpegBytesToImageData(gainMapJpegBytes))
            : await jpegBytesToImageData(gainMapJpegBytes);

        const { sdr, gainMap } = telemetry
            ? await telemetry.runStage('rotation-reencode-components', async () =>
                compressImages(
                    baseImageData,
                    gainMapImageData,
                    { ...options, quality, rotation },
                    gainMapMetadata,
                    telemetry,
                    exifBytes
                )
            )
            : await compressImages(
                baseImageData,
                gainMapImageData,
                { ...options, quality, rotation },
                gainMapMetadata,
                null,
                exifBytes
            );

        // 3. Finalize (handle EXIF)
        return await finalizeUltraHDR({}, sdr, gainMap, options.stripExif);
    } finally {
        decoder.destroy();
    }
}

/**
 * Preprocesses the file, converting HEIC/TIFF to a format we can read if necessary.
 * @param {File} file 
 * @param {Object} options 
 * @returns {Promise<File>}
 */
async function preprocessFile(file, options) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.heic') || name.endsWith('.heif')) {
        console.log('[Process] Detected HEIC/HEIF, converting...');
        try {
            const converted = await processHeic(file, options);
            if (converted) {
                console.log('[Process] Converted HEIC to:', converted.type);
                return converted;
            }
        } catch (e) {
            console.error('[Process] HEIC conversion failed:', e);
            throw e;
        }
    } else if (name.endsWith('.tif') || name.endsWith('.tiff')) {
        console.log('[Process] Detected TIFF, converting...');
        try {
            const converted = await processTiff(file);
            if (converted) {
                console.log('[Process] Converted TIFF to:', converted.type);
                return converted;
            }
        } catch (e) {
            console.error('[Process] TIFF conversion failed:', e);
            throw e;
        }
    }
    return file;
}

/**
 * Loads image data from a Data URL.
 * @param {string} dataUrl 
 * @returns {Promise<{imageData: ImageData, width: number, height: number}>}
 */
async function loadImageData(dataUrl) {
    const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
    });

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    let width = img.width;
    let height = img.height;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Cleanup
    canvas.width = 1;
    canvas.height = 1;
    canvas = null;
    ctx = null;

    return { imageData, width: canvas?.width || width, height: canvas?.height || height };
}

async function resizeImageData(imageData, targetWidth, targetHeight) {
    if (!imageData || targetWidth <= 0 || targetHeight <= 0) {
        throw new Error('Invalid resize arguments');
    }

    if (imageData.width === targetWidth && imageData.height === targetHeight) {
        return imageData;
    }

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = imageData.width;
    sourceCanvas.height = imageData.height;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) {
        throw new Error('Failed to create source canvas context for resize');
    }
    sourceCtx.putImageData(imageData, 0, 0);

    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = targetWidth;
    targetCanvas.height = targetHeight;
    const targetCtx = targetCanvas.getContext('2d');
    if (!targetCtx) {
        throw new Error('Failed to create target canvas context for resize');
    }

    targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    const resized = targetCtx.getImageData(0, 0, targetWidth, targetHeight);

    sourceCanvas.width = 1;
    sourceCanvas.height = 1;
    targetCanvas.width = 1;
    targetCanvas.height = 1;

    return resized;
}

function getGainMapConstrainedDimensions(imageData, gainMapScale) {
    const normalizedScale = Number(gainMapScale);
    if (!Number.isFinite(normalizedScale) || normalizedScale <= 0 || normalizedScale >= 1) {
        return {
            width: imageData.width,
            height: imageData.height,
            changed: false
        };
    }

    const width = Math.max(1, Math.floor(imageData.width * normalizedScale));
    const height = Math.max(1, Math.floor(imageData.height * normalizedScale));
    return {
        width,
        height,
        changed: width !== imageData.width || height !== imageData.height
    };
}

function getPreservedGainMapConstrainedDimensions(gainMapImageData, sdrImageData) {
    const width = Math.min(gainMapImageData.width, sdrImageData.width);
    const height = Math.min(gainMapImageData.height, sdrImageData.height);
    return {
        width,
        height,
        changed: width !== gainMapImageData.width || height !== gainMapImageData.height
    };
}

/**
 * Computes a box-filtered (mean) version of a Float32Array image channel.
 * Uses integral image for O(N) performance regardless of radius.
 * @param {Float32Array} src - Source single-channel data (width * height)
 * @param {number} w - Image width
 * @param {number} h - Image height
 * @param {number} r - Kernel radius
 * @returns {Float32Array} Filtered output
 */
function boxFilter(src, w, h, r) {
    const radius = Math.max(0, Math.floor(Number(r) || 0));
    if (radius === 0) {
        return src.slice();
    }

    const temp = new Float32Array(w * h);
    const out = new Float32Array(w * h);

    // Horizontal pass with running window sum.
    for (let y = 0; y < h; y++) {
        const rowOff = y * w;
        const initialEnd = Math.min(w - 1, radius);
        let sum = 0;

        for (let x = 0; x <= initialEnd; x++) {
            sum += src[rowOff + x];
        }
        temp[rowOff] = sum / (initialEnd + 1);

        for (let x = 1; x < w; x++) {
            const addX = x + radius;
            const subX = x - radius - 1;
            if (addX < w) {
                sum += src[rowOff + addX];
            }
            if (subX >= 0) {
                sum -= src[rowOff + subX];
            }

            const x0 = Math.max(0, x - radius);
            const x1 = Math.min(w - 1, x + radius);
            temp[rowOff + x] = sum / (x1 - x0 + 1);
        }
    }

    // Vertical pass with running window sum.
    for (let x = 0; x < w; x++) {
        const initialEnd = Math.min(h - 1, radius);
        let sum = 0;

        for (let y = 0; y <= initialEnd; y++) {
            sum += temp[y * w + x];
        }
        out[x] = sum / (initialEnd + 1);

        for (let y = 1; y < h; y++) {
            const addY = y + radius;
            const subY = y - radius - 1;
            if (addY < h) {
                sum += temp[addY * w + x];
            }
            if (subY >= 0) {
                sum -= temp[subY * w + x];
            }

            const y0 = Math.max(0, y - radius);
            const y1 = Math.min(h - 1, y + radius);
            out[y * w + x] = sum / (y1 - y0 + 1);
        }
    }

    return out;
}

/**
 * Guided filter (He et al. 2013) — edge-preserving smoothing with O(N) complexity.
 * Uses the input luminance as both the guide and the filtering target.
 * @param {Float32Array} I - Guide/input image (single channel, width*height)
 * @param {number} w - Image width
 * @param {number} h - Image height
 * @param {number} r - Window radius
 * @param {number} eps - Regularization parameter (controls edge sensitivity)
 * @returns {Float32Array} Edge-preserving smoothed output
 */
function guidedFilter(I, w, h, r, eps) {
    const n = w * h;

    // Step 1: Compute local means and correlations via box filter
    const meanI = boxFilter(I, w, h, r);

    // I*I element-wise
    const II = new Float32Array(n);
    for (let i = 0; i < n; i++) II[i] = I[i] * I[i];
    const meanII = boxFilter(II, w, h, r);

    // Step 2: Compute local variance and linear coefficients
    // Since guide == input (self-guided): var_I = meanII - meanI^2
    // a = var_I / (var_I + eps)
    // b = meanI * (1 - a)
    const a = new Float32Array(n);
    const b = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const varI = meanII[i] - meanI[i] * meanI[i];
        a[i] = varI / (varI + eps);
        b[i] = meanI[i] * (1 - a[i]);
    }

    // Step 3: Average a and b over the window
    const meanA = boxFilter(a, w, h, r);
    const meanB = boxFilter(b, w, h, r);

    // Step 4: Output = meanA * I + meanB
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        out[i] = meanA[i] * I[i] + meanB[i];
    }
    return out;
}

/**
 * Stephen Hill ACES RRT+ODT fit (scalar form for luminance).
 * Reference implementation: BakingLab/ACES.hlsl.
 * @param {number} x - Scene-linear luminance
 * @returns {number}
 */
function acesHillForward(x) {
    const a = x * (x + 0.0245786) - 0.000090537;
    const b = x * (0.983729 * x + 0.4329510) + 0.238081;
    return a / b;
}

function acesHillForwardDerivative(x) {
    const a = x * (x + 0.0245786) - 0.000090537;
    const b = x * (0.983729 * x + 0.4329510) + 0.238081;
    const aPrime = 2.0 * x + 0.0245786;
    const bPrime = 1.967458 * x + 0.4329510;
    return (aPrime * b - a * bPrime) / (b * b);
}

function acesHillInverse(y, maxIter = 8) {
    if (y <= 0) return 0;
    if (y >= 1) return 20.0;

    let x = y / Math.max(1e-6, 1 - y);
    x = Math.max(0, Math.min(20, x));

    for (let i = 0; i < maxIter; i++) {
        const fx = acesHillForward(x) - y;
        const fpx = acesHillForwardDerivative(x);
        if (!Number.isFinite(fpx) || Math.abs(fpx) < 1e-10) break;
        const step = fx / fpx;
        x -= step;
        x = Math.max(0, Math.min(20, x));
        if (Math.abs(step) < 1e-8) break;
    }
    return Math.max(0, x);
}

/**
 * Generates gain-map data using a deterministic reverse-tonemapping pipeline.
 *
 * This implementation is v2-only and applies:
 *  - Clip-aware highlight emphasis
 *  - Two-scale edge-aware local adaptation
 *  - Conservative APL/midtone guardrails
 *  - Continuous low-luma regularization (no hard shadow cutoff)
 *
 * @param {ImageData} imageData - The SDR image data.
 * @param {Object} [options]
 * @param {number} [options.maxContentBoost=2.3] - Maximum HDR boost factor.
 * @param {number} [options.highlightExponent=2.0] - Controls highlight expansion aggressiveness.
 * @param {"conservative" | "balanced" | "vibrant"} [options.brightnessIntent="conservative"] - Brightness profile.
 * @param {number} [options.shadowCutoff] - Deprecated (accepted as no-op).
 * @param {number} [options.localAdaptationStrength=0.5] - Blend between global (0) and local (1) adaptation.
 * @param {(progress: number, note?: string) => void} [options.onStageProgress] - Optional granular progress callback.
 * @returns {{gainMapImageData: ImageData, metadata: Object}}
 */
export function generateGainMapData(imageData, options = {}) {
    throwIfAborted(options?.abortSignal);
    const rgba = imageData.data;
    const length = rgba.length;
    const width = imageData.width;
    const height = imageData.height;
    const pixelCount = width * height;

    const brightnessIntent = ['conservative', 'balanced', 'vibrant'].includes(options.brightnessIntent)
        ? options.brightnessIntent
        : DEFAULT_BRIGHTNESS_INTENT;

    if (Object.prototype.hasOwnProperty.call(options, 'shadowCutoff')) {
        warnDeprecationOnce(
            SHADOW_CUTOFF_DEPRECATION_KEY,
            'shadowCutoff is deprecated and ignored by the v2 gain-map generator; remove it from callers.'
        );
    }

    const rawMaxContentBoost = Number.isFinite(options.maxContentBoost)
        ? options.maxContentBoost
        : DEFAULT_MAX_CONTENT_BOOST;
    const maxContentBoost = Math.max(1.0, rawMaxContentBoost);
    const highlightExponent = options.highlightExponent !== undefined ? options.highlightExponent : 2.0;
    const localAdaptStrength = options.localAdaptationStrength !== undefined ? options.localAdaptationStrength : 0.5;
    const v2BaseRadius = Math.max(3, Math.min(12, Math.round(Math.max(width, height) / 256)));
    const localRadiusSmall = Math.max(2, Math.min(8, Math.round(v2BaseRadius * 0.6)));
    const localRadiusLarge = Math.max(localRadiusSmall + 2, Math.min(14, Math.round(v2BaseRadius * 1.6)));
    const guidedEps = 0.0001;
    const onStageProgress = typeof options?.onStageProgress === 'function'
        ? options.onStageProgress
        : null;
    let lastReportedProgress = -1;

    function reportProgress(progress, note) {
        if (!onStageProgress) {
            return;
        }
        const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
        if (safeProgress < lastReportedProgress) {
            return;
        }
        lastReportedProgress = safeProgress;
        onStageProgress(safeProgress, note);
    }

    const log2MaxBoost = Math.log2(maxContentBoost);
    const canEncodeGain = log2MaxBoost > 0;
    const logDelta = 1e-6;
    const gainMapGamma = GAIN_MAP_GAMMA_LINEAR;
    const gainMapOffsetSdr = GAIN_MAP_OFFSET_SDR_LINEAR;

    const toLinear = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const linR = new Float32Array(pixelCount);
    const linG = new Float32Array(pixelCount);
    const linB = new Float32Array(pixelCount);
    const luminance = new Float32Array(pixelCount);
    const reportInterval = Math.max(2048, Math.floor(pixelCount / 24));

    reportProgress(0, 'Preparing source pixels');

    for (let i = 0; i < pixelCount; i++) {
        if (i % 4096 === 0) {
            throwIfAborted(options?.abortSignal);
        }
        const idx = i * 4;
        const r = toLinear(rgba[idx]);
        const g = toLinear(rgba[idx + 1]);
        const b = toLinear(rgba[idx + 2]);
        linR[i] = r;
        linG[i] = g;
        linB[i] = b;
        luminance[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        if (i % reportInterval === 0 || i === pixelCount - 1) {
            const stageProgress = (i / Math.max(1, pixelCount - 1)) * 40;
            reportProgress(stageProgress, 'Analyzing luminance');
        }
    }

    reportProgress(45, 'Computing local adaptation');

    const localSmall = guidedFilter(luminance, width, height, localRadiusSmall, guidedEps);
    const localLarge = guidedFilter(luminance, width, height, localRadiusLarge, guidedEps * 1.5);
    const localLum = new Float32Array(pixelCount);
    const localDetailLum = localSmall;
    for (let i = 0; i < pixelCount; i++) {
        const contrastRatio = Math.abs(localSmall[i] - localLarge[i]) / (localLarge[i] + logDelta);
        const edgeWeight = smoothstep(0.0, 0.06, contrastRatio);
        localLum[i] = localLarge[i] * (1 - edgeWeight) + localSmall[i] * edgeWeight;
    }

    reportProgress(60, 'Building adaptive gain map');

    let logSum = 0;
    for (let i = 0; i < pixelCount; i++) {
        logSum += Math.log(luminance[i] + logDelta);
    }
    const globalAvgLum = Math.exp(logSum / pixelCount);

    const [medianLum, p75Lum] = estimatePercentiles(luminance, [0.5, 0.75]);
    const toneForward = acesHillForward;
    const toneInverse = acesHillInverse;
    const acesAt1 = toneForward(1.0);
    const medianNorm = clamp01(medianLum);
    const medianSceneLinear = toneInverse(medianNorm * acesAt1);
    const medianBaseBoost = medianLum > logDelta ? medianSceneLinear / medianLum : 1.0;
    const medianHighlightWeight = Math.pow(medianNorm, highlightExponent);
    const medianBaseScale = medianBaseBoost > 1.0
        ? Math.min(medianBaseBoost / (maxContentBoost * 0.6), 1.0)
        : 0.4;
    const estimatedMedianRawBoost = 1.0 + (maxContentBoost - 1.0) * medianHighlightWeight * medianBaseScale;
    const medianLiftCap = brightnessIntent === 'vibrant'
        ? 1.26
        : brightnessIntent === 'balanced'
            ? 1.16
            : 1.08;
    const midtoneGuard = Math.min(1.0, Math.max(0, (medianLiftCap - 1.0) / Math.max(1e-5, estimatedMedianRawBoost - 1.0)));

    const gainMapData = new Uint8ClampedArray(length);

    for (let i = 0; i < pixelCount; i++) {
        if (i % 4096 === 0) {
            throwIfAborted(options?.abortSignal);
        }
        const lum = luminance[i];
        const lumForAnalysis = lum;
        const idx = i * 4;

        const adaptedAvg = localAdaptStrength > 0
            ? globalAvgLum * (1 - localAdaptStrength) + localLum[i] * localAdaptStrength
            : globalAvgLum;
        const adaptRatio = (lumForAnalysis + logDelta) / (adaptedAvg + logDelta);

        const sdrNorm = clamp01(lum);
        const acesInput = sdrNorm * acesAt1;
        const sceneLinear = toneInverse(acesInput);
        const baseBoost = lum > logDelta ? sceneLinear / lum : 1.0;

        const lumNorm = clamp01(lumForAnalysis);
        const highlightWeight = Math.pow(Math.min(1, lumNorm), highlightExponent);
        const localBoostMod = Math.pow(
            Math.max(0.6, adaptRatio),
            0.22 * localAdaptStrength
        );
        const baseScale = baseBoost > 1.0
            ? Math.min(baseBoost / (maxContentBoost * 0.6), 1.0)
            : 0.4;

        let rawBoost = 1.0 + (maxContentBoost - 1.0) * highlightWeight * localBoostMod * baseScale;

        const maxChannel = Math.max(linR[i], linG[i], linB[i]);
        const nearClip = smoothstep(0.96, 0.995, maxChannel);
        const localContrast = Math.abs(lumForAnalysis - localDetailLum[i]);
        const plateau = 1.0 - smoothstep(0.01, 0.08, localContrast);
        const clipMask = nearClip * plateau;
        if (clipMask > 0) {
            const clipBoost = 1.0 + clipMask * (maxContentBoost - 1.0);
            rawBoost = Math.max(rawBoost, clipBoost);
        }

        const highlightShare = smoothstep(Math.max(0, Math.min(1, p75Lum)), 1.0, lumForAnalysis);
        const midtoneScale = 1.0 - (1.0 - midtoneGuard) * (1.0 - highlightShare);
        rawBoost = 1.0 + (rawBoost - 1.0) * midtoneScale;
        if (midtoneGuard < 1.0 && highlightShare > 0) {
            const recovered = (1.0 - midtoneGuard) * 0.35 * highlightShare;
            rawBoost = rawBoost + recovered * (maxContentBoost - rawBoost);
        }

        const lowLumaWeight = smoothstep(0.03, 0.12, lumForAnalysis);
        let boost = 1.0 + (rawBoost - 1.0) * lowLumaWeight;

        boost = Math.max(1.0, Math.min(maxContentBoost, boost));

        const satBoostStrength = brightnessIntent === 'vibrant' ? 0.14 : brightnessIntent === 'balanced' ? 0.1 : 0.06;
        const boostRatio = clamp01((boost - 1.0) / Math.max(1e-6, maxContentBoost - 1.0));
        const satBoost = 1.0 + satBoostStrength * boostRatio;

        const lumSafe = Math.max(lum, logDelta);
        const rRatio = linR[i] / lumSafe;
        const gRatio = linG[i] / lumSafe;
        const bRatio = linB[i] / lumSafe;
        const rRatSat = 1.0 + (rRatio - 1.0) * satBoost;
        const gRatSat = 1.0 + (gRatio - 1.0) * satBoost;
        const bRatSat = 1.0 + (bRatio - 1.0) * satBoost;
        const minChannelRatio = 0.65;
        const minChannelBoost = 1.0 + (boost - 1.0) * 0.35;

        const rBoost = Math.max(1.0, Math.min(maxContentBoost, Math.max(minChannelBoost, boost * Math.max(minChannelRatio, rRatSat))));
        const gBoost = Math.max(1.0, Math.min(maxContentBoost, Math.max(minChannelBoost, boost * Math.max(minChannelRatio, gRatSat))));
        const bBoost = Math.max(1.0, Math.min(maxContentBoost, Math.max(minChannelBoost, boost * Math.max(minChannelRatio, bRatSat))));

        const rLinearEncoded = canEncodeGain ? clamp01(Math.log2(rBoost) / log2MaxBoost) : 0;
        const gLinearEncoded = canEncodeGain ? clamp01(Math.log2(gBoost) / log2MaxBoost) : 0;
        const bLinearEncoded = canEncodeGain ? clamp01(Math.log2(bBoost) / log2MaxBoost) : 0;
        const rEncoded = rLinearEncoded;
        const gEncoded = gLinearEncoded;
        const bEncoded = bLinearEncoded;

        gainMapData[idx] = Math.round(rEncoded * 255);
        gainMapData[idx + 1] = Math.round(gEncoded * 255);
        gainMapData[idx + 2] = Math.round(bEncoded * 255);
        gainMapData[idx + 3] = 255;

        if (i % reportInterval === 0 || i === pixelCount - 1) {
            const stageProgress = 60 + (i / Math.max(1, pixelCount - 1)) * 40;
            reportProgress(stageProgress, 'Encoding gain map');
        }
    }

    reportProgress(100, 'Gain map ready');

    const gainMapImageData = new ImageData(gainMapData, width, height);
    const parsedMaxBoost = canEncodeGain ? log2MaxBoost : 0;
    const metadata = {
        gainMapMin: [1.0, 1.0, 1.0],
        gainMapMax: [maxContentBoost, maxContentBoost, maxContentBoost],
        gamma: [gainMapGamma, gainMapGamma, gainMapGamma],
        offsetSdr: [gainMapOffsetSdr, gainMapOffsetSdr, gainMapOffsetSdr],
        offsetHdr: [0, 0, 0],
        hdrCapacityMin: 1.0,
        hdrCapacityMax: maxContentBoost,
        parsedGainMapMin: [0, 0, 0],
        parsedGainMapMax: [parsedMaxBoost, parsedMaxBoost, parsedMaxBoost],
        parsedGamma: [gainMapGamma, gainMapGamma, gainMapGamma],
        parsedOffsetSdr: [gainMapOffsetSdr, gainMapOffsetSdr, gainMapOffsetSdr],
        parsedOffsetHdr: [0, 0, 0],
        parsedHdrCapacityMin: 0,
        parsedHdrCapacityMax: parsedMaxBoost
    };

    return { gainMapImageData, metadata };
}

/**
 * Compresses images using libultrahdr WASM encoder.
 * @param {ImageData} sdrImageData
 * @param {ImageData} gainMapImageData
 * @param {Object} options
 * @param {Object} metadata
 * @param {Object|null} telemetry
 * @param {Uint8Array|null} exifPayload
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
async function compressImages(sdrImageData, gainMapImageData, options, metadata = null, telemetry = null, exifPayload = null) {
    // Convert quality 0-1 to 0-100
    const quality = options.quality !== undefined ? options.quality : 0.95;
    const wasmQuality = Math.round(quality * 100);
    const rotation = ((options.rotation || 0) % 360 + 360) % 360;
    const maxContentBoost = options.maxContentBoost ?? DEFAULT_MAX_CONTENT_BOOST;
    const gainMapMetadata = metadata || buildGainMapMetadata(maxContentBoost);
    const compressedMetadata = {
        gainMapMin: gainMapMetadata.gainMapMin,
        gainMapMax: gainMapMetadata.gainMapMax,
        gamma: gainMapMetadata.gamma,
        offsetSdr: gainMapMetadata.offsetSdr,
        offsetHdr: gainMapMetadata.offsetHdr,
        hdrCapacityMin: gainMapMetadata.hdrCapacityMin,
        hdrCapacityMax: gainMapMetadata.hdrCapacityMax
    };

    // Initialize WASM encoder
    const encoder = new UHDREncoder();
    if (telemetry) {
        await telemetry.runStage('encode-init', async () => encoder.init());
    } else {
        await encoder.init();
    }

    try {
        const rotatedSdrImageData = rotation !== 0
            ? (telemetry
                ? await telemetry.runStage('rotate-sdr-image', async () => rotateImageData(sdrImageData, rotation))
                : await rotateImageData(sdrImageData, rotation))
            : sdrImageData;
        const rotatedGainMapImageData = rotation !== 0
            ? (telemetry
                ? await telemetry.runStage('rotate-gain-map-image', async () => rotateImageData(gainMapImageData, rotation))
                : await rotateImageData(gainMapImageData, rotation))
            : gainMapImageData;

        // The current WASM wrapper expects compressed base and gain map inputs
        // when bypassing gain-map computation.
        const sdrJpegBytes = telemetry
            ? await telemetry.runStage('encode-sdr-to-jpeg', async () => imageDataToJpegBytes(rotatedSdrImageData, quality))
            : await imageDataToJpegBytes(rotatedSdrImageData, quality);
        const gainMapJpegBytes = telemetry
            ? await telemetry.runStage('encode-gain-map-to-jpeg', async () => imageDataToJpegBytes(rotatedGainMapImageData, quality))
            : await imageDataToJpegBytes(rotatedGainMapImageData, quality);

        let finalExifPayload = exifPayload;
        if (finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0) {
            finalExifPayload = normalizeExifOrientationTo1(finalExifPayload);
            if (finalExifPayload.length + 2 > 0xffff) {
                console.warn('Skipping EXIF insertion: payload exceeds JPEG APP1 segment size limit');
                finalExifPayload = null;
            }
        }

        const baseJpegForEncoder =
            !options.stripExif && finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0
                ? insertExifSegment(sdrJpegBytes, finalExifPayload)
                : sdrJpegBytes;

        if (telemetry) {
            await telemetry.runStage('encode-set-base-image', async () => {
                encoder.setCompressedBaseImage(baseJpegForEncoder);
            });
            await telemetry.runStage('encode-set-gain-map-image', async () => {
                encoder.setCompressedGainMapImage(gainMapJpegBytes, compressedMetadata);
            });
        } else {
            encoder.setCompressedBaseImage(baseJpegForEncoder);
            encoder.setCompressedGainMapImage(gainMapJpegBytes, compressedMetadata);
        }

        if (!options.stripExif && finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0) {
            if (telemetry) {
                await telemetry.runStage('encode-set-exif', async () => {
                    encoder.setExifData(finalExifPayload);
                });
            } else {
                encoder.setExifData(finalExifPayload);
            }
        }

        // Encode to UltraHDR JPEG.
        if (telemetry) {
            await telemetry.runStage('encode-ultrahdr', async () => {
                encoder.encode(wasmQuality);
            });
        } else {
            encoder.encode(wasmQuality);
        }

        // Get the encoded data.
        const jpegData = encoder.getEncodedData();
        if (!jpegData) {
            throw new Error('Encoding failed: no output data');
        }

        return { sdr: jpegData, gainMap: new Uint8Array(0) };
    } finally {
        encoder.destroy();
    }
}

async function imageDataToJpegBytes(imageData, quality = 0.95) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to create canvas context for JPEG encoding');
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (encodedBlob) => {
                if (!encodedBlob) {
                    reject(new Error('Canvas toBlob returned null for JPEG encoding'));
                    return;
                }
                resolve(encodedBlob);
            },
            'image/jpeg',
            quality
        );
    });

    // Release canvas resources aggressively when processing many files.
    canvas.width = 1;
    canvas.height = 1;

    return await blobToUint8Array(blob);
}

async function jpegBytesToImageData(jpegBytes) {
    const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
    const dataUrl = await readBlobAsDataURL(blob);
    const { imageData } = await loadImageData(dataUrl);
    return imageData;
}

async function rotateImageData(imageData, degrees) {
    const normalized = ((degrees || 0) % 360 + 360) % 360;
    if (normalized === 0) {
        return imageData;
    }

    const canvas = document.createElement('canvas');
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = imageData.width;
    sourceCanvas.height = imageData.height;

    const srcCtx = sourceCanvas.getContext('2d');
    if (!srcCtx) {
        throw new Error('Failed to create source canvas context for rotation');
    }
    srcCtx.putImageData(imageData, 0, 0);

    if (normalized === 90 || normalized === 270) {
        canvas.width = imageData.height;
        canvas.height = imageData.width;
    } else {
        canvas.width = imageData.width;
        canvas.height = imageData.height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to create destination canvas context for rotation');
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((normalized * Math.PI) / 180);
    ctx.drawImage(sourceCanvas, -imageData.width / 2, -imageData.height / 2);

    const rotated = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = 1;
    canvas.height = 1;
    sourceCanvas.width = 1;
    sourceCanvas.height = 1;
    return rotated;
}

async function blobToUint8Array(blob) {
    if (blob && typeof blob.arrayBuffer === 'function') {
        return new Uint8Array(await blob.arrayBuffer());
    }

    if (typeof Response !== 'undefined') {
        const arrayBuffer = await new Response(blob).arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

function readBlobAsDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Embeds metadata and finalizes the UltraHDR JPEG.
 * With WASM encoder, the metadata is already embedded in the JPEG.
 * This function now handles EXIF preservation only.
 * @param {Object} metadata
 * @param {Uint8Array} sdr - The UltraHDR JPEG from WASM encoder
 * @param {Uint8Array} gainMap - Unused (kept for API compatibility)
 * @param {boolean} stripExif
 * @returns {Promise<Blob>}
 */
async function finalizeUltraHDR(metadata, sdr, gainMap, stripExif) {
    // The WASM encoder embeds metadata directly in the JPEG
    // We only strip metadata when requested.
    let finalJpeg = sdr;

    if (stripExif) {
        finalJpeg = stripExifSegments(finalJpeg);
    }

    return new Blob([finalJpeg], { type: 'image/jpeg' });
}

/**
 * Reads a File as a Data URL.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
