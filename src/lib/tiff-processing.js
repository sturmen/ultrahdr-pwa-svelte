import UTIF from 'utif';
import { canvasToBlob, createCanvasWithContext } from './canvas-runtime.js';

/**
 * Processes a TIFF file and converts it to a PNG File object.
 * @param {File} file - The input TIFF file.
 * @returns {Promise<File>} - The converted PNG file.
 */
export async function processTiff(file) {
    console.log('[TIFF] Processing TIFF file:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    const ifds = UTIF.decode(arrayBuffer);

    if (!ifds || ifds.length === 0) {
        throw new Error('No IFDs found in TIFF file');
    }

    // Decode the first image
    UTIF.decodeImage(arrayBuffer, ifds[0]);
    const rgba = UTIF.toRGBA8(ifds[0]);

    const width = ifds[0].width;
    const height = ifds[0].height;

    console.log('[TIFF] Decoded image:', width, 'x', height);

    const { canvas, ctx } = createCanvasWithContext(
        width,
        height,
        'Canvas not available for TIFF conversion'
    );

    const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);
    ctx.putImageData(imageData, 0, 0);

    const pngBlob = await canvasToBlob(canvas, 'image/png');
    const pngFile = new File([pngBlob], file.name.replace(/\.(tif|tiff)$/i, '.png'), { type: 'image/png' });

    console.log('[TIFF] Converted to PNG:', pngFile.name);
    return pngFile;
}
