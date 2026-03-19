import type { JpegTransform } from './exif-utils.js';

export class JpegTransformError extends Error {
    code: string;
    details: Record<string, unknown> | null;
}

export function resetJpegtranForTests(): void;
export function ensureJpegtranLoaded(): Promise<unknown>;
export function rotateJpeg(
    inputBytes: Uint8Array | ArrayBuffer,
    transform: JpegTransform,
    options?: {
        trim?: boolean;
        perfect?: boolean;
    },
): Promise<Uint8Array>;
