/**
 * @vitest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, '../../../media/exif_matrix.tiff');

let capturedImageData = null;

vi.mock('../canvas-runtime.js', () => ({
  createCanvasWithContext: vi.fn(() => ({
    canvas: { width: 0, height: 0 },
    ctx: {
      putImageData: vi.fn((imageData) => {
        capturedImageData = imageData;
      }),
    },
  })),
  canvasToBlob: vi.fn(async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })),
}));

describe('tiff-processing color regression', () => {
  it('does not decode exif_matrix.tiff as green-dominant', async () => {
    capturedImageData = null;

    const bytes = fs.readFileSync(fixturePath);
    const mockFile = new File([bytes], 'exif_matrix.tiff', { type: 'image/tiff' });

    const { processTiff } = await import('../tiff-processing.js');
    await processTiff(mockFile);

    expect(capturedImageData).toBeTruthy();

    const data = capturedImageData.data;
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
  });
});
