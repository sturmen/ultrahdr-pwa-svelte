import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ensureNoJekyllFile,
} from '../prepare-gh-pages.js';

const tempRoots = [];

function makeTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ultrahdr-gh-pages-test-'));
  tempRoots.push(tempDir);
  return tempDir;
}

afterEach(() => {
  while (tempRoots.length) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('prepare-gh-pages', () => {
  it('creates a .nojekyll file in the dist directory', () => {
    const rootDir = makeTempDir();
    const distDir = path.join(rootDir, 'dist');
    fs.mkdirSync(distDir, { recursive: true });

    const noJekyllPath = ensureNoJekyllFile({ rootDirectory: rootDir });

    expect(noJekyllPath).toBe(path.join(distDir, '.nojekyll'));
    expect(fs.existsSync(noJekyllPath)).toBe(true);
    expect(fs.readFileSync(noJekyllPath, 'utf8')).toContain('Disable Jekyll');
  });

  it('is idempotent when the .nojekyll file already exists', () => {
    const rootDir = makeTempDir();
    const distDir = path.join(rootDir, 'dist');
    fs.mkdirSync(distDir, { recursive: true });
    const noJekyllPath = path.join(distDir, '.nojekyll');
    fs.writeFileSync(noJekyllPath, 'existing\n', 'utf8');

    const resultPath = ensureNoJekyllFile({ rootDirectory: rootDir });

    expect(resultPath).toBe(noJekyllPath);
    expect(fs.readFileSync(noJekyllPath, 'utf8')).toBe('existing\n');
  });

  it('throws when dist directory does not exist', () => {
    const rootDir = makeTempDir();

    expect(() => ensureNoJekyllFile({ rootDirectory: rootDir })).toThrow(/dist directory/i);
  });
});
