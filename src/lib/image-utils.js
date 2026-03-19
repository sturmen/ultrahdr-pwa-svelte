
/**
 * Utility functions for image manipulation and conversion.
 */

const canvasPool = [];

function acquirePooledCanvas(width, height, errorMessage, options = {}) {
    const pooled = canvasPool.pop();
    if (!pooled) {
        return createCanvasWithContext(width, height, errorMessage, options);
    }

    pooled.canvas.width = width;
    pooled.canvas.height = height;
    return pooled;
}

function releasePooledCanvas(entry) {
    if (!entry?.canvas || !entry?.ctx) {
        return;
    }
    entry.canvas.width = 1;
    entry.canvas.height = 1;
    if (canvasPool.length < 2) {
        canvasPool.push(entry);
    }
}

// Helper for canvas creation
export function createCanvasWithContext(width, height, errorMessage = 'Canvas not available', options = {}) {
    const contextOptions = { willReadFrequently: true };
    if (typeof options.colorSpace === 'string' && options.colorSpace) {
        contextOptions.colorSpace = options.colorSpace;
    }
    if (typeof document === 'undefined') {
        if (typeof OffscreenCanvas !== 'undefined') {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d', contextOptions);
            if (!ctx) throw new Error(errorMessage);
            return { canvas, ctx };
        }
        throw new Error(errorMessage + ' (document and OffscreenCanvas are both undefined)');
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

export async function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.95, options = {}) {
    const blobOptions = { type, quality };
    if (typeof options.colorSpace === 'string' && options.colorSpace) {
        blobOptions.colorSpace = options.colorSpace;
    }
    if (typeof canvas.convertToBlob === 'function') {
        return canvas.convertToBlob(blobOptions);
    }
    if (typeof canvas.toBlob === 'function') {
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
    // Fallback for environments where both APIs are missing.
    throw new Error('canvas blob export is not available in this environment');
}

export async function decodeDrawableFromBlob(blob, config = {}) {
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
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
}

export async function loadImageData(source, config = {}) {
    let drawable;
    if (source instanceof Blob) {
        drawable = await decodeDrawableFromBlob(source, config);
    } else {
        // Assume data URL
        const response = await fetch(source);
        let blob;
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

export async function imageDataToDrawable(imageData) {
    if (typeof ImageData === 'undefined') {
        throw new Error('ImageData is not supported in this environment');
    }
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(imageData);
    }

    const { canvas, ctx } = createCanvasWithContext(imageData.width, imageData.height, 'Canvas not available for imageDataToDrawable');
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

function getTransformedDimensions(width, height, degrees) {
    const normalized = ((degrees || 0) % 360 + 360) % 360;
    const isPortrait = normalized === 90 || normalized === 270;
    return {
        width: isPortrait ? height : width,
        height: isPortrait ? width : height,
        normalizedRotation: normalized,
    };
}

export async function transformImageData(imageData, {
    width = imageData.width,
    height = imageData.height,
    degrees = 0,
} = {}) {
    const targetWidth = Math.max(1, Math.floor(Number(width) || imageData.width || 1));
    const targetHeight = Math.max(1, Math.floor(Number(height) || imageData.height || 1));
    const { width: outputWidth, height: outputHeight, normalizedRotation } = getTransformedDimensions(
        targetWidth,
        targetHeight,
        degrees,
    );

    if (
        imageData.width === outputWidth
        && imageData.height === outputHeight
        && normalizedRotation === 0
        && targetWidth === imageData.width
        && targetHeight === imageData.height
    ) {
        return imageData;
    }

    const surface = acquirePooledCanvas(outputWidth, outputHeight, 'Canvas not available for transform');
    const sourceSurface = acquirePooledCanvas(imageData.width, imageData.height, 'Canvas not available for transform source');
    sourceSurface.ctx.putImageData(imageData, 0, 0);
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

export async function resizeImageData(imageData, targetWidth, targetHeight) {
    return transformImageData(imageData, { width: targetWidth, height: targetHeight });
}

export async function rotateImageData(imageData, degrees) {
    return transformImageData(imageData, { degrees });
}

export async function jpegBytesToImageData(jpegBytes, config = {}) {
    const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
    const { imageData } = await loadImageData(blob, config);
    return imageData;
}

export async function imageDataToJpegBlob(imageData, quality = 0.95) {
    const colorSpace = typeof imageData?.colorSpace === 'string' ? imageData.colorSpace : undefined;
    const canvasOptions = colorSpace ? { colorSpace } : {};
    const { canvas, ctx } = createCanvasWithContext(
        imageData.width,
        imageData.height,
        'Canvas not available for JPEG encoding',
        canvasOptions
    );
    ctx.putImageData(imageData, 0, 0);
    return canvasToBlob(canvas, 'image/jpeg', quality, canvasOptions);
}

export async function blobToUint8Array(blob) {
    if (blob && typeof blob.arrayBuffer === 'function') {
        return new Uint8Array(await blob.arrayBuffer());
    }

    if (typeof Response !== 'undefined') {
        const arrayBuffer = await new Response(blob).arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

export function readBlobAsDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
export function isMonochromeGainMapImageData(imageData) {
    if (!imageData || !imageData.data) {
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

export function toMonochromeGainMapImageData(imageData) {
    if (!imageData || !imageData.data) {
        return imageData;
    }
    const monochromeData = new Uint8ClampedArray(imageData.data.length);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
        monochromeData[i] = gray;
        monochromeData[i + 1] = gray;
        monochromeData[i + 2] = gray;
        monochromeData[i + 3] = imageData.data[i + 3];
    }
    return new ImageData(monochromeData, imageData.width, imageData.height);
}

export function isSingleChannelGainMapMetadata(metadata) {
    if (!metadata) {
        return true;
    }
    const channelKeys = ['gainMapMin', 'gainMapMax', 'gamma', 'offsetSdr', 'offsetHdr'];
    return channelKeys.every((key) => {
        const values = metadata[key];
        if (!Array.isArray(values) || values.length < 3) {
            return true;
        }
        return values[0] === values[1] && values[0] === values[2];
    });
}

export function toSingleChannelGainMapMetadata(metadata) {
    if (!metadata) {
        return metadata;
    }
    const normalized = {
        ...metadata
    };
    const channelKeys = ['gainMapMin', 'gainMapMax', 'gamma', 'offsetSdr', 'offsetHdr'];
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
