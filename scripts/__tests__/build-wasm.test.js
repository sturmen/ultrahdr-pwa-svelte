import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  computeWasmAssetVersion,
  computeWasmAssetVersionFromFiles,
  isStrictBuildMode,
  resolveBuildFailureStrategy,
  writeWasmVersionMetadata,
} from '../build-wasm.js';

const tempRoots = [];

function makeTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ultrahdr-wasm-test-'));
  tempRoots.push(tempDir);
  return tempDir;
}

afterEach(() => {
  while (tempRoots.length) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('build-wasm strict mode', () => {
  it('enables strict mode in CI/production contexts', () => {
    expect(isStrictBuildMode({ CI: 'true' })).toBe(true);
    expect(isStrictBuildMode({ NODE_ENV: 'production' })).toBe(true);
    expect(isStrictBuildMode({ WASM_BUILD_STRICT: '1' })).toBe(true);
    expect(isStrictBuildMode({})).toBe(false);
  });

  it('rejects fallback strategy in strict mode and allows fallback in dev with assets', () => {
    expect(resolveBuildFailureStrategy({ strictMode: true, hasAssets: true })).toBe('throw');
    expect(resolveBuildFailureStrategy({ strictMode: false, hasAssets: false })).toBe('throw');
    expect(resolveBuildFailureStrategy({ strictMode: false, hasAssets: true })).toBe('fallback');
  });
});

describe('build-wasm version metadata', () => {
  it('computes deterministic hash token from wrapper artifacts', () => {
    const tempDir = makeTempDir();
    const jsPath = path.join(tempDir, 'ultrahdr_wasm.js');
    const wasmPath = path.join(tempDir, 'ultrahdr_wasm.wasm');
    fs.writeFileSync(jsPath, 'console.log("wrapper");\n', 'utf8');
    fs.writeFileSync(wasmPath, Buffer.from([0x00, 0x61, 0x73, 0x6d]));

    const tokenA = computeWasmAssetVersionFromFiles([wasmPath, jsPath]);
    const tokenB = computeWasmAssetVersion(tempDir);

    expect(tokenA).toMatch(/^[a-f0-9]{16}$/);
    expect(tokenB).toBe(tokenA);
  });

  it('writes .wasm-version metadata with computed asset hash', () => {
    const tempDir = makeTempDir();
    const metadataPath = path.join(tempDir, '.wasm-version.json');
    fs.writeFileSync(path.join(tempDir, 'ultrahdr_wasm.js'), 'console.log("a");\n', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'ultrahdr_wasm.wasm'), Buffer.from([1, 2, 3, 4]));

    const metadata = writeWasmVersionMetadata(tempDir, metadataPath);
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    expect(metadata.wasmAssetVersion).toMatch(/^[a-f0-9]{16}$/);
    expect(parsed.wasmAssetVersion).toBe(metadata.wasmAssetVersion);
    expect(parsed.files).toEqual(['ultrahdr_wasm.js', 'ultrahdr_wasm.wasm']);
    expect(typeof parsed.generatedAt).toBe('string');
  });
});
