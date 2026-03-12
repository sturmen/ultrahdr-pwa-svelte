import { probeHeifProcessingPathFromHeaders } from './input-exif.js';

async function getProcessHeic() {
  const module = await import('./heic-processing.js');
  return module.processHeic;
}

async function getProcessHeifHdr() {
  const module = await import('./heif-hdr-processing.js');
  return module.processHeifHdr;
}

async function getProcessTiff() {
  const module = await import('./tiff-processing.js');
  return module.processTiff;
}

async function isUhdrImageWithDecoderFallback(fileBuffer) {
  const module = await import('./processing-core.js');
  return module.isUhdrImageWithDecoderFallback(fileBuffer);
}

function isHeifFamilyFile(file) {
  const fileName = String(file?.name || '').toLowerCase();
  return (
    file?.type === 'image/heic' ||
    file?.type === 'image/heif' ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileName.endsWith('.hif')
  );
}

export async function probeInputProcessingPathFromHeaders(file) {
  if (!(file instanceof Blob) || !isHeifFamilyFile(file)) {
    return 'unknown';
  }

  const headerBytes = new Uint8Array(
    await file.slice(0, 256 * 1024).arrayBuffer(),
  );
  return probeHeifProcessingPathFromHeaders(
    headerBytes,
    file?.name || '',
    file?.type || '',
  );
}

export async function classifyInputProcessingPath(file, options = {}) {
  if (!(file instanceof Blob)) {
    if (file?.kind === 'hdr-intent-heif' && file?.hdrIntent) {
      return 'hdr-intent';
    }
    if (file?.sdr && file?.gainMap) {
      return 'preserved';
    }
    return 'generated';
  }

  const fileName = String(file?.name || '').toLowerCase();
  if (fileName.endsWith('.hif')) {
    const processHeifHdr = await getProcessHeifHdr();
    const converted = await processHeifHdr(file, options);
    return converted?.kind === 'hdr-intent-heif' && converted?.hdrIntent
      ? 'hdr-intent'
      : 'generated';
  }

  if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
    const processHeic = await getProcessHeic();
    const converted = await processHeic(file, options);
    if (converted?.kind === 'hdr-intent-heif' && converted?.hdrIntent) {
      return 'hdr-intent';
    }
    if (converted?.sdr && converted?.gainMap) {
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
