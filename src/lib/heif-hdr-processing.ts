import libheifFactory from './libheif-browser.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';
import { extractExifOrientation } from './exif-utils.js';
import {
    fetchRuntimeAssetBuffer,
    resolveRuntimeAssetUrl,
} from './runtime-assets.ts';
import { LIBHEIF_WASM_BINARY_ASSET } from './runtime-asset-definitions.ts';
import { getProcessingProfile } from './capabilities.ts';
import { recordProcessingMemoryDiagnostics } from './diagnostics-events.ts';
import { HDR_INTENT_MAX_LONG_EDGE } from './constants.ts';
import { constrainHdrIntentDimensions } from './hdr-intent-dimensions.ts';
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
    free?(): void;
}

interface HeifDecoderInstance {
    decode(buffer: ArrayBuffer): HeifPrimaryImage[];
    decoder?: unknown;
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
    heif_image_handle_release?(handle: unknown): void;
    heif_context_free?(context: unknown): void;
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

type HeifProbeSink = (substage: string) => void;
let heifProbeSink: HeifProbeSink | null = null;

export function setHeifProbeSink(sink: HeifProbeSink | null): void {
    heifProbeSink = sink;
}

function emitHeifProbe(substage: string): void {
    if (heifProbeSink) {
        try {
            heifProbeSink(substage);
        } catch {
            // Profiler diagnostics must not affect pipeline.
        }
        return;
    }
    const g: unknown = typeof globalThis !== 'undefined' ? globalThis : undefined;
    const target = g as { dispatchEvent?: (ev: Event) => boolean } | undefined;
    if (!target || typeof target.dispatchEvent !== 'function' || typeof CustomEvent !== 'function') {
        return;
    }
    try {
        target.dispatchEvent(new CustomEvent('ultrahdr:processing-progress', {
            detail: {
                phase: 'stage-progress',
                stage: 'preprocess-file',
                substage,
            },
        }));
    } catch {
        // Profiler diagnostics must not affect pipeline.
    }
}

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

export function linearToPq(linear: number): number {
    const clamped = Math.max(0, Math.min(LIBULTRAHDR_MAX_LINEAR, linear));
    if (clamped <= 0) {
        return 0;
    }
    const m1 = 2610 / 16384;
    const m2 = 2523 / 32;
    const c1 = 3424 / 4096;
    const c2 = 2413 / 128;
    const c3 = 2392 / 128;
    const y = (clamped * 203) / 10000;
    const yPowM1 = y ** m1;
    const numerator = c1 + c2 * yPowM1;
    const denominator = 1 + c3 * yPowM1;
    return (numerator / denominator) ** m2;
}

export function linearToHlg(linear: number): number {
    const clamped = Math.max(0, Math.min(LIBULTRAHDR_MAX_LINEAR, linear));
    if (clamped <= 0) {
        return 0;
    }
    const a = 0.17883277;
    const b = 1 - 4 * a;
    const c = 0.5 - a * Math.log(4 * a);
    if (clamped <= 1 / 12) {
        return Math.sqrt(3 * clamped);
    }
    return a * Math.log(12 * clamped - b) + c;
}

function encodeLinearToHdrChannel(linear: number, transfer: number, codeMax: number): number {
    const clamped = Math.max(0, Math.min(LIBULTRAHDR_MAX_LINEAR, linear));
    let ePrime: number;
    if (transfer === HEIF_TRANSFER_PQ) {
        ePrime = linearToPq(clamped);
    } else if (transfer === HEIF_TRANSFER_HLG) {
        ePrime = linearToHlg(clamped);
    } else {
        throw new Error(`Unsupported HDR transfer: ${transfer}`);
    }
    const normalized = Math.max(0, Math.min(1, ePrime));
    return Math.max(0, Math.min(codeMax, Math.round(normalized * codeMax)));
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

export type HdrIntentMemoryTier = 'low' | 'mid' | 'high';

export interface HdrIntentFormatResolution {
    format: 'rgba1010102' | 'rgbaf16';
    downgraded: boolean;
    reason: 'low-memory-tier' | null;
}

export function resolveHdrIntentFormat(input: {
    bitsPerPixel: number;
    memoryTier: HdrIntentMemoryTier;
}): HdrIntentFormatResolution {
    const bpp = Number(input.bitsPerPixel);
    const fitsInPacked = Number.isInteger(bpp) && bpp > 0 && bpp <= 10;
    if (fitsInPacked) {
        return { format: 'rgba1010102', downgraded: false, reason: null };
    }
    if (input.memoryTier === 'low') {
        return { format: 'rgba1010102', downgraded: true, reason: 'low-memory-tier' };
    }
    return { format: 'rgbaf16', downgraded: false, reason: null };
}

/**
 * Bilinear downscale of an interleaved 16-bit RGBA buffer (libheif
 * `heif_chroma_interleaved_RRGGBBAA_LE` output) into a new tightly-packed
 * buffer of dst dimensions. Used to cap HDR-intent input dimensions before
 * libultrahdr encode to avoid wasm32 `std::bad_alloc` aborts on high-MP
 * inputs.
 */
export function downscale16BitInterleavedRgba(
    src: Uint8Array,
    srcWidth: number,
    srcHeight: number,
    srcStrideBytes: number,
    dstWidth: number,
    dstHeight: number,
): { data: Uint8Array; strideBytes: number } {
    const dst = new Uint8Array(dstWidth * dstHeight * 8);
    const srcView = new DataView(src.buffer, src.byteOffset, src.byteLength);
    const dstView = new DataView(dst.buffer);
    const scaleX = srcWidth / dstWidth;
    const scaleY = srcHeight / dstHeight;
    const maxX = srcWidth - 1;
    const maxY = srcHeight - 1;
    for (let y = 0; y < dstHeight; y++) {
        const sy = (y + 0.5) * scaleY - 0.5;
        const y0 = Math.max(0, Math.floor(sy));
        const y1 = Math.min(maxY, y0 + 1);
        const wy = Math.max(0, Math.min(1, sy - y0));
        const inv_wy = 1 - wy;
        for (let x = 0; x < dstWidth; x++) {
            const sx = (x + 0.5) * scaleX - 0.5;
            const x0 = Math.max(0, Math.floor(sx));
            const x1 = Math.min(maxX, x0 + 1);
            const wx = Math.max(0, Math.min(1, sx - x0));
            const inv_wx = 1 - wx;
            const off00 = y0 * srcStrideBytes + x0 * 8;
            const off01 = y0 * srcStrideBytes + x1 * 8;
            const off10 = y1 * srcStrideBytes + x0 * 8;
            const off11 = y1 * srcStrideBytes + x1 * 8;
            const dstOffset = (y * dstWidth + x) * 8;
            for (let c = 0; c < 4; c++) {
                const p00 = srcView.getUint16(off00 + c * 2, true);
                const p01 = srcView.getUint16(off01 + c * 2, true);
                const p10 = srcView.getUint16(off10 + c * 2, true);
                const p11 = srcView.getUint16(off11 + c * 2, true);
                const top = p00 * inv_wx + p01 * wx;
                const bot = p10 * inv_wx + p11 * wx;
                const val = Math.round(top * inv_wy + bot * wy);
                dstView.setUint16(dstOffset + c * 2, Math.max(0, Math.min(65535, val)), true);
            }
        }
    }
    return { data: dst, strideBytes: dstWidth * 8 };
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

export type PeakNormalizationOutcome =
    | {
        kind: 'applied';
        observedPeak: number;
        targetPeak: number;
        scale: number;
        format: 'rgbaf16' | 'rgba1010102';
    }
    | {
        kind: 'skipped';
        reason: string;
        format: 'rgbaf16' | 'rgba1010102';
    };

export interface DecodePrimaryToHdrIntentResult {
    image: DecodedHdrIntentImage;
    formatResolution: HdrIntentFormatResolution;
    bitsPerPixel: number;
    peakNormalization: PeakNormalizationOutcome | null;
}

function decodePrimaryToHdrIntent(
    heif: LibHeifModule,
    primaryImage: HeifPrimaryImage,
    nclx: HdrNclxInfo,
    orientation: number,
    options: { memoryTier?: HdrIntentMemoryTier; targetPeakLinear?: number; filename?: string } = {},
): DecodePrimaryToHdrIntentResult {
    let width = primaryImage.get_width();
    let height = primaryImage.get_height();
    emitHeifProbe('heif-pre-decode-image2');
    const decoded = heif.heif_js_decode_image2(
        primaryImage.handle,
        heif.heif_colorspace.heif_colorspace_RGB,
        heif.heif_chroma.heif_chroma_interleaved_RRGGBBAA_LE
    );
    emitHeifProbe('heif-post-decode-image2');
    if (!decoded || decoded.code) {
        const code = decoded && typeof decoded.code === 'number' ? decoded.code : null;
        const firstChannel = decoded?.channels?.[0];
        const bppRaw = firstChannel ? Number(firstChannel.bits_per_pixel) : NaN;
        const bitsPerPixel = Number.isFinite(bppRaw) ? bppRaw : null;
        const filename = typeof options.filename === 'string' ? options.filename : null;
        recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
            type: 'hdr-intent-decode-failed',
            source: 'heif',
            code,
            bitsPerPixel,
            primaries: nclx.primaries,
            transfer: nclx.transfer,
            width,
            height,
            filename,
        });
        console.error('[HEIF HDR] primary image decode failed', {
            code,
            bitsPerPixel,
            primaries: nclx.primaries,
            transfer: nclx.transfer,
            width,
            height,
            filename,
        });
        throw new Error(
            `HEIF HDR primary image decode failed (code=${code ?? 'unknown'}, bpp=${bitsPerPixel ?? 'unknown'}, primaries=${nclx.primaries}, transfer=${nclx.transfer}, ${width}x${height})`,
        );
    }

    const interleavedChannel = decoded.channels?.find((channel: HeifInterleavedChannel) => channel.id === heif.heif_channel.heif_channel_interleaved)
        || decoded.channels?.[0];
    if (!interleavedChannel?.data) {
        throw new Error('HEIF HDR primary image did not expose interleaved 16-bit pixels');
    }
    emitHeifProbe('heif-interleaved-channel-found');

    let effectiveSrcBytes: Uint8Array = interleavedChannel.data;
    let effectiveSrcStride = interleavedChannel.stride || (width * 8);
    const longEdgeCap = HDR_INTENT_MAX_LONG_EDGE;
    const constrained = constrainHdrIntentDimensions(width, height, longEdgeCap);
    if (constrained.changed) {
        const downscaled = downscale16BitInterleavedRgba(
            effectiveSrcBytes,
            width,
            height,
            effectiveSrcStride,
            constrained.width,
            constrained.height,
        );
        recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
            type: 'hdr-intent-downscaled',
            source: 'heif',
            sourceWidth: width,
            sourceHeight: height,
            targetWidth: constrained.width,
            targetHeight: constrained.height,
            longEdgeCap,
        });
        effectiveSrcBytes = downscaled.data;
        effectiveSrcStride = downscaled.strideBytes;
        width = constrained.width;
        height = constrained.height;
    }

    const { width: outWidth, height: outHeight } = getOrientedDimensions(width, height, orientation);
    const srcView = new DataView(
        effectiveSrcBytes.buffer,
        effectiveSrcBytes.byteOffset,
        effectiveSrcBytes.byteLength
    );
    const strideBytes = effectiveSrcStride;
    const channelCodeMax = resolveChannelCodeMax(interleavedChannel);
    const bitsPerPixel = Number(interleavedChannel.bits_per_pixel);
    const formatResolution = resolveHdrIntentFormat({
        bitsPerPixel,
        memoryTier: options.memoryTier ?? 'mid',
    });
    const shouldPack1010102 = formatResolution.format === 'rgba1010102';
    const targetPeakLinear = options.targetPeakLinear;
    const peakNormalizeRequested = typeof targetPeakLinear === 'number' && Number.isFinite(targetPeakLinear) && targetPeakLinear > 0;

    let observedPeakLinear = 0;
    let peakNormalization: PeakNormalizationOutcome | null = null;
    if (peakNormalizeRequested) {
        for (let y = 0; y < outHeight; y++) {
            for (let x = 0; x < outWidth; x++) {
                const srcCoord = mapOrientedPixelToSource(x, y, width, height, orientation);
                const srcOffset = srcCoord.y * strideBytes + srcCoord.x * 8;
                const r = Math.min(LIBULTRAHDR_MAX_LINEAR, decodeHdrChannelToLinear(srcView.getUint16(srcOffset, true), nclx.transfer, channelCodeMax));
                const g = Math.min(LIBULTRAHDR_MAX_LINEAR, decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 2, true), nclx.transfer, channelCodeMax));
                const b = Math.min(LIBULTRAHDR_MAX_LINEAR, decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 4, true), nclx.transfer, channelCodeMax));
                if (r > observedPeakLinear) observedPeakLinear = r;
                if (g > observedPeakLinear) observedPeakLinear = g;
                if (b > observedPeakLinear) observedPeakLinear = b;
            }
        }
    }

    const targetFormat: 'rgbaf16' | 'rgba1010102' = shouldPack1010102 ? 'rgba1010102' : 'rgbaf16';
    let scale = 1.0;
    if (peakNormalizeRequested) {
        if (observedPeakLinear > 0 && Number.isFinite(observedPeakLinear)) {
            scale = (targetPeakLinear as number) / observedPeakLinear;
            peakNormalization = {
                kind: 'applied',
                observedPeak: observedPeakLinear,
                targetPeak: targetPeakLinear as number,
                scale,
                format: targetFormat,
            };
        } else {
            peakNormalization = {
                kind: 'skipped',
                reason: 'no-signal',
                format: targetFormat,
            };
        }
    }

    if (shouldPack1010102) {
        emitHeifProbe('heif-pre-pack1010102-alloc');
        const packedBytes = new Uint8Array(outWidth * outHeight * 4);
        const packedView = new DataView(packedBytes.buffer);
        emitHeifProbe('heif-post-pack1010102-alloc');

        const transfer = nclx.transfer;
        for (let y = 0; y < outHeight; y++) {
            for (let x = 0; x < outWidth; x++) {
                const srcCoord = mapOrientedPixelToSource(x, y, width, height, orientation);
                const srcOffset = srcCoord.y * strideBytes + srcCoord.x * 8;
                const dstIndex = y * outWidth + x;
                let r: number;
                let g: number;
                let b: number;
                if (peakNormalizeRequested && scale !== 1.0) {
                    const linR = decodeHdrChannelToLinear(srcView.getUint16(srcOffset, true), transfer, channelCodeMax) * scale;
                    const linG = decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 2, true), transfer, channelCodeMax) * scale;
                    const linB = decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 4, true), transfer, channelCodeMax) * scale;
                    r = encodeLinearToHdrChannel(linR, transfer, 1023);
                    g = encodeLinearToHdrChannel(linG, transfer, 1023);
                    b = encodeLinearToHdrChannel(linB, transfer, 1023);
                } else {
                    r = scaleChannelTo10Bit(srcView.getUint16(srcOffset, true), channelCodeMax);
                    g = scaleChannelTo10Bit(srcView.getUint16(srcOffset + 2, true), channelCodeMax);
                    b = scaleChannelTo10Bit(srcView.getUint16(srcOffset + 4, true), channelCodeMax);
                }
                const a = scaleAlphaTo2Bit(srcView.getUint16(srcOffset + 6, true), channelCodeMax);
                const packedPixel = (r & 0x3ff)
                    | ((g & 0x3ff) << 10)
                    | ((b & 0x3ff) << 20)
                    | ((a & 0x03) << 30);
                packedView.setUint32(dstIndex * 4, packedPixel >>> 0, true);
            }
        }
        emitHeifProbe('heif-post-pack1010102-loop');

        if (decoded.image && typeof heif.heif_image_release === 'function') {
            heif.heif_image_release(decoded.image);
        }
        emitHeifProbe('heif-post-image-release-1010102');

        return {
            image: {
                data: packedBytes,
                width: outWidth,
                height: outHeight,
                strideBytes: outWidth * 4,
                format: 'rgba1010102',
                ct: getHdrIntentTransfer(nclx),
            },
            formatResolution,
            bitsPerPixel,
            peakNormalization,
        };
    }

    emitHeifProbe('heif-pre-halffloat-alloc');
    const halfFloatBytes = new Uint8Array(outWidth * outHeight * 8);
    const halfFloatView = new DataView(halfFloatBytes.buffer);
    emitHeifProbe('heif-post-halffloat-alloc');

    for (let y = 0; y < outHeight; y++) {
        for (let x = 0; x < outWidth; x++) {
            const srcCoord = mapOrientedPixelToSource(x, y, width, height, orientation);
            const srcOffset = srcCoord.y * strideBytes + srcCoord.x * 8;
            const dstOffset = (y * outWidth + x) * 8;

            const r = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset, true), nclx.transfer, channelCodeMax) * scale
            );
            const g = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 2, true), nclx.transfer, channelCodeMax) * scale
            );
            const b = Math.min(
                LIBULTRAHDR_MAX_LINEAR,
                decodeHdrChannelToLinear(srcView.getUint16(srcOffset + 4, true), nclx.transfer, channelCodeMax) * scale
            );
            const a = Math.max(0, Math.min(1, srcView.getUint16(srcOffset + 6, true) / channelCodeMax));

            halfFloatView.setUint16(dstOffset, float32ToFloat16(r), true);
            halfFloatView.setUint16(dstOffset + 2, float32ToFloat16(g), true);
            halfFloatView.setUint16(dstOffset + 4, float32ToFloat16(b), true);
            halfFloatView.setUint16(dstOffset + 6, float32ToFloat16(a), true);
        }
    }
    emitHeifProbe('heif-post-halffloat-loop');

    if (decoded.image && typeof heif.heif_image_release === 'function') {
        heif.heif_image_release(decoded.image);
    }
    emitHeifProbe('heif-post-image-release-halffloat');

    return {
        image: {
            data: halfFloatBytes,
            width: outWidth,
            height: outHeight,
            strideBytes: outWidth * 8,
            format: 'rgbaf16',
            ct: 'linear',
        },
        formatResolution,
        bitsPerPixel,
        peakNormalization,
    };
}

export async function processHeifHdr(
    file: File,
    options: { targetPeakLinear?: number } = {},
): Promise<HdrIntentHeifResult> {
    emitHeifProbe('heif-start');
    const heif = await initLibHeif();
    emitHeifProbe('heif-module-ready');
    const buffer = new Uint8Array(await file.arrayBuffer());
    emitHeifProbe('heif-file-read');
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
    emitHeifProbe('heif-container-parsed');

    const decoder = new heif.HeifDecoder();
    emitHeifProbe('heif-decoder-created');
    const images = decoder.decode(buffer.buffer);
    emitHeifProbe('heif-container-decoded');
    if (!images || images.length === 0) {
        throw new Error('No images found in HEIF file');
    }

    try {
        const primary = images[0];
        const memoryTier = getProcessingProfile().memoryTier;
        emitHeifProbe('heif-pre-decode-primary');
        const decodeResult = decodePrimaryToHdrIntent(heif, primary, supportedNclx, orientation, {
            memoryTier,
            targetPeakLinear: options.targetPeakLinear,
            filename: file.name || undefined,
        });
        emitHeifProbe('heif-post-decode-primary');
        const hdrIntentImage = decodeResult.image;
        if (decodeResult.formatResolution.downgraded) {
            recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
                type: 'hdr-intent-format-downgraded',
                fromFormat: 'rgbaf16',
                toFormat: decodeResult.formatResolution.format,
                reason: decodeResult.formatResolution.reason,
                memoryTier,
                bitsPerPixel: decodeResult.bitsPerPixel,
            });
        }
        if (decodeResult.peakNormalization) {
            const outcome = decodeResult.peakNormalization;
            if (outcome.kind === 'applied') {
                recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
                    type: 'hdr-intent-peak-normalized',
                    observedPeak: outcome.observedPeak,
                    targetPeak: outcome.targetPeak,
                    scale: outcome.scale,
                    stops: Math.log2(outcome.targetPeak),
                    format: outcome.format,
                });
            } else {
                recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
                    type: 'hdr-intent-peak-normalize-skipped',
                    reason: outcome.reason,
                    format: outcome.format,
                });
            }
        }
        const hdrIntent: HdrIntentPayload = hdrIntentImage.format === 'rgba1010102'
            ? {
                data: hdrIntentImage.data,
                width: hdrIntentImage.width,
                height: hdrIntentImage.height,
                strideBytes: hdrIntentImage.strideBytes,
                format: 'rgba1010102',
                cg: 'bt2100',
                ct: hdrIntentImage.ct as 'pq' | 'hlg',
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
    } finally {
        releaseHeifHandles(heif, decoder, images);
    }
}

function releaseHeifHandles(
    heif: LibHeifModule,
    decoder: HeifDecoderInstance,
    images: HeifPrimaryImage[],
): void {
    let releasedHandles = 0;
    for (const img of images) {
        try {
            if (typeof img.free === 'function') {
                img.free();
                releasedHandles++;
            } else if (img.handle && typeof heif.heif_image_handle_release === 'function') {
                heif.heif_image_handle_release(img.handle);
                (img as { handle: unknown }).handle = null;
                releasedHandles++;
            }
        } catch {
            // Teardown must never throw.
        }
    }
    let contextFreed = false;
    try {
        const ctx = decoder.decoder;
        if (ctx && typeof heif.heif_context_free === 'function') {
            heif.heif_context_free(ctx);
            decoder.decoder = null;
            contextFreed = true;
        }
    } catch {
        // Teardown must never throw.
    }
    try {
        recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
            type: 'heif-handles-released',
            trigger: 'post-process-heif-hdr',
            releasedHandles,
            contextFreed,
        });
    } catch {
        // Diagnostics must not block teardown (test runtimes lack localStorage).
    }
    emitHeifProbe('heif-handles-released');
}
