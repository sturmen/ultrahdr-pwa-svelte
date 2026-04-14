/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Gain Map Extraction (Real Files) - UltraHDR JPEG', () => {
  it('identifies the UltraHDR JPEG fixture as containing MPF metadata', () => {
    const filePath = path.resolve(process.cwd(), 'fixtures', 'test_hdr_jpeg_gainmap.jpg');
    const buffer = fs.readFileSync(filePath);
    const marker = Buffer.from('MPF');

    expect(buffer.includes(marker)).toBe(true);
  });
});
