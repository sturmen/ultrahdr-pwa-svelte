import libheifFactory from 'libheif-js/libheif-wasm/libheif.js';
import { createCanvasWithContext } from './canvas-runtime.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';

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

function findNclxColorInfo(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length < 12) {
        return null;
    }
    const n = bytes.length;
    for (let i = 0; i <= n - 11; i++) {
        if (
            bytes[i] === 0x6e && bytes[i + 1] === 0x63 &&
            bytes[i + 2] === 0x6c && bytes[i + 3] === 0x78
        ) {
            const primaries = (bytes[i + 4] << 8) | bytes[i + 5];
            const transfer = (bytes[i + 6] << 8) | bytes[i + 7];
            const matrix = (bytes[i + 8] << 8) | bytes[i + 9];
            const fullRange = (bytes[i + 10] & 0x80) !== 0;
            return { primaries, transfer, matrix, fullRange };
        }
    }
    return null;
}

function isRec2020Pq(info) {
    return !!info && info.primaries === 9 && info.transfer === 16;
}

function packRgba8888ToRgba1010102(imageData) {
    const src = imageData?.data;
    const isByteView = ArrayBuffer.isView(src) && src.BYTES_PER_ELEMENT === 1;
    if (!isByteView || src.length % 4 !== 0) {
        throw new Error('Invalid HEIF decode buffer for RGBA1010102 conversion');
    }
    const pixels = src.length / 4;
    const out32 = new Uint32Array(pixels);
    for (let i = 0, p = 0; i < src.length; i += 4, p++) {
        const r10 = (src[i] << 2) | (src[i] >> 6);
        const g10 = (src[i + 1] << 2) | (src[i + 1] >> 6);
        const b10 = (src[i + 2] << 2) | (src[i + 2] >> 6);
        const a2 = 0x3;
        out32[p] = (r10 & 0x3ff) | ((g10 & 0x3ff) << 10) | ((b10 & 0x3ff) << 20) | (a2 << 30);
    }
    return new Uint8Array(out32.buffer);
}

async function initLibHeif() {
    if (libheif) {
        return libheif;
    }
    const wasmUrl = appendVersionQuery((import.meta.env.BASE_URL || '/') + 'assets/libheif.wasm');
    const response = await fetch(wasmUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch libheif WASM: ${response.statusText}`);
    }
    const wasmBinary = await response.arrayBuffer();
    libheif = await libheifFactory({
        wasmBinary,
        locateFile: (path) => (path.endsWith('.wasm') ? wasmUrl : path),
    });
    return libheif;
}

async function decodePrimaryToImageData(primaryImage) {
    const width = primaryImage.get_width();
    const height = primaryImage.get_height();
    const { ctx } = createCanvasWithContext(
        width,
        height,
        'Canvas not available for HEIF HDR decoding'
    );
    const imageData = ctx.createImageData(width, height);
    await new Promise((resolve, reject) => {
        primaryImage.display(imageData, (displayData) => {
            if (!displayData) {
                reject(new Error('HEIF HDR primary image decode failed'));
                return;
            }
            resolve(displayData);
        });
    });
    return imageData;
}

export async function processHeifHdr(file) {
    const heif = await initLibHeif();
    const buffer = new Uint8Array(await file.arrayBuffer());
    const nclx = findNclxColorInfo(buffer);
    if (!isRec2020Pq(nclx)) {
        throw new Error('10-bit HDR Rec.2020 PQ decode unavailable for this HEIF input');
    }

    const decoder = new heif.HeifDecoder();
    const images = decoder.decode(buffer.buffer);
    if (!images || images.length === 0) {
        throw new Error('No images found in HEIF file');
    }

    const primary = images[0];
    const rgbaImageData = await decodePrimaryToImageData(primary);
    const packedRgba1010102 = packRgba8888ToRgba1010102(rgbaImageData);
    const sourceExifBytes = extractExifApp1PayloadFromInput(
        buffer,
        file.name || '',
        file.type || 'image/heif'
    );

    return {
        kind: 'hdr-intent-heif',
        hdrIntent: {
            data: packedRgba1010102,
            width: rgbaImageData.width,
            height: rgbaImageData.height,
            strideBytes: rgbaImageData.width * 4,
            format: 'rgba1010102',
            cg: 'bt2100',
            ct: 'pq',
            range: nclx.fullRange ? 'full' : 'limited',
        },
        sourceExifBytes,
    };
}
