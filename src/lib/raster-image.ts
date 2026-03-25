import { Jimp, ResizeStrategy } from 'jimp';
import { Buffer } from 'buffer';
import { decode as decodePng } from 'fast-png';

export type RasterImageLike = ImageData | {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
  colorSpace?: PredefinedColorSpace;
};

type JimpBitmapImage = {
  bitmap: {
    data: Uint8Array | Buffer;
    width: number;
    height: number;
  };
  resize(options: { w: number; h: number; mode?: unknown }): unknown;
  rotate(options: number): unknown;
};

type RgbaSource = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  colorSpace?: PredefinedColorSpace;
};

const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function normalizeImageData(imageData: RasterImageLike): ImageData {
  if (typeof ImageData === 'undefined') {
    throw new Error('ImageData is not supported in this environment');
  }
  if (imageData instanceof ImageData) {
    return imageData;
  }
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
    imageData.colorSpace ? { colorSpace: imageData.colorSpace } : undefined,
  );
}

function normalizeRotation(degrees: number): number {
  return ((Math.round(Number(degrees) || 0) % 360) + 360) % 360;
}

function normalizeDimensions(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
): { width: number; height: number } {
  return {
    width: Math.max(1, Math.floor(Number(targetWidth) || imageData.width || 1)),
    height: Math.max(1, Math.floor(Number(targetHeight) || imageData.height || 1)),
  };
}

function createTargetImageData(source: RgbaSource, width: number, height: number): ImageData {
  return new ImageData(
    new Uint8ClampedArray(width * height * 4),
    width,
    height,
    source.colorSpace ? { colorSpace: source.colorSpace } : undefined,
  );
}

function copyPixel(
  source: Uint8ClampedArray,
  sourceWidth: number,
  sourceX: number,
  sourceY: number,
  target: Uint8ClampedArray,
  targetIndex: number,
  weight: number,
): void {
  const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
  target[targetIndex] += source[sourceIndex] * weight;
  target[targetIndex + 1] += source[sourceIndex + 1] * weight;
  target[targetIndex + 2] += source[sourceIndex + 2] * weight;
  target[targetIndex + 3] += source[sourceIndex + 3] * weight;
}

function bilinearResize(source: RgbaSource, width: number, height: number): ImageData {
  if (source.width === width && source.height === height) {
    return new ImageData(
      new Uint8ClampedArray(source.data),
      source.width,
      source.height,
      source.colorSpace ? { colorSpace: source.colorSpace } : undefined,
    );
  }

  const target = createTargetImageData(source, width, height);
  const xScale = source.width / width;
  const yScale = source.height / height;

  for (let y = 0; y < height; y += 1) {
    const sourceY = (y + 0.5) * yScale - 0.5;
    const y0 = Math.max(0, Math.floor(sourceY));
    const y1 = Math.min(source.height - 1, y0 + 1);
    const wy = sourceY - y0;

    for (let x = 0; x < width; x += 1) {
      const sourceX = (x + 0.5) * xScale - 0.5;
      const x0 = Math.max(0, Math.floor(sourceX));
      const x1 = Math.min(source.width - 1, x0 + 1);
      const wx = sourceX - x0;
      const targetIndex = (y * width + x) * 4;

      copyPixel(source.data, source.width, x0, y0, target.data, targetIndex, (1 - wx) * (1 - wy));
      copyPixel(source.data, source.width, x1, y0, target.data, targetIndex, wx * (1 - wy));
      copyPixel(source.data, source.width, x0, y1, target.data, targetIndex, (1 - wx) * wy);
      copyPixel(source.data, source.width, x1, y1, target.data, targetIndex, wx * wy);
    }
  }

  return target;
}

function rotateOrthogonal(source: RgbaSource, rotation: number): ImageData {
  if (rotation === 0) {
    return new ImageData(
      new Uint8ClampedArray(source.data),
      source.width,
      source.height,
      source.colorSpace ? { colorSpace: source.colorSpace } : undefined,
    );
  }

  const targetWidth = rotation === 180 ? source.width : source.height;
  const targetHeight = rotation === 180 ? source.height : source.width;
  const target = createTargetImageData(source, targetWidth, targetHeight);

  for (let sourceY = 0; sourceY < source.height; sourceY += 1) {
    for (let sourceX = 0; sourceX < source.width; sourceX += 1) {
      let targetX = sourceX;
      let targetY = sourceY;

      if (rotation === 90) {
        targetX = source.height - 1 - sourceY;
        targetY = sourceX;
      } else if (rotation === 180) {
        targetX = source.width - 1 - sourceX;
        targetY = source.height - 1 - sourceY;
      } else if (rotation === 270) {
        targetX = sourceY;
        targetY = source.width - 1 - sourceX;
      }

      const sourceIndex = (sourceY * source.width + sourceX) * 4;
      const targetIndex = (targetY * targetWidth + targetX) * 4;
      target.data[targetIndex] = source.data[sourceIndex];
      target.data[targetIndex + 1] = source.data[sourceIndex + 1];
      target.data[targetIndex + 2] = source.data[sourceIndex + 2];
      target.data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }

  return target;
}

function toJimpImage(imageData: ImageData): JimpBitmapImage {
  return new Jimp({
    width: imageData.width,
    height: imageData.height,
    data: Buffer.from(imageData.data),
  }) as unknown as JimpBitmapImage;
}

function fromJimpImage(image: JimpBitmapImage, colorSpace?: PredefinedColorSpace): ImageData {
  return new ImageData(
    new Uint8ClampedArray(image.bitmap.data),
    image.bitmap.width,
    image.bitmap.height,
    colorSpace ? { colorSpace } : undefined,
  );
}

function isPngBytes(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) {
    return false;
  }
  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (bytes[index] !== PNG_SIGNATURE[index]) {
      return false;
    }
  }
  return true;
}

function decodePngBuffer(bytes: Uint8Array, colorSpace?: PredefinedColorSpace): ImageData {
  const image = decodePng(bytes);
  return new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height,
    colorSpace ? { colorSpace } : undefined,
  );
}

export async function decodeRasterBuffer(
  bytes: Uint8Array,
  colorSpace?: PredefinedColorSpace,
): Promise<ImageData> {
  if (isPngBytes(bytes)) {
    return decodePngBuffer(bytes, colorSpace);
  }
  const buffer = Buffer.from(bytes);
  const image = typeof Jimp.fromBuffer === 'function'
    ? await Jimp.fromBuffer(buffer) as unknown as JimpBitmapImage
    : await Jimp.read(buffer) as unknown as JimpBitmapImage;
  return fromJimpImage(image, colorSpace);
}

export async function resizeRasterImage(
  imageData: RasterImageLike,
  targetWidth: number,
  targetHeight: number,
): Promise<ImageData> {
  const normalized = normalizeImageData(imageData);
  const { width, height } = normalizeDimensions(normalized, targetWidth, targetHeight);
  if (normalized.width === width && normalized.height === height) {
    return normalized;
  }

  const image = toJimpImage(normalized);
  image.resize({ w: width, h: height, mode: ResizeStrategy.BILINEAR });
  return fromJimpImage(image, normalized.colorSpace);
}

export function resizeRasterImageSync(
  imageData: RasterImageLike,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  const normalized = normalizeImageData(imageData);
  const { width, height } = normalizeDimensions(normalized, targetWidth, targetHeight);
  return bilinearResize(normalized, width, height);
}

export async function rotateRasterImage(
  imageData: RasterImageLike,
  degrees: number,
): Promise<ImageData> {
  const normalized = normalizeImageData(imageData);
  const rotation = normalizeRotation(degrees);
  if (rotation === 0) {
    return normalized;
  }
  if (rotation === 90 || rotation === 180 || rotation === 270) {
    return rotateOrthogonal(normalized, rotation);
  }

  const image = toJimpImage(normalized);
  // Existing pipeline semantics treat positive degrees as clockwise.
  image.rotate((360 - rotation) % 360);
  return fromJimpImage(image, normalized.colorSpace);
}
