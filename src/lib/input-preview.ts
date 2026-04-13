import {
  imageDataToJpegBlob,
  loadImageData,
  resizeImageData,
  type ImageDataLike,
} from './image-utils.js';
import { probeInputProcessingPathFromHeaders } from './processing-path.js';
import type { DecodedRasterImage } from './processing-types.ts';

const PREVIEW_MAX_DIMENSION = 256;
const PREVIEW_JPEG_QUALITY = 0.7;

export const INPUT_PREVIEW_PLACEHOLDER_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e8eef6'/%3E%3Cpath d='M16 44l10-12 8 9 6-7 8 10H16z' fill='%2392a5bb'/%3E%3Ccircle cx='24' cy='22' r='5' fill='%23b8c7d8'/%3E%3C/svg%3E";

export type InputPreviewTask =
  | {
      status: 'ready';
      blob: Blob;
    }
  | {
      status: 'pending';
      promise: Promise<Blob>;
    };

function isHeifFamilyFile(file: Blob): file is File {
  if (!(file instanceof File)) {
    return false;
  }
  const fileName = file.name.toLowerCase();
  return (
    file.type === 'image/heic'
    || file.type === 'image/heif'
    || fileName.endsWith('.heic')
    || fileName.endsWith('.heif')
    || fileName.endsWith('.hif')
  );
}

function isTiffFile(file: Blob): boolean {
  if (!(file instanceof File)) {
    return false;
  }
  const fileName = file.name.toLowerCase();
  return (
    file.type === 'image/tiff'
    || file.type === 'image/tif'
    || fileName.endsWith('.tif')
    || fileName.endsWith('.tiff')
  );
}

async function createJpegPreviewBlob(source: ImageDataLike): Promise<Blob> {
  const sourceWidth = source.width || 1;
  const sourceHeight = source.height || 1;
  const scale = Math.min(
    1,
    PREVIEW_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight),
  );
  const previewWidth = Math.max(1, Math.round(sourceWidth * scale));
  const previewHeight = Math.max(1, Math.round(sourceHeight * scale));
  const resized = await resizeImageData(source, previewWidth, previewHeight);
  return imageDataToJpegBlob(resized, PREVIEW_JPEG_QUALITY);
}

export async function createPreviewBlobFromImageBlob(blob: Blob): Promise<Blob> {
  const { imageData } = await loadImageData(blob);
  return createJpegPreviewBlob(imageData);
}

async function createStandardRasterPreview(file: File): Promise<Blob> {
  return createPreviewBlobFromImageBlob(file);
}

async function createTiffPreview(file: File): Promise<Blob> {
  const { processTiff } = await import('./tiff-processing.js');
  const imageData = await processTiff(file);
  return createJpegPreviewBlob(imageData);
}

async function createHeifPreview(file: File): Promise<Blob> {
  const { decodeHeifPreviewImage } = await import('./heic-processing.js');
  const imageData: DecodedRasterImage = await decodeHeifPreviewImage(file);
  return createJpegPreviewBlob(imageData);
}

export async function createInputPreviewTask(file: File): Promise<InputPreviewTask> {
  if (isHeifFamilyFile(file)) {
    const processingPath = await probeInputProcessingPathFromHeaders(file);
    if (processingPath === 'hdr-intent') {
      return {
        status: 'pending',
        promise: createHeifPreview(file),
      };
    }
    return {
      status: 'ready',
      blob: await createHeifPreview(file),
    };
  }

  if (isTiffFile(file)) {
    return {
      status: 'ready',
      blob: await createTiffPreview(file),
    };
  }

  return {
    status: 'ready',
    blob: await createStandardRasterPreview(file),
  };
}
