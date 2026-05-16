export type NamedImageBlob = Blob & {
  name?: string;
  type?: string;
};

export function isJpegFamilyBlob(file: NamedImageBlob): boolean {
  const fileName = String(file?.name || '').toLowerCase();
  return (
    file?.type === 'image/jpeg'
    || fileName.endsWith('.jpg')
    || fileName.endsWith('.jpeg')
  );
}

export function isHeifFamilyBlob(file: NamedImageBlob): boolean {
  const fileName = String(file?.name || '').toLowerCase();
  return (
    file?.type === 'image/heic'
    || file?.type === 'image/heif'
    || fileName.endsWith('.heic')
    || fileName.endsWith('.heif')
    || fileName.endsWith('.hif')
  );
}
