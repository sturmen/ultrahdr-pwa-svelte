export type NamedImageBlob = {
  name?: string;
  type?: string;
};

type ImageInputRule = {
  readonly mimeTypes: readonly string[];
  readonly extensions: readonly string[];
};

export const JPEG_INPUT_RULE = Object.freeze({
  mimeTypes: ['image/jpeg', 'image/jpg'],
  extensions: ['.jpg', '.jpeg'],
} satisfies ImageInputRule);

export const PNG_INPUT_RULE = Object.freeze({
  mimeTypes: ['image/png'],
  extensions: ['.png'],
} satisfies ImageInputRule);

export const WEBP_INPUT_RULE = Object.freeze({
  mimeTypes: ['image/webp'],
  extensions: ['.webp'],
} satisfies ImageInputRule);

export const HEIF_INPUT_RULE = Object.freeze({
  mimeTypes: ['image/heic', 'image/heif'],
  extensions: ['.heic', '.heif', '.hif'],
} satisfies ImageInputRule);

export const TIFF_INPUT_RULE = Object.freeze({
  mimeTypes: ['image/tiff'],
  extensions: ['.tif', '.tiff'],
} satisfies ImageInputRule);

const USER_SELECTABLE_IMAGE_INPUT_RULES = Object.freeze([
  JPEG_INPUT_RULE,
  PNG_INPUT_RULE,
  WEBP_INPUT_RULE,
  HEIF_INPUT_RULE,
  TIFF_INPUT_RULE,
]);

export const ACCEPTED_IMAGE_INPUT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  '.heic',
  '.heif',
  '.hif',
  '.tif',
  '.tiff',
].join(',');

export function getFileExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index).toLowerCase();
}

function matchesImageInputRule(file: NamedImageBlob, rule: ImageInputRule): boolean {
  const mimeType = String(file?.type || '').toLowerCase();
  const extension = getFileExtension(String(file?.name || ''));
  return rule.mimeTypes.includes(mimeType) || rule.extensions.includes(extension);
}

function matchesImageInputName(fileName: string, rule: ImageInputRule): boolean {
  const extension = getFileExtension(fileName);
  return rule.extensions.includes(extension);
}

export function isJpegFamilyBlob(file: NamedImageBlob): boolean {
  return matchesImageInputRule(file, JPEG_INPUT_RULE);
}

export function isPngFamilyBlob(file: NamedImageBlob): boolean {
  return matchesImageInputRule(file, PNG_INPUT_RULE);
}

export function isWebpFamilyBlob(file: NamedImageBlob): boolean {
  return matchesImageInputRule(file, WEBP_INPUT_RULE);
}

export function isHeifFamilyBlob(file: NamedImageBlob): boolean {
  return matchesImageInputRule(file, HEIF_INPUT_RULE);
}

export function isTiffFamilyBlob(file: NamedImageBlob): boolean {
  return matchesImageInputRule(file, TIFF_INPUT_RULE);
}

export function isSupportedImageInputBlob(file: NamedImageBlob): boolean {
  return USER_SELECTABLE_IMAGE_INPUT_RULES.some((rule) => matchesImageInputRule(file, rule));
}

export function isSupportedImageInputName(fileName: string): boolean {
  return USER_SELECTABLE_IMAGE_INPUT_RULES.some((rule) => matchesImageInputName(fileName, rule));
}
