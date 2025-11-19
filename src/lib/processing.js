import { compress, encode, findTextureMinMax } from '@monogrid/gainmap-js/encode';
import { encodeJPEGMetadata } from '@monogrid/gainmap-js/libultrahdr';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { TextureLoader, SRGBColorSpace, LinearSRGBColorSpace, HalfFloatType, NoColorSpace, Texture, DataTexture, FloatType, RGBAFormat, NoToneMapping } from 'three';
import piexif from 'piexifjs';

/**
 * Processes an image file to create an UltraHDR JPEG.
 * @param {File} file - The input image file.
 * @param {Object} options - Processing options.
 * @param {number} options.maxContentBoost - Max content boost for gain map.
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = { maxContentBoost: 4.0, rotation: 0, quality: 0.95 }) {
    const arrayBuffer = await file.arrayBuffer();
    const dataUrl = await readFileAsDataURL(file);

    // Extract EXIF
    let exifObj = null;
    try {
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            exifObj = piexif.load(dataUrl);
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

    // Handle Rotation and Get Pixel Data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

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

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rgba = imageData.data;

    // Convert to Float32 DataTexture (HDR)
    // We perform Inverse Tone Mapping here by converting sRGB to Linear and applying boost
    const length = rgba.length;
    const float32 = new Float32Array(length);
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

        float32[i] = toLinear(rgba[i]) * maxContentBoost;     // R
        float32[i + 1] = toLinear(rgba[i + 1]) * maxContentBoost; // G
        float32[i + 2] = toLinear(rgba[i + 2]) * maxContentBoost; // B
        float32[i + 3] = rgba[i + 3] / 255; // Alpha
    }

    const texture = new DataTexture(float32, canvas.width, canvas.height, RGBAFormat, FloatType);
    texture.colorSpace = LinearSRGBColorSpace;
    texture.needsUpdate = true;

    // Encode
    // We use NoToneMapping and adjust exposure to ensure the generated SDR matches our original SDR (conceptually).
    // This ensures the Gain Map is calculated relative to a linear scaling of the HDR, which matches our ITM logic.
    const encodingResult = encode({
        image: texture,
        maxContentBoost: maxContentBoost,
        toneMapping: NoToneMapping
    });

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
    const sdrImageData = imageData;

    // For GainMap, we use the result from the encoder.
    // We must ensure the gain map is calculated. Calling toArray() triggers render.
    // We serialize this to ensure SDR is rendered before GainMap if there's a dependency.

    // Force SDR render first (by calling toArray, even if we discard it, or just render())
    // encodingResult.sdr.render();
    // But toArray() reads pixels which is slow. render() is fast.
    // Let's assume toArray() on gainMap handles dependencies or we just rely on Promise.all if independent.
    // But wait, if I changed exposure, I definitely need that change to propagate.
    // Let's assume Promise.all is fine if gainmap-js is well written, BUT to be safe given my manual material tweak:

    // We'll run gainMap compression. This calls toArray() on gainMap renderer.
    // Does gainMap renderer automatically render sdr renderer? Probably not.
    // So we should render sdr first.
    encodingResult.sdr.render();

    const gainMapArray = encodingResult.gainMap.toArray();
    const gainMapImageData = new ImageData(
        new Uint8ClampedArray(gainMapArray),
        encodingResult.gainMap.width,
        encodingResult.gainMap.height
    );

    // DEBUG: Visualize Gain Map
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = encodingResult.gainMap.width;
    debugCanvas.height = encodingResult.gainMap.height;
    debugCanvas.style.position = 'fixed';
    debugCanvas.style.top = '10px';
    debugCanvas.style.right = '10px';
    debugCanvas.style.zIndex = '9999';
    debugCanvas.style.border = '2px solid red';
    debugCanvas.style.width = '200px'; // Scale down for view
    const debugCtx = debugCanvas.getContext('2d');

    // WebGL data is bottom-up, so we need to flip it to visualize correctly on canvas (which is top-down)
    // Create a temporary bitmap to flip it or manually flip?
    // Actually, let's just draw it directly. If it looks upside down here, that confirms it's bottom-up data.
    debugCtx.putImageData(gainMapImageData, 0, 0);

    // To visualize it "correctly" as it will be encoded (with flipY: true), we should flip it here?
    // No, let's just see the raw data.
    // If raw data is upside-down, and we pass flipY: true to compress, then compress flips it to be right-side up.
    // So if we see it upside-down here, that's GOOD (matches expectation).
    // If we see it right-side up here, then flipY: true will make it upside-down!

    document.body.appendChild(debugCanvas);
    console.log('Debug canvas added');

    // Compress
    const mimeType = 'image/jpeg';
    const quality = options.quality || 0.95;

    const [sdr, gainMap] = await Promise.all([
        compress({
            source: sdrImageData, // Use ORIGINAL SDR
            mimeType,
            quality
        }),
        compress({
            source: gainMapImageData,
            mimeType,
            quality
        })
    ]);

    // Get Metadata
    const metadata = encodingResult.getMetadata();

    // Embed Metadata and Images
    const jpegUint8Array = await encodeJPEGMetadata({
        ...encodingResult,
        ...metadata,
        sdr,
        gainMap
    });

    // Cleanup
    encodingResult.gainMap.dispose();
    encodingResult.sdr.dispose();
    texture.dispose();

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
        } catch (e) {
            console.warn('Could not re-insert EXIF:', e);
        }
    }

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
