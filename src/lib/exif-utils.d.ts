export type JpegTransform =
    | 'flipH'
    | 'flipV'
    | 'transpose'
    | 'transverse'
    | '90'
    | '180'
    | '270';

export function insertExifSegment(jpegBytes: Uint8Array, exifPayload: Uint8Array): Uint8Array;
export function stripExifSegments(jpegBytes: Uint8Array): Uint8Array;
export function normalizeExifOrientationTo1(exifPayload: Uint8Array): Uint8Array;
export function extractExifOrientation(exifPayload: Uint8Array): number;
export function extractExifPayloadFromJpeg(jpegBytes: Uint8Array): Uint8Array | null;
