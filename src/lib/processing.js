import { processHeic } from './heic-processing.js';
import { createPipelineTelemetry } from './pipeline-telemetry.js';
import { processTiff } from './tiff-processing.js';
import { UHDREncoder, UHDRDecoder, isWasmLoaded, isAvailable, getStatus, isUhdrImage } from './ultrahdr-wasm.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;

const DEFAULT_PROCESS_OPTIONS = {
    maxContentBoost: DEFAULT_MAX_CONTENT_BOOST,
    rotation: 0,
    quality: 0.95,
    discardGainMap: false,
    stripExif: false,
    highlightExponent: 2.0,
    shadowCutoff: 0.05,
    safeMode: false,
    maxOutputMegapixels: null,
    gainMapScale: 1,
    abortSignal: null
};

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
    const log2MaxBoost = Math.log2(maxContentBoost);
    return {
        gainMapMin: [1.0, 1.0, 1.0],
        gainMapMax: [maxContentBoost, maxContentBoost, maxContentBoost],
        gamma: [1.0, 1.0, 1.0],
        offsetSdr: [0, 0, 0],
        offsetHdr: [0, 0, 0],
        hdrCapacityMin: 1.0,
        hdrCapacityMax: maxContentBoost,
        parsedGainMapMin: [0, 0, 0],
        parsedGainMapMax: [log2MaxBoost, log2MaxBoost, log2MaxBoost],
        parsedGamma: [1.0, 1.0, 1.0],
        parsedOffsetSdr: [0, 0, 0],
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
 * @param {number} options.shadowCutoff - Cutoff for shadow boost (0-1).
 * @param {(event: Object) => void} [options.onProgress] - Optional telemetry callback.
 * @param {number} [options.fileIndex] - Optional file index in current batch.
 * @param {number} [options.totalFiles] - Optional total files in current batch.
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = DEFAULT_PROCESS_OPTIONS) {
    const mergedOptions = { ...DEFAULT_PROCESS_OPTIONS, ...(options || {}) };
    console.log('[Process] Starting processing for:', file.name);
    throwIfAborted(mergedOptions.abortSignal);

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

        file = await telemetry.runStage('preprocess-file', async () => {
            throwIfAborted(mergedOptions.abortSignal);
            return preprocessFile(file, mergedOptions);
        });

        // Check if JPEG already has a gain map (UltraHDR)
        // When discardGainMap is false, preserve the original gain map.
        if (!mergedOptions.discardGainMap && file instanceof File) {
            try {
                const fileBuffer = await telemetry.runStage('read-source-buffer', async () =>
                    new Uint8Array(await file.arrayBuffer())
                );
                throwIfAborted(mergedOptions.abortSignal);

                const isUhdr = await telemetry.runStage('detect-ultrahdr', async () => isUhdrImage(fileBuffer));
                if (isUhdr) {
                    if (mergedOptions.rotation === 0) {
                        console.log('[Process] Input is already UltraHDR JPEG — preserving existing gain map');
                        const exifBytes = extractExifFromJpeg(fileBuffer);
                        const blob = await telemetry.runStage('finalize-preserved', async () =>
                            finalizeUltraHDR({}, fileBuffer, new Uint8Array(0), exifBytes, mergedOptions.stripExif)
                        );
                        telemetry.complete({ outputBytes: blob.size, mode: 'preserve' });
                        return blob;
                    }

                    console.log('[Process] UltraHDR JPEG with rotation — extracting and rotating gain map');
                    const blob = await telemetry.runStage('rotate-preserved-ultrahdr', async () =>
                        processUhdrWithRotation(file, fileBuffer, mergedOptions, telemetry)
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

                const constrainedGainDimensions = getGainMapConstrainedDimensions(
                    gainMapImageData,
                    mergedOptions.gainMapScale
                );
                if (constrainedGainDimensions.changed) {
                    gainMapImageData = await telemetry.runStage('safe-mode-resize-gain-map', async () =>
                        resizeImageData(
                            gainMapImageData,
                            constrainedGainDimensions.width,
                            constrainedGainDimensions.height
                        )
                    );
                }
            }

            const { sdr, gainMap } = await telemetry.runStage('compress-components', async () =>
                compressImages(imageData, gainMapImageData, mergedOptions, metadata, telemetry)
            );
            const blob = await telemetry.runStage('finalize-output', async () =>
                finalizeUltraHDR(metadata, sdr, gainMap, null, mergedOptions.stripExif)
            );

            telemetry.complete({ outputBytes: blob.size, mode: 'pre-decoded-components' });
            return blob;
        }

        // Load Data & EXIF
        const dataUrl = await telemetry.runStage('read-input-data-url', async () => readFileAsDataURL(file));
        const exifBytes = await telemetry.runStage('extract-exif', async () => extractExif(file));
        console.log('[Process] File loaded and EXIF extracted');
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
        if (mergedOptions.safeMode) {
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
        }

        throwIfAborted(mergedOptions.abortSignal);

        // Generate gain map data
        const { gainMapImageData, metadata } = await telemetry.runStage('generate-gain-map', async () =>
            generateGainMapData(gainMapSourceImageData, mergedOptions)
        );
        console.log('[Process] GainMap generated manually');
        throwIfAborted(mergedOptions.abortSignal);

        // Compress and encode to UltraHDR
        const { sdr, gainMap } = await telemetry.runStage('compress-components', async () =>
            compressImages(workingImageData, gainMapImageData, mergedOptions, metadata, telemetry)
        );
        console.log('[Process] Compression complete');

        // Finalize UltraHDR
        const blob = await telemetry.runStage('finalize-output', async () =>
            finalizeUltraHDR(metadata, sdr, gainMap, exifBytes, mergedOptions.stripExif)
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
async function processUhdrWithRotation(file, fileBuffer, options, telemetry = null) {
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
        const exifBytes = options.stripExif ? null : await extractExif(file);

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
                    telemetry
                )
            )
            : await compressImages(
                baseImageData,
                gainMapImageData,
                { ...options, quality, rotation },
                gainMapMetadata,
                null
            );

        // 3. Finalize (handle EXIF)
        return await finalizeUltraHDR({}, sdr, gainMap, exifBytes, options.stripExif);
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
 * Extracts EXIF APP1 payload bytes from a JPEG source file.
 * @param {File} file 
 * @returns {Promise<Uint8Array|null>}
 */
async function extractExif(file) {
    try {
        if (file && (file.type === 'image/jpeg' || file.type === 'image/jpg')) {
            return extractExifFromJpeg(new Uint8Array(await file.arrayBuffer()));
        }
    } catch (e) {
        console.warn('Could not extract EXIF:', e);
    }
    return null;
}

function extractExifFromJpeg(jpegBytes) {
    if (!(jpegBytes instanceof Uint8Array) || jpegBytes.length < 4) {
        return null;
    }

    if (jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
        return null;
    }

    let offset = 2;
    while (offset + 4 <= jpegBytes.length) {
        if (jpegBytes[offset] !== 0xff) {
            offset++;
            continue;
        }

        const marker = jpegBytes[offset + 1];
        if (marker === 0xda || marker === 0xd9) {
            break;
        }

        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            offset += 2;
            continue;
        }

        const segmentLength = (jpegBytes[offset + 2] << 8) | jpegBytes[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > jpegBytes.length) {
            break;
        }

        const segmentEnd = offset + 2 + segmentLength;
        const isExifApp1 =
            marker === 0xe1 &&
            offset + 10 <= jpegBytes.length &&
            jpegBytes[offset + 4] === 0x45 &&
            jpegBytes[offset + 5] === 0x78 &&
            jpegBytes[offset + 6] === 0x69 &&
            jpegBytes[offset + 7] === 0x66 &&
            jpegBytes[offset + 8] === 0x00 &&
            jpegBytes[offset + 9] === 0x00;

        if (isExifApp1) {
            return jpegBytes.slice(offset + 4, segmentEnd);
        }

        offset = segmentEnd;
    }

    return null;
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
    const out = new Float32Array(w * h);
    // Separable box filter: horizontal pass then vertical pass
    const rowBuf = new Float32Array(w);
    for (let y = 0; y < h; y++) {
        const rowOff = y * w;
        for (let x = 0; x < w; x++) {
            const x0 = Math.max(0, x - r);
            const x1 = Math.min(w - 1, x + r);
            const count = x1 - x0 + 1;
            let s = 0;
            for (let xx = x0; xx <= x1; xx++) s += src[rowOff + xx];
            rowBuf[x] = s / count;
        }
        for (let x = 0; x < w; x++) out[rowOff + x] = rowBuf[x];
    }
    // Vertical pass on the horizontally-filtered result
    const colBuf = new Float32Array(h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const y0 = Math.max(0, y - r);
            const y1 = Math.min(h - 1, y + r);
            const count = y1 - y0 + 1;
            let s = 0;
            for (let yy = y0; yy <= y1; yy++) s += out[yy * w + x];
            colBuf[y] = s / count;
        }
        for (let y = 0; y < h; y++) out[y * w + x] = colBuf[y];
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
 * ACES-approximate forward tone curve (Narkowicz 2015 fit).
 * Maps scene-linear [0, ∞) → display [0, ~1].
 * f(x) = (x*(2.51*x + 0.03)) / (x*(2.43*x + 0.59) + 0.14)
 * @param {number} x - Scene-linear luminance
 * @returns {number} Display luminance
 */
function acesForward(x) {
    return (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
}

/**
 * Derivative of the ACES-approximate forward curve, used for Newton's method.
 * f(x) = (ax² + bx) / (cx² + dx + e) where a=2.51, b=0.03, c=2.43, d=0.59, e=0.14
 * f'(x) = [(2ax+b)(cx²+dx+e) - (ax²+bx)(2cx+d)] / (cx²+dx+e)²
 * @param {number} x
 * @returns {number}
 */
function acesForwardDerivative(x) {
    const a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    const num = a * x * x + b * x;
    const den = c * x * x + d * x + e;
    const numPrime = 2 * a * x + b;
    const denPrime = 2 * c * x + d;
    return (numPrime * den - num * denPrime) / (den * den);
}

/**
 * Inverse ACES tone curve via Newton's method.
 * Given a display-referred value y in [0, ~1], recovers scene-linear x such that acesForward(x) ≈ y.
 * @param {number} y - Display-referred (SDR) luminance in [0, 1]
 * @param {number} maxIter - Max Newton iterations
 * @returns {number} Scene-linear HDR luminance
 */
function acesInverse(y, maxIter = 8) {
    if (y <= 0) return 0;
    if (y >= 1) return 20.0; // ACES saturates around x≈20 → f(x)≈1.0

    // Initial guess via algebraic rearrangement:
    // y*(cx²+dx+e) = ax²+bx → (a-yc)x² + (b-yd)x - ye = 0
    const a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    const A = a - y * c;
    const B = b - y * d;
    const C = -y * e;
    const disc = B * B - 4 * A * C;
    let x = disc > 0 ? (-B + Math.sqrt(disc)) / (2 * A) : y; // quadratic solution or fallback

    // Refine with Newton's method for numerical precision
    for (let i = 0; i < maxIter; i++) {
        const fx = acesForward(x) - y;
        const fpx = acesForwardDerivative(x);
        if (Math.abs(fpx) < 1e-10) break;
        const step = fx / fpx;
        x -= step;
        x = Math.max(0, x); // clamp to positive
        if (Math.abs(step) < 1e-8) break;
    }
    return Math.max(0, x);
}

/**
 * Generates the Gain Map ImageData using state-of-the-art reverse tonemapping.
 *
 * Pipeline stages:
 *  1. Luminance decomposition (BT.709) — prevents hue shifts
 *  2. Guided filter local adaptation (He et al. 2013) — edge-preserving spatial context
 *  3. ACES-inspired inverse sigmoid — natural highlight expansion
 *  4. Adaptive boost blending (global + local) — spatially-aware gain
 *  5. Desaturation compensation — maintains color vibrancy at high boost
 *  6. Log2 gain encoding — UltraHDR-compatible metadata
 *
 * @param {ImageData} imageData - The SDR image data.
 * @param {Object} options
 * @param {number} [options.maxContentBoost=2.3] - Maximum HDR boost factor
 * @param {number} [options.highlightExponent=2.0] - Controls highlight expansion aggressiveness
 * @param {number} [options.shadowCutoff=0.05] - Linear luminance below which no boost is applied
 * @param {number} [options.localAdaptationStrength=0.5] - Blend between global (0) and local (1) adaptation
 * @param {number} [options.localAdaptationRadius] - Guided filter radius (auto if not set)
 * @returns {{gainMapImageData: ImageData, metadata: Object}}
 */
export function generateGainMapData(imageData, options) {
    throwIfAborted(options?.abortSignal);
    const rgba = imageData.data;
    const length = rgba.length;
    const width = imageData.width;
    const height = imageData.height;
    const pixelCount = width * height;

    const maxContentBoost = options.maxContentBoost ?? DEFAULT_MAX_CONTENT_BOOST;
    const highlightExponent = options.highlightExponent !== undefined ? options.highlightExponent : 2.0;
    const shadowCutoff = options.shadowCutoff !== undefined ? options.shadowCutoff : 0.05;
    const localAdaptStrength = options.localAdaptationStrength !== undefined ? options.localAdaptationStrength : 0.5;
    const localRadius = options.localAdaptationRadius || Math.max(4, Math.min(64, Math.round(Math.max(width, height) / 32)));
    const guidedEps = 0.0001; // ε = 0.01² for luminance in [0,1]

    const log2MaxBoost = Math.log2(maxContentBoost);

    // ─── Stage 1: sRGB → Linear + Luminance Decomposition ───

    const toLinear = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    // Convert to linear RGB and compute BT.709 luminance
    const linR = new Float32Array(pixelCount);
    const linG = new Float32Array(pixelCount);
    const linB = new Float32Array(pixelCount);
    const luminance = new Float32Array(pixelCount);

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
    }

    // ─── Stage 2: Local Adaptation via Guided Filter ───

    const localLum = guidedFilter(luminance, width, height, localRadius, guidedEps);

    // Compute global average luminance (log-average for perceptual accuracy)
    let logSum = 0;
    const logDelta = 1e-6; // prevent log(0)
    for (let i = 0; i < pixelCount; i++) {
        logSum += Math.log(luminance[i] + logDelta);
    }
    const globalAvgLum = Math.exp(logSum / pixelCount);

    // ─── Stage 3 & 4: ACES Inverse + Adaptive Boost ───

    // Normalize the ACES forward curve so that f(1) maps to the curve's output at 1.0
    // This lets us treat SDR [0,1] luminance as the output of the ACES curve
    const acesAt1 = acesForward(1.0); // ≈ 0.8048

    const gainMapData = new Uint8ClampedArray(length);

    for (let i = 0; i < pixelCount; i++) {
        if (i % 4096 === 0) {
            throwIfAborted(options?.abortSignal);
        }
        const lum = luminance[i];
        const idx = i * 4;

        // Blend between global and local average luminance for adaptation
        const adaptedAvg = localAdaptStrength > 0
            ? globalAvgLum * (1 - localAdaptStrength) + localLum[i] * localAdaptStrength
            : globalAvgLum;

        // Adaptation ratio: how bright is this pixel relative to its local context?
        // Values > 1 mean brighter than surroundings (highlight), < 1 means darker (shadow)
        const adaptRatio = (lum + logDelta) / (adaptedAvg + logDelta);

        // Map SDR luminance through inverse ACES to get "scene-linear" HDR luminance
        // Scale input to the ACES curve range and then invert
        const sdrNorm = Math.min(1.0, lum / 1.0); // already in [0,1] from linear
        const acesInput = sdrNorm * acesAt1; // scale to ACES output range
        const sceneLinear = acesInverse(acesInput);

        // The base boost from the inverse tone curve
        let baseBoost = lum > logDelta ? sceneLinear / lum : 1.0;

        // Apply highlight exponent to control aggressiveness of expansion
        // Higher exponent = more aggressive boost for bright pixels
        const lumNorm = Math.max(0, (lum - shadowCutoff) / (1 - shadowCutoff + logDelta));
        const highlightWeight = Math.pow(Math.min(1, lumNorm), highlightExponent);

        // Modulate boost by local adaptation: highlights in dark regions get extra boost
        // while highlights in already-bright regions are more restrained
        const localBoostMod = Math.pow(adaptRatio, 0.3 * localAdaptStrength);

        // Final boost: blend between 1.0 (no boost) and the full calculated boost
        let boost;
        if (lum <= shadowCutoff) {
            boost = 1.0; // No boost in deep shadows
        } else {
            boost = 1.0 + (maxContentBoost - 1.0) * highlightWeight * localBoostMod *
                (baseBoost > 1.0 ? Math.min(baseBoost / (maxContentBoost * 0.5), 1.0) : 0.5);
        }

        // Clamp boost to valid range
        boost = Math.max(1.0, Math.min(maxContentBoost, boost));

        // ─── Stage 5: Desaturation Compensation ───
        // High-boost areas tend to look washed out; increase saturation proportionally
        const boostRatio = (boost - 1.0) / (maxContentBoost - 1.0); // 0–1 normalized
        const satBoost = 1.0 + 0.15 * boostRatio; // subtle 0–15% saturation increase

        // Apply boost to each channel, using luminance-ratio method to preserve hue
        // hdrChannel = lum * boost * (channel / lum) * satBoost_adjustment
        // Simplifies to: channel * boost, with saturation compensation
        const lumSafe = Math.max(lum, logDelta);
        const rRatio = linR[i] / lumSafe;
        const gRatio = linG[i] / lumSafe;
        const bRatio = linB[i] / lumSafe;

        // Apply saturation boost: push ratios away from 1.0
        const rRatSat = 1.0 + (rRatio - 1.0) * satBoost;
        const gRatSat = 1.0 + (gRatio - 1.0) * satBoost;
        const bRatSat = 1.0 + (bRatio - 1.0) * satBoost;

        // Per-channel boost preserving hue (via luminance ratios)
        const rBoost = Math.max(1.0, Math.min(maxContentBoost, boost * Math.max(0.5, rRatSat)));
        const gBoost = Math.max(1.0, Math.min(maxContentBoost, boost * Math.max(0.5, gRatSat)));
        const bBoost = Math.max(1.0, Math.min(maxContentBoost, boost * Math.max(0.5, bRatSat)));

        // ─── Stage 6: Log2 Gain Encoding ───
        const rEncoded = Math.max(0, Math.min(1, Math.log2(rBoost) / log2MaxBoost));
        const gEncoded = Math.max(0, Math.min(1, Math.log2(gBoost) / log2MaxBoost));
        const bEncoded = Math.max(0, Math.min(1, Math.log2(bBoost) / log2MaxBoost));

        gainMapData[idx] = Math.round(rEncoded * 255);
        gainMapData[idx + 1] = Math.round(gEncoded * 255);
        gainMapData[idx + 2] = Math.round(bEncoded * 255);
        gainMapData[idx + 3] = 255;
    }

    const gainMapImageData = new ImageData(gainMapData, width, height);

    // Construct metadata (unchanged format for full backward compatibility)
    const metadata = {
        gainMapMin: [1.0, 1.0, 1.0],
        gainMapMax: [maxContentBoost, maxContentBoost, maxContentBoost],
        gamma: [1.0, 1.0, 1.0],
        offsetSdr: [0, 0, 0],
        offsetHdr: [0, 0, 0],
        hdrCapacityMin: 1.0,
        hdrCapacityMax: maxContentBoost,
        parsedGainMapMin: [0, 0, 0],
        parsedGainMapMax: [log2MaxBoost, log2MaxBoost, log2MaxBoost],
        parsedGamma: [1.0, 1.0, 1.0],
        parsedOffsetSdr: [0, 0, 0],
        parsedOffsetHdr: [0, 0, 0],
        parsedHdrCapacityMin: 0,
        parsedHdrCapacityMax: log2MaxBoost
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
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
async function compressImages(sdrImageData, gainMapImageData, options, metadata = null, telemetry = null) {
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

        if (telemetry) {
            await telemetry.runStage('encode-set-base-image', async () => {
                encoder.setCompressedBaseImage(sdrJpegBytes);
            });
            await telemetry.runStage('encode-set-gain-map-image', async () => {
                encoder.setCompressedGainMapImage(gainMapJpegBytes, compressedMetadata);
            });
        } else {
            encoder.setCompressedBaseImage(sdrJpegBytes);
            encoder.setCompressedGainMapImage(gainMapJpegBytes, compressedMetadata);
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
 * @param {Uint8Array|null} exifBytes
 * @param {boolean} stripExif
 * @returns {Promise<Blob>}
 */
async function finalizeUltraHDR(metadata, sdr, gainMap, exifBytes, stripExif) {
    // The WASM encoder embeds metadata directly in the JPEG
    // We just need to handle EXIF preservation
    let finalJpeg = sdr;

    if (stripExif) {
        finalJpeg = stripExifSegments(finalJpeg);
    } else if (exifBytes) {
        try {
            const normalizedExif = normalizeExifOrientation(exifBytes);
            finalJpeg = insertExifSegment(finalJpeg, normalizedExif);
        } catch (e) {
            console.warn('Could not re-insert EXIF:', e);
        }
    }

    return new Blob([finalJpeg], { type: 'image/jpeg' });
}

function stripExifSegments(jpegBytes) {
    if (!(jpegBytes instanceof Uint8Array) || jpegBytes.length < 4) {
        return jpegBytes;
    }

    if (jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
        return jpegBytes;
    }

    const outputChunks = [jpegBytes.slice(0, 2)]; // SOI
    let offset = 2;

    while (offset + 4 <= jpegBytes.length) {
        if (jpegBytes[offset] !== 0xff) {
            // Preserve trailing bytes as-is if parsing loses marker alignment.
            outputChunks.push(jpegBytes.slice(offset));
            break;
        }

        const marker = jpegBytes[offset + 1];

        // SOS and EOI terminate metadata segment parsing.
        if (marker === 0xda || marker === 0xd9) {
            outputChunks.push(jpegBytes.slice(offset));
            break;
        }

        // Restart markers/TEM do not have segment length.
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            outputChunks.push(jpegBytes.slice(offset, offset + 2));
            offset += 2;
            continue;
        }

        const segmentLength = (jpegBytes[offset + 2] << 8) | jpegBytes[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > jpegBytes.length) {
            outputChunks.push(jpegBytes.slice(offset));
            break;
        }

        const segmentEnd = offset + 2 + segmentLength;
        const isExifApp1 =
            marker === 0xe1 &&
            offset + 10 <= jpegBytes.length &&
            jpegBytes[offset + 4] === 0x45 && // E
            jpegBytes[offset + 5] === 0x78 && // x
            jpegBytes[offset + 6] === 0x69 && // i
            jpegBytes[offset + 7] === 0x66 && // f
            jpegBytes[offset + 8] === 0x00 &&
            jpegBytes[offset + 9] === 0x00;

        if (!isExifApp1) {
            outputChunks.push(jpegBytes.slice(offset, segmentEnd));
        }

        offset = segmentEnd;
    }

    const totalLength = outputChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Uint8Array(totalLength);
    let cursor = 0;
    for (const chunk of outputChunks) {
        merged.set(chunk, cursor);
        cursor += chunk.length;
    }
    return merged;
}

function insertExifSegment(jpegBytes, exifPayload) {
    if (!(exifPayload instanceof Uint8Array) || exifPayload.length === 0) {
        return jpegBytes;
    }

    const segmentLength = exifPayload.length + 2;
    if (segmentLength > 0xffff) {
        console.warn('Skipping EXIF insertion: payload exceeds JPEG APP1 segment size limit');
        return jpegBytes;
    }

    const base = stripExifSegments(jpegBytes);
    if (!(base instanceof Uint8Array) || base.length < 2 || base[0] !== 0xff || base[1] !== 0xd8) {
        return jpegBytes;
    }

    const rest = base.subarray(2);
    const output = new Uint8Array(2 + 4 + exifPayload.length + rest.length);
    output[0] = 0xff;
    output[1] = 0xd8;
    output[2] = 0xff;
    output[3] = 0xe1;
    output[4] = (segmentLength >> 8) & 0xff;
    output[5] = segmentLength & 0xff;
    output.set(exifPayload, 6);
    output.set(rest, 6 + exifPayload.length);
    return output;
}

function normalizeExifOrientation(exifPayload) {
    if (!(exifPayload instanceof Uint8Array) || exifPayload.length < 14) {
        return exifPayload;
    }

    if (
        exifPayload[0] !== 0x45 ||
        exifPayload[1] !== 0x78 ||
        exifPayload[2] !== 0x69 ||
        exifPayload[3] !== 0x66 ||
        exifPayload[4] !== 0x00 ||
        exifPayload[5] !== 0x00
    ) {
        return exifPayload;
    }

    const tiffOffset = 6;
    const byteOrderA = exifPayload[tiffOffset];
    const byteOrderB = exifPayload[tiffOffset + 1];
    const littleEndian = byteOrderA === 0x49 && byteOrderB === 0x49;
    const bigEndian = byteOrderA === 0x4d && byteOrderB === 0x4d;
    if (!littleEndian && !bigEndian) {
        return exifPayload;
    }

    const tiffMarker = readExifUint16(exifPayload, tiffOffset + 2, littleEndian);
    if (tiffMarker !== 0x002a) {
        return exifPayload;
    }

    const ifd0RelativeOffset = readExifUint32(exifPayload, tiffOffset + 4, littleEndian);
    if (ifd0RelativeOffset === null) {
        return exifPayload;
    }

    const ifd0Offset = tiffOffset + ifd0RelativeOffset;
    const entryCount = readExifUint16(exifPayload, ifd0Offset, littleEndian);
    if (entryCount === null) {
        return exifPayload;
    }

    for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifd0Offset + 2 + (i * 12);
        const tag = readExifUint16(exifPayload, entryOffset, littleEndian);
        if (tag !== 0x0112) {
            continue;
        }

        const type = readExifUint16(exifPayload, entryOffset + 2, littleEndian);
        const count = readExifUint32(exifPayload, entryOffset + 4, littleEndian);
        if (type !== 3 || count === null || count < 1) {
            return exifPayload;
        }

        const valueOffset = entryOffset + 8;
        const currentOrientation = readExifUint16(exifPayload, valueOffset, littleEndian);
        if (currentOrientation === null || currentOrientation === 1) {
            return exifPayload;
        }

        const patched = exifPayload.slice();
        writeExifUint16(patched, valueOffset, 1, littleEndian);
        return patched;
    }

    return exifPayload;
}

function readExifUint16(buffer, offset, littleEndian) {
    if (offset < 0 || offset + 2 > buffer.length) {
        return null;
    }
    if (littleEndian) {
        return buffer[offset] | (buffer[offset + 1] << 8);
    }
    return (buffer[offset] << 8) | buffer[offset + 1];
}

function readExifUint32(buffer, offset, littleEndian) {
    if (offset < 0 || offset + 4 > buffer.length) {
        return null;
    }
    if (littleEndian) {
        return (
            buffer[offset] |
            (buffer[offset + 1] << 8) |
            (buffer[offset + 2] << 16) |
            (buffer[offset + 3] << 24)
        ) >>> 0;
    }
    return (
        (buffer[offset] << 24) |
        (buffer[offset + 1] << 16) |
        (buffer[offset + 2] << 8) |
        buffer[offset + 3]
    ) >>> 0;
}

function writeExifUint16(buffer, offset, value, littleEndian) {
    if (offset < 0 || offset + 2 > buffer.length) {
        return;
    }
    if (littleEndian) {
        buffer[offset] = value & 0xff;
        buffer[offset + 1] = (value >> 8) & 0xff;
        return;
    }
    buffer[offset] = (value >> 8) & 0xff;
    buffer[offset + 1] = value & 0xff;
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
