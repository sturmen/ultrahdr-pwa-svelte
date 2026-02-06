import piexif from 'piexifjs';

import { processHeic } from './heic-processing.js';
import { processTiff } from './tiff-processing.js';
import { UHDREncoder, isWasmLoaded, isAvailable, getStatus } from './ultrahdr-wasm.js';

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
 * @param {boolean} options.discardGainMap - (Unused in current logic but kept for API compat).
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

    // 2. Load Data & EXIF
    const dataUrl = await readFileAsDataURL(file);
    const exifObj = extractExif(file, dataUrl);
    console.log('[Process] File loaded and EXIF extracted');

    // 3. Load Image Data (Canvas/Rotation)
    const { imageData } = await loadImageData(dataUrl, options.rotation);
    console.log('[Process] Image data retrieved');

    // 4. Generate Gain Map Data (Manual Calculation)
    // We calculate the gain map directly here, skipping the WebGL HDR texture generation step.
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
 * Loads the image data from a Data URL, applying rotation if needed.
 * @param {string} dataUrl 
 * @param {number} rotation 
 * @returns {Promise<{imageData: ImageData, width: number, height: number}>}
 */
async function loadImageData(dataUrl, rotation = 0) {
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

    // Normalize rotation
    rotation = (rotation % 360 + 360) % 360;

    if (rotation === 90 || rotation === 270) {
        canvas.width = height;
        canvas.height = width;
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -width / 2, -height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Cleanup
    canvas.width = 1;
    canvas.height = 1;
    canvas = null;
    ctx = null;

    return { imageData, width: canvas?.width || width, height: canvas?.height || height };
}

/**
 * Generates the Gain Map ImageData manually by calculating the boost for each pixel.
 * @param {ImageData} imageData - The SDR image data.
 * @param {Object} options 
 * @returns {{gainMapImageData: ImageData, metadata: Object}}
 */
function generateGainMapData(imageData, options) {
    const rgba = imageData.data;
    const length = rgba.length;
    const width = imageData.width;
    const height = imageData.height;

    // Create Gain Map ImageData (single channel usually, but we'll use RGB for compatibility)
    // We can use a smaller resolution for gain map if we wanted, but let's keep it 1:1 for simplicity first.
    // Actually, gain maps are often 1/4 resolution. But let's stick to 1:1 to avoid resizing logic complexity for now.
    const gainMapData = new Uint8ClampedArray(length);

    const maxContentBoost = options.maxContentBoost || 4.0;
    const highlightExponent = options.highlightExponent !== undefined ? options.highlightExponent : 2.0;
    const shadowCutoff = options.shadowCutoff !== undefined ? options.shadowCutoff : 0.05;

    // Pre-calculate log2 of max boost for normalization
    const log2MaxBoost = Math.log2(maxContentBoost);

    // sRGB to Linear conversion helper
    const toLinear = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    // Helper to calculate boost
    const calcBoost = (linearVal) => {
        if (shadowCutoff >= 1.0) return 1.0;
        const norm = Math.max(0, (linearVal - shadowCutoff) / (1 - shadowCutoff));
        return 1 + (maxContentBoost - 1) * Math.pow(norm, highlightExponent);
    };

    for (let i = 0; i < length; i += 4) {
        const rLin = toLinear(rgba[i]);
        const gLin = toLinear(rgba[i + 1]);
        const bLin = toLinear(rgba[i + 2]);

        // Calculate Boost
        const rBoost = calcBoost(rLin);
        const gBoost = calcBoost(gLin);
        const bBoost = calcBoost(bLin);

        // Encode Gain:
        // GainMap value = (log2(Boost) - log2(minBoost)) / (log2(maxBoost) - log2(minBoost))
        // We assume minBoost = 1.0, so log2(minBoost) = 0.
        // So Encoded = log2(Boost) / log2(maxContentBoost)

        // We clamp to [0, 1] just in case
        const rLog = Math.log2(rBoost);
        const gLog = Math.log2(gBoost);
        const bLog = Math.log2(bBoost);

        const rEncoded = Math.max(0, Math.min(1, rLog / log2MaxBoost));
        const gEncoded = Math.max(0, Math.min(1, gLog / log2MaxBoost));
        const bEncoded = Math.max(0, Math.min(1, bLog / log2MaxBoost));

        gainMapData[i] = Math.round(rEncoded * 255);     // R
        gainMapData[i + 1] = Math.round(gEncoded * 255); // G
        gainMapData[i + 2] = Math.round(bEncoded * 255); // B
        gainMapData[i + 3] = 255;                        // Alpha
    }

    const gainMapImageData = new ImageData(gainMapData, width, height);

    // Construct Metadata
    // We are using a simple encoding where min = 1.0 (0 log2) and max = maxContentBoost.
    // Gamma is 1.0 because we are encoding log2 values linearly into the 0-255 range (conceptually).
    // Actually, UltraHDR spec usually expects the gain map image to be sRGB encoded if gamma is 1.0?
    // Or is the stored image treated as linear values?
    // gainmap-js usually encodes as:
    // Value = ((log2(hdr) - log2(sdr)) - offsetHdr + offsetSdr) / (gainMapMax - gainMapMin)
    // Here: hdr = sdr * boost => log2(hdr) - log2(sdr) = log2(boost)
    // We assume offsetHdr = offsetSdr = 0 (or they cancel out for our simple case).
    // So we are encoding log2(boost).
    // gainMapMin = 0 (log2(1))
    // gainMapMax = log2(maxContentBoost)

    const metadata = {
        gainMapMin: [1.0, 1.0, 1.0],
        gainMapMax: [maxContentBoost, maxContentBoost, maxContentBoost],
        gamma: [1.0, 1.0, 1.0], // We are writing linear log values directly
        offsetSdr: [0, 0, 0],
        offsetHdr: [0, 0, 0],
        hdrCapacityMin: 1.0,
        hdrCapacityMax: maxContentBoost,
        parsedGainMapMin: [0, 0, 0], // gainmap-js internal usage
        parsedGainMapMax: [log2MaxBoost, log2MaxBoost, log2MaxBoost], // gainmap-js internal usage
        parsedGamma: [1.0, 1.0, 1.0], // gainmap-js internal usage
        parsedOffsetSdr: [0, 0, 0], // gainmap-js internal usage
        parsedOffsetHdr: [0, 0, 0], // gainmap-js internal usage
        parsedHdrCapacityMin: 0, // gainmap-js internal usage
        parsedHdrCapacityMax: log2MaxBoost // gainmap-js internal usage
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

    // Initialize WASM encoder
    const encoder = new UHDREncoder();
    await encoder.init();

    try {
        // Compress SDR image to JPEG (base image)
        const sdrJpeg = await compressToJpeg(sdrImageData, quality);

        // Set compressed base image
        encoder.setCompressedBaseImage(sdrJpeg);

        // Compress Gain Map to JPEG
        // libultrahdr expects the gain map to be a compressed JPEG image.
        // We compress it here using the browser's native canvas encoder.
        const gainMapJpeg = await compressToJpeg(gainMapImageData, 0.90);

        // Set gain map image
        // We pass the JPEG data as a flat buffer.
        // The C++ wrapper calculates size as stride * height.
        // We pass width=size, height=1, stride=size to ensure correct buffer allocation.
        encoder.setGainMapImage(
            gainMapJpeg,
            {
                gainMapMin: [1.0, 1.0, 1.0],
                gainMapMax: [maxContentBoost, maxContentBoost, maxContentBoost], // Will be adjusted based on content
                gamma: [1.0, 1.0, 1.0],
                offsetSdr: [0, 0, 0],
                offsetHdr: [0, 0, 0],
                hdrCapacityMin: 1.0,
                hdrCapacityMax: maxContentBoost
            },
            gainMapJpeg.length, // width (used for size calc)
            1 // height
        );

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

            const binary = Array.from(finalJpeg).map(b => String.fromCharCode(b)).join('');
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

/**
 * Compresses ImageData to a JPEG Uint8Array using canvas.
 * @param {ImageData} imageData 
 * @param {number} quality 
 * @returns {Promise<Uint8Array>}
 */
function compressToJpeg(imageData, quality) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas toBlob failed'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                resolve(new Uint8Array(reader.result));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', quality);
    });
}
