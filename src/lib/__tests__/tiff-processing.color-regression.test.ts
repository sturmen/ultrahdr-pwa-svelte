/**
 * @vitest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, '../../../fixtures/exif_matrix.tiff');

describe('tiff-processing color regression', () => {
  it('does not decode exif_matrix.tiff as green-dominant', async () => {
    const bytes = fs.readFileSync(fixturePath);
    const mockFile = new File([bytes], 'exif_matrix.tiff', { type: 'image/tiff' });

    const { processTiff } = await import('../tiff-processing.js');
    const raster = await processTiff(mockFile);

    const data = raster.data;
    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i];
      greenSum += data[i + 1];
      blueSum += data[i + 2];
      pixelCount += 1;
    }

    const redMean = redSum / pixelCount;
    const greenMean = greenSum / pixelCount;
    const blueMean = blueSum / pixelCount;

    expect(redMean).toBeGreaterThan(40);
    expect(greenMean).toBeLessThan(120);
    expect(blueMean).toBeGreaterThan(30);
  }, 15_000);
});
