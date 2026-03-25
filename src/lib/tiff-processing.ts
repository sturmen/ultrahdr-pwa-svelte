import UTIF from './utif-adapter.js';
import type { DecodedRasterImage } from './processing-types.ts';

/**
 * Processes a TIFF file and converts it to decoded RGBA raster bytes.
 */
export async function processTiff(file: Blob): Promise<DecodedRasterImage> {
  console.log('[TIFF] Processing TIFF file');
  const arrayBuffer = await file.arrayBuffer();
  const ifds = UTIF.decode(arrayBuffer);

  if (!ifds || ifds.length === 0) {
    throw new Error('No IFDs found in TIFF file');
  }

  UTIF.decodeImage(arrayBuffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  const width = Number(ifds[0].width) || 0;
  const height = Number(ifds[0].height) || 0;

  if (width <= 0 || height <= 0) {
    throw new Error('TIFF decoding produced invalid dimensions');
  }

  return {
    data: new Uint8Array(rgba),
    width,
    height,
    strideBytes: width * 4,
    pixelFormat: 'rgba8',
    bitDepth: 8,
  };
}
