/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { isHeifFamilyBlob, isJpegFamilyBlob } from '../image-family.ts';

describe('image family helpers', () => {
  it('classifies JPEG inputs by MIME type or file extension', () => {
    expect(isJpegFamilyBlob(new File([], 'photo.bin', { type: 'image/jpeg' }))).toBe(true);
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
});
