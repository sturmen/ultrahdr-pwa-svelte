/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

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

  it('installs a non-canvas createImageBitmap stub', async () => {
    const bitmap = await globalThis.createImageBitmap(new Blob(['test'], { type: 'image/png' }));

    expect(bitmap).toEqual(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
        close: expect.any(Function),
      }),
    );
    expect('getContext' in bitmap).toBe(false);
  });

  it('has no direct canvas imports left in repo-owned code', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      const canvasImportPattern = ["from 'can", "vas'|from \"can", "vas\"|import\\('can", "vas'\\)"].join('');
      output = execFileSync(
        'rg',
        [
          '-n',
          canvasImportPattern,
          'src',
          'tests',
          '--glob',
          '!node_modules',
          '--glob',
          '!src/test/setup-runtime.test.ts',
        ],
        {
          cwd: repoRoot,
          encoding: 'utf8',
        },
      ).trim();
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status !== 1) {
        throw error;
      }
    }

    expect(output).toBe('');
  });
});
