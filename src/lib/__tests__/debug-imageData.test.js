/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

describe('Debug ImageData', () => {
  it('should check ImageData', () => {
    console.log('typeof ImageData:', typeof ImageData);
    console.log('global.ImageData:', global.ImageData);
    console.log('globalThis.ImageData:', globalThis.ImageData);
    expect(typeof ImageData).toBe('function');
  });
});
