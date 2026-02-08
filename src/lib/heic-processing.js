import libheifFactory from 'libheif-js/libheif-wasm/libheif.js';
import { readFileAsDataURL } from './processing.js';
import piexif from 'piexifjs';

let libheif = null;

async function initLibHeif() {
    if (libheif) return libheif;
    console.log('[HEIC] Initializing libheif...');

    // Manually fetch the WASM binary to avoid sync fetching issues
    const wasmUrl = (import.meta.env.BASE_URL || '/') + 'assets/libheif.wasm';
    console.log('[HEIC] Fetching WASM from:', wasmUrl);

    const response = await fetch(wasmUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch libheif WASM: ${response.statusText}`);
    }
    const wasmBinary = await response.arrayBuffer();

    libheif = await libheifFactory({
        wasmBinary,
        // We don't need locateFile if we provide wasmBinary, but keeping it harmless
        locateFile: (path) => {
            if (path.endsWith('.wasm')) {
                return wasmUrl;
            }
            return path;
        }
    });
    console.log('[HEIC] libheif initialized');
    return libheif;
}

export async function processHeic(file, options = { quality: 0.95, discardGainMap: false }) {
    console.log('[HEIC] Processing HEIC file:', file.name);
    const heif = await initLibHeif();
    const arrayBuffer = await file.arrayBuffer();

    const decoder = new heif.HeifDecoder();
    const data = decoder.decode(arrayBuffer);

    if (!data || data.length === 0) {
        throw new Error('No images found in HEIC file');
    }

    console.log('[HEIC] Found', data.length, 'top-level images');

    // Log all images to see if gain map is exposed as top-level
    for (let i = 0; i < data.length; i++) {
        console.log(`[HEIC] Image ${i}:`, data[i].get_width(), 'x', data[i].get_height());
    }

    // Assume first image is primary
    const primaryImage = data[0];
    const handle = primaryImage.handle;

    // Check for auxiliary images (Gain Map)
    // 0 = all auxiliary images
    let auxCount = 0;
    if (heif.heif_image_handle_get_number_of_auxiliary_images) {
        try {
            auxCount = heif.heif_image_handle_get_number_of_auxiliary_images(handle, 0);
            console.log('[HEIC] Auxiliary images count:', auxCount);
        } catch (e) {
            console.warn('[HEIC] Could not get auxiliary image count:', e);
        }
    } else {
        console.warn('[HEIC] heif_image_handle_get_number_of_auxiliary_images not available');
    }

    let gainMapHandle = null;
    let gainMapImageData = null;

    // ... (Gain map extraction logic would go here)
    // ... (Gain map extraction logic)
    if (auxCount > 0 && !options.discardGainMap) {
        try {
            // Get list of auxiliary image IDs
            const idsSize = auxCount * 4; // 4 bytes per ID (int)
            const idsPtr = heif._malloc(idsSize);

            const count = heif.heif_image_handle_get_list_of_auxiliary_image_IDs(handle, 0, idsPtr, auxCount);
            console.log('[HEIC] Got', count, 'auxiliary IDs');

            const ids = new Int32Array(heif.HEAP32.buffer, idsPtr, count);

            for (let i = 0; i < count; i++) {
                const id = ids[i];
                // Get handle for this aux image
                let auxHandle = null;
                const auxHandlePtr = heif._malloc(4); // Pointer to pointer

                const err = heif.heif_image_handle_get_auxiliary_image_handle(handle, id, auxHandlePtr);

                if (err && err.code !== 0) {
                    console.warn('[HEIC] Failed to get aux handle for ID', id, err);
                    heif._free(auxHandlePtr);
                    continue;
                }

                // Get the handle value from the pointer
                const auxHandleVal = heif.getValue(auxHandlePtr, '*'); // Pointer type

                // Now check type
                const typePtr = heif.heif_image_handle_get_auxiliary_type(auxHandleVal);
                const type = heif.UTF8ToString(typePtr);
                console.log('[HEIC] Aux Image Type:', type);

                if (type === 'urn:apple:gainmap' || type === 'urn:google:gainmap') {
                    console.log('[HEIC] Found Gain Map!');

                    // Decode this aux image
                    const auxImage = new heif.HeifImage(auxHandleVal);

                    const w = auxImage.get_width();
                    const h = auxImage.get_height();
                    console.log('[HEIC] Gain Map Size:', w, 'x', h);

                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    const imageData = ctx.createImageData(w, h);

                    await new Promise((resolve, reject) => {
                        auxImage.display(imageData, (displayData) => {
                            if (!displayData) {
                                reject(new Error('Gain map decoding error'));
                            } else {
                                resolve(displayData);
                            }
                        });
                    });

                    gainMapImageData = imageData;

                    heif._free(auxHandlePtr);
                    break;
                }

                // Release aux handle if not used
                heif.heif_image_handle_release(auxHandleVal);
                heif._free(auxHandlePtr);
            }

            heif._free(idsPtr);

        } catch (e) {
            console.warn('[HEIC] Error iterating auxiliary images:', e);
        }
    } else if (options.discardGainMap) {
        console.log('[HEIC] Gain map extraction skipped (discardGainMap=true)');
    }

    // Standard Decoding (Fallback / Default)
    // Decode HEIC -> ImageData -> PNG File -> processImage (ITM)

    // To decode to ImageData:
    const w = primaryImage.get_width();
    const h = primaryImage.get_height();

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);

    await new Promise((resolve, reject) => {
        primaryImage.display(imageData, (displayData) => {
            if (!displayData) {
                reject(new Error('HEIF processing error'));
            } else {
                resolve(displayData);
            }
        });
    });

    // Now we have ImageData.
    // If we want to preserve the gain map, we need to extract it.
    // If we can't, we'll just use this ImageData as input to the standard processImage function.
    // But processImage expects a File object.
    // I can create a synthetic File or modify processImage to accept ImageData/Blob.
    // Or I can just convert this ImageData to a PNG/JPEG Blob and pass it to processImage.
    // Converting to PNG is lossless but slow.

    // Better: Modify processImage to accept 'imageSource' which can be File or ImageData/Image.
    // But processImage does a lot of setup (EXIF, loading).

    // Let's try to extract the gain map.
    // If I can't, I'll just return the decoded image as a standard JPEG (SDR) and let the user know?
    // No, the user wants UltraHDR.
    // So if I can't extract the gain map, I should generate one (ITM).

    // So the plan:
    // 1. Decode HEIC to ImageData.
    // 2. Pass to standard pipeline (which generates gain map).
    // 3. (Future/Advanced) Extract existing gain map if possible.

    // Given the complexity of Emscripten C API without docs, I'll start with the fallback (ITM) to ensure basic HEIC support.
    // I'll add a TODO/Log for gain map extraction.

    // If we found a gain map, return structured data
    if (gainMapImageData) {
        console.log('[HEIC] Returning SDR + Gain Map');
        return {
            sdr: imageData,
            gainMap: gainMapImageData,
            name: file.name
        };
    }

    // Fallback: Return PNG File (ITM)
    console.log('[HEIC] No gain map found (or discarded), falling back to ITM');
    ctx.putImageData(imageData, 0, 0);
    const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const pngFile = new File([pngBlob], file.name.replace(/\.(heic|heif)$/i, '.png'), { type: 'image/png' });

    // Call standard processImage with the converted PNG
    // This will use ITM to generate a NEW gain map.
    // This satisfies "Support HEIC input" but misses "Reuse input gain map".
    // I will notify the user about this limitation if I can't implement it now.

    // However, I should try to get the ICC profile at least.
    // heif_image_handle_get_raw_color_profile(handle, profile_type)
    // profile_type: heif_color_profile_type_prof = 1 (ICC)

    return pngFile;
}
