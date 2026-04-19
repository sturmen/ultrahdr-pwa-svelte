import libheifFactory from './libheif-browser.js';
import {
    extractHdrGainMapHeadroomFromBuffer,
    parseHdrGainMapMetadataFromBuffer,
} from './gain-map-metadata.js';
import { processHeifHdr } from './heif-hdr-processing.js';
import type { DecodedRasterImage, HdrIntentHeifResult, PreservedHeifResult } from './processing-types.ts';

interface HeifImageHandle {
    constructor?: {
        name?: string;
    };
}

interface HeifImageLike {
    handle: HeifImageHandle;
    get_width(): number;
    get_height(): number;
    display(imageData: ImageData, callback: (displayData: ImageData | null) => void): void;
    free?(): void;
}

interface HeifDecoderInstance {
    decoder: unknown;
    decode(buffer: ArrayBuffer): HeifImageLike[];
}

interface HeifDecoderConstructor {
    new (): HeifDecoderInstance;
}

interface HeifInterleavedChannel {
    id: number;
    data: Uint8Array;
    width?: number;
    height?: number;
    stride?: number;
    bits_per_pixel?: number | string;
}

interface HeifDecodeResult {
    code?: number;
    channels?: HeifInterleavedChannel[];
    image?: unknown;
}

interface LibHeifModule {
    HeifDecoder: HeifDecoderConstructor;
    heif_js_decode_image2(
        handle: HeifImageHandle,
        colorspace: number,
        chroma: number,
    ): HeifDecodeResult;
    heif_colorspace: {
        heif_colorspace_RGB: number;
    };
    heif_chroma: {
        heif_chroma_interleaved_RGBA: number;
    };
    heif_channel: {
        heif_channel_interleaved: number;
    };
    heif_js_context_get_list_of_top_level_image_IDs(decoder: unknown): number[];
    heif_js_context_get_image_handle(ctx: unknown, itemId: number): HeifImageHandle | null;
    heif_image_handle_get_width(handle: HeifImageHandle): number;
    heif_image_handle_get_height(handle: HeifImageHandle): number;
    heif_image_handle_release(handle: HeifImageHandle): void;
    heif_image_release?(image: unknown): void;
    heif_context_free?(context: unknown): void;
    heif_image_handle_get_number_of_auxiliary_images(handle: HeifImageHandle, type: null): number;
    heif_image_handle_get_number_of_depth_images(handle: HeifImageHandle): number;
    heif_image_handle_get_list_of_auxiliary_image_IDs(
        handle: HeifImageHandle,
        type: null,
        auxIdsPtr: number,
        auxCount: number,
    ): number;
    heif_image_handle_get_number_of_thumbnails?(handle: HeifImageHandle): number;
    heif_image_handle_get_list_of_thumbnail_IDs?(
        handle: HeifImageHandle,
        idsPtr: number,
        count: number,
    ): number;
    _malloc(size: number): number;
    _free(ptr: number): void;
    HEAP32: Int32Array;
}

type HeicProcessOptions = {
    quality?: number;
    discardGainMap?: boolean;
};

type DecodedRgbaImageData = DecodedRasterImage;
type GainMapImageData = PreservedHeifResult['gainMap'];
type HeicProcessResult = DecodedRgbaImageData | HdrIntentHeifResult | PreservedHeifResult;

let libheif: LibHeifModule | null = null;
const APP_ASSET_VERSION = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
    : '';

function appendVersionQuery(url: string): string {
    if (!APP_ASSET_VERSION) {
        return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(APP_ASSET_VERSION)}`;
}

async function initLibHeif(): Promise<LibHeifModule> {
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
    }) as LibHeifModule;
    console.log('[HEIC] libheif initialized');
    return libheif;
}

function findNclxColorInfo(bytes: Uint8Array): { primaries: number; transfer: number } | null {
    if (!(bytes instanceof Uint8Array) || bytes.length < 12) {
        return null;
    }
    for (let i = 0; i <= bytes.length - 11; i++) {
        if (
            bytes[i] === 0x6e && bytes[i + 1] === 0x63 &&
            bytes[i + 2] === 0x6c && bytes[i + 3] === 0x78
        ) {
            return {
                primaries: (bytes[i + 4] << 8) | bytes[i + 5],
                transfer: (bytes[i + 6] << 8) | bytes[i + 7],
            };
        }
    }
    return null;
}

function isSupportedRawHdrHeif(bytes: Uint8Array): boolean {
    const nclx = findNclxColorInfo(bytes);
    return !!nclx && nclx.primaries === 9 && (nclx.transfer === 16 || nclx.transfer === 18);
}

export async function processHeic(
    file: File,
    options: HeicProcessOptions = { quality: 0.95, discardGainMap: false },
): Promise<HeicProcessResult> {
    console.log('[HEIC] Processing HEIC file:', file.name);
    const heif = await initLibHeif();
    const arrayBuffer = await file.arrayBuffer();
    const sourceBytes = new Uint8Array(arrayBuffer);
    const gainMapMetadata = parseHdrGainMapMetadataFromBuffer(sourceBytes);
    const gainMapHeadroom = extractHdrGainMapHeadroomFromBuffer(sourceBytes);
    if (gainMapHeadroom !== null) {
        console.log(`[HEIC] Detected HDR gain-map headroom from source metadata: ${gainMapHeadroom}`);
    }
    if (gainMapMetadata) {
        console.log('[HEIC] Detected full HDR gain-map metadata from source metadata.');
    }

    const decoder = new heif.HeifDecoder();
    let data: HeifImageLike[] | null = null;
    try {
        data = decoder.decode(arrayBuffer);

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

        if (gainMapImageData) {
            const sdrImageData = _decodeHandleToImageData(heif, primaryImage.handle);
            console.log('[HEIC] Returning SDR + Gain Map (gain map will be preserved through pipeline)');
            return {
                sdr: sdrImageData,
                gainMap: gainMapImageData,
                gainMapMetadata,
                gainMapHeadroom,
                name: file.name
            };
        }

        if (isSupportedRawHdrHeif(sourceBytes)) {
            console.log('[HEIC] No native gain map found and HDR metadata detected. Routing through raw HDR intent pipeline.');
            return processHeifHdr(file);
        }

        console.log('[HEIC] No gain map found (or discarded), falling back to ITM');
        return _decodeHandleToImageData(heif, primaryImage.handle);
    } finally {
        _releaseHeifImages(heif, data);
        _freeHeifContext(heif, decoder);
    }
}

function _releaseHeifImages(heif: LibHeifModule, images: HeifImageLike[] | null | undefined): void {
    if (!images) return;
    for (const img of images) {
        try {
            if (typeof img.free === 'function') {
                img.free();
            } else if (img.handle && typeof heif.heif_image_handle_release === 'function') {
                heif.heif_image_handle_release(img.handle);
                (img as { handle: HeifImageHandle | null }).handle = null;
            }
        } catch { /* teardown must not throw */ }
    }
}

function _freeHeifContext(heif: LibHeifModule, decoder: HeifDecoderInstance): void {
    try {
        const ctx = decoder.decoder;
        if (ctx && typeof heif.heif_context_free === 'function') {
            heif.heif_context_free(ctx);
            (decoder as { decoder: unknown }).decoder = null;
        }
    } catch { /* teardown must not throw */ }
}

function _getThumbnailHandle(
    heif: LibHeifModule,
    decoder: HeifDecoderInstance,
    primaryHandle: HeifImageHandle,
): HeifImageHandle | null {
    if (
        typeof heif.heif_image_handle_get_number_of_thumbnails !== 'function'
        || typeof heif.heif_image_handle_get_list_of_thumbnail_IDs !== 'function'
    ) {
        return null;
    }
    let count = 0;
    try {
        count = heif.heif_image_handle_get_number_of_thumbnails(primaryHandle);
    } catch {
        return null;
    }
    if (!count || count <= 0) return null;

    const idsPtr = heif._malloc(count * 4);
    try {
        let got = 0;
        try {
            got = heif.heif_image_handle_get_list_of_thumbnail_IDs(primaryHandle, idsPtr, count);
        } catch {
            return null;
        }
        if (!got) return null;

        const ctx = decoder.decoder;
        for (let i = 0; i < got; i++) {
            const thumbId = heif.HEAP32[(idsPtr >> 2) + i];
            let thumbHandle: HeifImageHandle | null = null;
            try {
                thumbHandle = heif.heif_js_context_get_image_handle(ctx, thumbId);
            } catch {
                continue;
            }
            if (_isHeifHandle(thumbHandle)) {
                return thumbHandle;
            }
        }
        return null;
    } finally {
        heif._free(idsPtr);
    }
}

export async function decodeHeifPreviewImage(file: File): Promise<DecodedRasterImage> {
    const heif = await initLibHeif();
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new heif.HeifDecoder();
    let data: HeifImageLike[] | null = null;
    let thumbHandle: HeifImageHandle | null = null;
    try {
        data = decoder.decode(arrayBuffer);

        if (!data || data.length === 0) {
            throw new Error('No images found in HEIC file');
        }

        const primaryHandle = data[0].handle;
        thumbHandle = _getThumbnailHandle(heif, decoder, primaryHandle);
        if (thumbHandle) {
            return _decodeHandleToImageData(heif, thumbHandle);
        }
        return _decodeHandleToImageData(heif, primaryHandle);
    } finally {
        if (thumbHandle) {
            try { heif.heif_image_handle_release(thumbHandle); } catch { /* teardown must not throw */ }
        }
        _releaseHeifImages(heif, data);
        _freeHeifContext(heif, decoder);
    }
}

/**
 * Check if an RGBA gain map candidate is monochrome (R ≈ G ≈ B).
 * Apple gain maps are 8-bit grayscale. If the image has significant
 * color variance, it may be a stereoscopic pair or other non-gain-map image.
 * @param {{data: Uint8Array, width: number, height: number}} imageData
 * @param {number} tolerance - Max per-pixel channel difference allowed
 * @returns {boolean}
 */
function _isGainMapMonochrome(
    imageData: { data: Uint8Array | Uint8ClampedArray<ArrayBuffer>; width: number; height: number },
    tolerance = 10,
): boolean {
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

function _getTopLevelImageIds(heif: LibHeifModule, decoder: HeifDecoderInstance): number[] {
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

function _isHeifHandle(obj: unknown): obj is HeifImageHandle {
    return !!obj && obj.constructor && obj.constructor.name === 'heif_image_handle';
}

function _decodeHandleToImageData(heif: LibHeifModule, handle: HeifImageHandle): DecodedRgbaImageData {
    const decoded = heif.heif_js_decode_image2(
        handle,
        heif.heif_colorspace.heif_colorspace_RGB,
        heif.heif_chroma.heif_chroma_interleaved_RGBA
    );
    if (!decoded || decoded.code) {
        if (decoded?.image && typeof heif.heif_image_release === 'function') {
            try { heif.heif_image_release(decoded.image); } catch { /* teardown must not throw */ }
        }
        throw new Error('HEIF image decoding error');
    }

    try {
        const interleavedChannel = decoded.channels?.find((channel: HeifInterleavedChannel) => channel.id === heif.heif_channel.heif_channel_interleaved)
            || decoded.channels?.[0];
        if (!interleavedChannel?.data) {
            throw new Error('HEIF image decoding did not expose interleaved pixels');
        }

        const width = interleavedChannel.width || heif.heif_image_handle_get_width(handle);
        const height = interleavedChannel.height || heif.heif_image_handle_get_height(handle);
        return {
            data: new Uint8Array(interleavedChannel.data),
            width,
            height,
            strideBytes: interleavedChannel.stride || (width * 4),
            pixelFormat: 'rgba8',
            bitDepth: Number(interleavedChannel.bits_per_pixel) || 8,
        };
    } finally {
        if (decoded.image && typeof heif.heif_image_release === 'function') {
            try { heif.heif_image_release(decoded.image); } catch { /* teardown must not throw */ }
        }
    }
}

async function _extractIphoneHiddenGainMapItem(
    heif: LibHeifModule,
    decoder: HeifDecoderInstance,
    topLevelIds: number[],
    primaryW: number,
    primaryH: number,
): Promise<GainMapImageData | null> {
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

        let handle: HeifImageHandle | null;
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

async function _extractViaAuxiliaryApi(
    heif: LibHeifModule,
    decoder: HeifDecoderInstance,
    topLevelIds: number[],
    primaryW: number,
    primaryH: number,
): Promise<GainMapImageData | null> {
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
