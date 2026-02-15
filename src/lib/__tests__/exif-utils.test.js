import { describe, expect, it } from 'vitest';

import {
  extractExifPayloadFromJpeg,
  stripExifSegments,
  insertExifSegment,
  normalizeExifOrientationTo1,
} from '../exif-utils.js';

function buildJpeg(segments = [], imageData = new Uint8Array([0x11, 0x22, 0x33])) {
  const parts = [new Uint8Array([0xff, 0xd8])];
  for (const { marker, payload } of segments) {
    const length = payload.length + 2;
    parts.push(
      new Uint8Array([0xff, marker, (length >> 8) & 0xff, length & 0xff]),
      payload
    );
  }
  parts.push(new Uint8Array([0xff, 0xda, 0x00, 0x08, 1, 2, 3, 4, 5, 6]));
  parts.push(imageData);
  parts.push(new Uint8Array([0xff, 0xd9]));

  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return merged;
}

function littleEndianExifPayload(orientation = 6) {
  return new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
}

function bigEndianExifPayload(orientation = 6) {
  return new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x01,
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
}

function countExifApp1Segments(jpegBytes) {
  let count = 0;
  let offset = 2;
  while (offset + 4 <= jpegBytes.length) {
    if (jpegBytes[offset] !== 0xff) {
      break;
    }
    const marker = jpegBytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      break;
    }
    const length = (jpegBytes[offset + 2] << 8) | jpegBytes[offset + 3];
    if (length < 2 || offset + 2 + length > jpegBytes.length) {
      break;
    }
    if (
      marker === 0xe1 &&
      offset + 10 <= jpegBytes.length &&
      jpegBytes[offset + 4] === 0x45 &&
      jpegBytes[offset + 5] === 0x78 &&
      jpegBytes[offset + 6] === 0x69 &&
      jpegBytes[offset + 7] === 0x66 &&
      jpegBytes[offset + 8] === 0x00 &&
      jpegBytes[offset + 9] === 0x00
    ) {
      count++;
    }
    offset += 2 + length;
  }
  return count;
}

describe('exif-utils', () => {
  it('extractExifPayloadFromJpeg finds EXIF APP1 payload bytes', () => {
    const exifPayload = littleEndianExifPayload(6);
    const jpeg = buildJpeg([
      { marker: 0xe0, payload: new Uint8Array([0x4a, 0x46, 0x49, 0x46, 0x00]) },
      { marker: 0xe1, payload: exifPayload },
    ]);

    const extracted = extractExifPayloadFromJpeg(jpeg);
    expect(extracted).not.toBeNull();
    expect(Array.from(extracted)).toEqual(Array.from(exifPayload));
  });

  it('stripExifSegments removes EXIF APP1 and preserves non-EXIF segments', () => {
    const exifPayload = littleEndianExifPayload(6);
    const xmpPayload = new Uint8Array([0x58, 0x4d, 0x50, 0x00]); // "XMP\0"
    const jpeg = buildJpeg([
      { marker: 0xe0, payload: new Uint8Array([0x4a, 0x46, 0x49, 0x46, 0x00]) },
      { marker: 0xe1, payload: exifPayload },
      { marker: 0xe1, payload: xmpPayload },
      { marker: 0xe2, payload: new Uint8Array([0x49, 0x43, 0x43]) },
    ]);

    const stripped = stripExifSegments(jpeg);

    expect(extractExifPayloadFromJpeg(stripped)).toBeNull();
    expect(stripped.some((byte) => byte === 0x58)).toBe(true);
    expect(stripped.some((byte) => byte === 0x49)).toBe(true);
  });

  it('insertExifSegment inserts EXIF after SOI and replaces existing EXIF', () => {
    const oldExif = littleEndianExifPayload(6);
    const newExif = littleEndianExifPayload(1);
    const jpeg = buildJpeg([
      { marker: 0xe1, payload: oldExif },
      { marker: 0xe0, payload: new Uint8Array([1, 2, 3]) },
    ]);

    const withInserted = insertExifSegment(jpeg, newExif);
    const extracted = extractExifPayloadFromJpeg(withInserted);

    expect(withInserted[0]).toBe(0xff);
    expect(withInserted[1]).toBe(0xd8);
    expect(extracted).not.toBeNull();
    expect(Array.from(extracted)).toEqual(Array.from(newExif));
    expect(countExifApp1Segments(withInserted)).toBe(1);
  });

  it('normalizeExifOrientationTo1 patches little-endian orientation', () => {
    const exifPayload = littleEndianExifPayload(6);
    const normalized = normalizeExifOrientationTo1(exifPayload);

    expect(normalized[24]).toBe(1);
    expect(normalized[25]).toBe(0);
  });

  it('normalizeExifOrientationTo1 patches big-endian orientation', () => {
    const exifPayload = bigEndianExifPayload(6);
    const normalized = normalizeExifOrientationTo1(exifPayload);

    expect(normalized[24]).toBe(0);
    expect(normalized[25]).toBe(1);
  });

  it('normalizeExifOrientationTo1 is a safe no-op for malformed payload', () => {
    const malformed = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00]);

    expect(() => normalizeExifOrientationTo1(malformed)).not.toThrow();
    const normalized = normalizeExifOrientationTo1(malformed);
    expect(normalized).toBe(malformed);
  });
});
