import { compress, encode } from '@monogrid/gainmap-js/encode';
import { encodeJPEGMetadata } from '@monogrid/gainmap-js/libultrahdr';
import { LinearSRGBColorSpace, HalfFloatType, DataTexture, RGBAFormat, NoToneMapping, DataUtils } from 'three';
import piexif from 'piexifjs';

import { processHeic } from './heic-processing.js';
import { processTiff } from './tiff-processing.js';

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
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = { maxContentBoost: 4.0, rotation: 0, quality: 0.95, discardGainMap: false, stripExif: false, highlightExponent: 3.0 }) {
    console.log('[Process] Starting processing for:', file.name);

    // 1. Preprocess (HEIC/TIFF conversion)
    file = await preprocessFile(file, options);

    // 2. Load Data & EXIF
    const dataUrl = await readFileAsDataURL(file);
    const exifObj = extractExif(file, dataUrl);
    console.log('[Process] File loaded and EXIF extracted');

    // 3. Load Image Data (Canvas/Rotation)
    const { imageData } = await loadImageData(dataUrl, options.rotation);
    console.log('[Process] Image data retrieved');

    // 4. Generate HDR Texture (ITM)
    const { texture, maxContentBoost } = generateHdrTexture(imageData, options);
    console.log('[Process] HDR DataTexture created');

    // 5. Generate Gain Map
    const { gainMapImageData, encodingResult } = await generateGainMap(texture, maxContentBoost);
    console.log('[Process] GainMap generated');

    // 6. Compress Images
    const { sdr, gainMap } = await compressImages(imageData, gainMapImageData, options.quality);
    console.log('[Process] Compression complete');

    // 7. Finalize UltraHDR
    const blob = await finalizeUltraHDR(encodingResult, sdr, gainMap, exifObj, options.stripExif);
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
 * Generates an HDR DataTexture from SDR ImageData using Inverse Tone Mapping.
 * @param {ImageData} imageData 
 * @param {Object} options 
 * @returns {{texture: DataTexture, maxContentBoost: number}}
 */
function generateHdrTexture(imageData, options) {
    const rgba = imageData.data;
    const length = rgba.length;
    const uint16 = new Uint16Array(length);
    const maxContentBoost = options.maxContentBoost || 4.0;
    const highlightExponent = options.highlightExponent !== undefined ? options.highlightExponent : 3.0;

    // sRGB to Linear conversion helper
    const toLinear = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    for (let i = 0; i < length; i += 4) {
        const rLin = toLinear(rgba[i]);
        const gLin = toLinear(rgba[i + 1]);
        const bLin = toLinear(rgba[i + 2]);

        // Apply Per-Channel Boost
        const rBoost = 1 + (maxContentBoost - 1) * Math.pow(rLin, highlightExponent);
        const gBoost = 1 + (maxContentBoost - 1) * Math.pow(gLin, highlightExponent);
        const bBoost = 1 + (maxContentBoost - 1) * Math.pow(bLin, highlightExponent);

        uint16[i] = DataUtils.toHalfFloat(rLin * rBoost);     // R
        uint16[i + 1] = DataUtils.toHalfFloat(gLin * gBoost); // G
        uint16[i + 2] = DataUtils.toHalfFloat(bLin * bBoost); // B
        uint16[i + 3] = DataUtils.toHalfFloat(rgba[i + 3] / 255); // Alpha
    }

    const texture = new DataTexture(uint16, imageData.width, imageData.height, RGBAFormat, HalfFloatType);
    texture.colorSpace = LinearSRGBColorSpace;
    texture.needsUpdate = true;

    return { texture, maxContentBoost };
}

/**
 * Generates the Gain Map using monogrid/gainmap-js.
 * @param {DataTexture} texture - The HDR texture.
 * @param {number} maxContentBoost 
 * @returns {Promise<{gainMapImageData: ImageData, encodingResult: Object}>}
 */
async function generateGainMap(texture, maxContentBoost) {
    const encodingResult = encode({
        image: texture,
        maxContentBoost: maxContentBoost,
        toneMapping: NoToneMapping
    });

    // Adjust SDR renderer exposure
    encodingResult.sdr.material.exposure = 1.0 / maxContentBoost;
    encodingResult.sdr.material.needsUpdate = true;

    // Render SDR first (needed for correct gain map calculation context sometimes)
    encodingResult.sdr.render();

    // Get Gain Map data
    const gainMapArray = encodingResult.gainMap.toArray();
    const gainMapImageData = new ImageData(
        new Uint8ClampedArray(gainMapArray),
        encodingResult.gainMap.width,
        encodingResult.gainMap.height
    );

    // Cleanup WebGL resources
    encodingResult.gainMap.dispose();
    encodingResult.sdr.dispose();
    texture.dispose();

    return { gainMapImageData, encodingResult };
}

/**
 * Compresses the SDR and Gain Map images to JPEG.
 * @param {ImageData} sdrImageData 
 * @param {ImageData} gainMapImageData 
 * @param {number} quality 
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
async function compressImages(sdrImageData, gainMapImageData, quality) {
    const mimeType = 'image/jpeg';

    const sdr = await compress({
        source: sdrImageData,
        mimeType,
        quality
    });

    const gainMap = await compress({
        source: gainMapImageData,
        mimeType,
        quality
    });

    return { sdr, gainMap };
}

/**
 * Embeds metadata and finalizes the UltraHDR JPEG.
 * @param {Object} encodingResult 
 * @param {Uint8Array} sdr 
 * @param {Uint8Array} gainMap 
 * @param {Object|null} exifObj 
 * @param {boolean} stripExif 
 * @returns {Promise<Blob>}
 */
async function finalizeUltraHDR(encodingResult, sdr, gainMap, exifObj, stripExif) {
    const metadata = encodingResult.getMetadata();

    const jpegUint8Array = await encodeJPEGMetadata({
        ...encodingResult,
        ...metadata,
        sdr,
        gainMap
    });

    let finalJpeg = jpegUint8Array;

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
