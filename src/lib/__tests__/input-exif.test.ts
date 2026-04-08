/**
 * @vitest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  extractExifApp1PayloadFromInput,
  extractExifPayloadFromHeif,
  extractExifPayloadFromPng,
  extractExifPayloadFromTiff,
  extractExifPayloadFromWebp,
  probeHeifProcessingPathFromHeaders,
} from '../input-exif.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const textEncoder = new TextEncoder();

function sampleExifPayload(orientation = 6): Uint8Array {
  return new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
}

function createPngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = textEncoder.encode(type);
  const out = new Uint8Array(4 + 4 + data.length + 4);
  out[0] = (data.length >>> 24) & 0xff;
  out[1] = (data.length >>> 16) & 0xff;
  out[2] = (data.length >>> 8) & 0xff;
  out[3] = data.length & 0xff;
  out.set(typeBytes, 4);
  out.set(data, 8);
  return out;
}

function createPng(chunks: Uint8Array[]): Uint8Array {
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const totalLength = signature.length + chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  out.set(signature, offset);
  offset += signature.length;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function createWebpChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = textEncoder.encode(type);
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

function createWebp(chunks: Uint8Array[]): Uint8Array {
  const bodyLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const riffSize = 4 + bodyLength;
  const out = new Uint8Array(12 + bodyLength);
  out.set(textEncoder.encode('RIFF'), 0);
  out[4] = riffSize & 0xff;
  out[5] = (riffSize >>> 8) & 0xff;
  out[6] = (riffSize >>> 16) & 0xff;
  out[7] = (riffSize >>> 24) & 0xff;
  out.set(textEncoder.encode('WEBP'), 8);
  let offset = 12;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function writeUint16(
  bytes: Uint8Array,
  offset: number,
  value: number,
  littleEndian: boolean,
): void {
  if (littleEndian) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
    return;
  }
  bytes[offset] = (value >>> 8) & 0xff;
  bytes[offset + 1] = value & 0xff;
}

function writeUint32(
  bytes: Uint8Array,
  offset: number,
  value: number,
  littleEndian: boolean,
): void {
  if (littleEndian) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >>> 8) & 0xff;
    bytes[offset + 2] = (value >>> 16) & 0xff;
    bytes[offset + 3] = (value >>> 24) & 0xff;
    return;
  }
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

interface TiffEntrySpec {
  tag: number;
  type: number;
  count: number;
  valueBytes: Uint8Array;
}

function typeByteSize(type: number): number {
  switch (type) {
    case 1:
    case 2:
    case 7:
      return 1;
    case 3:
      return 2;
    case 4:
    case 9:
    case 11:
      return 4;
    case 5:
    case 10:
    case 12:
      return 8;
    default:
      throw new Error(`Unsupported TIFF type in test helper: ${type}`);
  }
}

function asciiBytes(value: string): Uint8Array {
  return textEncoder.encode(value);
}

function longValue(value: number, littleEndian: boolean): Uint8Array {
  const out = new Uint8Array(4);
  writeUint32(out, 0, value, littleEndian);
  return out;
}

function byteArray(...values: number[]): Uint8Array {
  return new Uint8Array(values);
}

function buildTiff(
  littleEndian: boolean,
  ifdEntries: TiffEntrySpec[],
  nextIfdOffset = 0,
): Uint8Array {
  const sortedEntries = [...ifdEntries].sort((a, b) => a.tag - b.tag);
  const headerLength = 8;
  const ifdOffset = 8;
  const tableLength = 2 + (sortedEntries.length * 12) + 4;
  let dataOffset = ifdOffset + tableLength;

  const externalData: Array<{ offset: number; data: Uint8Array }> = [];
  const totalLength = sortedEntries.reduce((maxLength, entry) => {
    const expectedByteLength = typeByteSize(entry.type) * entry.count;
    if (entry.valueBytes.length !== expectedByteLength) {
      throw new Error(`Mismatched TIFF value length for tag ${entry.tag.toString(16)}`);
    }
    if (expectedByteLength <= 4) {
      return maxLength;
    }
    const entryOffset = dataOffset;
    externalData.push({ offset: entryOffset, data: entry.valueBytes });
    dataOffset += expectedByteLength;
    return Math.max(maxLength, dataOffset);
  }, headerLength + tableLength);

  const out = new Uint8Array(totalLength);
  if (littleEndian) {
    out.set([0x49, 0x49, 0x2a, 0x00], 0);
  } else {
    out.set([0x4d, 0x4d, 0x00, 0x2a], 0);
  }
  writeUint32(out, 4, ifdOffset, littleEndian);
  writeUint16(out, ifdOffset, sortedEntries.length, littleEndian);

  let entryOffset = ifdOffset + 2;
  let nextExternalIndex = 0;
  for (const entry of sortedEntries) {
    const valueLength = typeByteSize(entry.type) * entry.count;
    writeUint16(out, entryOffset, entry.tag, littleEndian);
    writeUint16(out, entryOffset + 2, entry.type, littleEndian);
    writeUint32(out, entryOffset + 4, entry.count, littleEndian);
    if (valueLength <= 4) {
      out.set(entry.valueBytes, entryOffset + 8);
    } else {
      const external = externalData[nextExternalIndex++];
      writeUint32(out, entryOffset + 8, external.offset, littleEndian);
    }
    entryOffset += 12;
  }

  writeUint32(out, entryOffset, nextIfdOffset, littleEndian);
  for (const external of externalData) {
    out.set(external.data, external.offset);
  }
  return out;
}

interface IsoBoxOptions {
  largeSize?: boolean;
  openEnded?: boolean;
}

function isoBox(type: string, data: Uint8Array, options: IsoBoxOptions = {}): Uint8Array {
  const typeBytes = textEncoder.encode(type);
  if (options.largeSize) {
    const totalSize = 16 + data.length;
    const out = new Uint8Array(totalSize);
    writeUint32(out, 0, 1, false);
    out.set(typeBytes, 4);
    const high = Math.floor(totalSize / 0x100000000);
    const low = totalSize >>> 0;
    writeUint32(out, 8, high, false);
    writeUint32(out, 12, low, false);
    out.set(data, 16);
    return out;
  }

  if (options.openEnded) {
    const out = new Uint8Array(8 + data.length);
    writeUint32(out, 0, 0, false);
    out.set(typeBytes, 4);
    out.set(data, 8);
    return out;
  }

  const totalSize = 8 + data.length;
  const out = new Uint8Array(totalSize);
  writeUint32(out, 0, totalSize, false);
  out.set(typeBytes, 4);
  out.set(data, 8);
  return out;
}

function concatenate(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

interface IlocItemSpec {
  itemId: number;
  constructionMethod?: number;
  baseOffset?: number;
  extents: Array<{ offset: number; length: number; extentIndex?: number }>;
}

function buildInfe(itemId: number, itemType: string, version = 2): Uint8Array {
  const body = new Uint8Array(version >= 2 ? 4 + 2 + 2 + 4 : 6);
  body[0] = version;
  if (version >= 2) {
    if (version === 2) {
      writeUint16(body, 4, itemId, false);
      writeUint16(body, 6, 0, false);
      body.set(textEncoder.encode(itemType), 8);
    } else {
      writeUint32(body, 4, itemId, false);
      writeUint16(body, 8, 0, false);
      body.set(textEncoder.encode(itemType), 10);
    }
  } else {
    writeUint16(body, 4, itemId, false);
  }
  return isoBox('infe', body);
}

function buildIinf(entries: Uint8Array[], version = 0): Uint8Array {
  const header = new Uint8Array(version === 0 ? 6 : 8);
  header[0] = version;
  if (version === 0) {
    writeUint16(header, 4, entries.length, false);
  } else {
    writeUint32(header, 4, entries.length, false);
  }
  return isoBox('iinf', concatenate([header, ...entries]));
}

function buildIloc(items: IlocItemSpec[], version = 0, indexSize = 0): Uint8Array {
  const sizeByteA = 0x44;
  const sizeByteB = 0x40 | indexSize;
  const chunks: Uint8Array[] = [];
  const header = new Uint8Array(version < 2 ? 8 : 10);
  header[0] = version;
  header[4] = sizeByteA;
  header[5] = sizeByteB;
  if (version < 2) {
    writeUint16(header, 6, items.length, false);
  } else {
    writeUint32(header, 6, items.length, false);
  }
  chunks.push(header);

  for (const item of items) {
    const itemHeaderLength = version < 2 ? 10 : 14;
    const extentRecordLength = (indexSize > 0 ? indexSize : 0) + 4 + 4;
    const out = new Uint8Array(itemHeaderLength + (2 + extentRecordLength * item.extents.length));
    let offset = 0;
    if (version < 2) {
      writeUint16(out, offset, item.itemId, false);
      offset += 2;
    } else {
      writeUint32(out, offset, item.itemId, false);
      offset += 4;
    }
    if (version === 1 || version === 2) {
      writeUint16(out, offset, item.constructionMethod ?? 0, false);
      offset += 2;
    }
    writeUint16(out, offset, 0, false);
    offset += 2;
    writeUint32(out, offset, item.baseOffset ?? 0, false);
    offset += 4;
    writeUint16(out, offset, item.extents.length, false);
    offset += 2;
    for (const extent of item.extents) {
      if ((version === 1 || version === 2) && indexSize > 0) {
        out[offset] = extent.extentIndex ?? 0;
        offset += indexSize;
      }
      writeUint32(out, offset, extent.offset, false);
      offset += 4;
      writeUint32(out, offset, extent.length, false);
      offset += 4;
    }
    chunks.push(out);
  }

  return isoBox('iloc', concatenate(chunks));
}

function buildHeifWithExifItem(
  rawExifItem: Uint8Array,
  options: {
    constructionMethod?: number;
    useIdat?: boolean;
    version?: number;
    indexSize?: number;
    largeFtyp?: boolean;
    itemInfoVersion?: number;
    openEndedMeta?: boolean;
  } = {},
): Uint8Array {
  const ftyp = isoBox('ftyp', textEncoder.encode('heic\0\0\0\0mif1heic'), {
    largeSize: options.largeFtyp,
  });

  const exifItemId = 7;
  const itemInfoVersion = options.itemInfoVersion ?? 2;
  const iinf = buildIinf([buildInfe(exifItemId, 'Exif', itemInfoVersion)], 0);
  const ilocVersion = options.version ?? 0;
  const indexSize = options.indexSize ?? 0;
  const constructionMethod = options.constructionMethod ?? 0;

  if (options.useIdat) {
    const idat = isoBox('idat', rawExifItem);
    const iloc = buildIloc(
      [
        {
          itemId: exifItemId,
          constructionMethod,
          baseOffset: 0,
          extents: [{ offset: 0, length: rawExifItem.length, extentIndex: 1 }],
        },
      ],
      ilocVersion,
      indexSize,
    );
    const metaPayload = concatenate([new Uint8Array(4), iinf, iloc, idat]);
    const meta = options.openEndedMeta
      ? isoBox('meta', metaPayload, { openEnded: true })
      : isoBox('meta', metaPayload);
    return concatenate([ftyp, meta]);
  }

  const placeholderIloc = buildIloc(
    [
      {
        itemId: exifItemId,
        constructionMethod,
        baseOffset: 0,
        extents: [{ offset: 0, length: rawExifItem.length, extentIndex: 1 }],
      },
    ],
    ilocVersion,
    indexSize,
  );
  const placeholderMetaPayload = concatenate([new Uint8Array(4), iinf, placeholderIloc]);
  const placeholderMeta = options.openEndedMeta
    ? isoBox('meta', placeholderMetaPayload, { openEnded: true })
    : isoBox('meta', placeholderMetaPayload);
  const mdat = isoBox('mdat', rawExifItem);
  const mdatDataStart = ftyp.length + placeholderMeta.length + 8;
  const iloc = buildIloc(
    [
      {
        itemId: exifItemId,
        constructionMethod,
        baseOffset: 0,
        extents: [{ offset: mdatDataStart, length: rawExifItem.length, extentIndex: 1 }],
      },
    ],
    ilocVersion,
    indexSize,
  );
  const metaPayload = concatenate([new Uint8Array(4), iinf, iloc]);
  const meta = options.openEndedMeta
    ? isoBox('meta', metaPayload, { openEnded: true })
    : isoBox('meta', metaPayload);
  return concatenate([ftyp, meta, mdat]);
}

function buildHeifWithMetaChildren(children: Uint8Array[]): Uint8Array {
  const ftyp = isoBox('ftyp', textEncoder.encode('heic\0\0\0\0mif1heic'));
  const meta = isoBox('meta', concatenate([new Uint8Array(4), ...children]));
  return concatenate([ftyp, meta]);
}

function buildHeifProbeBytes(payload: Uint8Array, options: IsoBoxOptions = {}): Uint8Array {
  const ftyp = isoBox('ftyp', textEncoder.encode('heic\0\0\0\0mif1heic'), options);
  const free = isoBox('free', payload, options.openEnded ? { openEnded: true } : undefined);
  return concatenate([ftyp, free]);
}

function createMinimalTiffWithMakeAndOrientation(littleEndian: boolean): Uint8Array {
  return buildTiff(littleEndian, [
    {
      tag: 0x010f,
      type: 2,
      count: 5,
      valueBytes: asciiBytes('ACME\0'),
    },
    {
      tag: 0x0112,
      type: 3,
      count: 1,
      valueBytes: byteArray(0x01, 0x00),
    },
  ]);
}

function createTiffWithNestedIfds(littleEndian: boolean): Uint8Array {
  const make = asciiBytes('ACME CAM\0');
  const date = asciiBytes('2026:04:08 13:22:14\0');
  const ifd0Offset = 8;
  const entryCount = 3;
  const tableLength = 2 + (entryCount * 12) + 4;
  const makeOffset = ifd0Offset + tableLength;
  const gpsIfdOffset = makeOffset + make.length;
  const gpsIfdLength = 2 + 12 + 4;
  const exifIfdOffset = gpsIfdOffset + gpsIfdLength;
  const exifIfdLength = 2 + (2 * 12) + 4;
  const dateOffset = exifIfdOffset + exifIfdLength;
  const interopIfdOffset = dateOffset + date.length;
  const interopIfdLength = 2 + 12 + 4;
  const out = new Uint8Array(interopIfdOffset + interopIfdLength);
  if (littleEndian) {
    out.set([0x49, 0x49, 0x2a, 0x00], 0);
  } else {
    out.set([0x4d, 0x4d, 0x00, 0x2a], 0);
  }
  writeUint32(out, 4, ifd0Offset, littleEndian);
  writeUint16(out, ifd0Offset, entryCount, littleEndian);

  let entryOffset = ifd0Offset + 2;
  writeUint16(out, entryOffset, 0x010f, littleEndian);
  writeUint16(out, entryOffset + 2, 2, littleEndian);
  writeUint32(out, entryOffset + 4, make.length, littleEndian);
  writeUint32(out, entryOffset + 8, makeOffset, littleEndian);

  entryOffset += 12;
  writeUint16(out, entryOffset, 0x8769, littleEndian);
  writeUint16(out, entryOffset + 2, 4, littleEndian);
  writeUint32(out, entryOffset + 4, 1, littleEndian);
  writeUint32(out, entryOffset + 8, exifIfdOffset, littleEndian);

  entryOffset += 12;
  writeUint16(out, entryOffset, 0x8825, littleEndian);
  writeUint16(out, entryOffset + 2, 4, littleEndian);
  writeUint32(out, entryOffset + 4, 1, littleEndian);
  writeUint32(out, entryOffset + 8, gpsIfdOffset, littleEndian);

  entryOffset += 12;
  writeUint32(out, entryOffset, 0, littleEndian);

  out.set(make, makeOffset);

  writeUint16(out, gpsIfdOffset, 1, littleEndian);
  writeUint16(out, gpsIfdOffset + 2, 0x0000, littleEndian);
  writeUint16(out, gpsIfdOffset + 4, 1, littleEndian);
  writeUint32(out, gpsIfdOffset + 6, 4, littleEndian);
  out.set(byteArray(2, 3, 0, 0), gpsIfdOffset + 10);
  writeUint32(out, gpsIfdOffset + 14, 0, littleEndian);

  writeUint16(out, exifIfdOffset, 2, littleEndian);
  writeUint16(out, exifIfdOffset + 2, 0x9003, littleEndian);
  writeUint16(out, exifIfdOffset + 4, 2, littleEndian);
  writeUint32(out, exifIfdOffset + 6, date.length, littleEndian);
  writeUint32(out, exifIfdOffset + 10, dateOffset, littleEndian);
  writeUint16(out, exifIfdOffset + 14, 0xa005, littleEndian);
  writeUint16(out, exifIfdOffset + 16, 4, littleEndian);
  writeUint32(out, exifIfdOffset + 18, 1, littleEndian);
  writeUint32(out, exifIfdOffset + 22, interopIfdOffset, littleEndian);
  writeUint32(out, exifIfdOffset + 26, 0, littleEndian);
  out.set(date, dateOffset);

  writeUint16(out, interopIfdOffset, 1, littleEndian);
  writeUint16(out, interopIfdOffset + 2, 0x0001, littleEndian);
  writeUint16(out, interopIfdOffset + 4, 2, littleEndian);
  writeUint32(out, interopIfdOffset + 6, 4, littleEndian);
  out.set(asciiBytes('R98\0'), interopIfdOffset + 10);
  writeUint32(out, interopIfdOffset + 14, 0, littleEndian);
  return out;
}

function createExcludedOnlyTiff(littleEndian: boolean): Uint8Array {
  return buildTiff(littleEndian, [
    {
      tag: 0x0100,
      type: 4,
      count: 1,
      valueBytes: longValue(1024, littleEndian),
    },
  ]);
}

function createOversizedTiff(): Uint8Array {
  const giant = new Uint8Array(70_000);
  giant.fill(0x41);
  giant[giant.length - 1] = 0;
  return buildTiff(true, [
    {
      tag: 0x010f,
      type: 2,
      count: giant.length,
      valueBytes: giant,
    },
  ]);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.doUnmock('../exif-utils.js');
});

describe('input-exif extractors', () => {
  it('extracts PNG eXIf chunks from both TIFF and full Exif payloads', () => {
    const expected = sampleExifPayload();
    const bigEndianTiff = createMinimalTiffWithMakeAndOrientation(false);
    const pngWithTiff = createPng([
      createPngChunk('IHDR', byteArray(0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0)),
      createPngChunk('eXIf', expected.subarray(6)),
      createPngChunk('IEND', new Uint8Array(0)),
    ]);
    const pngWithExif = createPng([
      createPngChunk('IHDR', byteArray(0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0)),
      createPngChunk('eXIf', expected),
      createPngChunk('IEND', new Uint8Array(0)),
    ]);
    const pngWithBigEndianTiff = createPng([
      createPngChunk('IHDR', byteArray(0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0)),
      createPngChunk('eXIf', bigEndianTiff),
      createPngChunk('IEND', new Uint8Array(0)),
    ]);

    expect(Array.from(extractExifPayloadFromPng(pngWithTiff) ?? [])).toEqual(Array.from(expected));
    expect(Array.from(extractExifPayloadFromPng(pngWithExif) ?? [])).toEqual(Array.from(expected));
    expect(extractExifPayloadFromPng(pngWithBigEndianTiff)?.subarray(0, 6)).toEqual(expected.subarray(0, 6));
  });

  it('returns null for invalid or malformed PNG EXIF inputs', () => {
    const invalidSignature = createPng([createPngChunk('IEND', new Uint8Array(0))]);
    invalidSignature[0] = 0;
    const overflowingChunk = createPng([createPngChunk('eXIf', new Uint8Array([1, 2, 3]))]);
    overflowingChunk[3] = 0xff;
    const truncatedChunk = createPng([createPngChunk('eXIf', new Uint8Array([1, 2, 3]))]).subarray(0, 12);
    const invalidExifPayload = createPng([
      createPngChunk('eXIf', new Uint8Array([0x01, 0x02, 0x03, 0x04])),
    ]);
    const emptyExifChunk = createPng([createPngChunk('eXIf', new Uint8Array(0))]);

    expect(extractExifPayloadFromPng(invalidSignature)).toBeNull();
    expect(extractExifPayloadFromPng(overflowingChunk)).toBeNull();
    expect(extractExifPayloadFromPng(truncatedChunk)).toBeNull();
    expect(extractExifPayloadFromPng(invalidExifPayload)).toBeNull();
    expect(extractExifPayloadFromPng(emptyExifChunk)).toBeNull();
    expect(extractExifPayloadFromPng(new Uint8Array([1, 2, 3]))).toBeNull();
  });

  it('extracts WebP EXIF chunks from both TIFF and full Exif payloads', () => {
    const expected = sampleExifPayload();
    const bigEndianTiff = createMinimalTiffWithMakeAndOrientation(false);
    const webpWithTiff = createWebp([createWebpChunk('EXIF', expected.subarray(6))]);
    const webpWithExif = createWebp([createWebpChunk('EXIF', expected)]);
    const webpWithBigEndianTiff = createWebp([createWebpChunk('EXIF', bigEndianTiff)]);

    expect(Array.from(extractExifPayloadFromWebp(webpWithTiff) ?? [])).toEqual(Array.from(expected));
    expect(Array.from(extractExifPayloadFromWebp(webpWithExif) ?? [])).toEqual(Array.from(expected));
    expect(extractExifPayloadFromWebp(webpWithBigEndianTiff)?.subarray(0, 6)).toEqual(expected.subarray(0, 6));
  });

  it('returns null for invalid or malformed WebP EXIF inputs', () => {
    const invalidHeader = createWebp([createWebpChunk('EXIF', sampleExifPayload())]);
    invalidHeader[0] = 0;
    const oddSizedChunk = createWebp([
      createWebpChunk('VP8 ', new Uint8Array([1])),
      createWebpChunk('EXIF', new Uint8Array([0x01, 0x02, 0x03])),
    ]);
    const truncatedChunk = createWebp([createWebpChunk('EXIF', sampleExifPayload())]).subarray(0, 18);
    const emptyExifChunk = createWebp([createWebpChunk('EXIF', new Uint8Array(0))]);

    expect(extractExifPayloadFromWebp(invalidHeader)).toBeNull();
    expect(extractExifPayloadFromWebp(oddSizedChunk)).toBeNull();
    expect(extractExifPayloadFromWebp(truncatedChunk)).toBeNull();
    expect(extractExifPayloadFromWebp(emptyExifChunk)).toBeNull();
    expect(extractExifPayloadFromWebp(new Uint8Array([1, 2, 3]))).toBeNull();
  });

  it('classifies HEIF processing paths from headers', () => {
    const preserved = buildHeifProbeBytes(textEncoder.encode('urn:com:apple:photo:2020:aux:hdrgainmap'));
    const hdrIntent = buildHeifProbeBytes(
      concatenate([
        textEncoder.encode('xxxxnclx'),
        byteArray(0x00, 0x09, 0x00, 0x10, 0x00, 0x09, 0x80),
      ]),
      { largeSize: true },
    );
    const generated = buildHeifProbeBytes(
      concatenate([
        textEncoder.encode('yyyynclx'),
        byteArray(0x00, 0x09, 0x00, 0x01, 0x00, 0x09, 0x00),
      ]),
      { openEnded: true },
    );

    expect(probeHeifProcessingPathFromHeaders(preserved, 'a.heic', 'image/heic')).toBe('preserved');
    expect(probeHeifProcessingPathFromHeaders(hdrIntent, 'a.hif', 'image/heif')).toBe('hdr-intent');
    expect(probeHeifProcessingPathFromHeaders(generated, 'a.heif', 'image/heif')).toBe('generated');
    expect(probeHeifProcessingPathFromHeaders(new Uint8Array([1, 2, 3]), 'a.heif', 'image/heif')).toBe('unknown');
    expect(probeHeifProcessingPathFromHeaders(preserved, 'a.jpg', 'image/jpeg')).toBe('unknown');
  });

  it('returns unknown for malformed or missing HEIF header structure', () => {
    const noFtyp = isoBox('meta', new Uint8Array(8));
    const malformedLargeSize = new Uint8Array([
      0x00, 0x00, 0x00, 0x01,
      0x66, 0x74, 0x79, 0x70,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x0f,
    ]);
    const unknownButValidHeif = buildHeifProbeBytes(textEncoder.encode('plain-heif-without-markers'));

    expect(probeHeifProcessingPathFromHeaders(noFtyp, 'a.heic', 'image/heic')).toBe('unknown');
    expect(probeHeifProcessingPathFromHeaders(malformedLargeSize, 'a.heic', 'image/heic')).toBe('unknown');
    expect(probeHeifProcessingPathFromHeaders(unknownButValidHeif)).toBe('unknown');
  });

  it('extracts HEIF EXIF items from fixture and synthetic containers', () => {
    const fixturePath = path.resolve(__dirname, '../../../media/test_hdr_heif_gainmap.HEIC');
    const fixtureBytes = new Uint8Array(fs.readFileSync(fixturePath));
    const exifPayload = sampleExifPayload();
    const tiffPayload = exifPayload.subarray(6);
    const prefixedExif = concatenate([byteArray(0, 0, 0, 0), exifPayload]);
    const prefixedTiff = concatenate([byteArray(0, 0, 0, 2), byteArray(0xaa, 0xbb), tiffPayload]);

    expect(extractExifPayloadFromHeif(fixtureBytes)?.subarray(0, 6)).toEqual(exifPayload.subarray(0, 6));
    expect(extractExifPayloadFromHeif(buildHeifWithExifItem(exifPayload))).toEqual(exifPayload);
    expect(extractExifPayloadFromHeif(buildHeifWithExifItem(tiffPayload))).toEqual(exifPayload);
    expect(extractExifPayloadFromHeif(buildHeifWithExifItem(prefixedExif))).toEqual(exifPayload);
    expect(extractExifPayloadFromHeif(buildHeifWithExifItem(prefixedTiff))).toEqual(exifPayload);
    expect(
      extractExifPayloadFromHeif(
        buildHeifWithExifItem(exifPayload, {
          constructionMethod: 1,
          useIdat: true,
          version: 1,
          indexSize: 1,
        }),
      ),
    ).toEqual(exifPayload);
  });

  it('returns null for malformed or unsupported HEIF EXIF structures', () => {
    const exifPayload = sampleExifPayload();
    const missingMeta = isoBox('ftyp', textEncoder.encode('heic\0\0\0\0mif1heic'));
    const missingIinf = buildHeifWithMetaChildren([buildIloc([{ itemId: 1, extents: [{ offset: 0, length: 4 }] }])]);
    const missingIloc = buildHeifWithMetaChildren([buildIinf([buildInfe(7, 'Exif')])]);
    const missingExifItem = buildHeifWithMetaChildren([
      buildIinf([buildInfe(7, 'mime')]),
      buildIloc([{ itemId: 7, extents: [{ offset: 0, length: exifPayload.length }] }]),
      exifPayload,
    ]);
    const emptyExtents = buildHeifWithMetaChildren([
      buildIinf([buildInfe(7, 'Exif')]),
      buildIloc([{ itemId: 7, extents: [] }]),
      exifPayload,
    ]);
    const outOfRange = buildHeifWithMetaChildren([
      buildIinf([buildInfe(7, 'Exif')]),
      buildIloc([{ itemId: 7, extents: [{ offset: 1000, length: 4 }] }]),
      exifPayload,
    ]);
    const missingIdat = buildHeifWithMetaChildren([
      buildIinf([buildInfe(7, 'Exif')]),
      buildIloc([{ itemId: 7, constructionMethod: 1, extents: [{ offset: 0, length: exifPayload.length }] }], 1),
    ]);
    const unsupportedConstructionMethod = buildHeifWithMetaChildren([
      buildIinf([buildInfe(7, 'Exif')]),
      buildIloc([{ itemId: 7, constructionMethod: 2, extents: [{ offset: 0, length: exifPayload.length }] }], 1),
      exifPayload,
    ]);
    const undecodablePayload = buildHeifWithExifItem(new Uint8Array([0x01, 0x02, 0x03, 0x04]));

    expect(extractExifPayloadFromHeif(missingMeta)).toBeNull();
    expect(extractExifPayloadFromHeif(missingIinf)).toBeNull();
    expect(extractExifPayloadFromHeif(missingIloc)).toBeNull();
    expect(extractExifPayloadFromHeif(missingExifItem)).toBeNull();
    expect(extractExifPayloadFromHeif(emptyExtents)).toBeNull();
    expect(extractExifPayloadFromHeif(outOfRange)).toBeNull();
    expect(extractExifPayloadFromHeif(missingIdat)).toBeNull();
    expect(extractExifPayloadFromHeif(unsupportedConstructionMethod)).toBeNull();
    expect(extractExifPayloadFromHeif(undecodablePayload)).toBeNull();
    expect(extractExifPayloadFromHeif(new Uint8Array([1, 2, 3]))).toBeNull();
  });

  it('extracts TIFF payloads for little-endian, big-endian, and nested IFD inputs', () => {
    const littleEndian = createMinimalTiffWithMakeAndOrientation(true);
    const bigEndian = createMinimalTiffWithMakeAndOrientation(false);
    const nested = createTiffWithNestedIfds(true);

    expect(extractExifPayloadFromTiff(littleEndian)?.subarray(0, 6)).toEqual(sampleExifPayload().subarray(0, 6));
    expect(extractExifPayloadFromTiff(bigEndian)?.subarray(0, 6)).toEqual(sampleExifPayload().subarray(0, 6));

    const nestedPayload = extractExifPayloadFromTiff(nested);
    expect(nestedPayload).not.toBeNull();
    expect(Buffer.from(nestedPayload ?? []).includes(Buffer.from('ACME CAM\0', 'ascii'))).toBe(true);
    expect(Buffer.from(nestedPayload ?? []).includes(Buffer.from('2026:04:08 13:22:14\0', 'ascii'))).toBe(true);
    expect(Buffer.from(nestedPayload ?? []).includes(Buffer.from('R98\0', 'ascii'))).toBe(true);
  });

  it('returns null for malformed, excluded-only, or oversized TIFF inputs and warns on oversize', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidByteOrder = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    const invalidMarker = createMinimalTiffWithMakeAndOrientation(true);
    invalidMarker[2] = 0;
    const invalidIfdOffset = createMinimalTiffWithMakeAndOrientation(true);
    invalidIfdOffset[4] = 0xff;
    const truncatedIfd = createMinimalTiffWithMakeAndOrientation(true).subarray(0, 10);
    const excludedOnly = createExcludedOnlyTiff(true);
    const oversized = createOversizedTiff();

    expect(extractExifPayloadFromTiff(invalidByteOrder)).toBeNull();
    expect(extractExifPayloadFromTiff(invalidMarker)).toBeNull();
    expect(extractExifPayloadFromTiff(invalidIfdOffset)).toBeNull();
    expect(extractExifPayloadFromTiff(truncatedIfd)).toBeNull();
    expect(extractExifPayloadFromTiff(excludedOnly)).toBeNull();
    expect(extractExifPayloadFromTiff(oversized)).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      'Skipping TIFF EXIF extraction: payload exceeds JPEG APP1 segment size limit',
    );
  });

  it('dispatches by MIME type and extension at the top level', () => {
    const expected = sampleExifPayload();
    const jpeg = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe1, 0x00, expected.length + 2,
      ...expected,
      0xff, 0xd9,
    ]);
    const png = createPng([createPngChunk('eXIf', expected.subarray(6))]);
    const webp = createWebp([createWebpChunk('EXIF', expected.subarray(6))]);
    const heif = buildHeifWithExifItem(expected);
    const tiff = createMinimalTiffWithMakeAndOrientation(true);

    expect(extractExifApp1PayloadFromInput(jpeg, 'a.jpg', 'image/jpeg')).toEqual(expected);
    expect(extractExifApp1PayloadFromInput(png, 'a.png', 'image/png')).toEqual(expected);
    expect(extractExifApp1PayloadFromInput(webp, 'a.webp', 'image/webp')).toEqual(expected);
    expect(extractExifApp1PayloadFromInput(heif, 'a.heic', 'image/heic')).toEqual(expected);
    expect(extractExifApp1PayloadFromInput(tiff, 'a.tiff', 'image/tiff')?.subarray(0, 6)).toEqual(
      expected.subarray(0, 6),
    );
    expect(extractExifApp1PayloadFromInput(heif, 'a.hif', '')).toEqual(expected);
    expect(extractExifApp1PayloadFromInput(jpeg)).toBeNull();
  });

  it('returns null for empty, unknown, and extractor-failure top-level inputs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(extractExifApp1PayloadFromInput(new Uint8Array(0), 'a.jpg', 'image/jpeg')).toBeNull();
    expect(extractExifApp1PayloadFromInput(new Uint8Array([1, 2, 3]), 'a.bin', 'application/octet-stream')).toBeNull();

    vi.doMock('../exif-utils.js', () => ({
      extractExifPayloadFromJpeg: () => {
        throw new Error('boom');
      },
    }));
    const reloadedModule = await import('../input-exif.js');

    expect(
      reloadedModule.extractExifApp1PayloadFromInput(
        new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
        'a.jpg',
        'image/jpeg',
      ),
    ).toBeNull();
    expect(warn).toHaveBeenCalledWith('Failed to extract EXIF from input:', expect.any(Error));
  });
});
