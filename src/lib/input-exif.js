import { extractExifPayloadFromJpeg } from './exif-utils.js';

const JPEG_APP1_MAX_PAYLOAD = 0xffff - 2;
const EXIF_HEADER = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]); // Exif\0\0

const TIFF_TYPE_SIZES = new Map([
    [1, 1],   // BYTE
    [2, 1],   // ASCII
    [3, 2],   // SHORT
    [4, 4],   // LONG
    [5, 8],   // RATIONAL
    [7, 1],   // UNDEFINED
    [9, 4],   // SLONG
    [10, 8],  // SRATIONAL
    [11, 4],  // FLOAT
    [12, 8],  // DOUBLE
]);

const IFD0_EXCLUDED_TAGS = new Set([
    0x0100, // ImageWidth
    0x0101, // ImageLength
    0x0102, // BitsPerSample
    0x0103, // Compression
    0x0106, // PhotometricInterpretation
    0x0111, // StripOffsets
    0x0115, // SamplesPerPixel
    0x0116, // RowsPerStrip
    0x0117, // StripByteCounts
    0x011c, // PlanarConfiguration
    0x011d, // PageName
    0x011e, // XPosition
    0x011f, // YPosition
    0x0124, // T4Options
    0x0125, // T6Options
    0x0140, // ColorMap
    0x0141, // HalftoneHints
    0x0142, // TileWidth
    0x0143, // TileLength
    0x0144, // TileOffsets
    0x0145, // TileByteCounts
    0x0153, // SampleFormat
    0x0201, // JPEGInterchangeFormat
    0x0202, // JPEGInterchangeFormatLength
    0x8769, // ExifOffset pointer (rebuilt)
    0x8825, // GPSInfo pointer (rebuilt)
]);

const EXIF_EXCLUDED_TAGS = new Set([
    0x8769, // nested Exif IFD pointer
    0x8825, // nested GPS IFD pointer
    0xa005, // InteropOffset pointer (rebuilt)
]);

function startsWithExifHeader(bytes, offset = 0) {
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

function startsWithTiffHeader(bytes, offset = 0) {
    if (offset + 4 > bytes.length) {
        return false;
    }
    const boA = bytes[offset];
    const boB = bytes[offset + 1];
    const littleEndian = boA === 0x49 && boB === 0x49;
    const bigEndian = boA === 0x4d && boB === 0x4d;
    if (!littleEndian && !bigEndian) {
        return false;
    }
    if (littleEndian) {
        return bytes[offset + 2] === 0x2a && bytes[offset + 3] === 0x00;
    }
    return bytes[offset + 2] === 0x00 && bytes[offset + 3] === 0x2a;
}

function wrapTiffAsExifPayload(tiffBytes) {
    const payload = new Uint8Array(EXIF_HEADER.length + tiffBytes.length);
    payload.set(EXIF_HEADER, 0);
    payload.set(tiffBytes, EXIF_HEADER.length);
    return payload;
}

function canonicalizeExifPayload(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) {
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

function getExtension(fileName) {
    if (typeof fileName !== 'string') {
        return '';
    }
    const idx = fileName.lastIndexOf('.');
    return idx === -1 ? '' : fileName.slice(idx).toLowerCase();
}

function isJpegInput(mimeType, extension) {
    return (
        mimeType === 'image/jpeg' ||
        mimeType === 'image/jpg' ||
        extension === '.jpg' ||
        extension === '.jpeg'
    );
}

function isPngInput(mimeType, extension) {
    return mimeType === 'image/png' || extension === '.png';
}

function isWebpInput(mimeType, extension) {
    return mimeType === 'image/webp' || extension === '.webp';
}

function isHeifInput(mimeType, extension) {
    return (
        mimeType === 'image/heic' ||
        mimeType === 'image/heif' ||
        extension === '.heic' ||
        extension === '.heif'
    );
}

function isTiffInput(mimeType, extension) {
    return mimeType === 'image/tiff' || extension === '.tif' || extension === '.tiff';
}

function readUInt16(bytes, offset, littleEndian) {
    if (offset < 0 || offset + 2 > bytes.length) {
        return null;
    }
    if (littleEndian) {
        return bytes[offset] | (bytes[offset + 1] << 8);
    }
    return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUInt32(bytes, offset, littleEndian) {
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

function writeUInt16(bytes, offset, value, littleEndian) {
    if (littleEndian) {
        bytes[offset] = value & 0xff;
        bytes[offset + 1] = (value >> 8) & 0xff;
    } else {
        bytes[offset] = (value >> 8) & 0xff;
        bytes[offset + 1] = value & 0xff;
    }
}

function writeUInt32(bytes, offset, value, littleEndian) {
    if (littleEndian) {
        bytes[offset] = value & 0xff;
        bytes[offset + 1] = (value >> 8) & 0xff;
        bytes[offset + 2] = (value >> 16) & 0xff;
        bytes[offset + 3] = (value >> 24) & 0xff;
    } else {
        bytes[offset] = (value >> 24) & 0xff;
        bytes[offset + 1] = (value >> 16) & 0xff;
        bytes[offset + 2] = (value >> 8) & 0xff;
        bytes[offset + 3] = value & 0xff;
    }
}

function readSizedUIntBE(bytes, offset, size) {
    if (size === 0) {
        return 0;
    }
    if (size < 0 || size > 8 || offset < 0 || offset + size > bytes.length) {
        return null;
    }
    let value = 0n;
    for (let i = 0; i < size; i++) {
        value = (value << 8n) | BigInt(bytes[offset + i]);
    }
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
        return null;
    }
    return Number(value);
}

function readUInt32BE(bytes, offset) {
    if (offset < 0 || offset + 4 > bytes.length) {
        return null;
    }
    return (
        (bytes[offset] << 24) |
        (bytes[offset + 1] << 16) |
        (bytes[offset + 2] << 8) |
        bytes[offset + 3]
    ) >>> 0;
}

function readTypeString(bytes, offset) {
    if (offset < 0 || offset + 4 > bytes.length) {
        return null;
    }
    return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function align2(value) {
    return (value + 1) & ~1;
}

function toUint8Array(value) {
    return value instanceof Uint8Array ? value : null;
}

export function extractExifPayloadFromPng(bytes) {
    const input = toUint8Array(bytes);
    if (!input || input.length < 8) {
        return null;
    }
    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    for (let i = 0; i < pngSignature.length; i++) {
        if (input[i] !== pngSignature[i]) {
            return null;
        }
    }

    let offset = 8;
    while (offset + 12 <= input.length) {
        const length = readUInt32BE(input, offset);
        const chunkType = readTypeString(input, offset + 4);
        if (length === null || chunkType === null) {
            break;
        }

        const dataOffset = offset + 8;
        const nextOffset = dataOffset + length + 4; // +CRC
        if (length < 0 || nextOffset > input.length) {
            break;
        }

        if (chunkType === 'eXIf') {
            return canonicalizeExifPayload(input.slice(dataOffset, dataOffset + length));
        }

        offset = nextOffset;
    }

    return null;
}

export function extractExifPayloadFromWebp(bytes) {
    const input = toUint8Array(bytes);
    if (!input || input.length < 12) {
        return null;
    }
    if (
        readTypeString(input, 0) !== 'RIFF' ||
        readTypeString(input, 8) !== 'WEBP'
    ) {
        return null;
    }

    let offset = 12;
    while (offset + 8 <= input.length) {
        const chunkType = readTypeString(input, offset);
        const chunkSize = readUInt32(input, offset + 4, true);
        if (chunkType === null || chunkSize === null) {
            break;
        }

        const chunkDataOffset = offset + 8;
        const chunkDataEnd = chunkDataOffset + chunkSize;
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

function forEachIsoBox(bytes, start, end, callback) {
    let offset = start;
    while (offset + 8 <= end && offset + 8 <= bytes.length) {
        const size32 = readUInt32BE(bytes, offset);
        const type = readTypeString(bytes, offset + 4);
        if (size32 === null || type === null) {
            return;
        }

        let headerSize = 8;
        let boxSize = size32;
        if (size32 === 1) {
            const largeSize = readSizedUIntBE(bytes, offset + 8, 8);
            if (largeSize === null || largeSize < 16) {
                return;
            }
            boxSize = largeSize;
            headerSize = 16;
        } else if (size32 === 0) {
            boxSize = end - offset;
        }

        if (boxSize < headerSize) {
            return;
        }

        const boxEnd = offset + boxSize;
        if (boxEnd > end || boxEnd > bytes.length) {
            return;
        }

        callback({
            type,
            start: offset,
            end: boxEnd,
            dataStart: offset + headerSize,
            headerSize,
        });

        if (boxEnd <= offset) {
            return;
        }
        offset = boxEnd;
    }
}

function parseInfeBox(bytes, box) {
    let offset = box.dataStart;
    if (offset + 4 > box.end) {
        return null;
    }
    const version = bytes[offset];
    offset += 4; // version + flags

    if (version >= 2) {
        const itemId = version === 2
            ? readUInt16(bytes, offset, false)
            : readUInt32(bytes, offset, false);
        offset += version === 2 ? 2 : 4;
        if (itemId === null || offset + 6 > box.end) {
            return null;
        }
        offset += 2; // item_protection_index
        const itemType = readTypeString(bytes, offset);
        if (!itemType) {
            return null;
        }
        return { itemId, itemType };
    }

    // v0/v1 infe entries do not carry item_type; we can only guess from name.
    const itemId = readUInt16(bytes, offset, false);
    if (itemId === null) {
        return null;
    }
    return { itemId, itemType: null };
}

function parseIinfBox(bytes, box) {
    let offset = box.dataStart;
    if (offset + 4 > box.end) {
        return new Map();
    }
    const version = bytes[offset];
    offset += 4; // version + flags

    const entryCount = version === 0
        ? readUInt16(bytes, offset, false)
        : readUInt32(bytes, offset, false);
    if (entryCount === null) {
        return new Map();
    }
    offset += version === 0 ? 2 : 4;

    const byId = new Map();
    let parsed = 0;
    forEachIsoBox(bytes, offset, box.end, (entry) => {
        if (parsed >= entryCount) {
            return;
        }
        if (entry.type !== 'infe') {
            return;
        }
        const parsedInfe = parseInfeBox(bytes, entry);
        if (parsedInfe?.itemId !== null && parsedInfe?.itemId !== undefined) {
            byId.set(parsedInfe.itemId, parsedInfe);
        }
        parsed++;
    });
    return byId;
}

function parseIlocBox(bytes, box) {
    let offset = box.dataStart;
    if (offset + 6 > box.end) {
        return new Map();
    }
    const version = bytes[offset];
    offset += 4; // version + flags

    const sizeByteA = bytes[offset++];
    const sizeByteB = bytes[offset++];

    const offsetSize = (sizeByteA >> 4) & 0x0f;
    const lengthSize = sizeByteA & 0x0f;
    const baseOffsetSize = (sizeByteB >> 4) & 0x0f;
    const indexSize = version === 0 ? 0 : (sizeByteB & 0x0f);

    const itemCount = version < 2
        ? readUInt16(bytes, offset, false)
        : readUInt32(bytes, offset, false);
    if (itemCount === null) {
        return new Map();
    }
    offset += version < 2 ? 2 : 4;

    const byId = new Map();

    for (let i = 0; i < itemCount; i++) {
        const itemId = version < 2
            ? readUInt16(bytes, offset, false)
            : readUInt32(bytes, offset, false);
        offset += version < 2 ? 2 : 4;
        if (itemId === null || offset > box.end) {
            return byId;
        }

        let constructionMethod = 0;
        if (version === 1 || version === 2) {
            const constructionField = readUInt16(bytes, offset, false);
            if (constructionField === null) {
                return byId;
            }
            constructionMethod = constructionField & 0x000f;
            offset += 2;
        }

        const dataReferenceIndex = readUInt16(bytes, offset, false);
        if (dataReferenceIndex === null) {
            return byId;
        }
        offset += 2;

        const baseOffset = readSizedUIntBE(bytes, offset, baseOffsetSize);
        if (baseOffset === null) {
            return byId;
        }
        offset += baseOffsetSize;

        const extentCount = readUInt16(bytes, offset, false);
        if (extentCount === null) {
            return byId;
        }
        offset += 2;

        const extents = [];
        for (let j = 0; j < extentCount; j++) {
            if ((version === 1 || version === 2) && indexSize > 0) {
                const extentIndex = readSizedUIntBE(bytes, offset, indexSize);
                if (extentIndex === null) {
                    return byId;
                }
                offset += indexSize;
            }

            const extentOffset = readSizedUIntBE(bytes, offset, offsetSize);
            if (extentOffset === null) {
                return byId;
            }
            offset += offsetSize;

            const extentLength = readSizedUIntBE(bytes, offset, lengthSize);
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

function decodeHeifExifItemPayload(itemBytes) {
    if (!(itemBytes instanceof Uint8Array) || itemBytes.length === 0) {
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
    if (tiffOffset === null) {
        return null;
    }

    if (startsWithExifHeader(itemBytes, 4)) {
        return itemBytes.slice(4);
    }

    const absoluteOffset = 4 + tiffOffset;
    if (absoluteOffset < itemBytes.length) {
        if (startsWithExifHeader(itemBytes, absoluteOffset)) {
            return itemBytes.slice(absoluteOffset);
        }
        if (startsWithTiffHeader(itemBytes, absoluteOffset)) {
            return wrapTiffAsExifPayload(itemBytes.slice(absoluteOffset));
        }
    }

    return null;
}

function concatenateChunks(chunks) {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
    }
    return merged;
}

export function extractExifPayloadFromHeif(bytes) {
    const input = toUint8Array(bytes);
    if (!input || input.length < 16) {
        return null;
    }

    let extracted = null;
    forEachIsoBox(input, 0, input.length, (topBox) => {
        if (extracted) {
            return;
        }
        if (topBox.type !== 'meta') {
            return;
        }
        // meta is a FullBox; first 4 bytes are version/flags.
        const childStart = topBox.dataStart + 4;
        if (childStart >= topBox.end) {
            return;
        }

        let iinfMap = new Map();
        let ilocMap = new Map();
        let idatBox = null;

        forEachIsoBox(input, childStart, topBox.end, (metaChild) => {
            if (metaChild.type === 'iinf') {
                iinfMap = parseIinfBox(input, metaChild);
                return;
            }
            if (metaChild.type === 'iloc') {
                ilocMap = parseIlocBox(input, metaChild);
                return;
            }
            if (metaChild.type === 'idat') {
                idatBox = metaChild;
            }
        });

        if (iinfMap.size === 0 || ilocMap.size === 0) {
            return;
        }

        let exifItemId = null;
        for (const [itemId, info] of iinfMap.entries()) {
            if (info.itemType === 'Exif') {
                exifItemId = itemId;
                break;
            }
        }
        if (exifItemId === null) {
            return;
        }

        const iloc = ilocMap.get(exifItemId);
        if (!iloc || !Array.isArray(iloc.extents) || iloc.extents.length === 0) {
            return;
        }

        const chunks = [];
        for (const extent of iloc.extents) {
            if (!extent || extent.length <= 0) {
                continue;
            }

            let sourceOffset = iloc.baseOffset + extent.offset;
            if (iloc.constructionMethod === 1) {
                if (!idatBox) {
                    return;
                }
                sourceOffset = idatBox.dataStart + iloc.baseOffset + extent.offset;
            } else if (iloc.constructionMethod !== 0) {
                return;
            }

            const sourceEnd = sourceOffset + extent.length;
            if (sourceOffset < 0 || sourceEnd > input.length) {
                return;
            }
            chunks.push(input.slice(sourceOffset, sourceEnd));
        }

        if (chunks.length === 0) {
            return;
        }

        const rawExifItem = concatenateChunks(chunks);
        const decoded = decodeHeifExifItemPayload(rawExifItem);
        if (decoded) {
            extracted = decoded;
        }
    });

    return extracted;
}

function parseTiffIfd(bytes, ifdOffset, littleEndian) {
    const entryCount = readUInt16(bytes, ifdOffset, littleEndian);
    if (entryCount === null) {
        return null;
    }
    const entriesStart = ifdOffset + 2;
    const entriesBytes = entryCount * 12;
    const nextOffsetPos = entriesStart + entriesBytes;
    if (nextOffsetPos + 4 > bytes.length) {
        return null;
    }

    const entries = [];
    for (let i = 0; i < entryCount; i++) {
        const entryOffset = entriesStart + (i * 12);
        const tag = readUInt16(bytes, entryOffset, littleEndian);
        const type = readUInt16(bytes, entryOffset + 2, littleEndian);
        const count = readUInt32(bytes, entryOffset + 4, littleEndian);
        if (tag === null || type === null || count === null) {
            return null;
        }

        const typeSize = TIFF_TYPE_SIZES.get(type);
        if (!typeSize) {
            continue;
        }
        const valueByteLength = typeSize * count;
        const valueOffsetField = readUInt32(bytes, entryOffset + 8, littleEndian);
        if (valueOffsetField === null) {
            return null;
        }

        let valueBytes = null;
        if (valueByteLength <= 4) {
            valueBytes = bytes.slice(entryOffset + 8, entryOffset + 8 + valueByteLength);
        } else {
            const valueStart = valueOffsetField;
            const valueEnd = valueStart + valueByteLength;
            if (valueStart >= 0 && valueEnd <= bytes.length) {
                valueBytes = bytes.slice(valueStart, valueEnd);
            }
        }

        if (!valueBytes) {
            continue;
        }

        entries.push({
            tag,
            type,
            count,
            valueBytes,
        });
    }

    const nextIfdOffset = readUInt32(bytes, nextOffsetPos, littleEndian);
    if (nextIfdOffset === null) {
        return null;
    }

    return {
        entries,
        nextIfdOffset,
    };
}

function readLongFromEntry(entry, littleEndian) {
    if (!entry || entry.type !== 4 || entry.count < 1 || !entry.valueBytes || entry.valueBytes.length < 4) {
        return null;
    }
    return readUInt32(entry.valueBytes, 0, littleEndian);
}

function filterEntries(entries, excludedTags) {
    return entries
        .filter((entry) => !excludedTags.has(entry.tag))
        .filter((entry) => {
            const typeSize = TIFF_TYPE_SIZES.get(entry.type);
            return typeSize && entry.count > 0 && entry.valueBytes instanceof Uint8Array;
        });
}

function cloneEntry(entry) {
    return {
        tag: entry.tag,
        type: entry.type,
        count: entry.count,
        valueBytes: entry.valueBytes.slice(),
    };
}

function pointerEntry(tag, targetIfdName) {
    return {
        tag,
        type: 4,
        count: 1,
        valueBytes: new Uint8Array(4),
        pointerTarget: targetIfdName,
    };
}

function serializeExifTiff({
    littleEndian,
    ifd0Entries,
    exifEntries,
    gpsEntries,
    interopEntries,
}) {
    const ifdLayouts = [];
    const ifdByName = new Map();

    const sortedIfd0Entries = [...ifd0Entries].sort((a, b) => a.tag - b.tag);
    ifdLayouts.push({ name: 'ifd0', entries: sortedIfd0Entries, offset: 0 });
    ifdByName.set('ifd0', ifdLayouts[0]);

    if (exifEntries.length > 0) {
        const layout = {
            name: 'exif',
            entries: [...exifEntries].sort((a, b) => a.tag - b.tag),
            offset: 0,
        };
        ifdLayouts.push(layout);
        ifdByName.set('exif', layout);
    }
    if (gpsEntries.length > 0) {
        const layout = {
            name: 'gps',
            entries: [...gpsEntries].sort((a, b) => a.tag - b.tag),
            offset: 0,
        };
        ifdLayouts.push(layout);
        ifdByName.set('gps', layout);
    }
    if (interopEntries.length > 0) {
        const layout = {
            name: 'interop',
            entries: [...interopEntries].sort((a, b) => a.tag - b.tag),
            offset: 0,
        };
        ifdLayouts.push(layout);
        ifdByName.set('interop', layout);
    }

    // Pointer entries are appended after target IFD existence is known.
    if (ifdByName.has('exif')) {
        ifdByName.get('ifd0').entries.push(pointerEntry(0x8769, 'exif'));
    }
    if (ifdByName.has('gps')) {
        ifdByName.get('ifd0').entries.push(pointerEntry(0x8825, 'gps'));
    }
    if (ifdByName.has('interop') && ifdByName.has('exif')) {
        ifdByName.get('exif').entries.push(pointerEntry(0xa005, 'interop'));
    }

    for (const layout of ifdLayouts) {
        layout.entries.sort((a, b) => a.tag - b.tag);
    }

    let nextOffset = 8; // TIFF header size
    for (const layout of ifdLayouts) {
        layout.offset = align2(nextOffset);
        const tableSize = 2 + (layout.entries.length * 12) + 4;
        nextOffset = layout.offset + tableSize;
    }
    let dataOffset = align2(nextOffset);

    const extraDataWrites = [];
    for (const layout of ifdLayouts) {
        for (const entry of layout.entries) {
            const typeSize = TIFF_TYPE_SIZES.get(entry.type);
            if (!typeSize) {
                return null;
            }
            const valueByteLength = typeSize * entry.count;
            if (entry.pointerTarget) {
                const target = ifdByName.get(entry.pointerTarget);
                if (!target) {
                    return null;
                }
                entry.valueBytes = new Uint8Array(4);
                writeUInt32(entry.valueBytes, 0, target.offset, littleEndian);
                continue;
            }

            if (!(entry.valueBytes instanceof Uint8Array) || entry.valueBytes.length < valueByteLength) {
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

    const totalLength = dataOffset;
    if (totalLength <= 8) {
        return null;
    }

    const out = new Uint8Array(totalLength);
    // TIFF header.
    if (littleEndian) {
        out[0] = 0x49;
        out[1] = 0x49;
        out[2] = 0x2a;
        out[3] = 0x00;
    } else {
        out[0] = 0x4d;
        out[1] = 0x4d;
        out[2] = 0x00;
        out[3] = 0x2a;
    }
    writeUInt32(out, 4, ifdByName.get('ifd0').offset, littleEndian);

    for (const layout of ifdLayouts) {
        const tableOffset = layout.offset;
        writeUInt16(out, tableOffset, layout.entries.length, littleEndian);
        let entryOffset = tableOffset + 2;
        for (const entry of layout.entries) {
            const typeSize = TIFF_TYPE_SIZES.get(entry.type);
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
                writeUInt32(out, entryOffset + 8, entry.dataOffset, littleEndian);
            }
            entryOffset += 12;
        }
        // next IFD offset. We only encode dedicated EXIF/GPS/Interop IFDs.
        writeUInt32(out, entryOffset, 0, littleEndian);
    }

    for (const write of extraDataWrites) {
        out.set(write.data, write.offset);
    }

    return out;
}

export function extractExifPayloadFromTiff(bytes) {
    const input = toUint8Array(bytes);
    if (!input || input.length < 8) {
        return null;
    }

    const boA = input[0];
    const boB = input[1];
    const littleEndian = boA === 0x49 && boB === 0x49;
    const bigEndian = boA === 0x4d && boB === 0x4d;
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
    if (!ifd0) {
        return null;
    }

    const ifd0Entries = filterEntries(ifd0.entries, IFD0_EXCLUDED_TAGS).map(cloneEntry);

    let exifEntries = [];
    let gpsEntries = [];
    let interopEntries = [];

    const exifPtrEntry = ifd0.entries.find((entry) => entry.tag === 0x8769);
    const exifPtr = readLongFromEntry(exifPtrEntry, littleEndian);
    if (exifPtr && exifPtr > 0 && exifPtr < input.length) {
        const exifIfd = parseTiffIfd(input, exifPtr, littleEndian);
        if (exifIfd) {
            exifEntries = filterEntries(exifIfd.entries, EXIF_EXCLUDED_TAGS).map(cloneEntry);
            const interopPtrEntry = exifIfd.entries.find((entry) => entry.tag === 0xa005);
            const interopPtr = readLongFromEntry(interopPtrEntry, littleEndian);
            if (interopPtr && interopPtr > 0 && interopPtr < input.length) {
                const interopIfd = parseTiffIfd(input, interopPtr, littleEndian);
                if (interopIfd) {
                    interopEntries = filterEntries(interopIfd.entries, EXIF_EXCLUDED_TAGS).map(cloneEntry);
                }
            }
        }
    }

    const gpsPtrEntry = ifd0.entries.find((entry) => entry.tag === 0x8825);
    const gpsPtr = readLongFromEntry(gpsPtrEntry, littleEndian);
    if (gpsPtr && gpsPtr > 0 && gpsPtr < input.length) {
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

export function extractExifApp1PayloadFromInput(bytes, fileName = '', mimeType = '') {
    const input = toUint8Array(bytes);
    if (!input || input.length === 0) {
        return null;
    }

    const mime = String(mimeType || '').toLowerCase();
    const extension = getExtension(fileName);

    try {
        if (isJpegInput(mime, extension)) {
            return extractExifPayloadFromJpeg(input);
        }
        if (isPngInput(mime, extension)) {
            return extractExifPayloadFromPng(input);
        }
        if (isWebpInput(mime, extension)) {
            return extractExifPayloadFromWebp(input);
        }
        if (isHeifInput(mime, extension)) {
            return extractExifPayloadFromHeif(input);
        }
        if (isTiffInput(mime, extension)) {
            return extractExifPayloadFromTiff(input);
        }
    } catch (error) {
        console.warn('Failed to extract EXIF from input:', error);
        return null;
    }

    return null;
}
