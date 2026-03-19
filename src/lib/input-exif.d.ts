import type { ProcessingPathClassification } from './processing-types.ts';

export function extractExifApp1PayloadFromInput(
    input: Uint8Array,
    fileName: string,
    mimeType: string,
): Uint8Array | null;

export function probeHeifProcessingPathFromHeaders(
    headerBytes: Uint8Array,
    fileName: string,
    mimeType: string,
): ProcessingPathClassification;
