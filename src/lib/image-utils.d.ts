import type { GainMapMetadata } from './gain-map-metadata.js';

export type Canvas2DContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
export type DecodeDrawable = CanvasImageSource & {
    width: number;
    height: number;
    close?: () => void;
};

export function createCanvasWithContext(
    width: number,
    height: number,
    errorMessage?: string,
    options?: { colorSpace?: string },
): {
    canvas: CanvasLike;
    ctx: Canvas2DContext;
};

export function resizeImageData(imageData: ImageData, targetWidth: number, targetHeight: number): Promise<ImageData>;
export function rotateImageData(imageData: ImageData, degrees: number): Promise<ImageData>;
export function loadImageData(
    source: string | Blob,
    config?: ImageBitmapOptions,
): Promise<{
    imageData: ImageData;
    width: number;
    height: number;
}>;
export function jpegBytesToImageData(jpegBytes: Uint8Array, config?: ImageBitmapOptions): Promise<ImageData>;
export function imageDataToJpegBlob(imageData: ImageData, quality?: number): Promise<Blob>;
export function blobToUint8Array(blob: Blob): Promise<Uint8Array>;
export function readBlobAsDataURL(blob: Blob): Promise<string>;
export function isMonochromeGainMapImageData(imageData: ImageData): boolean;
export function toMonochromeGainMapImageData(imageData: ImageData): ImageData;
export function isSingleChannelGainMapMetadata(metadata: GainMapMetadata): boolean;
export function toSingleChannelGainMapMetadata(metadata: GainMapMetadata): GainMapMetadata;
