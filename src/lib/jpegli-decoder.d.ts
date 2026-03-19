export type JpegliEncodeOptions = {
    onProgress?: (progress: number, metadata?: Record<string, unknown>) => void;
    chunkRows?: number;
    inputMode?: string;
    iccProfile?: Uint8Array;
};

export function encodeJpegli(
    imageData: ImageData,
    quality: number,
    options?: JpegliEncodeOptions,
): Promise<Uint8Array>;
