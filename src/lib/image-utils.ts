import type { GainMapMetadata } from './gain-map-metadata.js';
import { extractExifOrientation, extractExifPayloadFromJpeg } from './exif-utils.js';
import { decodeJpegli, encodeJpegli } from './jpegli-decoder.js';
import { decodeRasterBuffer, resizeRasterImage, rotateRasterImage } from './raster-image.ts';

export type ImageDataLike = ImageData | {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    colorSpace?: PredefinedColorSpace;
};

export async function loadImageData(
    source: string | Blob,
    config: { imageOrientation?: string } & Record<string, unknown> = {},
    preloadedBytes: Uint8Array | null = null,
): Promise<{
    imageData: ImageData;
    width: number;
    height: number;
}> {
    let blob: Blob;
    if (source instanceof Blob) {
        blob = source;
    } else {
        const response = await fetch(source);
        if (typeof response.blob === 'function') {
            blob = await response.blob();
        } else if (typeof response.arrayBuffer === 'function') {
            blob = new Blob([await response.arrayBuffer()]);
        } else {
            throw new Error('Image decode response does not provide blob() or arrayBuffer()');
        }
    }

    const bytes = preloadedBytes ?? await blobToUint8Array(blob);

    if (blob.type === 'image/jpeg') {
        const decoded = await decodeJpegli(bytes);
        const imageData = await orientDecodedJpegImageData(
            new ImageData(decoded.data, decoded.width, decoded.height),
            bytes,
            config,
        );
        const width = imageData.width;
        const height = imageData.height;
        return { imageData, width, height };
    }

    const imageData = await decodeRasterBuffer(bytes);
    const width = imageData.width;
    const height = imageData.height;
    return { imageData, width, height };
}

function getTransformedDimensions(width: number, height: number, degrees: number): {
    width: number;
    height: number;
    normalizedRotation: number;
} {
    const normalized = ((degrees || 0) % 360 + 360) % 360;
    const isPortrait = normalized === 90 || normalized === 270;
    return {
        width: isPortrait ? height : width,
        height: isPortrait ? width : height,
        normalizedRotation: normalized,
    };
}

export async function transformImageData(
    imageData: ImageDataLike,
    {
        width = imageData.width,
        height = imageData.height,
        degrees = 0,
    }: {
        width?: number;
        height?: number;
        degrees?: number;
    } = {},
): Promise<ImageData> {
    const normalizedImageData = normalizeImageData(imageData);
    const targetWidth = Math.max(1, Math.floor(Number(width) || imageData.width || 1));
    const targetHeight = Math.max(1, Math.floor(Number(height) || imageData.height || 1));
    const { width: outputWidth, height: outputHeight, normalizedRotation } = getTransformedDimensions(
        targetWidth,
        targetHeight,
        degrees,
    );

    if (
        normalizedImageData.width === outputWidth
        && normalizedImageData.height === outputHeight
        && normalizedRotation === 0
        && targetWidth === normalizedImageData.width
        && targetHeight === normalizedImageData.height
    ) {
        return normalizedImageData;
    }

    let transformed = normalizedImageData;
    if (targetWidth !== normalizedImageData.width || targetHeight !== normalizedImageData.height) {
        transformed = await resizeRasterImage(transformed, targetWidth, targetHeight);
    }
    if (normalizedRotation !== 0) {
        transformed = await rotateRasterImage(transformed, normalizedRotation);
    }
    return transformed;
}

export async function resizeImageData(imageData: ImageDataLike, targetWidth: number, targetHeight: number): Promise<ImageData> {
    return transformImageData(imageData, { width: targetWidth, height: targetHeight });
}

export async function rotateImageData(imageData: ImageDataLike, degrees: number): Promise<ImageData> {
    return transformImageData(imageData, { degrees });
}

export async function jpegBytesToImageData(
    jpegBytes: Uint8Array,
    config: { imageOrientation?: string } & Record<string, unknown> = {},
): Promise<ImageData> {
    const decoded = await decodeJpegli(jpegBytes);
    return orientDecodedJpegImageData(
        new ImageData(decoded.data, decoded.width, decoded.height),
        jpegBytes,
        config,
    );
}

export async function imageDataToJpegBlob(imageData: ImageDataLike, quality = 0.95): Promise<Blob> {
    const normalizedImageData = normalizeImageData(imageData);
    const bytes = await encodeJpegli(normalizedImageData, Math.round(quality * 100));
    return new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
}

type ImageUtilsProbeSink = (substage: string) => void;
let imageUtilsProbeSink: ImageUtilsProbeSink | null = null;

export function setImageUtilsProbeSink(sink: ImageUtilsProbeSink | null): void {
    imageUtilsProbeSink = sink;
}

function emitImageUtilsProbe(substage: string): void {
    if (imageUtilsProbeSink) {
        try {
            imageUtilsProbeSink(substage);
        } catch {
            // Probe diagnostics must not affect pipeline.
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
                stage: 'extract-source-exif',
                substage,
            },
        }));
    } catch {
        // best-effort probe
    }
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    if (blob && typeof blob.arrayBuffer === 'function') {
        emitImageUtilsProbe('pre-blob-array-buffer');
        const ab = await blob.arrayBuffer();
        emitImageUtilsProbe('post-blob-array-buffer');
        const result = new Uint8Array(ab);
        emitImageUtilsProbe('post-uint8array-wrap');
        return result;
    }

    if (typeof Response !== 'undefined') {
        emitImageUtilsProbe('pre-response-array-buffer');
        const arrayBuffer = await new Response(blob).arrayBuffer();
        emitImageUtilsProbe('post-response-array-buffer');
        const result = new Uint8Array(arrayBuffer);
        emitImageUtilsProbe('post-uint8array-wrap');
        return result;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
        reader.readAsArrayBuffer(blob);
    });
}

export function readBlobAsDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob as data URL'));
        reader.readAsDataURL(blob);
    });
}

function normalizeImageData(imageData: ImageDataLike): ImageData {
    if (typeof ImageData === 'undefined') {
        throw new Error('ImageData is not supported in this environment');
    }
    if (imageData instanceof ImageData) {
        return imageData;
    }

    const colorSpace = typeof imageData.colorSpace === 'string' ? imageData.colorSpace : undefined;
    return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height,
        colorSpace ? { colorSpace } : undefined
    );
}

function exifOrientationToRotationDegrees(orientation: number): number {
    switch (orientation) {
    case 3:
        return 180;
    case 6:
        return 90;
    case 8:
        return 270;
    default:
        return 0;
    }
}

async function orientDecodedJpegImageData(
    imageData: ImageData,
    jpegBytes: Uint8Array,
    config: { imageOrientation?: string } & Record<string, unknown>,
): Promise<ImageData> {
    if (config.imageOrientation === 'none') {
        return imageData;
    }

    const exifPayload = extractExifPayloadFromJpeg(jpegBytes);
    const orientation = exifPayload instanceof Uint8Array ? extractExifOrientation(exifPayload) : 1;
    const rotationDegrees = exifOrientationToRotationDegrees(orientation);
    if (rotationDegrees === 0) {
        return imageData;
    }

    return rotateRasterImage(imageData, rotationDegrees);
}

export function isMonochromeGainMapImageData(imageData: ImageDataLike | null | undefined): boolean {
    if (!imageData?.data) {
        return true;
    }
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== data[i + 1] || data[i] !== data[i + 2]) {
            return false;
        }
    }
    return true;
}

export function toMonochromeGainMapImageData(imageData: ImageDataLike): ImageData {
    const normalizedImageData = normalizeImageData(imageData);
    const monochromeData = new Uint8ClampedArray(normalizedImageData.data.length);
    for (let i = 0; i < normalizedImageData.data.length; i += 4) {
        const gray = Math.round((
            normalizedImageData.data[i]
            + normalizedImageData.data[i + 1]
            + normalizedImageData.data[i + 2]
        ) / 3);
        monochromeData[i] = gray;
        monochromeData[i + 1] = gray;
        monochromeData[i + 2] = gray;
        monochromeData[i + 3] = normalizedImageData.data[i + 3];
    }
    return new ImageData(monochromeData, normalizedImageData.width, normalizedImageData.height);
}

export function isSingleChannelGainMapMetadata(metadata: GainMapMetadata | null | undefined): boolean {
    if (!metadata) {
        return true;
    }
    const channelKeys: Array<keyof Pick<GainMapMetadata, 'gainMapMin' | 'gainMapMax' | 'gamma' | 'offsetSdr' | 'offsetHdr'>> = [
        'gainMapMin',
        'gainMapMax',
        'gamma',
        'offsetSdr',
        'offsetHdr',
    ];
    return channelKeys.every((key) => {
        const values = metadata[key];
        if (!Array.isArray(values) || values.length < 3) {
            return true;
        }
        return values[0] === values[1] && values[0] === values[2];
    });
}

export function toSingleChannelGainMapMetadata(metadata: GainMapMetadata | null | undefined): GainMapMetadata | null | undefined {
    if (!metadata) {
        return metadata;
    }
    const normalized: GainMapMetadata = {
        ...metadata,
    };
    const channelKeys: Array<keyof Pick<GainMapMetadata, 'gainMapMin' | 'gainMapMax' | 'gamma' | 'offsetSdr' | 'offsetHdr'>> = [
        'gainMapMin',
        'gainMapMax',
        'gamma',
        'offsetSdr',
        'offsetHdr',
    ];
    for (const key of channelKeys) {
        const values = metadata[key];
        if (!Array.isArray(values) || values.length === 0) {
            continue;
        }
        const channel0 = values[0];
        normalized[key] = [channel0, channel0, channel0];
    }
    return normalized;
}
