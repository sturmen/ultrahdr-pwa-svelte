import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  APP_VERSION_INPUTS,
  computeAppAssetVersion,
  isStrictBuildMode,
  writeAppVersionMetadata,
} from '../build-app-version.ts';

const tempRoots: string[] = [];

function makeTempDir(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ultrahdr-app-version-test-'));
  tempRoots.push(tempDir);
  return tempDir;
}

function writeFixtureRoot(rootDir: string): void {
  fs.mkdirSync(path.join(rootDir, 'src', 'lib'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'public', 'assets'), { recursive: true });

  fs.writeFileSync(path.join(rootDir, 'src', 'App.svelte'), '<h1>App</h1>\n', 'utf8');
  fs.writeFileSync(path.join(rootDir, 'src', 'lib', 'x.js'), 'export const x = 1;\n', 'utf8');
  fs.writeFileSync(path.join(rootDir, 'public', 'assets', 'logo.svg'), '<svg></svg>\n', 'utf8');
  fs.writeFileSync(path.join(rootDir, 'index.html'), '<!doctype html>\n', 'utf8');
  fs.writeFileSync(path.join(rootDir, 'vite.config.ts'), 'export default {};\n', 'utf8');
  fs.writeFileSync(
    path.join(rootDir, '.wasm-version.json'),
    JSON.stringify({ wasmAssetVersion: 'aaaaaaaaaaaaaaaa' }),
    'utf8',
  );
}

afterEach(() => {
  while (tempRoots.length) {
    fs.rmSync(tempRoots.pop() as string, { recursive: true, force: true });
  }
});

describe('build-app-version strict mode', () => {
  it('enables strict mode in CI/production contexts', () => {
    expect(isStrictBuildMode({ CI: 'true' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isStrictBuildMode({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isStrictBuildMode({ WASM_BUILD_STRICT: '1' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isStrictBuildMode({} as NodeJS.ProcessEnv)).toBe(false);
  });
});

describe('build-app-version metadata', () => {
  it('computes deterministic hash token from app inputs', () => {
    const rootDir = makeTempDir();
    writeFixtureRoot(rootDir);

    const tokenA = computeAppAssetVersion({ rootDirectory: rootDir, strictMode: true });
    const tokenB = computeAppAssetVersion({ rootDirectory: rootDir, strictMode: true });

    expect(tokenA).toMatch(/^[a-f0-9]{16}$/);
    expect(tokenA).toBe(tokenB);
  });

  it('changes hash when tracked input bytes change', () => {
    const rootDir = makeTempDir();
    writeFixtureRoot(rootDir);

    const before = computeAppAssetVersion({ rootDirectory: rootDir, strictMode: true });
    fs.writeFileSync(path.join(rootDir, 'src', 'lib', 'x.js'), 'export const x = 2;\n', 'utf8');
    const after = computeAppAssetVersion({ rootDirectory: rootDir, strictMode: true });

    expect(after).not.toBe(before);
  });

  it('writes .app-version.json with expected schema', () => {
    const rootDir = makeTempDir();
    writeFixtureRoot(rootDir);
    const metadataPath = path.join(rootDir, '.app-version.json');

    const metadata = writeAppVersionMetadata({
      rootDirectory: rootDir,
      metadataPath,
      strictMode: true,
    });
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as {
      appAssetVersion: string;
      inputs: string[];
      generatedAt: string;
    };

    expect(metadata.appAssetVersion).toMatch(/^[a-f0-9]{16}$/);
    expect(parsed.appAssetVersion).toBe(metadata.appAssetVersion);
    expect(parsed.inputs).toEqual(APP_VERSION_INPUTS);
    expect(typeof parsed.generatedAt).toBe('string');
  });
});
