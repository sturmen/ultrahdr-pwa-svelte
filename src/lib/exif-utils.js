export function extractExifPayloadFromJpeg(jpegBytes) {
    if (!(jpegBytes instanceof Uint8Array) || jpegBytes.length < 4) {
        return null;
    }

    if (jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
        return null;
    }

    let offset = 2;
    while (offset + 4 <= jpegBytes.length) {
        if (jpegBytes[offset] !== 0xff) {
            offset++;
            continue;
        }

        const marker = jpegBytes[offset + 1];
        if (marker === 0xda || marker === 0xd9) {
            break;
        }

        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            offset += 2;
            continue;
        }

        const segmentLength = (jpegBytes[offset + 2] << 8) | jpegBytes[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > jpegBytes.length) {
            break;
        }

        const segmentEnd = offset + 2 + segmentLength;
        const isExifApp1 =
            marker === 0xe1 &&
            offset + 10 <= jpegBytes.length &&
            jpegBytes[offset + 4] === 0x45 &&
            jpegBytes[offset + 5] === 0x78 &&
            jpegBytes[offset + 6] === 0x69 &&
            jpegBytes[offset + 7] === 0x66 &&
            jpegBytes[offset + 8] === 0x00 &&
            jpegBytes[offset + 9] === 0x00;

        if (isExifApp1) {
            return jpegBytes.slice(offset + 4, segmentEnd);
        }

        offset = segmentEnd;
    }

    return null;
}

export function stripExifSegments(jpegBytes) {
    if (!(jpegBytes instanceof Uint8Array) || jpegBytes.length < 4) {
        return jpegBytes;
    }

    if (jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
        return jpegBytes;
    }

    const outputChunks = [jpegBytes.slice(0, 2)]; // SOI
    let offset = 2;

    while (offset + 4 <= jpegBytes.length) {
        if (jpegBytes[offset] !== 0xff) {
            // Preserve trailing bytes as-is if parsing loses marker alignment.
            outputChunks.push(jpegBytes.slice(offset));
            break;
        }

        const marker = jpegBytes[offset + 1];

        // SOS and EOI terminate metadata segment parsing.
        if (marker === 0xda || marker === 0xd9) {
            outputChunks.push(jpegBytes.slice(offset));
            break;
        }

        // Restart markers/TEM do not have segment length.
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            outputChunks.push(jpegBytes.slice(offset, offset + 2));
            offset += 2;
            continue;
        }

        const segmentLength = (jpegBytes[offset + 2] << 8) | jpegBytes[offset + 3];
        if (segmentLength < 2 || offset + 2 + segmentLength > jpegBytes.length) {
            outputChunks.push(jpegBytes.slice(offset));
            break;
        }

        const segmentEnd = offset + 2 + segmentLength;
        const isExifApp1 =
            marker === 0xe1 &&
            offset + 10 <= jpegBytes.length &&
            jpegBytes[offset + 4] === 0x45 && // E
            jpegBytes[offset + 5] === 0x78 && // x
            jpegBytes[offset + 6] === 0x69 && // i
            jpegBytes[offset + 7] === 0x66 && // f
            jpegBytes[offset + 8] === 0x00 &&
            jpegBytes[offset + 9] === 0x00;

        if (!isExifApp1) {
            outputChunks.push(jpegBytes.slice(offset, segmentEnd));
        }

        offset = segmentEnd;
    }

    const totalLength = outputChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Uint8Array(totalLength);
    let cursor = 0;
    for (const chunk of outputChunks) {
        merged.set(chunk, cursor);
        cursor += chunk.length;
    }
    return merged;
}

export function insertExifSegment(jpegBytes, exifPayload) {
    if (!(exifPayload instanceof Uint8Array) || exifPayload.length === 0) {
        return jpegBytes;
    }

    const segmentLength = exifPayload.length + 2;
    if (segmentLength > 0xffff) {
        console.warn('Skipping EXIF insertion: payload exceeds JPEG APP1 segment size limit');
        return jpegBytes;
    }

    const base = stripExifSegments(jpegBytes);
    if (!(base instanceof Uint8Array) || base.length < 2 || base[0] !== 0xff || base[1] !== 0xd8) {
        return jpegBytes;
    }

    const rest = base.subarray(2);
    const output = new Uint8Array(2 + 4 + exifPayload.length + rest.length);
    output[0] = 0xff;
    output[1] = 0xd8;
    output[2] = 0xff;
    output[3] = 0xe1;
    output[4] = (segmentLength >> 8) & 0xff;
    output[5] = segmentLength & 0xff;
    output.set(exifPayload, 6);
    output.set(rest, 6 + exifPayload.length);
    return output;
}

export function normalizeExifOrientationTo1(exifPayload) {
    if (!(exifPayload instanceof Uint8Array) || exifPayload.length < 14) {
        return exifPayload;
    }

    if (
        exifPayload[0] !== 0x45 ||
        exifPayload[1] !== 0x78 ||
        exifPayload[2] !== 0x69 ||
        exifPayload[3] !== 0x66 ||
        exifPayload[4] !== 0x00 ||
        exifPayload[5] !== 0x00
    ) {
        return exifPayload;
    }

    const tiffOffset = 6;
    const byteOrderA = exifPayload[tiffOffset];
    const byteOrderB = exifPayload[tiffOffset + 1];
    const littleEndian = byteOrderA === 0x49 && byteOrderB === 0x49;
    const bigEndian = byteOrderA === 0x4d && byteOrderB === 0x4d;
    if (!littleEndian && !bigEndian) {
        return exifPayload;
    }

    const tiffMarker = readExifUint16(exifPayload, tiffOffset + 2, littleEndian);
    if (tiffMarker !== 0x002a) {
        return exifPayload;
    }

    const ifd0RelativeOffset = readExifUint32(exifPayload, tiffOffset + 4, littleEndian);
    if (ifd0RelativeOffset === null) {
        return exifPayload;
    }

    const ifd0Offset = tiffOffset + ifd0RelativeOffset;
    const entryCount = readExifUint16(exifPayload, ifd0Offset, littleEndian);
    if (entryCount === null) {
        return exifPayload;
    }

    for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifd0Offset + 2 + (i * 12);
        const tag = readExifUint16(exifPayload, entryOffset, littleEndian);
        if (tag !== 0x0112) {
            continue;
        }

        const type = readExifUint16(exifPayload, entryOffset + 2, littleEndian);
        const count = readExifUint32(exifPayload, entryOffset + 4, littleEndian);
        if (type !== 3 || count === null || count < 1) {
            return exifPayload;
        }

        const valueOffset = entryOffset + 8;
        const currentOrientation = readExifUint16(exifPayload, valueOffset, littleEndian);
        if (currentOrientation === null || currentOrientation === 1) {
            return exifPayload;
        }

        const patched = exifPayload.slice();
        writeExifUint16(patched, valueOffset, 1, littleEndian);
        return patched;
    }

    return exifPayload;
}

export function extractExifOrientation(exifPayload) {
    if (!(exifPayload instanceof Uint8Array) || exifPayload.length < 14) {
        return 1;
    }

    if (
        exifPayload[0] !== 0x45 ||
        exifPayload[1] !== 0x78 ||
        exifPayload[2] !== 0x69 ||
        exifPayload[3] !== 0x66 ||
        exifPayload[4] !== 0x00 ||
        exifPayload[5] !== 0x00
    ) {
        return 1;
    }

    const tiffOffset = 6;
    const byteOrderA = exifPayload[tiffOffset];
    const byteOrderB = exifPayload[tiffOffset + 1];
    const littleEndian = byteOrderA === 0x49 && byteOrderB === 0x49;
    const bigEndian = byteOrderA === 0x4d && byteOrderB === 0x4d;
    if (!littleEndian && !bigEndian) {
        return 1;
    }

    const tiffMarker = readExifUint16(exifPayload, tiffOffset + 2, littleEndian);
    if (tiffMarker !== 0x002a) {
        return 1;
    }

    const ifd0RelativeOffset = readExifUint32(exifPayload, tiffOffset + 4, littleEndian);
    if (ifd0RelativeOffset === null) {
        return 1;
    }

    const ifd0Offset = tiffOffset + ifd0RelativeOffset;
    const entryCount = readExifUint16(exifPayload, ifd0Offset, littleEndian);
    if (entryCount === null) {
        return 1;
    }

    for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifd0Offset + 2 + (i * 12);
        const tag = readExifUint16(exifPayload, entryOffset, littleEndian);
        if (tag !== 0x0112) { // Orientation tag
            continue;
        }

        const type = readExifUint16(exifPayload, entryOffset + 2, littleEndian);
        const count = readExifUint32(exifPayload, entryOffset + 4, littleEndian);
        if (type !== 3 || count === null || count < 1) {
            return 1;
        }

        const valueOffset = entryOffset + 8;
        return readExifUint16(exifPayload, valueOffset, littleEndian) || 1;
    }

    return 1;
}

function readExifUint16(buffer, offset, littleEndian) {
    if (offset < 0 || offset + 2 > buffer.length) {
        return null;
    }
    if (littleEndian) {
        return buffer[offset] | (buffer[offset + 1] << 8);
    }
    return (buffer[offset] << 8) | buffer[offset + 1];
}

function readExifUint32(buffer, offset, littleEndian) {
    if (offset < 0 || offset + 4 > buffer.length) {
        return null;
    }
    if (littleEndian) {
        return (
            buffer[offset] |
            (buffer[offset + 1] << 8) |
            (buffer[offset + 2] << 16) |
            (buffer[offset + 3] << 24)
        ) >>> 0;
    }
    return (
        (buffer[offset] << 24) |
        (buffer[offset + 1] << 16) |
        (buffer[offset + 2] << 8) |
        buffer[offset + 3]
    ) >>> 0;
}

function writeExifUint16(buffer, offset, value, littleEndian) {
    if (offset < 0 || offset + 2 > buffer.length) {
        return;
    }
    if (littleEndian) {
        buffer[offset] = value & 0xff;
        buffer[offset + 1] = (value >> 8) & 0xff;
        return;
    }
    buffer[offset] = (value >> 8) & 0xff;
    buffer[offset + 1] = value & 0xff;
}
