import libheifFactory from 'libheif-js/libheif-wasm/libheif.js';

let libheif = null;
const APP_ASSET_VERSION = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
    : '';

function appendVersionQuery(url) {
    if (!APP_ASSET_VERSION) {
        return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(APP_ASSET_VERSION)}`;
}

async function initLibHeif() {
    if (libheif) return libheif;
    console.log('[HEIC] Initializing libheif...');

    // Manually fetch the WASM binary to avoid sync fetching issues
    const wasmUrl = appendVersionQuery((import.meta.env.BASE_URL || '/') + 'assets/libheif.wasm');
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
    const gainMapHeadroom = _extractHdrGainMapHeadroomFromArrayBuffer(arrayBuffer);
    if (gainMapHeadroom !== null) {
        console.log(`[HEIC] Detected HDR gain-map headroom from source metadata: ${gainMapHeadroom}`);
    }

    const decoder = new heif.HeifDecoder();
    const data = decoder.decode(arrayBuffer);

    if (!data || data.length === 0) {
        throw new Error('No images found in HEIC file');
    }

    console.log('[HEIC] Found', data.length, 'top-level images');

    // Detect spatial/stereoscopic images (multiple top-level images with similar dimensions)
    const primaryImage = data[0];
    const primaryW = primaryImage.get_width();
    const primaryH = primaryImage.get_height();

    if (data.length > 1) {
        const secondaryW = data[1].get_width();
        const secondaryH = data[1].get_height();
        const isSpatial = (secondaryW === primaryW && secondaryH === primaryH);
        if (isSpatial) {
            console.log(`[HEIC] Spatial/stereoscopic image detected: ${data.length} top-level images of ${primaryW}x${primaryH}`);
        } else {
            console.log(`[HEIC] Multiple top-level images: primary ${primaryW}x${primaryH}, secondary ${secondaryW}x${secondaryH}`);
        }
    }

    let gainMapImageData = null;

    if (!options.discardGainMap) {
        const topLevelIds = _getTopLevelImageIds(heif, decoder);

        // Primary path for iPhone HEIF: gain map stored as a hidden image item.
        gainMapImageData = await _extractIphoneHiddenGainMapItem(
            heif,
            decoder,
            topLevelIds,
            primaryW,
            primaryH
        );

        // Secondary path: standard auxiliary-image relationship API.
        if (!gainMapImageData) {
            gainMapImageData = await _extractViaAuxiliaryApi(
                heif,
                decoder,
                topLevelIds,
                primaryW,
                primaryH
            );
        }

        if (!gainMapImageData) {
            console.log('[HEIC] No native gain map found via iPhone item path or auxiliary API. Will fall through to ITM generation.');
        }

    } else {
        console.log('[HEIC] Gain map extraction skipped (discardGainMap=true)');
    }

    // Standard SDR Decoding (always decode the primary/first image)
    const canvas = document.createElement('canvas');
    canvas.width = primaryW;
    canvas.height = primaryH;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(primaryW, primaryH);

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
        console.log('[HEIC] Returning SDR + Gain Map (gain map will be preserved through pipeline)');
        return {
            sdr: imageData,
            gainMap: gainMapImageData,
            gainMapHeadroom,
            name: file.name
        };
    }

    console.log('[HEIC] No gain map found (or discarded), falling back to ITM');
    ctx.putImageData(imageData, 0, 0);
    const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const pngFile = new File([pngBlob], file.name.replace(/\.(heic|heif)$/i, '.png'), { type: 'image/png' });

    return pngFile;
}

function _extractHdrGainMapHeadroomFromArrayBuffer(arrayBuffer) {
    try {
        const text = new TextDecoder('latin1').decode(arrayBuffer);
        const match = text.match(/<HDRGainMap:HDRGainMapHeadroom>\s*([0-9.+\-eE]+)\s*<\/HDRGainMap:HDRGainMapHeadroom>/i)
            || text.match(/HDRGainMapHeadroom="([0-9.+\-eE]+)"/i);

        if (!match) {
            return null;
        }

        const headroom = Number.parseFloat(match[1]);
        if (!Number.isFinite(headroom) || headroom <= 0) {
            return null;
        }

        return headroom;
    } catch {
        return null;
    }
}

/**
 * Check if an ImageData gain map is monochrome (R ≈ G ≈ B).
 * Apple gain maps are 8-bit grayscale. If the image has significant
 * color variance, it may be a stereoscopic pair or other non-gain-map image.
 * @param {ImageData} imageData
 * @param {number} tolerance - Max per-pixel channel difference allowed
 * @returns {boolean}
 */
function _isGainMapMonochrome(imageData, tolerance = 10) {
    const { data, width, height } = imageData;
    const pixelCount = width * height;
    const step = Math.max(1, Math.floor(pixelCount / 500)); // Sample ~500 pixels
    let colorPixelCount = 0;

    for (let i = 0; i < pixelCount; i += step) {
        const idx = i * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
        if (diff > tolerance) {
            colorPixelCount++;
        }
    }

    const sampledCount = Math.ceil(pixelCount / step);
    const colorRatio = colorPixelCount / sampledCount;
    return colorRatio < 0.05; // Less than 5% of sampled pixels have color
}

function _getTopLevelImageIds(heif, decoder) {
    try {
        const ids = heif.heif_js_context_get_list_of_top_level_image_IDs(decoder.decoder);
        if (Array.isArray(ids) && ids.length > 0) {
            return ids;
        }
    } catch (e) {
        console.warn('[HEIC] Could not read top-level image IDs via JS helper:', e);
    }

    // Fallback to decode order when IDs are unavailable.
    return [];
}

function _isHeifHandle(obj) {
    return !!obj && obj.constructor && obj.constructor.name === 'heif_image_handle';
}

async function _decodeHandleToImageData(heif, handle) {
    const w = heif.heif_image_handle_get_width(handle);
    const h = heif.heif_image_handle_get_height(handle);
    const heifImage = new heif.HeifImage(handle);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);

    await new Promise((resolve, reject) => {
        heifImage.display(imageData, (displayData) => {
            if (!displayData) reject(new Error('HEIF image decoding error'));
            else resolve(displayData);
        });
    });

    return imageData;
}

async function _extractIphoneHiddenGainMapItem(heif, decoder, topLevelIds, primaryW, primaryH) {
    const maxTopLevelId = topLevelIds.length ? Math.max(...topLevelIds) : 0;
    // iPhone files often place auxiliary/derived image items shortly after top-level IDs.
    const maxProbeId = Math.max(maxTopLevelId + 256, 512);
    const topLevelSet = new Set(topLevelIds);
    const primaryArea = primaryW * primaryH;
    const primaryAspect = primaryW / primaryH;

    let best = null;

    for (let itemId = 1; itemId <= maxProbeId; itemId++) {
        if (topLevelSet.has(itemId)) {
            continue;
        }

        let handle;
        try {
            handle = heif.heif_js_context_get_image_handle(decoder.decoder, itemId);
        } catch {
            continue;
        }

        if (!_isHeifHandle(handle)) {
            continue;
        }

        try {
            const w = heif.heif_image_handle_get_width(handle);
            const h = heif.heif_image_handle_get_height(handle);
            const area = w * h;

            // Keep only large, primary-aspect candidates to avoid thumbnails/depth maps.
            if (w >= primaryW || h >= primaryH) continue;
            if (area < primaryArea * 0.15) continue;

            const aspect = w / h;
            const aspectDelta = Math.abs(aspect - primaryAspect);
            if (aspectDelta > 0.08) continue;

            const halfWDelta = Math.abs((w / primaryW) - 0.5);
            const halfHDelta = Math.abs((h / primaryH) - 0.5);
            const halfScalePenalty = halfWDelta + halfHDelta;
            const score = area - (halfScalePenalty * primaryArea);

            if (!best || score > best.score) {
                if (best && best.handle) {
                    heif.heif_image_handle_release(best.handle);
                }
                best = { itemId, w, h, score, handle };
            } else {
                heif.heif_image_handle_release(handle);
            }
        } catch {
            heif.heif_image_handle_release(handle);
        }
    }

    if (!best) {
        return null;
    }

    try {
        const imageData = await _decodeHandleToImageData(heif, best.handle);
        if (!_isGainMapMonochrome(imageData)) {
            console.warn(`[HEIC] Hidden image item ${best.itemId} matched iPhone gain-map geometry but decoded with color. Rejecting.`);
            return null;
        }
        console.log(`[HEIC] ✓ Extracted iPhone hidden gain map item ID ${best.itemId}: ${best.w}x${best.h}`);
        return imageData;
    } catch (e) {
        console.warn(`[HEIC] Failed to decode hidden gain map item ${best.itemId}:`, e);
        return null;
    } finally {
        heif.heif_image_handle_release(best.handle);
    }
}

async function _extractViaAuxiliaryApi(heif, decoder, topLevelIds, primaryW, primaryH) {
    console.log('[HEIC] Searching for gain map via auxiliary image API...');
    const ctx = decoder.decoder;
    if (!topLevelIds.length) {
        return null;
    }
    const ids = topLevelIds;

    for (let imgIdx = 0; imgIdx < ids.length; imgIdx++) {
        const imageId = ids[imgIdx];
        let handle = null;

        try {
            handle = topLevelIds.length
                ? heif.heif_js_context_get_image_handle(ctx, imageId)
                : null;

            if (!_isHeifHandle(handle)) {
                continue;
            }

            const auxCount = heif.heif_image_handle_get_number_of_auxiliary_images(handle, null);
            const depthCount = heif.heif_image_handle_get_number_of_depth_images(handle);
            if (depthCount > 0) {
                console.log(`[HEIC] Image ${imgIdx} (ID ${imageId}): ${depthCount} depth image(s)`);
            }
            if (auxCount <= 0) {
                continue;
            }

            const auxIdsPtr = heif._malloc(auxCount * 4);
            try {
                const auxIdCount = heif.heif_image_handle_get_list_of_auxiliary_image_IDs(
                    handle,
                    null,
                    auxIdsPtr,
                    auxCount
                );
                const auxIds = new Int32Array(heif.HEAP32.buffer, auxIdsPtr, auxIdCount);

                for (let i = 0; i < auxIdCount; i++) {
                    const auxId = auxIds[i];
                    const auxHandle = heif.heif_js_context_get_image_handle(ctx, auxId);
                    if (!_isHeifHandle(auxHandle)) {
                        continue;
                    }

                    try {
                        const gmW = heif.heif_image_handle_get_width(auxHandle);
                        const gmH = heif.heif_image_handle_get_height(auxHandle);
                        if (gmW > primaryW || gmH > primaryH) {
                            continue;
                        }

                        const imageData = await _decodeHandleToImageData(heif, auxHandle);
                        if (_isGainMapMonochrome(imageData)) {
                            console.log(`[HEIC] ✓ Extracted gain map via auxiliary API (ID ${auxId}): ${gmW}x${gmH}`);
                            return imageData;
                        }
                    } finally {
                        heif.heif_image_handle_release(auxHandle);
                    }
                }
            } finally {
                heif._free(auxIdsPtr);
            }
        } catch (e) {
            console.warn(`[HEIC] Auxiliary API extraction failed for top-level image ${imageId}:`, e);
        } finally {
            if (_isHeifHandle(handle)) {
                heif.heif_image_handle_release(handle);
            }
        }
    }

    return null;
}
