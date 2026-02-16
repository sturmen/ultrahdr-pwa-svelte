/**
 * @vitest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

import {
  extractExifApp1PayloadFromInput,
  extractExifPayloadFromPng,
  extractExifPayloadFromWebp,
  extractExifPayloadFromHeif,
  extractExifPayloadFromTiff,
} from '../input-exif.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sampleExifPayload(orientation = 6) {
  return new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
}

function createPngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const out = new Uint8Array(4 + 4 + data.length + 4);
  out[0] = (data.length >>> 24) & 0xff;
  out[1] = (data.length >>> 16) & 0xff;
  out[2] = (data.length >>> 8) & 0xff;
  out[3] = data.length & 0xff;
  out.set(typeBytes, 4);
  out.set(data, 8);
  // CRC intentionally zeroed for parser tests.
  return out;
}

function createPngWithExifTiff(tiffBytes) {
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = new Uint8Array([
    0x00, 0x00, 0x00, 0x01, // width
    0x00, 0x00, 0x00, 0x01, // height
    0x08, // bit depth
    0x02, // color type
    0x00, // compression
    0x00, // filter
    0x00, // interlace
  ]);
  const ihdr = createPngChunk('IHDR', ihdrData);
  const exif = createPngChunk('eXIf', tiffBytes);
  const iend = createPngChunk('IEND', new Uint8Array(0));
  const out = new Uint8Array(signature.length + ihdr.length + exif.length + iend.length);
  let offset = 0;
  out.set(signature, offset); offset += signature.length;
  out.set(ihdr, offset); offset += ihdr.length;
  out.set(exif, offset); offset += exif.length;
  out.set(iend, offset);
  return out;
}

function createWebpChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const size = data.length;
  const padded = size + (size % 2);
  const out = new Uint8Array(8 + padded);
  out.set(typeBytes, 0);
  out[4] = size & 0xff;
  out[5] = (size >>> 8) & 0xff;
  out[6] = (size >>> 16) & 0xff;
  out[7] = (size >>> 24) & 0xff;
  out.set(data, 8);
  return out;
}

function createWebpWithExifTiff(tiffBytes) {
  const exif = createWebpChunk('EXIF', tiffBytes);
  const riffSize = 4 + exif.length;
  const out = new Uint8Array(12 + exif.length);
  out.set(new TextEncoder().encode('RIFF'), 0);
  out[4] = riffSize & 0xff;
  out[5] = (riffSize >>> 8) & 0xff;
  out[6] = (riffSize >>> 16) & 0xff;
  out[7] = (riffSize >>> 24) & 0xff;
  out.set(new TextEncoder().encode('WEBP'), 8);
  out.set(exif, 12);
  return out;
}

function createMinimalTiffWithMakeAndOrientation() {
  const make = new TextEncoder().encode('ACME\0');
  const ifdOffset = 8;
  const entryCount = 2;
  const ifdSize = 2 + (entryCount * 12) + 4;
  const makeOffset = ifdOffset + ifdSize;
  const out = new Uint8Array(makeOffset + make.length);

  // TIFF header (II, 42, first IFD at 8)
  out.set([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00], 0);

  // IFD entry count
  out[8] = entryCount;
  out[9] = 0x00;

  // Entry 1: Make (tag 0x010F, ASCII, count=5, value at makeOffset)
  let e = 10;
  out[e + 0] = 0x0f; out[e + 1] = 0x01; // tag
  out[e + 2] = 0x02; out[e + 3] = 0x00; // type ASCII
  out[e + 4] = make.length; out[e + 5] = 0x00; out[e + 6] = 0x00; out[e + 7] = 0x00; // count
  out[e + 8] = makeOffset & 0xff;
  out[e + 9] = (makeOffset >>> 8) & 0xff;
  out[e + 10] = (makeOffset >>> 16) & 0xff;
  out[e + 11] = (makeOffset >>> 24) & 0xff;

  // Entry 2: Orientation (tag 0x0112, SHORT, count=1, value=1 inline)
  e += 12;
  out[e + 0] = 0x12; out[e + 1] = 0x01; // tag
  out[e + 2] = 0x03; out[e + 3] = 0x00; // type SHORT
  out[e + 4] = 0x01; out[e + 5] = 0x00; out[e + 6] = 0x00; out[e + 7] = 0x00; // count
  out[e + 8] = 0x01; out[e + 9] = 0x00; // value
  out[e + 10] = 0x00; out[e + 11] = 0x00;

  // next IFD offset = 0
  const next = 10 + (entryCount * 12);
  out[next + 0] = 0x00;
  out[next + 1] = 0x00;
  out[next + 2] = 0x00;
  out[next + 3] = 0x00;

  out.set(make, makeOffset);
  return out;
}

describe('input-exif extractors', () => {
  it('extractExifPayloadFromPng wraps eXIf TIFF bytes with Exif header', () => {
    const expected = sampleExifPayload();
    const pngBytes = createPngWithExifTiff(expected.subarray(6));

    const extracted = extractExifPayloadFromPng(pngBytes);
    expect(extracted).not.toBeNull();
    expect(Array.from(extracted)).toEqual(Array.from(expected));
  });

  it('extractExifPayloadFromWebp wraps EXIF chunk TIFF bytes with Exif header', () => {
    const expected = sampleExifPayload();
    const webpBytes = createWebpWithExifTiff(expected.subarray(6));

    const extracted = extractExifPayloadFromWebp(webpBytes);
    expect(extracted).not.toBeNull();
    expect(Array.from(extracted)).toEqual(Array.from(expected));
  });

  it('extractExifPayloadFromHeif extracts EXIF APP1 payload from HEIC fixture', () => {
    const fixturePath = path.resolve(__dirname, '../../../media/test_hdr_heif_gainmap.HEIC');
    const bytes = new Uint8Array(fs.readFileSync(fixturePath));

    const extracted = extractExifPayloadFromHeif(bytes);
    expect(extracted).not.toBeNull();
    expect(extracted[0]).toBe(0x45); // E
    expect(extracted[1]).toBe(0x78); // x
    expect(extracted[2]).toBe(0x69); // i
    expect(extracted[3]).toBe(0x66); // f
    expect(extracted[4]).toBe(0x00);
    expect(extracted[5]).toBe(0x00);
  });

  it('extractExifPayloadFromTiff rebuilds representable EXIF payload', () => {
    const tiffBytes = createMinimalTiffWithMakeAndOrientation();

    const extracted = extractExifPayloadFromTiff(tiffBytes);
    expect(extracted).not.toBeNull();
    expect(extracted[0]).toBe(0x45); // E
    expect(extracted[1]).toBe(0x78); // x
    expect(extracted[2]).toBe(0x69); // i
    expect(extracted[3]).toBe(0x66); // f
    expect(Buffer.from(extracted).includes(Buffer.from('ACME\0', 'ascii'))).toBe(true);
  });

  it('extractExifApp1PayloadFromInput dispatches by mime type and extension', () => {
    const expected = sampleExifPayload();
    const jpeg = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe1, 0x00, expected.length + 2,
      ...expected,
      0xff, 0xd9
    ]);
    const png = createPngWithExifTiff(expected.subarray(6));
    const webp = createWebpWithExifTiff(expected.subarray(6));
    const tiff = createMinimalTiffWithMakeAndOrientation();

    const fromJpeg = extractExifApp1PayloadFromInput(jpeg, 'a.jpg', 'image/jpeg');
    const fromPng = extractExifApp1PayloadFromInput(png, 'a.png', 'image/png');
    const fromWebp = extractExifApp1PayloadFromInput(webp, 'a.webp', 'image/webp');
    const fromTiff = extractExifApp1PayloadFromInput(tiff, 'a.tiff', 'image/tiff');

    expect(fromJpeg).not.toBeNull();
    expect(fromPng).not.toBeNull();
    expect(fromWebp).not.toBeNull();
    expect(fromTiff).not.toBeNull();
  });

  it('returns null and does not throw for malformed inputs', () => {
    const malformed = new Uint8Array([0x00, 0x01, 0x02]);
    expect(() => extractExifPayloadFromPng(malformed)).not.toThrow();
    expect(() => extractExifPayloadFromWebp(malformed)).not.toThrow();
    expect(() => extractExifPayloadFromHeif(malformed)).not.toThrow();
    expect(() => extractExifPayloadFromTiff(malformed)).not.toThrow();
    expect(() => extractExifApp1PayloadFromInput(malformed, 'bad.bin', 'application/octet-stream')).not.toThrow();
  });
});
