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

    // Assume first image is primary
    const primaryImage = data[0];

    // Check for auxiliary images (Gain Map)
    // Inspect ALL top-level images for one attached as an auxiliary image
    let gainMapImageData = null;

    if (!options.discardGainMap) {
        console.log('[HEIC] Searching for Gain Map across', data.length, 'top-level images...');

        for (let imgIdx = 0; imgIdx < data.length; imgIdx++) {
            const currentImg = data[imgIdx];
            const currentHandle = currentImg.handle;

            // Check for auxiliary images on this handle
            let currentAuxCount = 0;
            if (heif.heif_image_handle_get_number_of_auxiliary_images) {
                try {
                    currentAuxCount = heif.heif_image_handle_get_number_of_auxiliary_images(currentHandle, 0);
                } catch (e) {
                    console.warn(`[HEIC] Could not get auxiliary image count for image ${imgIdx}:`, e);
                }
            }

            if (currentAuxCount > 0) {
                try {
                    const idsSize = currentAuxCount * 4;
                    const idsPtr = heif._malloc(idsSize);
                    const count = heif.heif_image_handle_get_list_of_auxiliary_image_IDs(currentHandle, 0, idsPtr, currentAuxCount);
                    const ids = new Int32Array(heif.HEAP32.buffer, idsPtr, count);

                    for (let i = 0; i < count; i++) {
                        const id = ids[i];
                        let auxHandle = null;
                        const auxHandlePtr = heif._malloc(4);
                        const err = heif.heif_image_handle_get_auxiliary_image_handle(currentHandle, id, auxHandlePtr);

                        if (err && err.code !== 0) {
                            heif._free(auxHandlePtr);
                            continue;
                        }
                        const auxHandleVal = heif.getValue(auxHandlePtr, '*');
                        const typePtr = heif.heif_image_handle_get_auxiliary_type(auxHandleVal);
                        const type = heif.UTF8ToString(typePtr);
                        console.log(`[HEIC] Image ${imgIdx} Aux Type:`, type);

                        if (type === 'urn:apple:gainmap' || type === 'urn:google:gainmap' || type === 'urn:com:apple:photo:2020:aux:hdrgainmap') {
                            console.log('[HEIC] Found Gain Map on Image', imgIdx);
                            const auxImage = new heif.HeifImage(auxHandleVal);
                            const w = auxImage.get_width();
                            const h = auxImage.get_height();

                            const canvas = document.createElement('canvas'); // Only works if document/canvas exists (JSDOM/Browser)
                            canvas.width = w;
                            canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            const imageData = ctx.createImageData(w, h);

                            await new Promise((resolve, reject) => {
                                auxImage.display(imageData, (displayData) => {
                                    if (!displayData) reject(new Error('Gain map decoding error'));
                                    else resolve(displayData);
                                });
                            });
                            gainMapImageData = imageData;
                            heif._free(auxHandlePtr);
                            break;
                        }
                        heif.heif_image_handle_release(auxHandleVal);
                        heif._free(auxHandlePtr);
                    }
                    heif._free(idsPtr);
                    if (gainMapImageData) break;

                } catch (e) {
                    console.warn(`[HEIC] Error iterating auxiliary images for image ${imgIdx}:`, e);
                }
            }
        }

        // Fallback: If no gain map found as auxiliary, check if secondary image exists and looks like a gain map
        if (!gainMapImageData && data.length > 1) {
            console.warn('[HEIC] No auxiliary gain map found. Attempting to use secondary image as gain map.');
            const potentialGainMap = data[1]; // Use second image

            // Simple heuristic: If smaller than primary, assume it's gain map (or thumbnail/preview used as gain map)
            if (potentialGainMap.get_width() < primaryImage.get_width()) {
                console.log('[HEIC] Using secondary image (Image 1) as Gain Map candidate.');
                try {
                    const w = potentialGainMap.get_width();
                    const h = potentialGainMap.get_height();

                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    const d = ctx.createImageData(w, h);

                    await new Promise((resolve, reject) => {
                        potentialGainMap.display(d, (res) => {
                            if (!res) reject(new Error('Failed to decode secondary image'));
                            else resolve(res);
                        });
                    });

                    gainMapImageData = d;
                    console.log(`[HEIC] Extracted gain map from secondary image: ${w}x${h}`);

                } catch (err) {
                    console.warn('[HEIC] Failed to decode secondary image as gain map:', err);
                }
            }
        }

    } else if (options.discardGainMap) {
        console.log('[HEIC] Gain map extraction skipped (discardGainMap=true)');
    }

    // Standard SDR Decoding
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

    if (gainMapImageData) {
        console.log('[HEIC] Returning SDR + Gain Map');
        return {
            sdr: imageData,
            gainMap: gainMapImageData,
            name: file.name
        };
    }

    console.log('[HEIC] No gain map found (or discarded), falling back to ITM');
    ctx.putImageData(imageData, 0, 0);
    const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const pngFile = new File([pngBlob], file.name.replace(/\.(heic|heif)$/i, '.png'), { type: 'image/png' });

    return pngFile;
}
