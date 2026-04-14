const fs = require('fs');
const { extractExifPayloadFromJpeg, extractExifOrientation } = require('./src/lib/exif-utils.js');
const bytes = new Uint8Array(fs.readFileSync('fixtures/hasselblad.JPG'));
const payload = extractExifPayloadFromJpeg(bytes);
console.log('Orientation:', extractExifOrientation(payload))
