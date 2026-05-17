/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import {
  isHeifFamilyBlob,
  isJpegFamilyBlob,
  isPngFamilyBlob,
  isSupportedImageInputName,
  isTiffFamilyBlob,
  isWebpFamilyBlob,
} from '../image-family.ts';

describe('image family helpers', () => {
  it('classifies JPEG inputs by MIME type or file extension', () => {
    expect(isJpegFamilyBlob(new File([], 'photo.bin', { type: 'image/jpeg' }))).toBe(true);
    expect(isJpegFamilyBlob(new File([], 'photo.bin', { type: 'image/jpg' }))).toBe(true);
    expect(isJpegFamilyBlob(new File([], 'photo.JPG', { type: '' }))).toBe(true);
    expect(isJpegFamilyBlob(new File([], 'photo.jpeg', { type: '' }))).toBe(true);
    expect(isJpegFamilyBlob(new File([], 'photo.heic', { type: 'image/heic' }))).toBe(false);
  });

  it('classifies HEIF-family inputs by MIME type or file extension', () => {
    expect(isHeifFamilyBlob(new File([], 'photo.bin', { type: 'image/heic' }))).toBe(true);
    expect(isHeifFamilyBlob(new File([], 'photo.bin', { type: 'image/heif' }))).toBe(true);
    expect(isHeifFamilyBlob(new File([], 'photo.HIF', { type: '' }))).toBe(true);
    expect(isHeifFamilyBlob(new File([], 'photo.jpg', { type: 'image/jpeg' }))).toBe(false);
  });

  it('classifies other supported image inputs through the shared family contract', () => {
    expect(isPngFamilyBlob(new File([], 'photo.bin', { type: 'image/png' }))).toBe(true);
    expect(isPngFamilyBlob(new File([], 'photo.PNG', { type: '' }))).toBe(true);
    expect(isWebpFamilyBlob(new File([], 'photo.bin', { type: 'image/webp' }))).toBe(true);
    expect(isWebpFamilyBlob(new File([], 'photo.webp', { type: '' }))).toBe(true);
    expect(isTiffFamilyBlob(new File([], 'photo.bin', { type: 'image/tiff' }))).toBe(true);
    expect(isTiffFamilyBlob(new File([], 'photo.TIF', { type: '' }))).toBe(true);
  });

  it('exposes the shared user-selectable image input rule for UI file pickers and directory drops', async () => {
    const imageFamily = await import('../image-family.ts') as Record<string, unknown>;

    expect(imageFamily.ACCEPTED_IMAGE_INPUT_TYPES).toBe(
      'image/jpeg,image/jpg,image/png,image/webp,.heic,.heif,.hif,.tif,.tiff',
    );
    expect(isSupportedImageInputName('nested/photo.HEIF')).toBe(true);
    expect(isSupportedImageInputName('notes.txt')).toBe(false);
  });
});
