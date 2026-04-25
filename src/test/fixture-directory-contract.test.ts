import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const mediaDir = path.resolve(repoRoot, 'media');
const fixturesDir = path.resolve(repoRoot, 'fixtures');

const demoMediaFiles = new Set([
  'gain_map_demo_image.jpg',
  'sdr_demo_image.jpg',
]);

const movedFixtureFiles = [
  'exif_matrix.heic',
  'exif_matrix.heif',
  'exif_matrix.jpeg',
  'exif_matrix.jpg',
  'exif_matrix.png',
  'exif_matrix.tif',
  'exif_matrix.tiff',
  'exif_matrix.webp',
  'test_hdr_heif_gainmap.HEIC',
  'test_hdr_heif_spatial_gainmap.HEIC',
  'test_hdr_jpeg_gainmap.jpg',
  'test_hdr_no_gain_map.HIF',
  'test_hdr_no_gain_map_270cw.HIF',
  'test_hdr_no_gain_map_90cw.HIF',
  'test_screenshot.heic',
  'test_sdr.jpg',
  'test_sdr2.jpg',
] as const;

const ignoredDirectories = new Set([
  '.git',
  'coverage',
  'dist',
  'node_modules',
  'build',
  'third_party',
  'jpegli',
  'libultrahdr',
  'emsdk',
]);

function listVisibleFiles(directory: string): string[] {
  return fs.readdirSync(directory).filter((name) => !name.startsWith('.')).sort();
}

function collectTextFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...collectTextFiles(absolutePath));
      }
      continue;
    }

    if (/\.(png|jpe?g|heic|heif|hif|tiff?|webp|wasm)$/i.test(entry.name)) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function readTextFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

describe('fixture directory contract', () => {
  it('keeps only README demo assets in media/', () => {
    expect(listVisibleFiles(mediaDir)).toEqual([...demoMediaFiles].sort());
  });

  it('stores test fixtures in fixtures/', () => {
    expect(fs.existsSync(fixturesDir)).toBe(true);
    expect(listVisibleFiles(fixturesDir)).toEqual([...movedFixtureFiles].sort());
  });

  it('does not reference moved fixtures from media/ paths anywhere in the repo', () => {
    const repoFiles = collectTextFiles(repoRoot);
    const staleReferences: string[] = [];

    for (const filePath of repoFiles) {
      const relativePath = path.relative(repoRoot, filePath);
      const source = readTextFile(filePath);

      for (const fixtureFile of movedFixtureFiles) {
        const stalePath = `media/${fixtureFile}`;
        if (source.includes(stalePath)) {
          staleReferences.push(`${relativePath}:${stalePath}`);
        }
      }
    }

    expect(staleReferences).toEqual([]);
  });
});
