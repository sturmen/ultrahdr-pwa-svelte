import piexif from 'piexifjs';

import { processHeic } from './heic-processing.js';
import { processTiff } from './tiff-processing.js';
import { UHDREncoder, UHDRDecoder, isWasmLoaded, isAvailable, getStatus, isUhdrImage } from './ultrahdr-wasm.js';

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
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = { maxContentBoost: 4.0, rotation: 0, quality: 0.95, discardGainMap: false, stripExif: false, highlightExponent: 2.0, shadowCutoff: 0.05 }) {
    console.log('[Process] Starting processing for:', file.name);

    // Ensure WASM encoder is loaded
    await ensureWasmLoaded();

    // 1. Preprocess (HEIC/TIFF conversion)
    file = await preprocessFile(file, options);

    // 1b. Check if JPEG already has a gain map (UltraHDR)
    // When discardGainMap is false, preserve the original gain map
    if (!options.discardGainMap && file instanceof File) {
        try {
            const fileBuffer = new Uint8Array(await file.arrayBuffer());
            const isUhdr = await isUhdrImage(fileBuffer);
            if (isUhdr) {
                if (options.rotation === 0) {
                    // No rotation — return original file as-is (just handle EXIF)
                    console.log('[Process] Input is already UltraHDR JPEG — preserving existing gain map');
                    const dataUrl = await readFileAsDataURL(file);
                    const exifObj = extractExif(file, dataUrl);
                    return await finalizeUltraHDR({}, fileBuffer, new Uint8Array(0), exifObj, options.stripExif);
                } else {
                    // Rotation requested — extract gain map, rotate both SDR and gain map, re-encode
                    console.log('[Process] UltraHDR JPEG with rotation — extracting and rotating gain map');
                    return await processUhdrWithRotation(file, fileBuffer, options);
                }
            }
        } catch (e) {
            console.warn('[Process] UltraHDR detection/preservation failed, proceeding with normal processing:', e);
        }
    }

    // 1c. If file is an object with raw data from HEIC preservation, handle it
    if (!(file instanceof File) && !(file instanceof Blob) && file.sdr) {
        console.log('[Process] Using pre-decoded components (likely HEIC with native gain map)');
        const imageData = file.sdr;
        const gainMapImageData = file.gainMap;

        const maxContentBoost = options.maxContentBoost || 4.0;
        const log2MaxBoost = Math.log2(maxContentBoost);
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

        const { sdr, gainMap } = await compressImages(imageData, gainMapImageData, options);
        return await finalizeUltraHDR(metadata, sdr, gainMap, null, options.stripExif);
    }

    // 2. Load Data & EXIF
    const dataUrl = await readFileAsDataURL(file);
    const exifObj = extractExif(file, dataUrl);
    console.log('[Process] File loaded and EXIF extracted');

    // 3. Load Image Data (Canvas/Rotation)
    const { imageData } = await loadImageData(dataUrl);
    console.log('[Process] Image data retrieved');

    // 4. Generate Gain Map Data (Manual Calculation)
    const { gainMapImageData, metadata } = generateGainMapData(imageData, options);
    console.log('[Process] GainMap generated manually');

    // 5. Compress Images (using WASM encoder)
    const { sdr, gainMap } = await compressImages(imageData, gainMapImageData, options);
    console.log('[Process] Compression complete');

    // 6. Finalize UltraHDR
    const blob = await finalizeUltraHDR(metadata, sdr, gainMap, exifObj, options.stripExif);
    console.log('[Process] Processing complete, returning Blob');

    return blob;
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
async function processUhdrWithRotation(file, fileBuffer, options) {
    const decoder = new UHDRDecoder();
    await decoder.init();

    try {
        // 1. Probe the UltraHDR JPEG and extract original compressed components.
        // This preserves source quality by avoiding decode/re-encode before final output.
        decoder.setImage(fileBuffer);
        decoder.probe();

        const baseJpegBytes = decoder.getBaseImage();
        const gainMapJpegBytes = decoder.getGainMapImage();
        const gainMapMetadata = decoder.getGainMapMetadata();
        console.log('[Process] Extracted compressed components. Base:', baseJpegBytes.length, 'GainMap:', gainMapJpegBytes.length);

        const quality = options.quality !== undefined ? options.quality : 0.95;
        const rotation = ((options.rotation || 0) % 360 + 360) % 360;
        const exifObj = options.stripExif ? null : extractExif(file, await readFileAsDataURL(file));

        // 2. Re-encode once with rotation effect applied in the encoder.
        const encoder = new UHDREncoder();
        await encoder.init();

        try {
            encoder.setCompressedBaseImage(baseJpegBytes);
            encoder.setCompressedGainMapImage(gainMapJpegBytes, gainMapMetadata);
            if (rotation !== 0) {
                encoder.addEffectRotate(rotation);
            }

            const wasmQuality = Math.round(quality * 100);
            encoder.encode(wasmQuality);

            const jpegData = encoder.getEncodedData();
            if (!jpegData) {
                throw new Error('Encoding failed: no output data');
            }

            // 3. Finalize (handle EXIF)
            return await finalizeUltraHDR({}, jpegData, new Uint8Array(0), exifObj, options.stripExif);
        } finally {
            encoder.destroy();
        }
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
 * Extracts EXIF data from the file if it's a JPEG.
 * @param {File} file 
 * @param {string} dataUrl 
 * @returns {Object|null}
 */
function extractExif(file, dataUrl) {
    try {
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            return piexif.load(dataUrl);
        }
    } catch (e) {
        console.warn('Could not extract EXIF:', e);
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
 * @param {number} [options.maxContentBoost=4.0] - Maximum HDR boost factor
 * @param {number} [options.highlightExponent=2.0] - Controls highlight expansion aggressiveness
 * @param {number} [options.shadowCutoff=0.05] - Linear luminance below which no boost is applied
 * @param {number} [options.localAdaptationStrength=0.5] - Blend between global (0) and local (1) adaptation
 * @param {number} [options.localAdaptationRadius] - Guided filter radius (auto if not set)
 * @returns {{gainMapImageData: ImageData, metadata: Object}}
 */
export function generateGainMapData(imageData, options) {
    const rgba = imageData.data;
    const length = rgba.length;
    const width = imageData.width;
    const height = imageData.height;
    const pixelCount = width * height;

    const maxContentBoost = options.maxContentBoost || 4.0;
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
 * @param {ImageData} sdrImageData
 * @param {ImageData} gainMapImageData
 * @param {Object} options
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
async function compressImages(sdrImageData, gainMapImageData, options) {
    // Convert quality 0-1 to 0-100
    const quality = options.quality !== undefined ? options.quality : 0.95;
    const maxContentBoost = options.maxContentBoost || 4.0;
    const wasmQuality = Math.round(quality * 100);
    const rotation = ((options.rotation || 0) % 360 + 360) % 360;

    // Initialize WASM encoder
    const encoder = new UHDREncoder();
    await encoder.init();

    try {
        // Set raw SDR and gain-map image data to avoid intermediate lossy re-encoding.
        encoder.setSDRImage(sdrImageData, sdrImageData.width, sdrImageData.height);

        encoder.setGainMapImage(
            gainMapImageData,
            {
                gainMapMin: [1.0, 1.0, 1.0],
                gainMapMax: [maxContentBoost, maxContentBoost, maxContentBoost],
                gamma: [1.0, 1.0, 1.0],
                offsetSdr: [0, 0, 0],
                offsetHdr: [0, 0, 0],
                hdrCapacityMin: 1.0,
                hdrCapacityMax: maxContentBoost
            },
            gainMapImageData.width,
            gainMapImageData.height
        );

        if (rotation !== 0) {
            encoder.addEffectRotate(rotation);
        }

        // Encode to UltraHDR JPEG
        encoder.encode(wasmQuality);

        // Get the encoded data
        const jpegData = encoder.getEncodedData();
        if (!jpegData) {
            throw new Error('Encoding failed: no output data');
        }

        // The WASM encoder produces a complete UltraHDR JPEG, so we return
        // the JPEG data as both sdr and gainMap for compatibility
        // (the metadata is embedded in the JPEG)
        return { sdr: jpegData, gainMap: new Uint8Array(0) };
    } finally {
        encoder.destroy();
    }
}

/**
 * Embeds metadata and finalizes the UltraHDR JPEG.
 * With WASM encoder, the metadata is already embedded in the JPEG.
 * This function now handles EXIF preservation only.
 * @param {Object} metadata
 * @param {Uint8Array} sdr - The UltraHDR JPEG from WASM encoder
 * @param {Uint8Array} gainMap - Unused (kept for API compatibility)
 * @param {Object|null} exifObj
 * @param {boolean} stripExif
 * @returns {Promise<Blob>}
 */
async function finalizeUltraHDR(metadata, sdr, gainMap, exifObj, stripExif) {
    // The WASM encoder embeds metadata directly in the JPEG
    // We just need to handle EXIF preservation
    let finalJpeg = sdr;

    if (exifObj && !stripExif) {
        try {
            // Reset Orientation to 1
            if (exifObj["0th"] && exifObj["0th"][piexif.ImageIFD.Orientation]) {
                exifObj["0th"][piexif.ImageIFD.Orientation] = 1;
            }

            // Convert Uint8Array to binary string in chunks for performance
            let binary = "";
            const CHUNK_SIZE = 8192;
            for (let i = 0; i < finalJpeg.length; i += CHUNK_SIZE) {
                binary += String.fromCharCode.apply(null, finalJpeg.subarray(i, i + CHUNK_SIZE));
            }

            const exifBytes = piexif.dump(exifObj);
            const newBinary = piexif.insert(exifBytes, binary);

            const len = newBinary.length;
            finalJpeg = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                finalJpeg[i] = newBinary.charCodeAt(i);
            }
        } catch (e) {
            console.warn('Could not re-insert EXIF:', e);
        }
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
