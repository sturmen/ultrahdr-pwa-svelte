import { decodeJpegli } from './jpegli-decoder.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';
import { recordProcessingMemoryDiagnostics } from './diagnostics-events.ts';
import { resizeRasterImageSync } from './raster-image.ts';
import { HDR_INTENT_MAX_LONG_EDGE } from './constants.ts';
import type { HdrIntentJpegResult, PackedHdrIntentPayload } from './processing-types.ts';

const APP2_MARKER_HIGH = 0xff;
const APP2_MARKER_LOW = 0xe2;
const ICC_SIGNATURE = 'ICC_PROFILE\0';
const ICC_TAG_TABLE_OFFSET = 128;

export interface JpegCicpInfo {
    primaries: number;
    transfer: number;
    matrix: number;
    fullRange: boolean;
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
    return ((bytes[offset] << 8) | bytes[offset + 1]) >>> 0;
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
    return (
        (bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]
    ) >>> 0;
}

function bytesEqualAscii(bytes: Uint8Array, offset: number, value: string): boolean {
    if (offset + value.length > bytes.length) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        if (bytes[offset + i] !== value.charCodeAt(i)) {
            return false;
        }
    }
    return true;
}

interface IccChunk {
    sequence: number;
    total: number;
    data: Uint8Array;
}

function collectIccChunks(bytes: Uint8Array): IccChunk[] {
    const chunks: IccChunk[] = [];
    let offset = 0;
    const limit = bytes.length;

    if (limit < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
        return chunks;
    }
    offset = 2;

    while (offset + 4 <= limit) {
        if (bytes[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        let markerCursor = offset + 1;
        while (markerCursor < limit && bytes[markerCursor] === 0xff) {
            markerCursor += 1;
        }
        if (markerCursor >= limit) {
            break;
        }
        const marker = bytes[markerCursor];
        offset = markerCursor + 1;

        if (marker === 0xd8 || marker === 0xd9) {
            continue;
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            continue;
        }
        if (offset + 2 > limit) {
            break;
        }
        const segmentLength = readUint16BE(bytes, offset);
        if (segmentLength < 2 || offset + segmentLength > limit) {
            break;
        }
        const payloadStart = offset + 2;
        const payloadEnd = offset + segmentLength;
        offset = payloadEnd;

        if (marker !== APP2_MARKER_LOW) {
            continue;
        }

        const sigEnd = payloadStart + ICC_SIGNATURE.length;
        if (sigEnd + 2 > payloadEnd) {
            continue;
        }
        if (!bytesEqualAscii(bytes, payloadStart, ICC_SIGNATURE)) {
            continue;
        }
        const sequence = bytes[sigEnd];
        const total = bytes[sigEnd + 1];
        const dataStart = sigEnd + 2;
        if (dataStart > payloadEnd) {
            continue;
        }
        const data = bytes.subarray(dataStart, payloadEnd);
        chunks.push({ sequence, total, data });
    }

    return chunks;
}

function assembleIccProfile(chunks: IccChunk[]): Uint8Array | null {
    if (chunks.length === 0) {
        return null;
    }
    const sorted = [...chunks].sort((a, b) => a.sequence - b.sequence);
    let totalLength = 0;
    for (const chunk of sorted) {
        totalLength += chunk.data.length;
    }
    const out = new Uint8Array(totalLength);
    let cursor = 0;
    for (const chunk of sorted) {
        out.set(chunk.data, cursor);
        cursor += chunk.data.length;
    }
    return out;
}

function findCicpTagInIcc(icc: Uint8Array): JpegCicpInfo | null {
    if (icc.length < ICC_TAG_TABLE_OFFSET + 4) {
        return null;
    }
    const tagCount = readUint32BE(icc, ICC_TAG_TABLE_OFFSET);
    const tableStart = ICC_TAG_TABLE_OFFSET + 4;
    const tableEnd = tableStart + tagCount * 12;
    if (tableEnd > icc.length) {
        return null;
    }
    for (let i = 0; i < tagCount; i++) {
        const entryOffset = tableStart + i * 12;
        if (!bytesEqualAscii(icc, entryOffset, 'cicp')) {
            continue;
        }
        const dataOffset = readUint32BE(icc, entryOffset + 4);
        const dataSize = readUint32BE(icc, entryOffset + 8);
        if (dataOffset + dataSize > icc.length || dataSize < 12) {
            return null;
        }
        const dataStart = dataOffset + 8;
        if (dataStart + 4 > icc.length) {
            return null;
        }
        const primaries = icc[dataStart];
        const transfer = icc[dataStart + 1];
        const matrix = icc[dataStart + 2];
        const fullRange = icc[dataStart + 3] === 1;
        return { primaries, transfer, matrix, fullRange };
    }
    return null;
}

export function parseJpegCicpFromApp2(bytes: Uint8Array): JpegCicpInfo | null {
    if (!(bytes instanceof Uint8Array) || bytes.length < 4) {
        return null;
    }
    const chunks = collectIccChunks(bytes);
    const icc = assembleIccProfile(chunks);
    if (!icc) {
        return null;
    }
    return findCicpTagInIcc(icc);
}

export function isJpegHdrInputCicp(info: JpegCicpInfo | null): info is JpegCicpInfo {
    if (!info) {
        return false;
    }
    return info.primaries === 9 && (info.transfer === 16 || info.transfer === 18);
}

export interface ConstrainedDimensions {
    width: number;
    height: number;
    changed: boolean;
}

/**
 * Cap a raster's long edge to {@param maxLongEdge}, preserving aspect ratio.
 * Returns `changed: false` when the source already fits.
 */
export function constrainHdrIntentDimensions(
    sourceWidth: number,
    sourceHeight: number,
    maxLongEdge: number,
): ConstrainedDimensions {
    const longEdge = Math.max(sourceWidth, sourceHeight);
    if (longEdge <= maxLongEdge) {
        return { width: sourceWidth, height: sourceHeight, changed: false };
    }
    const scale = maxLongEdge / longEdge;
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    return { width, height, changed: true };
}

function expand8To10(value: number): number {
    return ((value << 2) | (value >> 6)) & 0x3ff;
}

function pack1010102InPlaceFromRgba8(rgba: Uint8ClampedArray, width: number, height: number): Uint8Array {
    const pixelCount = width * height;
    const out = new Uint8Array(rgba.buffer, rgba.byteOffset, pixelCount * 4);
    const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
    for (let i = 0; i < pixelCount; i++) {
        const offset = i * 4;
        const r = expand8To10(out[offset]);
        const g = expand8To10(out[offset + 1]);
        const b = expand8To10(out[offset + 2]);
        const packed = ((3 << 30) | (b << 20) | (g << 10) | r) >>> 0;
        view.setUint32(offset, packed, true);
    }
    return out;
}

export async function processJpegHdr(file: File): Promise<HdrIntentJpegResult> {
    let buffer: Uint8Array | null = new Uint8Array(await file.arrayBuffer());
    const cicp = parseJpegCicpFromApp2(buffer);
    if (!isJpegHdrInputCicp(cicp)) {
        throw new Error('JPEG is not an HDR PQ/HLG input (missing or non-HDR CICP)');
    }
    const sourceExifBytes = extractExifApp1PayloadFromInput(
        buffer,
        file.name || '',
        file.type || 'image/jpeg',
    );

    let decoded: { width: number; height: number; data: Uint8ClampedArray } | null = await decodeJpegli(buffer);
    buffer = null;
    const ct: 'pq' | 'hlg' = cicp.transfer === 16 ? 'pq' : 'hlg';
    const sourceWidth = decoded.width;
    const sourceHeight = decoded.height;
    const constrained = constrainHdrIntentDimensions(sourceWidth, sourceHeight, HDR_INTENT_MAX_LONG_EDGE);
    if (constrained.changed) {
        const resized = resizeRasterImageSync(
            {
                width: sourceWidth,
                height: sourceHeight,
                data: decoded.data,
            },
            constrained.width,
            constrained.height,
        );
        decoded = { width: resized.width, height: resized.height, data: resized.data };
        recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
            type: 'hdr-intent-downscaled',
            source: 'jpeg',
            sourceWidth,
            sourceHeight,
            targetWidth: constrained.width,
            targetHeight: constrained.height,
            longEdgeCap: HDR_INTENT_MAX_LONG_EDGE,
        });
    }
    const packed = pack1010102InPlaceFromRgba8(decoded.data, decoded.width, decoded.height);
    const width = decoded.width;
    const height = decoded.height;
    decoded = null;

    const hdrIntent: PackedHdrIntentPayload = {
        data: packed,
        width,
        height,
        strideBytes: width * 4,
        format: 'rgba1010102',
        cg: 'bt2100',
        ct,
        range: cicp.fullRange ? 'full' : 'limited',
    };

    recordProcessingMemoryDiagnostics(globalThis as typeof globalThis, {
        type: 'hdr-intent-jpeg-classified',
        primaries: cicp.primaries,
        transfer: cicp.transfer,
        matrix: cicp.matrix,
        fullRange: cicp.fullRange,
        width,
        height,
        format: 'rgba1010102',
        ct,
    });

    return {
        kind: 'hdr-intent-jpeg',
        hdrIntent,
        sourceExifBytes,
    };
}
