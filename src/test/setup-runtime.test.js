/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

describe('test runtime setup', () => {
  it('installs a constructible ImageData on globalThis', () => {
    const imageData = new globalThis.ImageData(new Uint8ClampedArray(4), 1, 1);

    expect(typeof globalThis.ImageData).toBe('function');
    expect(imageData.width).toBe(1);
    expect(imageData.height).toBe(1);
    expect(imageData.data).toBeInstanceOf(Uint8ClampedArray);
  });

  it('installs usable default storage objects', () => {
    globalThis.localStorage.setItem('alpha', '1');
    globalThis.sessionStorage.setItem('beta', '2');

    expect(globalThis.localStorage.getItem('alpha')).toBe('1');
    expect(globalThis.sessionStorage.getItem('beta')).toBe('2');
  });
});
