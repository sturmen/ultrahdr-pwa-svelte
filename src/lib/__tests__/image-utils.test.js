/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { canvasToBlob, imageDataToJpegBlob } from '../image-utils.js';

describe('canvasToBlob', () => {
  it('prefers convertToBlob over toBlob when both are available', async () => {
    const expectedBlob = { type: 'image/jpeg', bytes: 123 };
    const convertToBlob = vi.fn().mockResolvedValue(expectedBlob);
    const toBlob = vi.fn((callback) => callback({ type: 'legacy' }));
    const canvas = {
      convertToBlob,
      toBlob,
    };

    const result = await canvasToBlob(canvas, 'image/jpeg', 0.9);

    expect(result).toBe(expectedBlob);
    expect(convertToBlob).toHaveBeenCalledTimes(1);
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/jpeg', quality: 0.9 });
    expect(toBlob).not.toHaveBeenCalled();
  });

  it('falls back to toBlob when convertToBlob is unavailable', async () => {
    const expectedBlob = { type: 'image/jpeg', bytes: 321 };
    const toBlob = vi.fn((callback) => callback(expectedBlob));
    const canvas = {
      toBlob,
    };

    const result = await canvasToBlob(canvas, 'image/jpeg', 0.7);

    expect(result).toBe(expectedBlob);
    expect(toBlob).toHaveBeenCalledTimes(1);
  });

  it('forwards color-space export options to convertToBlob', async () => {
    const expectedBlob = { type: 'image/jpeg', bytes: 456 };
    const convertToBlob = vi.fn().mockResolvedValue(expectedBlob);
    const canvas = {
      convertToBlob,
    };

    const result = await canvasToBlob(canvas, 'image/jpeg', 0.9, { colorSpace: 'display-p3' });

    expect(result).toBe(expectedBlob);
    expect(convertToBlob).toHaveBeenCalledWith({
      type: 'image/jpeg',
      quality: 0.9,
      colorSpace: 'display-p3',
    });
  });
});

describe('imageDataToJpegBlob', () => {
  afterEach(() => {
    delete global.document;
  });

  it('uses display-p3 canvas/export settings when the input image data is tagged display-p3', async () => {
    const putImageData = vi.fn();
    const convertToBlob = vi.fn().mockResolvedValue({ type: 'image/jpeg', bytes: 789 });
    const getContext = vi.fn(() => ({
      putImageData,
    }));

    global.document = {
      createElement: vi.fn(() => ({
        width: 0,
        height: 0,
        getContext,
        convertToBlob,
      })),
    };

    const imageData = {
      width: 2,
      height: 1,
      colorSpace: 'display-p3',
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]),
    };

    await imageDataToJpegBlob(imageData, 0.8);

    expect(getContext).toHaveBeenCalledWith('2d', {
      willReadFrequently: true,
      colorSpace: 'display-p3',
    });
    expect(putImageData).toHaveBeenCalledWith(imageData, 0, 0);
    expect(convertToBlob).toHaveBeenCalledWith({
      type: 'image/jpeg',
      quality: 0.8,
      colorSpace: 'display-p3',
    });
  });
});
