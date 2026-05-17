import { probeHeifProcessingPathFromHeaders } from './input-exif.js';
import { parseJpegCicpFromApp2, isJpegHdrInputCicp } from './jpeg-hdr-processing.ts';
import {
  getFileExtension,
  isHeifFamilyBlob,
  isJpegFamilyBlob,
  isTiffFamilyBlob,
} from './image-family.ts';
import {
  isHdrIntentHeifResult,
  isHdrIntentJpegResult,
  isPreservedHeifResult,
} from './processing-type-guards.ts';
import type {
  DecodedRasterImage,
  HdrIntentHeifResult,
  HdrIntentJpegResult,
  PreservedHeifResult,
  ProcessingPathClassification,
} from './processing-types.ts';

type HeicProcessOptions = {
  quality?: number;
  discardGainMap?: boolean;
};

type ClassifiedInput =
  | Blob
  | DecodedRasterImage
  | HdrIntentHeifResult
  | HdrIntentJpegResult
  | PreservedHeifResult
  | {
      kind?: string;
      hdrIntent?: unknown;
      sdr?: unknown;
      gainMap?: unknown;
    };

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

export async function probeInputProcessingPathFromHeaders(file: Blob): Promise<ProcessingPathClassification> {
  if (!(file instanceof Blob)) {
    return 'unknown';
  }

  if (isHeifFamilyBlob(file)) {
    const headerBytes = new Uint8Array(
      await file.slice(0, 256 * 1024).arrayBuffer(),
    );
    return probeHeifProcessingPathFromHeaders(
      headerBytes,
      file instanceof File ? file.name : '',
      file.type || '',
    );
  }

  if (isJpegFamilyBlob(file)) {
    const headerBytes = new Uint8Array(
      await file.slice(0, 256 * 1024).arrayBuffer(),
    );
    if (isJpegHdrInputCicp(parseJpegCicpFromApp2(headerBytes))) {
      return 'hdr-intent';
    }
    return 'unknown';
  }

  return 'unknown';
}

export async function classifyInputProcessingPath(
  file: ClassifiedInput,
  options: HeicProcessOptions = {},
): Promise<ProcessingPathClassification> {
  if (!(file instanceof Blob)) {
    if (isHdrIntentHeifResult(file) || isHdrIntentJpegResult(file)) {
      return 'hdr-intent';
    }
    if (isPreservedHeifResult(file)) {
      return 'preserved';
    }
    return 'generated';
  }

  const fileName = file instanceof File ? file.name : '';
  const extension = getFileExtension(fileName);
  if (file instanceof File && extension === '.hif') {
    const processHeifHdr = await getProcessHeifHdr();
    const converted = await processHeifHdr(file);
    return isHdrIntentHeifResult(converted)
      ? 'hdr-intent'
      : 'generated';
  }

  if (file instanceof File && isHeifFamilyBlob(file)) {
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

  if (isTiffFamilyBlob(file)) {
    const processTiff = await getProcessTiff();
    await processTiff(file);
    return 'generated';
  }

  if (isJpegFamilyBlob(file)) {
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    if (await isUhdrImageWithDecoderFallback(fileBuffer)) {
      return 'preserved';
    }
    if (isJpegHdrInputCicp(parseJpegCicpFromApp2(fileBuffer))) {
      return 'hdr-intent';
    }
    return 'generated';
  }

  return 'generated';
}
