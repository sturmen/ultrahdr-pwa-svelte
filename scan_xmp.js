import fs from 'fs';
const bytes = new Uint8Array(fs.readFileSync('fixtures/hasselblad.JPG'));
let offset = 2;
while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    const marker = bytes[offset + 1];
    if (marker === 0xda) break;
    const len = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (marker === 0xe1) {
        let sig = '';
        for (let i = 0; i < 6; i++) {
            const c = bytes[offset + 4 + i];
            sig += String.fromCharCode(c);
        }
        if (sig.startsWith('http')) {
            let xmp = '';
            for (let i = 0; i < len; i++) {
                xmp += String.fromCharCode(bytes[offset + 2 + i]);
            }
            console.log(xmp);
        }
    }
    offset += len + 2;
}
