/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

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

  it('does not install a default createImageBitmap shim', () => {
    expect('createImageBitmap' in globalThis).toBe(false);
    expect(globalThis.createImageBitmap).toBeUndefined();
  });

  it('has no direct legacy graphics imports left in repo-owned code', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      const legacyGraphicsImportPattern = ["from 'can", "vas'|from \"can", "vas\"|import\\('can", "vas'\\)"].join('');
      output = execFileSync(
        'rg',
        [
          '-n',
          legacyGraphicsImportPattern,
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

  it('does not keep obsolete worker-era graphics references in the next cleanup cluster', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      output = execFileSync(
        'rg',
        [
          '-n',
          '\\b(OffscreenCanvas|createImageBitmap)\\b',
          'src/lib/__tests__/processing-capability-cache.test.ts',
          'src/lib/__tests__/processing-offline-bundle-policy.test.ts',
          'src/lib/__tests__/processing-runtime-api.test.ts',
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

  it('does not keep obsolete graphics-era references in the worker and gain-map test cluster', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      output = execFileSync(
        'rg',
        [
          '-n',
          '\\b(OffscreenCanvas|createImageBitmap)\\b',
          'src/lib/__tests__/processing-worker.test.ts',
          'src/lib/__tests__/processing-gainmap-decision.test.ts',
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

  it('does not keep obsolete preservation/runtime graphics-era references in the next cleanup cluster', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      output = execFileSync(
        'rg',
        [
          '-n',
          '\\b(OffscreenCanvas|createImageBitmap)\\b|createElement\\(|getContext\\(|drawImage\\(|putImageData\\(|getImageData\\(|toBlob\\(',
          'src/lib/__tests__/processing-preservation.test.ts',
          'src/lib/__tests__/runtime-initialization.test.ts',
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

  it('does not keep obsolete runtime-property references in the next cleanup cluster', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      output = execFileSync(
        'rg',
        [
          '-n',
          '\\b(OffscreenCanvas|createImageBitmap)\\b|getContext\\(',
          'src/lib/__tests__/processing-runtime-init-timeout.test.ts',
          'src/lib/__tests__/processing-resolution-pipeline.test.ts',
          'src/lib/__tests__/processing-lazy-imports.test.ts',
          'src/lib/__tests__/processing-metadata-forwarding.test.ts',
          'src/lib/__tests__/gain-map-generator.test.ts',
          'src/lib/__tests__/runtime-initialization.chromium.test.ts',
          'src/lib/__tests__/gmnet-session.chromium.test.ts',
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

  it('does not keep obsolete legacy-graphics wording in the final cleanup cluster', () => {
    const repoRoot = path.resolve(process.cwd());
    let output = '';
    try {
      output = execFileSync(
        'rg',
        [
          '-n',
          '\\bcanvas\\b|\\bCanvas\\b',
          'src/test/setup.ts',
          'src/test/setup-runtime.test.ts',
          'src/lib/__tests__/ImageProcessor.lifecycle.test.ts',
          'src/lib/__tests__/gmnet-session.test.ts',
          'src/lib/__tests__/image-utils.test.ts',
          'src/lib/__tests__/jpegli-decoder.decode.test.ts',
          'src/lib/__tests__/raster-image.test.ts',
          'src/lib/__tests__/runtime-browser.test.ts',
          'src/lib/__tests__/gain-map-generator.test.ts',
          'tests/e2e/ultrahdr.spec.ts',
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

  it('does not keep ts re-export shim files once a direct ts source exists', () => {
    const repoRoot = path.resolve(process.cwd());
    const shimPaths = [
      'src/lib/__tests__/fixtures/createRuntimeFixture.js',
      'src/lib/capabilities.js',
      'src/lib/gain-map-generator.js',
      'src/lib/heic-processing.js',
      'src/lib/heif-hdr-processing.js',
      'src/lib/image-utils.js',
      'src/lib/jpegli-decoder.js',
      'src/lib/jpegtran-rotate.js',
      'src/lib/processing-core.js',
      'src/lib/processing-path.js',
      'src/lib/processing.js',
      'src/lib/runtime-capability-policy.js',
      'src/lib/tiff-processing.js',
    ];

    const existingShimPaths = shimPaths.filter((shimPath) => fs.existsSync(path.join(repoRoot, shimPath)));

    expect(existingShimPaths).toEqual([]);
  });

  it('does not keep the legacy js share-store module once the ts implementation exists', () => {
    const repoRoot = path.resolve(process.cwd());
    const legacyShareStorePath = path.join(repoRoot, 'src/lib/share-store.js');

    expect(fs.existsSync(legacyShareStorePath)).toBe(false);
  });
});
