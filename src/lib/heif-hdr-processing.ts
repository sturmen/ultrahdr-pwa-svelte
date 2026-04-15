import libheifFactory from './libheif-browser.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';
import { extractExifOrientation } from './exif-utils.js';
import {
    fetchRuntimeAssetBuffer,
    resolveRuntimeAssetUrl,
} from './runtime-assets.ts';
import { LIBHEIF_WASM_BINARY_ASSET } from './runtime-asset-definitions.ts';
import type {
    FloatHdrIntentPayload,
    HdrIntentHeifResult,
    HdrIntentPayload,
    PackedHdrIntentPayload,
} from './processing-types.ts';

interface HdrNclxInfo {
    primaries: number;
    transfer: number;
    matrix: number;
    fullRange: boolean;
}

interface ContainerTransformInfo {
    hasRotation: boolean;
    rotationQuarterTurns: number;
    hasMirror: boolean;
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

interface HeifPrimaryImage {
    handle: unknown;
    get_width(): number;
    get_height(): number;
}

interface HeifDecoderInstance {
    decode(buffer: ArrayBuffer): HeifPrimaryImage[];
}

interface HeifDecoderConstructor {
    new (): HeifDecoderInstance;
}

interface LibHeifModule {
    HeifDecoder: HeifDecoderConstructor;
    heif_js_decode_image2(
        handle: unknown,
        colorspace: number,
        chroma: number,
    ): HeifDecodeResult;
    heif_colorspace: {
        heif_colorspace_RGB: number;
    };
    heif_chroma: {
        heif_chroma_interleaved_RRGGBBAA_LE: number;
    };
    heif_channel: {
        heif_channel_interleaved: number;
    };
    heif_image_release?(image: unknown): void;
}

type HdrIntentTransfer = Extract<HdrIntentPayload['ct'], 'pq' | 'hlg'>;
type PackedDecodedHdrIntentImage = Pick<
    PackedHdrIntentPayload,
    'data' | 'width' | 'height' | 'strideBytes' | 'format' | 'ct'
>;
type FloatDecodedHdrIntentImage = Pick<
    FloatHdrIntentPayload,
    'data' | 'width' | 'height' | 'strideBytes' | 'format' | 'ct'
>;
type DecodedHdrIntentImage = PackedDecodedHdrIntentImage | FloatDecodedHdrIntentImage;

let libheif: LibHeifModule | null = null;

function findNclxColorInfo(bytes: Uint8Array): HdrNclxInfo | null {
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

function findAsciiBoxOffsets(bytes: Uint8Array, boxType: string): number[] {
    const offsets: number[] = [];
    if (!(bytes instanceof Uint8Array) || typeof boxType !== 'string' || boxType.length !== 4) {
        return offsets;
    }
    const needle = [
        boxType.charCodeAt(0),
        boxType.charCodeAt(1),
        boxType.charCodeAt(2),
        boxType.charCodeAt(3),
    ];
    for (let i = 4; i <= bytes.length - 5; i++) {
        if (
            bytes[i] === needle[0]
            && bytes[i + 1] === needle[1]
            && bytes[i + 2] === needle[2]
            && bytes[i + 3] === needle[3]
        ) {
            offsets.push(i - 4);
        }
    }
    return offsets;
}

function parseHeifContainerTransformInfo(bytes: Uint8Array): ContainerTransformInfo {
    const info: ContainerTransformInfo = {
        hasRotation: false,
        rotationQuarterTurns: 0,
        hasMirror: false,
    };
    if (!(bytes instanceof Uint8Array) || bytes.length < 9) {
        return info;
    }

    for (const boxOffset of findAsciiBoxOffsets(bytes, 'irot')) {
        const boxSize = (
            (bytes[boxOffset] << 24)
            | (bytes[boxOffset + 1] << 16)
            | (bytes[boxOffset + 2] << 8)
            | bytes[boxOffset + 3]
        ) >>> 0;
        if (boxSize >= 9 && boxOffset + 8 < bytes.length) {
            const quarterTurns = bytes[boxOffset + 8] & 0x03;
            if (quarterTurns !== 0) {
                info.hasRotation = true;
                info.rotationQuarterTurns = quarterTurns;
            }
        }
    }

    for (const boxOffset of findAsciiBoxOffsets(bytes, 'imir')) {
        const boxSize = (
            (bytes[boxOffset] << 24)
            | (bytes[boxOffset + 1] << 16)
            | (bytes[boxOffset + 2] << 8)
            | bytes[boxOffset + 3]
        ) >>> 0;
        if (boxSize >= 9 && boxOffset + 8 < bytes.length) {
            info.hasMirror = true;
        }
    }

    return info;
}

const HEIF_TRANSFER_PQ = 16;
const HEIF_TRANSFER_HLG = 18;
const HDR_LINEAR_EXPOSURE_SCALE = 1.0;
const LIBULTRAHDR_MAX_LINEAR = 10000 / 203;

function isSupportedHdrInfo(info: HdrNclxInfo | null): info is HdrNclxInfo {
    return !!info && info.primaries === 9 && (info.transfer === HEIF_TRANSFER_PQ || info.transfer === HEIF_TRANSFER_HLG);
}

function float32ToFloat16(value: number): number {
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

function pqToLinear(value: number): number {
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

function hlgToLinear(value: number): number {
    const a = 0.17883277;
    const b = 1 - 4 * a;
    const c = 0.5 - a * Math.log(4 * a);
    return value <= 0.5
        ? (value * value) / 3
        : (Math.exp((value - c) / a) + b) / 12;
}

function decodeHdrChannelToLinear(codeValue: number, transfer: number, codeMax: number): number {
    const normalized = Math.max(0, Math.min(1, codeValue / codeMax));
    if (transfer === HEIF_TRANSFER_PQ) {
        return pqToLinear(normalized);
    }
    if (transfer === HEIF_TRANSFER_HLG) {
        return hlgToLinear(normalized);
    }
    throw new Error(`Unsupported HDR transfer: ${transfer}`);
}

function resolveChannelCodeMax(interleavedChannel: HeifInterleavedChannel): number {
    const bitsPerPixel = Number(interleavedChannel?.bits_per_pixel);
    if (Number.isInteger(bitsPerPixel) && bitsPerPixel > 0 && bitsPerPixel <= 16) {
        return (2 ** bitsPerPixel) - 1;
    }
    return 65535;
}

function getOrientedDimensions(width: number, height: number, orientation: number): { width: number; height: number } {
    return orientation >= 5 && orientation <= 8
        ? { width: height, height: width }
        : { width, height };
}

function mapOrientedPixelToSource(
    x: number,
    y: number,
    width: number,
    height: number,
    orientation: number,
): { x: number; y: number } {
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

function scaleChannelTo10Bit(codeValue: number, codeMax: number): number {
    const normalized = Math.max(0, Math.min(codeMax, codeValue));
    if (codeMax === 1023) {
        return normalized;
    }
    return Math.max(0, Math.min(1023, Math.round((normalized * 1023) / codeMax)));
}

function scaleAlphaTo2Bit(codeValue: number, codeMax: number): number {
    const normalized = Math.max(0, Math.min(codeMax, codeValue));
    return Math.max(0, Math.min(3, Math.round((normalized * 3) / codeMax)));
}

function getHdrIntentTransfer(nclx: HdrNclxInfo): HdrIntentTransfer {
    return nclx.transfer === HEIF_TRANSFER_PQ ? 'pq' : 'hlg';
}

async function initLibHeif(): Promise<LibHeifModule> {
    if (libheif) {
        return libheif;
    }
    const wasmUrl = resolveRuntimeAssetUrl(LIBHEIF_WASM_BINARY_ASSET);
    const { asset: wasmBinary } = await fetchRuntimeAssetBuffer(LIBHEIF_WASM_BINARY_ASSET);
    libheif = await libheifFactory({
        wasmBinary,
        locateFile: (path) => (path.endsWith('.wasm') ? wasmUrl : path),
    }) as LibHeifModule;
    return libheif;
}

function decodePrimaryToHdrIntent(
    heif: LibHeifModule,
    primaryImage: HeifPrimaryImage,
    nclx: HdrNclxInfo,
    orientation: number,
): DecodedHdrIntentImage {
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

    const interleavedChannel = decoded.channels?.find((channel: HeifInterleavedChannel) => channel.id === heif.heif_channel.heif_channel_interleaved)
        || decoded.channels?.[0];
    if (!interleavedChannel?.data) {
        throw new Error('HEIF HDR primary image did not expose interleaved 16-bit pixels');
    }

    const { width: outWidth, height: outHeight } = getOrientedDimensions(width, height, orientation);
    const srcView = new DataView(
        interleavedChannel.data.buffer,
        interleavedChannel.data.byteOffset,
        interleavedChannel.data.byteLength
    );
    const strideBytes = interleavedChannel.stride || (width * 8);
    const channelCodeMax = resolveChannelCodeMax(interleavedChannel);
    const bitsPerPixel = Number(interleavedChannel.bits_per_pixel);
    const shouldPack1010102 = Number.isInteger(bitsPerPixel) && bitsPerPixel > 0 && bitsPerPixel <= 10;

    if (shouldPack1010102) {
        const packedBytes = new Uint8Array(outWidth * outHeight * 4);
        const packedView = new DataView(packedBytes.buffer);

        for (let y = 0; y < outHeight; y++) {
            for (let x = 0; x < outWidth; x++) {
                const srcCoord = mapOrientedPixelToSource(x, y, width, height, orientation);
                const srcOffset = srcCoord.y * strideBytes + srcCoord.x * 8;
                const dstIndex = y * outWidth + x;
                const r = scaleChannelTo10Bit(srcView.getUint16(srcOffset, true), channelCodeMax);
                const g = scaleChannelTo10Bit(srcView.getUint16(srcOffset + 2, true), channelCodeMax);
                const b = scaleChannelTo10Bit(srcView.getUint16(srcOffset + 4, true), channelCodeMax);
                const a = scaleAlphaTo2Bit(srcView.getUint16(srcOffset + 6, true), channelCodeMax);
                const packedPixel = (r & 0x3ff)
                    | ((g & 0x3ff) << 10)
                    | ((b & 0x3ff) << 20)
                    | ((a & 0x03) << 30);
                packedView.setUint32(dstIndex * 4, packedPixel >>> 0, true);
            }
        }

        if (decoded.image && typeof heif.heif_image_release === 'function') {
            heif.heif_image_release(decoded.image);
        }

        return {
            data: packedBytes,
            width: outWidth,
            height: outHeight,
            strideBytes: outWidth * 4,
            format: 'rgba1010102',
            ct: getHdrIntentTransfer(nclx),
        };
    }

    const halfFloatBytes = new Uint8Array(outWidth * outHeight * 8);
    const halfFloatView = new DataView(halfFloatBytes.buffer);

    for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
            const srcCoord = mapOrientedPixelToSource(x, y, width, height, orientation);
            const srcOffset = srcCoord.y * strideBytes + srcCoord.x * 8;
            const dstOffset = (y * outWidth + x) * 8;

            const r = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset, true), nclx.transfer, channelCodeMax) * HDR_LINEAR_EXPOSURE_SCALE
            );
            const g = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 2, true), nclx.transfer, channelCodeMax) * HDR_LINEAR_EXPOSURE_SCALE
            );
            const b = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 4, true), nclx.transfer, channelCodeMax) * HDR_LINEAR_EXPOSURE_SCALE
            );
            const a = Math.max(0, Math.min(1, srcView.getUint16(srcOffset + 6, true) / channelCodeMax));

            halfFloatView.setUint16(dstOffset, float32ToFloat16(r), true);
            halfFloatView.setUint16(dstOffset + 2, float32ToFloat16(g), true);
            halfFloatView.setUint16(dstOffset + 4, float32ToFloat16(b), true);
            halfFloatView.setUint16(dstOffset + 6, float32ToFloat16(a), true);
        }
    }

    if (decoded.image && typeof heif.heif_image_release === 'function') {
        heif.heif_image_release(decoded.image);
    }

    return {
        data: halfFloatBytes,
        width: outWidth,
        height: outHeight,
        strideBytes: outWidth * 8,
        format: 'rgbaf16',
        ct: 'linear',
    };
}

export async function processHeifHdr(file: File): Promise<HdrIntentHeifResult> {
    const heif = await initLibHeif();
    const buffer = new Uint8Array(await file.arrayBuffer());
    const supportedNclx = findNclxColorInfo(buffer);
    if (!isSupportedHdrInfo(supportedNclx)) {
        throw new Error('Unsupported HDR HEIF input: expected Rec.2020 PQ or HLG primary image');
    }
    const sourceExifBytes = extractExifApp1PayloadFromInput(
        buffer,
        file.name || '',
        file.type || 'image/heif'
    );
    const exifOrientation = sourceExifBytes instanceof Uint8Array ? extractExifOrientation(sourceExifBytes) : 1;
    const containerTransform = parseHeifContainerTransformInfo(buffer);
    const orientation = (containerTransform.hasRotation || containerTransform.hasMirror)
        ? 1
        : exifOrientation;

    const decoder = new heif.HeifDecoder();
    const images = decoder.decode(buffer.buffer);
    if (!images || images.length === 0) {
        throw new Error('No images found in HEIF file');
    }

    const primary = images[0];
    const hdrIntentImage = decodePrimaryToHdrIntent(heif, primary, supportedNclx, orientation);
    const hdrIntent: HdrIntentPayload = hdrIntentImage.format === 'rgba1010102'
        ? {
            data: hdrIntentImage.data,
            width: hdrIntentImage.width,
            height: hdrIntentImage.height,
            strideBytes: hdrIntentImage.strideBytes,
            format: 'rgba1010102',
            cg: 'bt2100',
            ct: hdrIntentImage.ct,
            range: supportedNclx.fullRange ? 'full' : 'limited',
        }
        : {
            data: hdrIntentImage.data,
            width: hdrIntentImage.width,
            height: hdrIntentImage.height,
            strideBytes: hdrIntentImage.strideBytes,
            format: 'rgbaf16',
            cg: 'bt2100',
            ct: 'linear',
            range: supportedNclx.fullRange ? 'full' : 'limited',
        };

    return {
        kind: 'hdr-intent-heif',
        hdrIntent,
        sourceExifBytes,
    };
}
