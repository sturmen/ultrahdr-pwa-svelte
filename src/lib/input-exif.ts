import { extractExifPayloadFromJpeg } from './exif-utils.js';
import {
  isHeifFamilyBlob,
  isJpegFamilyBlob,
  isPngFamilyBlob,
  isTiffFamilyBlob,
  isWebpFamilyBlob,
  getFileExtension,
} from './image-family.ts';
import type { ProcessingPathClassification } from './processing-types.js';

type InputExifProbeSink = (substage: string) => void;
let inputExifProbeSink: InputExifProbeSink | null = null;

export function setInputExifProbeSink(sink: InputExifProbeSink | null): void {
  inputExifProbeSink = sink;
}

function emitInputExifProbe(substage: string): void {
  if (inputExifProbeSink) {
    try {
      inputExifProbeSink(substage);
    } catch {
      // Probe diagnostics must not affect pipeline.
    }
    return;
  }
  const g: unknown = typeof globalThis !== 'undefined' ? globalThis : undefined;
  const target = g as { dispatchEvent?: (ev: Event) => boolean } | undefined;
  if (!target || typeof target.dispatchEvent !== 'function' || typeof CustomEvent !== 'function') {
    return;
  }
  try {
    target.dispatchEvent(new CustomEvent('ultrahdr:processing-progress', {
      detail: {
        phase: 'stage-progress',
        stage: 'extract-source-exif',
        substage,
      },
    }));
  } catch {
    // best-effort probe
  }
}

const JPEG_APP1_MAX_PAYLOAD = 0xffff - 2;
const EXIF_HEADER = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);

type PointerTargetIfd = 'exif' | 'gps' | 'interop';
type IfdName = 'ifd0' | PointerTargetIfd;

interface IsoBox {
  type: string;
  start: number;
  end: number;
  dataStart: number;
  headerSize: number;
}

interface NclxInfo {
  primaries: number | null;
  transfer: number | null;
  matrix: number | null;
  fullRange: boolean;
}

interface ParsedInfe {
  itemId: number;
  itemType: string | null;
}

interface IlocExtent {
  offset: number;
  length: number;
}

interface IlocRecord {
  constructionMethod: number;
  dataReferenceIndex: number;
  baseOffset: number;
  extents: IlocExtent[];
}

interface TiffEntry {
  tag: number;
  type: number;
  count: number;
  valueBytes: Uint8Array;
}

interface PointerTiffEntry extends TiffEntry {
  pointerTarget: PointerTargetIfd;
  dataOffset?: number;
}

interface DataTiffEntry extends TiffEntry {
  pointerTarget?: undefined;
  dataOffset?: number;
}

type SerializedTiffEntry = PointerTiffEntry | DataTiffEntry;

interface ParsedTiffIfd {
  entries: TiffEntry[];
  nextIfdOffset: number;
}

interface IfdLayout {
  name: IfdName;
  entries: SerializedTiffEntry[];
  offset: number;
}

interface ExtraDataWrite {
  offset: number;
  data: Uint8Array;
}

const TIFF_TYPE_SIZES = new Map<number, number>([
  [1, 1],
  [2, 1],
  [3, 2],
  [4, 4],
  [5, 8],
  [7, 1],
  [9, 4],
  [10, 8],
  [11, 4],
  [12, 8],
]);

const IFD0_EXCLUDED_TAGS = new Set<number>([
  0x0100,
  0x0101,
  0x0102,
  0x0103,
  0x0106,
  0x0111,
  0x0115,
  0x0116,
  0x0117,
  0x011c,
  0x011d,
  0x011e,
  0x011f,
  0x0124,
  0x0125,
  0x0140,
  0x0141,
  0x0142,
  0x0143,
  0x0144,
  0x0145,
  0x0153,
  0x0201,
  0x0202,
  0x8769,
  0x8825,
]);

const EXIF_EXCLUDED_TAGS = new Set<number>([
  0x8769,
  0x8825,
  0xa005,
]);

function compareTiffEntries(a: TiffEntry, b: TiffEntry): number {
  return a.tag - b.tag;
}

function startsWithExifHeader(bytes: Uint8Array, offset = 0): boolean {
  return (
    offset >= 0 &&
    offset + 6 <= bytes.length &&
    bytes[offset] === 0x45 &&
    bytes[offset + 1] === 0x78 &&
    bytes[offset + 2] === 0x69 &&
    bytes[offset + 3] === 0x66 &&
    bytes[offset + 4] === 0x00 &&
    bytes[offset + 5] === 0x00
  );
}

function startsWithTiffHeader(bytes: Uint8Array, offset = 0): boolean {
  if (offset + 4 > bytes.length) {
    return false;
  }

  const byteOrderA = bytes[offset];
  const byteOrderB = bytes[offset + 1];
  if (byteOrderA === 0x49 && byteOrderB === 0x49) {
    return bytes[offset + 2] === 0x2a && bytes[offset + 3] === 0x00;
  }
  if (byteOrderA === 0x4d && byteOrderB === 0x4d) {
    return bytes[offset + 2] === 0x00 && bytes[offset + 3] === 0x2a;
  }
  return false;
}

function wrapTiffAsExifPayload(tiffBytes: Uint8Array): Uint8Array {
  const payload = new Uint8Array(EXIF_HEADER.length + tiffBytes.length);
  payload.set(EXIF_HEADER, 0);
  payload.set(tiffBytes, EXIF_HEADER.length);
  return payload;
}

function canonicalizeExifPayload(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length === 0) {
    return null;
  }
  if (startsWithExifHeader(bytes)) {
    return bytes;
  }
  if (startsWithTiffHeader(bytes)) {
    return wrapTiffAsExifPayload(bytes);
  }
  return null;
}

function isJpegInput(mimeType: string, extension: string): boolean {
  return isJpegFamilyBlob({ type: mimeType, name: `input${extension}` });
}

function getExtension(fileName: string): string {
  return getFileExtension(fileName);
}

function isPngInput(mimeType: string, extension: string): boolean {
  return isPngFamilyBlob({ type: mimeType, name: `input${extension}` });
}

function isWebpInput(mimeType: string, extension: string): boolean {
  return isWebpFamilyBlob({ type: mimeType, name: `input${extension}` });
}

function isHeifInput(mimeType: string, extension: string): boolean {
  return isHeifFamilyBlob({ type: mimeType, name: `input${extension}` });
}

function hasAsciiMarker(bytes: Uint8Array, marker: string): boolean {
  const markerBytes = new Uint8Array(marker.length);
  for (let index = 0; index < marker.length; index += 1) {
    markerBytes[index] = marker.charCodeAt(index);
  }
  for (let offset = 0; offset <= bytes.length - markerBytes.length; offset += 1) {
    let matches = true;
    for (let index = 0; index < markerBytes.length; index += 1) {
      if (bytes[offset + index] !== markerBytes[index]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      return true;
    }
  }
  return false;
}

function isTiffInput(mimeType: string, extension: string): boolean {
  return isTiffFamilyBlob({ type: mimeType, name: `input${extension}` });
}

function readUInt16(bytes: Uint8Array, offset: number, littleEndian: boolean): number | null {
  /* istanbul ignore next -- defensive bounds guard */
  if (offset < 0 || offset + 2 > bytes.length) {
    return null;
  }
  if (littleEndian) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUInt32(bytes: Uint8Array, offset: number, littleEndian: boolean): number | null {
  /* istanbul ignore next -- defensive bounds guard */
  if (offset < 0 || offset + 4 > bytes.length) {
    return null;
  }
  if (littleEndian) {
    return (
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    ) >>> 0;
  }
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function writeUInt16(bytes: Uint8Array, offset: number, value: number, littleEndian: boolean): void {
  if (littleEndian) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >> 8) & 0xff;
    return;
  }
  bytes[offset] = (value >> 8) & 0xff;
  bytes[offset + 1] = value & 0xff;
}

function writeUInt32(bytes: Uint8Array, offset: number, value: number, littleEndian: boolean): void {
  if (littleEndian) {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >> 8) & 0xff;
    bytes[offset + 2] = (value >> 16) & 0xff;
    bytes[offset + 3] = (value >> 24) & 0xff;
    return;
  }
  bytes[offset] = (value >> 24) & 0xff;
  bytes[offset + 1] = (value >> 16) & 0xff;
  bytes[offset + 2] = (value >> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

function readSizedUIntBE(bytes: Uint8Array, offset: number, size: number): number | null {
  if (size === 0) {
    return 0;
  }
  /* istanbul ignore next -- defensive bounds guard */
  if (size < 0 || size > 8 || offset < 0 || offset + size > bytes.length) {
    return null;
  }
  let value = 0n;
  for (let index = 0; index < size; index += 1) {
    value = (value << 8n) | BigInt(bytes[offset + index]);
  }
  /* istanbul ignore next -- defensive overflow guard */
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    return null;
  }
  return Number(value);
}

function readUInt32BE(bytes: Uint8Array, offset: number): number | null {
  return readUInt32(bytes, offset, false);
}

function readTypeString(bytes: Uint8Array, offset: number): string | null {
  /* istanbul ignore next -- defensive bounds guard */
  if (offset < 0 || offset + 4 > bytes.length) {
    return null;
  }
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function align2(value: number): number {
  return (value + 1) & ~1;
}

function toUint8Array(value: unknown): Uint8Array | null {
  return value instanceof Uint8Array ? value : null;
}

export function extractExifPayloadFromPng(bytes: Uint8Array): Uint8Array | null {
  const input = toUint8Array(bytes);
  if (!input || input.length < 8) {
    return null;
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let index = 0; index < pngSignature.length; index += 1) {
    if (input[index] !== pngSignature[index]) {
      return null;
    }
  }

  let offset = 8;
  while (offset + 12 <= input.length) {
    const length = readUInt32BE(input, offset)!;
    const chunkType = readTypeString(input, offset + 4)!;

    const dataOffset = offset + 8;
    const nextOffset = dataOffset + length + 4;
    /* istanbul ignore next -- malformed chunk length guard */
    if (nextOffset > input.length) {
      break;
    }

    if (chunkType === 'eXIf') {
      return canonicalizeExifPayload(input.slice(dataOffset, dataOffset + length));
    }

    offset = nextOffset;
  }

  return null;
}

export function extractExifPayloadFromWebp(bytes: Uint8Array): Uint8Array | null {
  const input = toUint8Array(bytes);
  if (!input || input.length < 12) {
    return null;
  }
  if (readTypeString(input, 0) !== 'RIFF' || readTypeString(input, 8) !== 'WEBP') {
    return null;
  }

  let offset = 12;
  while (offset + 8 <= input.length) {
    const chunkType = readTypeString(input, offset)!;
    const chunkSize = readUInt32(input, offset + 4, true)!;

    const chunkDataOffset = offset + 8;
    const chunkDataEnd = chunkDataOffset + chunkSize;
    /* istanbul ignore next -- malformed chunk length guard */
    if (chunkDataEnd > input.length) {
      break;
    }

    if (chunkType === 'EXIF') {
      return canonicalizeExifPayload(input.slice(chunkDataOffset, chunkDataEnd));
    }

    offset = chunkDataEnd + (chunkSize % 2);
  }

  return null;
}

function forEachIsoBox(
  bytes: Uint8Array,
  start: number,
  end: number,
  callback: (box: IsoBox) => void,
): void {
  let offset = start;
  while (offset + 8 <= end && offset + 8 <= bytes.length) {
    const size32 = readUInt32BE(bytes, offset)!;
    const type = readTypeString(bytes, offset + 4)!;

    let headerSize = 8;
    let boxSize = size32;
    if (size32 === 1) {
      const largeSize = readSizedUIntBE(bytes, offset + 8, 8);
      /* istanbul ignore next -- malformed large-size box guard */
      if (largeSize === null || largeSize < 16) {
        return;
      }
      boxSize = largeSize;
      headerSize = 16;
    } else if (size32 === 0) {
      boxSize = end - offset;
    }

    /* istanbul ignore next -- malformed box size guard */
    if (boxSize < headerSize) {
      return;
    }

    const boxEnd = offset + boxSize;
    /* istanbul ignore next -- malformed box boundary guard */
    if (boxEnd > end || boxEnd > bytes.length || boxEnd <= offset) {
      return;
    }

    callback({
      type,
      start: offset,
      end: boxEnd,
      dataStart: offset + headerSize,
      headerSize,
    });

    offset = boxEnd;
  }
}

function readFirstHeifNclxInfo(bytes: Uint8Array): NclxInfo | null {
  /* istanbul ignore next -- helper is only called after HEIF header validation */
  if (bytes.length < 11) {
    return null;
  }
  for (let offset = 0; offset <= bytes.length - 11; offset += 1) {
    if (readTypeString(bytes, offset)! !== 'nclx') {
      continue;
    }
    return {
      primaries: readUInt16(bytes, offset + 4, false),
      transfer: readUInt16(bytes, offset + 6, false),
      matrix: readUInt16(bytes, offset + 8, false),
      fullRange: (bytes[offset + 10] & 0x80) !== 0,
    };
  }
  return null;
}

function isSupportedHdrNclxInfo(info: NclxInfo | null): boolean {
  return Boolean(info && info.primaries === 9 && (info.transfer === 16 || info.transfer === 18));
}

export function probeHeifProcessingPathFromHeaders(
  bytes: Uint8Array,
  fileName = '',
  mimeType = '',
): ProcessingPathClassification {
  const input = toUint8Array(bytes);
  if (!input || input.length < 8) {
    return 'unknown';
  }

  const extension = getExtension(fileName);
  const mime = String(mimeType).toLowerCase();
  if (!isHeifInput(mime, extension)) {
    return 'unknown';
  }

  let hasFtypBox = false;
  forEachIsoBox(input, 0, input.length, (topBox) => {
    if (topBox.type === 'ftyp') {
      hasFtypBox = true;
    }
  });
  if (!hasFtypBox) {
    return 'unknown';
  }

  if (
    hasAsciiMarker(input, 'urn:com:apple:photo:2020:aux:hdrgainmap') ||
    hasAsciiMarker(input, 'HDRGainMapHeadroom')
  ) {
    return 'preserved';
  }

  const nclxInfo = readFirstHeifNclxInfo(input);
  if (isSupportedHdrNclxInfo(nclxInfo)) {
    return 'hdr-intent';
  }
  if (nclxInfo) {
    return 'generated';
  }

  return 'unknown';
}

function parseInfeBox(bytes: Uint8Array, box: IsoBox): ParsedInfe | null {
  let offset = box.dataStart;
  /* istanbul ignore next -- malformed infe box guard */
  if (offset + 4 > box.end) {
    return null;
  }
  const version = bytes[offset];
  offset += 4;

  if (version >= 2) {
    const itemId = version === 2
      ? readUInt16(bytes, offset, false)
      : readUInt32(bytes, offset, false);
    offset += version === 2 ? 2 : 4;
    /* istanbul ignore next -- malformed infe payload guard */
    if (itemId === null || offset + 6 > box.end) {
      return null;
    }
    offset += 2;
    return { itemId, itemType: readTypeString(bytes, offset)! };
  }

  const itemId = readUInt16(bytes, offset, false);
  /* istanbul ignore next -- malformed infe payload guard */
  return itemId === null ? null : { itemId, itemType: null };
}

function parseIinfBox(bytes: Uint8Array, box: IsoBox): Map<number, ParsedInfe> {
  let offset = box.dataStart;
  /* istanbul ignore next -- malformed iinf box guard */
  if (offset + 4 > box.end) {
    return new Map();
  }
  const version = bytes[offset];
  offset += 4;

  const entryCount = version === 0
    ? readUInt16(bytes, offset, false)
    : readUInt32(bytes, offset, false);
  /* istanbul ignore next -- malformed iinf count guard */
  if (entryCount === null) {
    return new Map();
  }
  offset += version === 0 ? 2 : 4;

  const byId = new Map<number, ParsedInfe>();
  let parsed = 0;
  forEachIsoBox(bytes, offset, box.end, (entry) => {
    /* istanbul ignore next -- callback short-circuit for malformed/non-infe children */
    if (parsed >= entryCount || entry.type !== 'infe') {
      return;
    }
    const parsedInfe = parseInfeBox(bytes, entry);
    if (parsedInfe) {
      byId.set(parsedInfe.itemId, parsedInfe);
    }
    parsed += 1;
  });
  return byId;
}

function parseIlocBox(bytes: Uint8Array, box: IsoBox): Map<number, IlocRecord> {
  let offset = box.dataStart;
  /* istanbul ignore next -- malformed iloc box guard */
  if (offset + 6 > box.end) {
    return new Map();
  }
  const version = bytes[offset];
  offset += 4;

  const sizeByteA = bytes[offset];
  const sizeByteB = bytes[offset + 1];
  offset += 2;

  const offsetSize = (sizeByteA >> 4) & 0x0f;
  const lengthSize = sizeByteA & 0x0f;
  const baseOffsetSize = (sizeByteB >> 4) & 0x0f;
  const indexSize = version === 0 ? 0 : (sizeByteB & 0x0f);

  const itemCount = version < 2
    ? readUInt16(bytes, offset, false)
    : readUInt32(bytes, offset, false);
  /* istanbul ignore next -- malformed iloc item count guard */
  if (itemCount === null) {
    return new Map();
  }
  offset += version < 2 ? 2 : 4;

  const byId = new Map<number, IlocRecord>();
  for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
    const itemId = version < 2
      ? readUInt16(bytes, offset, false)
      : readUInt32(bytes, offset, false);
    offset += version < 2 ? 2 : 4;
    /* istanbul ignore next -- malformed iloc item guard */
    if (itemId === null || offset > box.end) {
      return byId;
    }

    let constructionMethod = 0;
    if (version === 1 || version === 2) {
      const constructionField = readUInt16(bytes, offset, false);
      /* istanbul ignore next -- malformed iloc construction method guard */
      if (constructionField === null) {
        return byId;
      }
      constructionMethod = constructionField & 0x000f;
      offset += 2;
    }

    const dataReferenceIndex = readUInt16(bytes, offset, false);
    /* istanbul ignore next -- malformed iloc data reference guard */
    if (dataReferenceIndex === null) {
      return byId;
    }
    offset += 2;

    const baseOffset = readSizedUIntBE(bytes, offset, baseOffsetSize);
    /* istanbul ignore next -- malformed iloc base offset guard */
    if (baseOffset === null) {
      return byId;
    }
    offset += baseOffsetSize;

    const extentCount = readUInt16(bytes, offset, false);
    /* istanbul ignore next -- malformed iloc extent count guard */
    if (extentCount === null) {
      return byId;
    }
    offset += 2;

    const extents: IlocExtent[] = [];
    for (let extentIndex = 0; extentIndex < extentCount; extentIndex += 1) {
      if ((version === 1 || version === 2) && indexSize > 0) {
        const parsedExtentIndex = readSizedUIntBE(bytes, offset, indexSize);
        /* istanbul ignore next -- malformed iloc extent index guard */
        if (parsedExtentIndex === null) {
          return byId;
        }
        offset += indexSize;
      }

      const extentOffset = readSizedUIntBE(bytes, offset, offsetSize);
      /* istanbul ignore next -- malformed iloc extent offset guard */
      if (extentOffset === null) {
        return byId;
      }
      offset += offsetSize;

      const extentLength = readSizedUIntBE(bytes, offset, lengthSize);
      /* istanbul ignore next -- malformed iloc extent length guard */
      if (extentLength === null) {
        return byId;
      }
      offset += lengthSize;

      extents.push({ offset: extentOffset, length: extentLength });
    }

    byId.set(itemId, {
      constructionMethod,
      dataReferenceIndex,
      baseOffset,
      extents,
    });
  }

  return byId;
}

function decodeHeifExifItemPayload(itemBytes: Uint8Array): Uint8Array | null {
  /* istanbul ignore next -- internal helper only sees slices from parsed extents */
  if (itemBytes.length === 0) {
    return null;
  }
  if (startsWithExifHeader(itemBytes)) {
    return itemBytes;
  }
  if (startsWithTiffHeader(itemBytes)) {
    return wrapTiffAsExifPayload(itemBytes);
  }
  if (itemBytes.length < 4) {
    return null;
  }

  const tiffOffset = readUInt32BE(itemBytes, 0);
  /* istanbul ignore next -- defensive offset read guard */
  if (tiffOffset === null) {
    return null;
  }
  if (startsWithExifHeader(itemBytes, 4)) {
    return itemBytes.slice(4);
  }

  const absoluteOffset = 4 + tiffOffset;
  if (absoluteOffset >= itemBytes.length) {
    return null;
  }
  /* istanbul ignore next -- malformed item payload guard */
  if (startsWithExifHeader(itemBytes, absoluteOffset)) {
    return itemBytes.slice(absoluteOffset);
  }
  /* istanbul ignore next -- malformed item payload guard */
  if (startsWithTiffHeader(itemBytes, absoluteOffset)) {
    return wrapTiffAsExifPayload(itemBytes.slice(absoluteOffset));
  }
  return null;
}

function concatenateChunks(chunks: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
  }
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

export function extractExifPayloadFromHeif(bytes: Uint8Array): Uint8Array | null {
  /* istanbul ignore next -- public API already validates short inputs elsewhere */
  const input = toUint8Array(bytes);
  if (!input || input.length < 16) {
    return null;
  }

  let extracted: Uint8Array | null = null;
  forEachIsoBox(input, 0, input.length, (topBox) => {
    if (extracted || topBox.type !== 'meta') {
      return;
    }

    const childStart = topBox.dataStart + 4;
    /* istanbul ignore next -- malformed meta full box guard */
    if (childStart >= topBox.end) {
      return;
    }

    let iinfMap = new Map<number, ParsedInfe>();
    let ilocMap = new Map<number, IlocRecord>();
    let idatDataStart: number | null = null;
    forEachIsoBox(input, childStart, topBox.end, (metaChild) => {
      if (metaChild.type === 'iinf') {
        iinfMap = parseIinfBox(input, metaChild);
      } else if (metaChild.type === 'iloc') {
        ilocMap = parseIlocBox(input, metaChild);
      } else if (metaChild.type === 'idat') {
        idatDataStart = metaChild.dataStart;
      }
    });

    if (iinfMap.size === 0 || ilocMap.size === 0) {
      return;
    }

    let exifItemId: number | null = null;
    for (const [itemId, info] of iinfMap.entries()) {
      if (info.itemType === 'Exif') {
        exifItemId = itemId;
        break;
      }
    }
    /* istanbul ignore next -- malformed item info guard */
    if (exifItemId === null) {
      return;
    }

    const iloc = ilocMap.get(exifItemId);
    if (!iloc || iloc.extents.length === 0) {
      return;
    }

    emitInputExifProbe('heif-pre-exif-extent-slice');
    const chunks: Uint8Array[] = [];
    for (const extent of iloc.extents) {
      /* istanbul ignore next -- zero-length extents are ignored defensively */
      if (extent.length <= 0) {
        continue;
      }

      let sourceOffset = iloc.baseOffset + extent.offset;
      if (iloc.constructionMethod === 1) {
        /* istanbul ignore next -- malformed idat-backed iloc guard */
        if (idatDataStart === null) {
          return;
        }
        sourceOffset = idatDataStart + iloc.baseOffset + extent.offset;
      } else if (iloc.constructionMethod !== 0) {
        return;
      }

      const sourceEnd = sourceOffset + extent.length;
      /* istanbul ignore next -- malformed extent bounds guard */
      if (sourceOffset < 0 || sourceEnd > input.length) {
        return;
      }
      chunks.push(input.slice(sourceOffset, sourceEnd));
    }
    emitInputExifProbe('heif-post-exif-extent-slice');

    /* istanbul ignore next -- all extents were empty */
    if (chunks.length === 0) {
      return;
    }

    const merged = concatenateChunks(chunks);
    emitInputExifProbe('heif-post-exif-concat');
    const decoded = decodeHeifExifItemPayload(merged);
    emitInputExifProbe('heif-post-exif-decode');
    if (decoded) {
      extracted = decoded;
    }
  });

  return extracted;
}

function parseTiffIfd(bytes: Uint8Array, ifdOffset: number, littleEndian: boolean): ParsedTiffIfd | null {
  const entryCount = readUInt16(bytes, ifdOffset, littleEndian);
  /* istanbul ignore next -- malformed IFD header guard */
  if (entryCount === null) {
    return null;
  }

  const entriesStart = ifdOffset + 2;
  const nextOffsetPos = entriesStart + (entryCount * 12);
  /* istanbul ignore next -- malformed next-IFD pointer guard */
  if (nextOffsetPos + 4 > bytes.length) {
    return null;
  }

  const entries: TiffEntry[] = [];
  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    const entryOffset = entriesStart + (entryIndex * 12);
    const tag = readUInt16(bytes, entryOffset, littleEndian);
    const type = readUInt16(bytes, entryOffset + 2, littleEndian);
    const count = readUInt32(bytes, entryOffset + 4, littleEndian);
    /* istanbul ignore next -- malformed TIFF entry guard */
    if (tag === null || type === null || count === null) {
      return null;
    }

    const typeSize = TIFF_TYPE_SIZES.get(type);
    if (!typeSize) {
      continue;
    }

    const valueByteLength = typeSize * count;
    const valueOffsetField = readUInt32(bytes, entryOffset + 8, littleEndian);
    /* istanbul ignore next -- malformed value offset guard */
    if (valueOffsetField === null) {
      return null;
    }

    let valueBytes: Uint8Array | null = null;
    if (valueByteLength <= 4) {
      valueBytes = bytes.slice(entryOffset + 8, entryOffset + 8 + valueByteLength);
    } else {
      const valueStart = valueOffsetField;
      const valueEnd = valueStart + valueByteLength;
      if (valueEnd <= bytes.length) {
        valueBytes = bytes.slice(valueStart, valueEnd);
      }
    }

    if (valueBytes) {
      entries.push({
        tag,
        type,
        count,
        valueBytes,
      });
    }
  }

  const nextIfdOffset = readUInt32(bytes, nextOffsetPos, littleEndian);
  return nextIfdOffset === null ? null : { entries, nextIfdOffset };
}

function readLongFromEntry(entry: TiffEntry | undefined, littleEndian: boolean): number | null {
  if (!entry || entry.type !== 4 || entry.count < 1 || entry.valueBytes.length < 4) {
    return null;
  }
  return readUInt32(entry.valueBytes, 0, littleEndian);
}

function filterEntries(entries: TiffEntry[], excludedTags: ReadonlySet<number>): TiffEntry[] {
  const filtered: TiffEntry[] = [];
  for (const entry of entries) {
    if (excludedTags.has(entry.tag)) {
      continue;
    }
    const typeSize = TIFF_TYPE_SIZES.get(entry.type);
    /* istanbul ignore next -- defensive unsupported/empty entry guard */
    if (!typeSize || entry.count <= 0) {
      continue;
    }
    filtered.push(entry);
  }
  return filtered;
}

function cloneEntry(entry: TiffEntry): DataTiffEntry {
  return {
    tag: entry.tag,
    type: entry.type,
    count: entry.count,
    valueBytes: entry.valueBytes.slice(),
  };
}

function pointerEntry(tag: number, targetIfdName: PointerTargetIfd): PointerTiffEntry {
  return {
    tag,
    type: 4,
    count: 1,
    valueBytes: new Uint8Array(4),
    pointerTarget: targetIfdName,
  };
}

function serializeExifTiff(args: {
  littleEndian: boolean;
  ifd0Entries: DataTiffEntry[];
  exifEntries: DataTiffEntry[];
  gpsEntries: DataTiffEntry[];
  interopEntries: DataTiffEntry[];
}): Uint8Array | null {
  const { littleEndian } = args;
  const ifdLayouts: IfdLayout[] = [
    { name: 'ifd0', entries: [...args.ifd0Entries], offset: 0 },
  ];

  if (args.exifEntries.length > 0) {
    ifdLayouts.push({ name: 'exif', entries: [...args.exifEntries], offset: 0 });
  }
  if (args.gpsEntries.length > 0) {
    ifdLayouts.push({ name: 'gps', entries: [...args.gpsEntries], offset: 0 });
  }
  if (args.interopEntries.length > 0) {
    ifdLayouts.push({ name: 'interop', entries: [...args.interopEntries], offset: 0 });
  }

  const ifdByName = new Map<IfdName, IfdLayout>();
  for (const layout of ifdLayouts) {
    layout.entries.sort(compareTiffEntries);
    ifdByName.set(layout.name, layout);
  }

  const ifd0Layout = ifdByName.get('ifd0');
  /* istanbul ignore next -- construction bug guard */
  if (!ifd0Layout) {
    throw new Error('Missing root IFD layout');
  }
  if (ifdByName.has('exif')) {
    ifd0Layout.entries.push(pointerEntry(0x8769, 'exif'));
  }
  if (ifdByName.has('gps')) {
    ifd0Layout.entries.push(pointerEntry(0x8825, 'gps'));
  }
  const exifLayout = ifdByName.get('exif');
  if (exifLayout && ifdByName.has('interop')) {
    exifLayout.entries.push(pointerEntry(0xa005, 'interop'));
  }
  for (const layout of ifdLayouts) {
    layout.entries.sort(compareTiffEntries);
  }

  let nextOffset = 8;
  for (const layout of ifdLayouts) {
    layout.offset = align2(nextOffset);
    nextOffset = layout.offset + 2 + (layout.entries.length * 12) + 4;
  }

  let dataOffset = align2(nextOffset);
  const extraDataWrites: ExtraDataWrite[] = [];
  for (const layout of ifdLayouts) {
    for (const entry of layout.entries) {
      const typeSize = TIFF_TYPE_SIZES.get(entry.type);
      /* istanbul ignore next -- defensive unsupported type guard */
      if (!typeSize) {
        return null;
      }
      const valueByteLength = typeSize * entry.count;
      if (entry.pointerTarget) {
        const target = ifdByName.get(entry.pointerTarget);
        /* istanbul ignore next -- construction bug guard */
        if (!target) {
          return null;
        }
        writeUInt32(entry.valueBytes, 0, target.offset, littleEndian);
        continue;
      }

      /* istanbul ignore next -- defensive truncated value guard */
      if (entry.valueBytes.length < valueByteLength) {
        return null;
      }
      if (valueByteLength > 4) {
        entry.dataOffset = dataOffset;
        extraDataWrites.push({
          offset: dataOffset,
          data: entry.valueBytes.slice(0, valueByteLength),
        });
        dataOffset = align2(dataOffset + valueByteLength);
      }
    }
  }

  const out = new Uint8Array(dataOffset);
  if (littleEndian) {
    out.set([0x49, 0x49, 0x2a, 0x00], 0);
  } else {
    out.set([0x4d, 0x4d, 0x00, 0x2a], 0);
  }
  writeUInt32(out, 4, ifd0Layout.offset, littleEndian);

  for (const layout of ifdLayouts) {
    const tableOffset = layout.offset;
    writeUInt16(out, tableOffset, layout.entries.length, littleEndian);
    let entryOffset = tableOffset + 2;
    for (const entry of layout.entries) {
      const typeSize = TIFF_TYPE_SIZES.get(entry.type)!;
      const valueByteLength = typeSize * entry.count;
      writeUInt16(out, entryOffset, entry.tag, littleEndian);
      writeUInt16(out, entryOffset + 2, entry.type, littleEndian);
      writeUInt32(out, entryOffset + 4, entry.count, littleEndian);

      if (entry.pointerTarget) {
        out.set(entry.valueBytes, entryOffset + 8);
      } else if (valueByteLength <= 4) {
        const inlineBytes = new Uint8Array(4);
        inlineBytes.set(entry.valueBytes.slice(0, valueByteLength), 0);
        out.set(inlineBytes, entryOffset + 8);
      } else {
        writeUInt32(out, entryOffset + 8, entry.dataOffset!, littleEndian);
      }
      entryOffset += 12;
    }
    writeUInt32(out, entryOffset, 0, littleEndian);
  }

  for (const write of extraDataWrites) {
    /* istanbul ignore next -- loop may be empty for inline-only payloads */
    out.set(write.data, write.offset);
  }

  return out;
}

export function extractExifPayloadFromTiff(bytes: Uint8Array): Uint8Array | null {
  const input = toUint8Array(bytes);
  /* istanbul ignore next -- public API validates short inputs defensively */
  if (!input || input.length < 8) {
    return null;
  }

  const littleEndian = input[0] === 0x49 && input[1] === 0x49;
  const bigEndian = input[0] === 0x4d && input[1] === 0x4d;
  if (!littleEndian && !bigEndian) {
    return null;
  }

  const tiffMarker = readUInt16(input, 2, littleEndian);
  if (tiffMarker !== 0x002a) {
    return null;
  }

  const ifd0Offset = readUInt32(input, 4, littleEndian);
  if (ifd0Offset === null || ifd0Offset <= 0 || ifd0Offset >= input.length) {
    return null;
  }

  const ifd0 = parseTiffIfd(input, ifd0Offset, littleEndian);
  /* istanbul ignore next -- malformed first IFD guard */
  if (!ifd0) {
    return null;
  }

  const ifd0Entries = filterEntries(ifd0.entries, IFD0_EXCLUDED_TAGS).map(cloneEntry);
  let exifEntries: DataTiffEntry[] = [];
  let gpsEntries: DataTiffEntry[] = [];
  let interopEntries: DataTiffEntry[] = [];

  const exifPtr = readLongFromEntry(ifd0.entries.find((entry) => entry.tag === 0x8769), littleEndian);
  if (exifPtr !== null && exifPtr > 0 && exifPtr < input.length) {
    const exifIfd = parseTiffIfd(input, exifPtr, littleEndian);
    if (exifIfd) {
      exifEntries = filterEntries(exifIfd.entries, EXIF_EXCLUDED_TAGS).map(cloneEntry);
      const interopPtr = readLongFromEntry(
        exifIfd.entries.find((entry) => entry.tag === 0xa005),
        littleEndian,
      );
      if (interopPtr !== null && interopPtr > 0 && interopPtr < input.length) {
        const interopIfd = parseTiffIfd(input, interopPtr, littleEndian);
        if (interopIfd) {
          interopEntries = filterEntries(interopIfd.entries, EXIF_EXCLUDED_TAGS).map(cloneEntry);
        }
      }
    }
  }

  const gpsPtr = readLongFromEntry(ifd0.entries.find((entry) => entry.tag === 0x8825), littleEndian);
  if (gpsPtr !== null && gpsPtr > 0 && gpsPtr < input.length) {
    const gpsIfd = parseTiffIfd(input, gpsPtr, littleEndian);
    if (gpsIfd) {
      gpsEntries = filterEntries(gpsIfd.entries, EXIF_EXCLUDED_TAGS).map(cloneEntry);
    }
  }

  if (
    ifd0Entries.length === 0 &&
    exifEntries.length === 0 &&
    gpsEntries.length === 0 &&
    interopEntries.length === 0
  ) {
    return null;
  }

  const serializedTiff = serializeExifTiff({
    littleEndian,
    ifd0Entries,
    exifEntries,
    gpsEntries,
    interopEntries,
  });
  /* istanbul ignore next -- serialize guard is defensive after prior validation */
  if (!serializedTiff) {
    return null;
  }

  const payload = wrapTiffAsExifPayload(serializedTiff);
  if (payload.length > JPEG_APP1_MAX_PAYLOAD) {
    console.warn('Skipping TIFF EXIF extraction: payload exceeds JPEG APP1 segment size limit');
    return null;
  }
  return payload;
}

export function extractExifApp1PayloadFromInput(
  bytes: Uint8Array,
  fileName = '',
  mimeType = '',
): Uint8Array | null {
  emitInputExifProbe('pre-exif-parse');
  const input = toUint8Array(bytes);
  if (!input || input.length === 0) {
    emitInputExifProbe('post-exif-parse-empty');
    return null;
  }

  const mime = String(mimeType).toLowerCase();
  const extension = getExtension(fileName);
  try {
    if (isJpegInput(mime, extension)) {
      emitInputExifProbe('dispatch-jpeg');
      const out = extractExifPayloadFromJpeg(input);
      emitInputExifProbe('post-exif-parse-jpeg');
      return out;
    }
    if (isPngInput(mime, extension)) {
      emitInputExifProbe('dispatch-png');
      const out = extractExifPayloadFromPng(input);
      emitInputExifProbe('post-exif-parse-png');
      return out;
    }
    if (isWebpInput(mime, extension)) {
      emitInputExifProbe('dispatch-webp');
      const out = extractExifPayloadFromWebp(input);
      emitInputExifProbe('post-exif-parse-webp');
      return out;
    }
    if (isHeifInput(mime, extension)) {
      emitInputExifProbe('dispatch-heif');
      const out = extractExifPayloadFromHeif(input);
      emitInputExifProbe('post-exif-parse-heif');
      return out;
    }
    if (isTiffInput(mime, extension)) {
      emitInputExifProbe('dispatch-tiff');
      const out = extractExifPayloadFromTiff(input);
      emitInputExifProbe('post-exif-parse-tiff');
      return out;
    }
  } catch (error) {
    console.warn('Failed to extract EXIF from input:', error);
    emitInputExifProbe('post-exif-parse-error');
    return null;
  }
  emitInputExifProbe('post-exif-parse-unmatched');
  return null;
}
