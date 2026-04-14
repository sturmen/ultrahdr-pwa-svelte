import fs from 'fs';
import { stripExifSegments } from './src/lib/exif-utils.js';

const bytes = new Uint8Array(fs.readFileSync('fixtures/hasselblad.JPG'));

function scan(arr, name) {
    let offset = 2;
    console.log(`Scanning ${name}:`);
    while (offset + 4 <= arr.length) {
        if (arr[offset] !== 0xff) { offset++; continue; }
        const marker = arr[offset + 1];
        if (marker === 0xda) break;
        if (marker >= 0xd0 && marker <= 0xd7) { offset += 2; continue; }
        if (marker === 0x01) { offset += 2; continue; }

        const len = (arr[offset + 2] << 8) | arr[offset + 3];
        if (marker >= 0xe0 && marker <= 0xef) {
            let sig = '';
            for (let i = 0; i < 6; i++) {
                const c = arr[offset + 4 + i];
                if (c >= 32 && c <= 126) sig += String.fromCharCode(c);
                else sig += '\\x' + c.toString(16).padStart(2, '0');
            }
            console.log(`  APP${marker - 0xe0} len=${len} sig=${sig}`);
        }
        offset += len + 2;
    }
}

scan(bytes, 'Original');
scan(stripExifSegments(bytes), 'Stripped');
