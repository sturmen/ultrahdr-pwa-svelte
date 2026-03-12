import libheifFactory from './libheif-browser.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';
import { extractExifOrientation } from './exif-utils.js';

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

const HEIF_TRANSFER_PQ = 16;
const HEIF_TRANSFER_HLG = 18;
const HDR_LINEAR_EXPOSURE_SCALE = 1.0;
const LIBULTRAHDR_MAX_LINEAR = 10000 / 203;

function isSupportedHdrInfo(info) {
    return !!info && info.primaries === 9 && (info.transfer === HEIF_TRANSFER_PQ || info.transfer === HEIF_TRANSFER_HLG);
}

function float32ToFloat16(value) {
    if (Number.isNaN(value)) {
        return 0x7e00;
    }
    if (value === Infinity) {
        return 0x7c00;
    }
    if (value === -Infinity) {
        return 0xfc00;
    }
    if (value === 0) {
        return Object.is(value, -0) ? 0x8000 : 0;
    }

    const sign = value < 0 ? 0x8000 : 0;
    let abs = Math.abs(value);

    if (abs >= 65504) {
        return sign | 0x7bff;
    }

    if (abs < 2 ** -14) {
        return sign | Math.round(abs / 2 ** -24);
    }

    let exponent = Math.floor(Math.log2(abs));
    let mantissa = abs / (2 ** exponent) - 1;
    exponent += 15;
    mantissa = Math.round(mantissa * 1024);

    if (mantissa === 1024) {
        exponent += 1;
        mantissa = 0;
    }

    return sign | (exponent << 10) | (mantissa & 0x03ff);
}

function pqToLinear(value) {
    const m1 = 2610 / 16384;
    const m2 = 2523 / 32;
    const c1 = 3424 / 4096;
    const c2 = 2413 / 128;
    const c3 = 2392 / 128;
    const p = value ** (1 / m2);
    const numerator = Math.max(p - c1, 0);
    const denominator = c2 - c3 * p;
    if (denominator <= 0) {
        return LIBULTRAHDR_MAX_LINEAR;
    }
    return (((numerator / denominator) ** (1 / m1)) * 10000) / 203;
}

function hlgToLinear(value) {
    const a = 0.17883277;
    const b = 1 - 4 * a;
    const c = 0.5 - a * Math.log(4 * a);
    return value <= 0.5
        ? (value * value) / 3
        : (Math.exp((value - c) / a) + b) / 12;
}

function decodeHdrChannelToLinear(codeValue, transfer, codeMax) {
    const normalized = Math.max(0, Math.min(1, codeValue / codeMax));
    if (transfer === HEIF_TRANSFER_PQ) {
        return pqToLinear(normalized);
    }
    if (transfer === HEIF_TRANSFER_HLG) {
        return hlgToLinear(normalized);
    }
    throw new Error(`Unsupported HDR transfer: ${transfer}`);
}

function resolveChannelCodeMax(interleavedChannel) {
    const bitsPerPixel = Number(interleavedChannel?.bits_per_pixel);
    if (Number.isInteger(bitsPerPixel) && bitsPerPixel > 0 && bitsPerPixel <= 16) {
        return (2 ** bitsPerPixel) - 1;
    }
    return 65535;
}

function getOrientedDimensions(width, height, orientation) {
    return orientation >= 5 && orientation <= 8
        ? { width: height, height: width }
        : { width, height };
}

function mapOrientedPixelToSource(x, y, width, height, orientation) {
    switch (orientation) {
        case 2:
            return { x: width - 1 - x, y };
        case 3:
            return { x: width - 1 - x, y: height - 1 - y };
        case 4:
            return { x, y: height - 1 - y };
        case 5:
            return { x: y, y: x };
        case 6:
            return { x: y, y: height - 1 - x };
        case 7:
            return { x: width - 1 - y, y: height - 1 - x };
        case 8:
            return { x: width - 1 - y, y: x };
        default:
            return { x, y };
    }
}

function encodeLinearPixelsToFloat16(linearPixels, width, height) {
    const bytes = new Uint8Array(width * height * 8);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < linearPixels.length; i++) {
        view.setUint16(i * 2, float32ToFloat16(linearPixels[i]), true);
    }
    return bytes;
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

function decodePrimaryToLinearRgba(heif, primaryImage, nclx, orientation) {
    const width = primaryImage.get_width();
    const height = primaryImage.get_height();
    const decoded = heif.heif_js_decode_image2(
        primaryImage.handle,
        heif.heif_colorspace.heif_colorspace_RGB,
        heif.heif_chroma.heif_chroma_interleaved_RRGGBBAA_LE
    );
    if (!decoded || decoded.code) {
        throw new Error('HEIF HDR primary image decode failed');
    }

    const interleavedChannel = decoded.channels?.find((channel) => channel.id === heif.heif_channel.heif_channel_interleaved)
        || decoded.channels?.[0];
    if (!interleavedChannel?.data) {
        throw new Error('HEIF HDR primary image did not expose interleaved 16-bit pixels');
    }

    const { width: outWidth, height: outHeight } = getOrientedDimensions(width, height, orientation);
    const linearPixels = new Float32Array(outWidth * outHeight * 4);
    const srcView = new DataView(
        interleavedChannel.data.buffer,
        interleavedChannel.data.byteOffset,
        interleavedChannel.data.byteLength
    );
    const strideBytes = interleavedChannel.stride || (width * 8);
    const channelCodeMax = resolveChannelCodeMax(interleavedChannel);

    for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
            const srcCoord = mapOrientedPixelToSource(x, y, width, height, orientation);
            const srcOffset = srcCoord.y * strideBytes + srcCoord.x * 8;
            const dstOffset = (y * outWidth + x) * 4;

            linearPixels[dstOffset] = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset, true), nclx.transfer, channelCodeMax) * HDR_LINEAR_EXPOSURE_SCALE
            );
            linearPixels[dstOffset + 1] = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 2, true), nclx.transfer, channelCodeMax) * HDR_LINEAR_EXPOSURE_SCALE
            );
            linearPixels[dstOffset + 2] = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 4, true), nclx.transfer, channelCodeMax) * HDR_LINEAR_EXPOSURE_SCALE
            );
            linearPixels[dstOffset + 3] = Math.max(0, Math.min(1, srcView.getUint16(srcOffset + 6, true) / channelCodeMax));
        }
    }

    if (decoded.image && typeof heif.heif_image_release === 'function') {
        heif.heif_image_release(decoded.image);
    }

    return {
        data: encodeLinearPixelsToFloat16(linearPixels, outWidth, outHeight),
        width: outWidth,
        height: outHeight,
    };
}

export async function processHeifHdr(file) {
    const heif = await initLibHeif();
    const buffer = new Uint8Array(await file.arrayBuffer());
    const nclx = findNclxColorInfo(buffer);
    if (!isSupportedHdrInfo(nclx)) {
        throw new Error('Unsupported HDR HEIF input: expected Rec.2020 PQ or HLG primary image');
    }
    const sourceExifBytes = extractExifApp1PayloadFromInput(
        buffer,
        file.name || '',
        file.type || 'image/heif'
    );
    const orientation = sourceExifBytes instanceof Uint8Array ? extractExifOrientation(sourceExifBytes) : 1;

    const decoder = new heif.HeifDecoder();
    const images = decoder.decode(buffer.buffer);
    if (!images || images.length === 0) {
        throw new Error('No images found in HEIF file');
    }

    const primary = images[0];
    const hdrIntentImage = decodePrimaryToLinearRgba(heif, primary, nclx, orientation);

    return {
        kind: 'hdr-intent-heif',
        hdrIntent: {
            data: hdrIntentImage.data,
            width: hdrIntentImage.width,
            height: hdrIntentImage.height,
            strideBytes: hdrIntentImage.width * 8,
            format: 'rgbaf16',
            cg: 'bt2100',
            ct: 'linear',
            range: nclx.fullRange ? 'full' : 'limited',
        },
        sourceExifBytes,
    };
}
