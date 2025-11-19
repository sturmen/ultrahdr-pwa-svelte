import { compress, encode, findTextureMinMax } from '@monogrid/gainmap-js/encode';
import { encodeJPEGMetadata } from '@monogrid/gainmap-js/libultrahdr';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { TextureLoader, SRGBColorSpace, LinearSRGBColorSpace, HalfFloatType, NoColorSpace, Texture, DataTexture, FloatType, RGBAFormat, NoToneMapping, DataUtils } from 'three';
import piexif from 'piexifjs';

/**
 * Processes an image file to create an UltraHDR JPEG.
 * @param {File} file - The input image file.
 * @param {Object} options - Processing options.
 * @param {number} options.maxContentBoost - Max content boost for gain map.
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = { maxContentBoost: 4.0, rotation: 0, quality: 0.95 }) {
    console.log('[Process] Starting processing for:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    const dataUrl = await readFileAsDataURL(file);
    console.log('[Process] File loaded');

    // Extract EXIF
    let exifObj = null;
    try {
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            exifObj = piexif.load(dataUrl);
            console.log('[Process] EXIF extracted');
        }
    } catch (e) {
        console.warn('Could not extract EXIF:', e);
    }

    // Load Image
    const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
    });
    console.log('[Process] Image object created', img.width, 'x', img.height);

    // Handle Rotation and Get Pixel Data
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    let width = img.width;
    let height = img.height;
    let rotation = options.rotation || 0;

    // Normalize rotation to 0, 90, 180, 270
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
    console.log('[Process] Canvas drawn (rotation applied)');

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let rgba = imageData.data;
    console.log('[Process] Image data retrieved');

    // Cleanup canvas immediately
    canvas.width = 1;
    canvas.height = 1;
    canvas = null;
    ctx = null;
    console.log('[Process] Canvas cleaned up');

    // Convert to HalfFloat DataTexture (HDR)
    // We perform Inverse Tone Mapping here by converting sRGB to Linear and applying boost
    const length = rgba.length;
    const uint16 = new Uint16Array(length); // Use Uint16 for HalfFloat
    const maxContentBoost = options.maxContentBoost || 4.0;

    // sRGB to Linear conversion helper
    const toLinear = (v) => {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    for (let i = 0; i < length; i += 4) {
        // RGB: Convert to Linear and Boost
        // We assume the input SDR image represents the "base" layer.
        // To create an HDR target that gainmap-js can use to generate a gain map,
        // we simply boost the linear values.
        // Note: gainmap-js expects the 'image' parameter to be the HDR representation.

        // Use DataUtils.toHalfFloat to convert float to half-float (uint16)
        uint16[i] = DataUtils.toHalfFloat(toLinear(rgba[i]) * maxContentBoost);     // R
        uint16[i + 1] = DataUtils.toHalfFloat(toLinear(rgba[i + 1]) * maxContentBoost); // G
        uint16[i + 2] = DataUtils.toHalfFloat(toLinear(rgba[i + 2]) * maxContentBoost); // B
        uint16[i + 3] = DataUtils.toHalfFloat(rgba[i + 3] / 255); // Alpha
    }
    console.log('[Process] Converted to HalfFloat Uint16Array');

    // We don't need rgba anymore for the HDR texture, but we need it for SDR compression.
    // However, we can't dispose it yet.

    const texture = new DataTexture(uint16, imageData.width, imageData.height, RGBAFormat, HalfFloatType);
    texture.colorSpace = LinearSRGBColorSpace;
    texture.needsUpdate = true;
    console.log('[Process] HDR DataTexture created');

    // Free uint16 array after texture creation (Three.js clones it? No, it uses it by reference usually, but DataTexture might take ownership or we should keep it until upload. 
    // Actually, DataTexture keeps a reference. We can't null it until texture is disposed or uploaded.
    // But we can null the local variable reference.

    // Encode
    // We use NoToneMapping and adjust exposure to ensure the generated SDR matches our original SDR (conceptually).
    // This ensures the Gain Map is calculated relative to a linear scaling of the HDR, which matches our ITM logic.
    const encodingResult = encode({
        image: texture,
        maxContentBoost: maxContentBoost,
        toneMapping: NoToneMapping
    });
    console.log('[Process] gainmap-js encode() called');

    // Adjust SDR renderer exposure to compensate for the boost.
    // HDR = SDR_linear * boost
    // We want SDR_renderer_output = HDR / boost = SDR_linear
    // So exposure = 1 / boost
    encodingResult.sdr.material.exposure = 1.0 / maxContentBoost;
    encodingResult.sdr.material.needsUpdate = true;

    // Render SDR first to ensure texture is ready for GainMap calculation (if dependent)
    // Although gainmap-js might handle this, explicit render is safer when we mess with materials.
    // Actually, we don't need the result of this render for the final file (we use original imageData),
    // but we need it to be correct for the GainMap calculation which likely samples the SDR texture.
    // encodingResult.sdr.render(); // encode() returns a QuadRenderer, render() renders to its target.

    // Create ImageDatas
    // For SDR, we use the ORIGINAL image data to preserve it exactly as requested.
    let sdrImageData = imageData;

    // For GainMap, we use the result from the encoder.
    // We must ensure the gain map is calculated. Calling toArray() triggers render.
    // We serialize this to ensure SDR is rendered before GainMap if there's a dependency.

    // Force SDR render first (by calling toArray, even if we discard it, or just render())
    // encodingResult.sdr.render();
    // But toArray() reads pixels which is slow. render() is fast.
    // Let's assume Promise.all is fine if gainmap-js is well written, BUT to be safe given my manual material tweak:

    // We'll run gainMap compression. This calls toArray() on gainMap renderer.
    // Does gainMap renderer automatically render sdr renderer? Probably not.
    // So we should render sdr first.
    encodingResult.sdr.render();
    console.log('[Process] SDR rendered');

    const gainMapArray = encodingResult.gainMap.toArray();
    console.log('[Process] GainMap toArray() completed');
    let gainMapImageData = new ImageData(
        new Uint8ClampedArray(gainMapArray),
        encodingResult.gainMap.width,
        encodingResult.gainMap.height
    );

    // Cleanup WebGL resources immediately
    encodingResult.gainMap.dispose();
    encodingResult.sdr.dispose();
    texture.dispose();
    console.log('[Process] WebGL resources disposed');

    // Compress
    const mimeType = 'image/jpeg';
    const quality = options.quality || 0.95;

    // Serialize compression to save memory
    // Compress SDR
    console.log('[Process] Starting SDR compression...');
    const sdr = await compress({
        source: sdrImageData, // Use ORIGINAL SDR
        mimeType,
        quality,
        flipY: false // Explicitly false as requested
    });
    console.log('[Process] SDR compression complete');

    // Release SDR data
    sdrImageData = null;
    rgba = null;
    imageData = null;
    console.log('[Process] SDR data released');

    // Compress GainMap
    console.log('[Process] Starting GainMap compression...');
    const gainMap = await compress({
        source: gainMapImageData,
        mimeType,
        quality,
        flipY: false // Explicitly false as requested (user said removing it fixed the issue)
    });
    console.log('[Process] GainMap compression complete');

    // Release GainMap data
    gainMapImageData = null;

    // Get Metadata
    const metadata = encodingResult.getMetadata();

    // Embed Metadata and Images
    console.log('[Process] Embedding metadata...');
    const jpegUint8Array = await encodeJPEGMetadata({
        ...encodingResult,
        ...metadata,
        sdr,
        gainMap
    });
    console.log('[Process] Metadata embedded');

    // Re-insert EXIF if it existed
    let finalJpeg = jpegUint8Array;
    if (exifObj) {
        try {
            // Reset Orientation to 1 (Normal)
            if (exifObj["0th"] && exifObj["0th"][piexif.ImageIFD.Orientation]) {
                exifObj["0th"][piexif.ImageIFD.Orientation] = 1;
            }
            // Remove thumbnail to save space/avoid conflicts? Optional.
            // delete exifObj["thumbnail"];

            const binary = Array.from(finalJpeg).map(b => String.fromCharCode(b)).join('');
            const exifBytes = piexif.dump(exifObj);
            const newBinary = piexif.insert(exifBytes, binary);

            const len = newBinary.length;
            finalJpeg = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                finalJpeg[i] = newBinary.charCodeAt(i);
            }
            console.log('[Process] EXIF re-inserted');
        } catch (e) {
            console.warn('Could not re-insert EXIF:', e);
        }
    }

    console.log('[Process] Processing complete, returning Blob');
    return new Blob([finalJpeg], { type: 'image/jpeg' });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
