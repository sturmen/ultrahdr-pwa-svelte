import { probeHeifProcessingPathFromHeaders } from './input-exif.js';
import type {
  DecodedRasterImage,
  HdrIntentHeifResult,
  PreservedHeifResult,
  ProcessingPathClassification,
} from './processing-types.ts';

type HeicProcessOptions = {
  quality?: number;
  discardGainMap?: boolean;
};

type HeifFamilyBlob = Blob & {
  name?: string;
  type?: string;
};

type ClassifiedInput =
  | Blob
  | DecodedRasterImage
  | HdrIntentHeifResult
  | PreservedHeifResult
  | {
      kind?: string;
      hdrIntent?: unknown;
      sdr?: unknown;
      gainMap?: unknown;
    };

function isHdrIntentHeifResult(file: ClassifiedInput): file is HdrIntentHeifResult {
  return !!file
    && typeof file === 'object'
    && 'kind' in file
    && file.kind === 'hdr-intent-heif'
    && 'hdrIntent' in file;
}

function isPreservedHeifResult(file: ClassifiedInput): file is PreservedHeifResult {
  return !!file && typeof file === 'object' && 'sdr' in file && 'gainMap' in file;
}

async function getProcessHeic(): Promise<(file: File, options?: HeicProcessOptions) => Promise<DecodedRasterImage | HdrIntentHeifResult | PreservedHeifResult>> {
  const module = await import('./heic-processing.js');
  return module.processHeic;
}

async function getProcessHeifHdr(): Promise<(file: File) => Promise<HdrIntentHeifResult>> {
  const module = await import('./heif-hdr-processing.js');
  return module.processHeifHdr;
}

async function getProcessTiff(): Promise<(file: Blob) => Promise<DecodedRasterImage>> {
  const module = await import('./tiff-processing.js');
  return module.processTiff;
}

async function isUhdrImageWithDecoderFallback(fileBuffer: Uint8Array): Promise<boolean> {
  const module = await import('./processing-core.js');
  return module.isUhdrImageWithDecoderFallback(fileBuffer);
}

function isHeifFamilyFile(file: HeifFamilyBlob): boolean {
  const fileName = String(file?.name || '').toLowerCase();
  return (
    file?.type === 'image/heic' ||
    file?.type === 'image/heif' ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileName.endsWith('.hif')
  );
}

export async function probeInputProcessingPathFromHeaders(file: Blob): Promise<ProcessingPathClassification> {
  if (!(file instanceof Blob) || !isHeifFamilyFile(file)) {
    return 'unknown';
  }

  const headerBytes = new Uint8Array(
    await file.slice(0, 256 * 1024).arrayBuffer(),
  );
  return probeHeifProcessingPathFromHeaders(
    headerBytes,
    file instanceof File ? file.name : '',
    file.type || '',
  );
}

export async function classifyInputProcessingPath(
  file: ClassifiedInput,
  options: HeicProcessOptions = {},
): Promise<ProcessingPathClassification> {
  if (!(file instanceof Blob)) {
    if (isHdrIntentHeifResult(file)) {
      return 'hdr-intent';
    }
    if (isPreservedHeifResult(file)) {
      return 'preserved';
    }
    return 'generated';
  }

  const fileName = file instanceof File ? file.name.toLowerCase() : '';
  if (file instanceof File && fileName.endsWith('.hif')) {
    const processHeifHdr = await getProcessHeifHdr();
    const converted = await processHeifHdr(file);
    return isHdrIntentHeifResult(converted)
      ? 'hdr-intent'
      : 'generated';
  }

  if (file instanceof File && (fileName.endsWith('.heic') || fileName.endsWith('.heif'))) {
    const processHeic = await getProcessHeic();
    const converted = await processHeic(file, options);
    if (isHdrIntentHeifResult(converted)) {
      return 'hdr-intent';
    }
    if (isPreservedHeifResult(converted)) {
      return 'preserved';
    }
    return 'generated';
  }

  if (fileName.endsWith('.tif') || fileName.endsWith('.tiff')) {
    const processTiff = await getProcessTiff();
    await processTiff(file);
    return 'generated';
  }

  const isJpeg =
    file.type === 'image/jpeg'
    || fileName.endsWith('.jpg')
    || fileName.endsWith('.jpeg');
  if (isJpeg) {
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    return (await isUhdrImageWithDecoderFallback(fileBuffer))
      ? 'preserved'
      : 'generated';
  }

  return 'generated';
}
