/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import { canvasToBlob } from '../image-utils.js';

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
});
