/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { parseJpegCicpFromApp2 } from '../jpeg-hdr-processing.ts';

const ICC_HEADER_BYTES = 128;

function be32(value: number): number[] {
    return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function be16(value: number): number[] {
    return [(value >>> 8) & 0xff, value & 0xff];
}

function asciiBytes(value: string): number[] {
    return Array.from(value, (ch) => ch.charCodeAt(0));
}

function buildIccProfile(options: {
    includeCicp: boolean;
    cicpBytes?: [number, number, number, number];
    extraTagBytes?: number;
}): Uint8Array {
    const header = new Array<number>(ICC_HEADER_BYTES).fill(0);
    const tagCount = options.includeCicp ? 1 : 0;
    const tagTable: number[] = [];
    tagTable.push(...be32(tagCount));
    const tagDataOffsetBase = ICC_HEADER_BYTES + 4 + tagCount * 12;
    const tagDataParts: number[] = [];

    if (options.includeCicp) {
        const cicpData = [
            ...asciiBytes('cicp'),
            0, 0, 0, 0,
            ...(options.cicpBytes ?? [9, 16, 9, 1]),
            0, 0, 0, 0,
        ];
        const cicpOffset = tagDataOffsetBase;
        tagTable.push(...asciiBytes('cicp'));
        tagTable.push(...be32(cicpOffset));
        tagTable.push(...be32(cicpData.length));
        tagDataParts.push(...cicpData);
    }

    const filler: number[] = [];
    if (options.extraTagBytes && options.extraTagBytes > 0) {
        for (let i = 0; i < options.extraTagBytes; i++) {
            filler.push(0);
        }
    }

    const totalSize = ICC_HEADER_BYTES + 4 + tagTable.length - 4 + tagDataParts.length + filler.length;
    header[0] = (totalSize >>> 24) & 0xff;
    header[1] = (totalSize >>> 16) & 0xff;
    header[2] = (totalSize >>> 8) & 0xff;
    header[3] = totalSize & 0xff;

    return new Uint8Array([
        ...header,
        ...tagTable,
        ...tagDataParts,
        ...filler,
    ]);
}

function buildJpegWithSingleChunkIcc(iccProfile: Uint8Array): Uint8Array {
    const sig = [...asciiBytes('ICC_PROFILE'), 0x00];
    const seq = [0x01, 0x01];
    const payloadLength = sig.length + seq.length + iccProfile.length;
    const segmentLength = payloadLength + 2;

    const bytes: number[] = [
        0xff, 0xd8,
        0xff, 0xe2,
        ...be16(segmentLength),
        ...sig,
        ...seq,
        ...iccProfile,
        0xff, 0xd9,
    ];
    return new Uint8Array(bytes);
}

function buildJpegWithChunkedIcc(iccProfile: Uint8Array, chunks: number): Uint8Array {
    const chunkSize = Math.ceil(iccProfile.length / chunks);
    const sig = [...asciiBytes('ICC_PROFILE'), 0x00];
    const bytes: number[] = [0xff, 0xd8];
    for (let i = 0; i < chunks; i++) {
        const slice = iccProfile.subarray(i * chunkSize, Math.min((i + 1) * chunkSize, iccProfile.length));
        const seq = [i + 1, chunks];
        const payloadLength = sig.length + seq.length + slice.length;
        const segmentLength = payloadLength + 2;
        bytes.push(
            0xff, 0xe2,
            ...be16(segmentLength),
            ...sig,
            ...seq,
            ...Array.from(slice),
        );
    }
    bytes.push(0xff, 0xd9);
    return new Uint8Array(bytes);
}

describe('parseJpegCicpFromApp2', () => {
    it('returns Rec.2020 PQ CICP for a JPEG carrying primaries=9 transfer=16', () => {
        const icc = buildIccProfile({ includeCicp: true, cicpBytes: [9, 16, 9, 1] });
        const jpeg = buildJpegWithSingleChunkIcc(icc);

        expect(parseJpegCicpFromApp2(jpeg)).toEqual({
            primaries: 9,
            transfer: 16,
            matrix: 9,
            fullRange: true,
        });
    });

    it('returns Rec.2020 HLG CICP for primaries=9 transfer=18', () => {
        const icc = buildIccProfile({ includeCicp: true, cicpBytes: [9, 18, 9, 1] });
        const jpeg = buildJpegWithSingleChunkIcc(icc);

        expect(parseJpegCicpFromApp2(jpeg)).toEqual({
            primaries: 9,
            transfer: 18,
            matrix: 9,
            fullRange: true,
        });
    });

    it('returns sRGB CICP when primaries=1 transfer=13', () => {
        const icc = buildIccProfile({ includeCicp: true, cicpBytes: [1, 13, 0, 0] });
        const jpeg = buildJpegWithSingleChunkIcc(icc);

        expect(parseJpegCicpFromApp2(jpeg)).toEqual({
            primaries: 1,
            transfer: 13,
            matrix: 0,
            fullRange: false,
        });
    });

    it('returns null when the ICC profile contains no cicp tag', () => {
        const icc = buildIccProfile({ includeCicp: false });
        const jpeg = buildJpegWithSingleChunkIcc(icc);

        expect(parseJpegCicpFromApp2(jpeg)).toBeNull();
    });

    it('returns null when the JPEG has no APP2 ICC profile marker', () => {
        const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
        expect(parseJpegCicpFromApp2(jpeg)).toBeNull();
    });

    it('reassembles a multi-chunk APP2 ICC profile before reading the cicp tag', () => {
        const icc = buildIccProfile({ includeCicp: true, cicpBytes: [9, 16, 9, 1], extraTagBytes: 4000 });
        const jpeg = buildJpegWithChunkedIcc(icc, 3);

        expect(parseJpegCicpFromApp2(jpeg)).toEqual({
            primaries: 9,
            transfer: 16,
            matrix: 9,
            fullRange: true,
        });
    });

    it('returns null for empty or truncated buffers', () => {
        expect(parseJpegCicpFromApp2(new Uint8Array([]))).toBeNull();
        expect(parseJpegCicpFromApp2(new Uint8Array([0xff, 0xd8]))).toBeNull();
    });
});
