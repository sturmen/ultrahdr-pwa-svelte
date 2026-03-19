import type { GainMapMetadata } from './gain-map-metadata.js';

export type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
export type CanvasBlobExportOptions = {
    colorSpace?: PredefinedColorSpace;
};
export type ImageDataLike = ImageData | {
    width: number;
    height: number;
    data: Uint8ClampedArray;
    colorSpace?: PredefinedColorSpace;
};
export type DecodeDrawable = CanvasImageSource & {
    width: number;
    height: number;
    close?: () => void;
};

type CanvasPoolEntry = {
    canvas: CanvasLike;
    ctx: Canvas2DContext;
};

const canvasPool: CanvasPoolEntry[] = [];

function acquirePooledCanvas(
    width: number,
    height: number,
    errorMessage: string,
    options: CanvasBlobExportOptions = {},
): CanvasPoolEntry {
    const pooled = canvasPool.pop();
    if (!pooled) {
        return createCanvasWithContext(width, height, errorMessage, options);
    }

    pooled.canvas.width = width;
    pooled.canvas.height = height;
    return pooled;
}

function releasePooledCanvas(entry: CanvasPoolEntry | null | undefined): void {
    if (!entry?.canvas || !entry?.ctx) {
        return;
    }
    entry.canvas.width = 1;
    entry.canvas.height = 1;
    if (canvasPool.length < 2) {
        canvasPool.push(entry);
    }
}

export function createCanvasWithContext(
    width: number,
    height: number,
    errorMessage = 'Canvas not available',
    options: CanvasBlobExportOptions = {},
): CanvasPoolEntry {
    const contextOptions: CanvasRenderingContext2DSettings = { willReadFrequently: true };
    if (typeof options.colorSpace === 'string' && options.colorSpace) {
        contextOptions.colorSpace = options.colorSpace;
    }
    if (typeof document === 'undefined') {
        if (typeof OffscreenCanvas !== 'undefined') {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d', contextOptions);
            if (!ctx) {
                throw new Error(errorMessage);
            }
            return { canvas, ctx };
        }
        throw new Error(`${errorMessage} (document and OffscreenCanvas are both undefined)`);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', contextOptions);
    if (!ctx) {
        throw new Error(errorMessage);
    }
    return { canvas, ctx };
}

export async function canvasToBlob(
    canvas: CanvasLike,
    type = 'image/jpeg',
    quality = 0.95,
    options: CanvasBlobExportOptions = {},
): Promise<Blob> {
    const blobOptions: ImageEncodeOptions & { colorSpace?: PredefinedColorSpace } = { type, quality };
    if (typeof options.colorSpace === 'string' && options.colorSpace) {
        blobOptions.colorSpace = options.colorSpace;
    }
    if ('convertToBlob' in canvas && typeof canvas.convertToBlob === 'function') {
        return canvas.convertToBlob(blobOptions);
    }
    if ('toBlob' in canvas && typeof canvas.toBlob === 'function') {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }
                reject(new Error('Canvas failed to produce a Blob'));
            }, type, quality);
        });
    }
    throw new Error('canvas blob export is not available in this environment');
}

export async function decodeDrawableFromBlob(blob: Blob, config: ImageBitmapOptions = {}): Promise<DecodeDrawable> {
    if (typeof createImageBitmap === 'function') {
        const bitmapOptions = { ...config };
        if (!bitmapOptions.imageOrientation) {
            bitmapOptions.imageOrientation = 'from-image';
        }
        return createImageBitmap(blob, bitmapOptions);
    }
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
        throw new Error('Image decoding requires createImageBitmap or DOM Image support');
    }

    const dataUrl = await readBlobAsDataURL(blob);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img as DecodeDrawable);
        img.onerror = () => reject(new Error('Failed to decode image blob'));
        img.src = dataUrl;
    });
}

export async function loadImageData(
    source: string | Blob,
    config: ImageBitmapOptions = {},
): Promise<{
    imageData: ImageData;
    width: number;
    height: number;
}> {
    let drawable: DecodeDrawable;
    if (source instanceof Blob) {
        drawable = await decodeDrawableFromBlob(source, config);
    } else {
        const response = await fetch(source);
        let blob: Blob;
        if (typeof response.blob === 'function') {
            blob = await response.blob();
        } else if (typeof response.arrayBuffer === 'function') {
            blob = new Blob([await response.arrayBuffer()]);
        } else {
            throw new Error('Image decode response does not provide blob() or arrayBuffer()');
        }
        drawable = await decodeDrawableFromBlob(blob, config);
    }

    const width = drawable.width;
    const height = drawable.height;
    const { ctx } = createCanvasWithContext(width, height, 'Canvas not available for loadImageData');

    ctx.drawImage(drawable, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    if (typeof drawable.close === 'function') {
        drawable.close();
    }
    return { imageData, width, height };
}

export async function imageDataToDrawable(imageData: ImageDataLike): Promise<CanvasImageSource> {
    const normalizedImageData = normalizeImageData(imageData);
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(normalizedImageData);
    }

    const { canvas, ctx } = createCanvasWithContext(
        normalizedImageData.width,
        normalizedImageData.height,
        'Canvas not available for imageDataToDrawable'
    );
    ctx.putImageData(normalizedImageData, 0, 0);
    return canvas;
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

    const surface = acquirePooledCanvas(outputWidth, outputHeight, 'Canvas not available for transform');
    const sourceSurface = acquirePooledCanvas(
        normalizedImageData.width,
        normalizedImageData.height,
        'Canvas not available for transform source'
    );
    sourceSurface.ctx.putImageData(normalizedImageData, 0, 0);
    const drawable = sourceSurface.canvas;

    try {
        if (normalizedRotation !== 0) {
            surface.ctx.save();
            surface.ctx.translate(outputWidth / 2, outputHeight / 2);
            surface.ctx.rotate((normalizedRotation * Math.PI) / 180);
            surface.ctx.drawImage(drawable, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
            surface.ctx.restore();
        } else {
            surface.ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);
        }

        return surface.ctx.getImageData(0, 0, outputWidth, outputHeight);
    } finally {
        releasePooledCanvas(sourceSurface);
        releasePooledCanvas(surface);
    }
}

export async function resizeImageData(imageData: ImageDataLike, targetWidth: number, targetHeight: number): Promise<ImageData> {
    return transformImageData(imageData, { width: targetWidth, height: targetHeight });
}

export async function rotateImageData(imageData: ImageDataLike, degrees: number): Promise<ImageData> {
    return transformImageData(imageData, { degrees });
}

export async function jpegBytesToImageData(jpegBytes: Uint8Array, config: ImageBitmapOptions = {}): Promise<ImageData> {
    const jpegBytesCopy = new Uint8Array(jpegBytes.byteLength);
    jpegBytesCopy.set(jpegBytes);
    const blob = new Blob([jpegBytesCopy], { type: 'image/jpeg' });
    const { imageData } = await loadImageData(blob, config);
    return imageData;
}

export async function imageDataToJpegBlob(imageData: ImageDataLike, quality = 0.95): Promise<Blob> {
    const normalizedImageData = normalizeImageData(imageData);
    const colorSpace = typeof imageData?.colorSpace === 'string'
        ? imageData.colorSpace
        : (typeof normalizedImageData.colorSpace === 'string' ? normalizedImageData.colorSpace : undefined);
    const canvasOptions = colorSpace ? { colorSpace } : {};
    const { canvas, ctx } = createCanvasWithContext(
        normalizedImageData.width,
        normalizedImageData.height,
        'Canvas not available for JPEG encoding',
        canvasOptions
    );
    ctx.putImageData(normalizedImageData, 0, 0);
    return canvasToBlob(canvas, 'image/jpeg', quality, canvasOptions);
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    if (blob && typeof blob.arrayBuffer === 'function') {
        return new Uint8Array(await blob.arrayBuffer());
    }

    if (typeof Response !== 'undefined') {
        const arrayBuffer = await new Response(blob).arrayBuffer();
        return new Uint8Array(arrayBuffer);
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
