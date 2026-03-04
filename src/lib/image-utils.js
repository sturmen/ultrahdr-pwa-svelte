
/**
 * Utility functions for image manipulation and conversion.
 */

// Helper for canvas creation
export function createCanvasWithContext(width, height, errorMessage = 'Canvas not available') {
    if (typeof document === 'undefined') {
        if (typeof OffscreenCanvas !== 'undefined') {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error(errorMessage);
            return { canvas, ctx };
        }
        throw new Error(errorMessage + ' (document and OffscreenCanvas are both undefined)');
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        throw new Error(errorMessage);
    }
    return { canvas, ctx };
}

export async function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.95) {
    if (typeof canvas.convertToBlob === 'function') {
        return canvas.convertToBlob({ type, quality });
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
    const { canvas, ctx } = createCanvasWithContext(imageData.width, imageData.height, 'Canvas not available for imageDataToDrawable');
    ctx.putImageData(imageData, 0, 0);

    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(canvas);
    }
    return canvas;
}

export async function resizeImageData(imageData, targetWidth, targetHeight) {
    const { ctx } = createCanvasWithContext(targetWidth, targetHeight, 'Canvas not available for resizing');
    const drawable = await imageDataToDrawable(imageData);

    ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);
    const resizedData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    if (typeof drawable.close === 'function') {
        drawable.close();
    }
    return resizedData;
}

export async function rotateImageData(imageData, degrees) {
    const normalized = ((degrees || 0) % 360 + 360) % 360;
    if (normalized === 0) {
        return imageData;
    }

    const width = imageData.width;
    const height = imageData.height;
    const isPortrait = normalized === 90 || normalized === 270;
    const newWidth = isPortrait ? height : width;
    const newHeight = isPortrait ? width : height;

    const { ctx } = createCanvasWithContext(newWidth, newHeight, 'Canvas not available for rotation');
    const drawable = await imageDataToDrawable(imageData);

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate((normalized * Math.PI) / 180);
    ctx.drawImage(drawable, -width / 2, -height / 2);
    ctx.restore();

    const rotatedData = ctx.getImageData(0, 0, newWidth, newHeight);
    if (typeof drawable.close === 'function') {
        drawable.close();
    }

    return rotatedData;
}

export async function jpegBytesToImageData(jpegBytes, config = {}) {
    const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
    const { imageData } = await loadImageData(blob, config);
    return imageData;
}

export async function imageDataToJpegBlob(imageData, quality = 0.95) {
    const { canvas, ctx } = createCanvasWithContext(imageData.width, imageData.height, 'Canvas not available for JPEG encoding');
    ctx.putImageData(imageData, 0, 0);
    return canvasToBlob(canvas, 'image/jpeg', quality);
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
