import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_REQUIRED_ASSET_SPECS,
  buildRuntimeBundleManifest,
  resolveBundleVersion,
  writeRuntimeBundleManifest,
} from '../build-runtime-bundle-manifest.ts';

const tempRoots: string[] = [];

function makeTempDir(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ultrahdr-runtime-bundle-test-'));
  tempRoots.push(tempDir);
  return tempDir;
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop() as string, { recursive: true, force: true });
  }
});

describe('build-runtime-bundle-manifest', () => {
  it('creates deterministic bundle version token from version inputs', () => {
    const version = resolveBundleVersion({
      appVersion: '5.1.1',
      appAssetVersion: 'aaaaaaaaaaaaaaaa',
      wasmAssetVersion: 'bbbbbbbbbbbbbbbb',
    });

    expect(version).toBe('5.1.1|aaaaaaaaaaaaaaaa|bbbbbbbbbbbbbbbb');
  });

  it('builds required assets with sha256 and byteLength metadata', async () => {
    const root = makeTempDir();
    fs.mkdirSync(path.join(root, 'public', 'models'), { recursive: true });
    fs.mkdirSync(path.join(root, 'public', 'assets'), { recursive: true });
    fs.writeFileSync(path.join(root, 'public', 'models', 'gmnet-smoke-128.png'), Buffer.from([1, 2, 3]));
    fs.writeFileSync(path.join(root, 'public', 'assets', 'ultrahdr_wasm.wasm'), Buffer.from([4, 5, 6]));

    const manifest = await buildRuntimeBundleManifest({
      rootDirectory: root,
      requiredAssetSpecs: [
        {
          id: 'smoke',
          sourcePath: 'public/models/gmnet-smoke-128.png',
          url: 'models/gmnet-smoke-128.png',
          cacheName: 'uhdr-ai-models-test',
          kind: 'smoke',
        },
        {
          id: 'ultrahdr-wasm',
          sourcePath: 'public/assets/ultrahdr_wasm.wasm',
          url: 'assets/ultrahdr_wasm.wasm',
          cacheName: 'uhdr-wasm-assets-test',
          kind: 'wasm',
        },
      ],
      appVersion: '5.1.1',
      appAssetVersion: 'aaaaaaaaaaaaaaaa',
      wasmAssetVersion: 'bbbbbbbbbbbbbbbb',
    });

    expect(manifest.requiredAssets).toHaveLength(2);
    expect(manifest.requiredAssets[0]).toEqual(expect.objectContaining({
      id: 'smoke',
      byteLength: 3,
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
  });

  it('writes runtime-bundle-manifest.json to target output path', async () => {
    const root = makeTempDir();
    fs.mkdirSync(path.join(root, 'public', 'models'), { recursive: true });
    fs.writeFileSync(path.join(root, 'public', 'models', 'gmnet-smoke-128.png'), Buffer.from([1, 2, 3]));

    const outputPath = path.join(root, 'public', 'models', 'runtime-bundle-manifest.json');
    const manifest = await writeRuntimeBundleManifest({
      rootDirectory: root,
      outputPath,
      requiredAssetSpecs: [
        {
          id: 'smoke',
          sourcePath: 'public/models/gmnet-smoke-128.png',
          url: 'models/gmnet-smoke-128.png',
          cacheName: 'uhdr-ai-models-test',
          kind: 'smoke',
        },
      ],
      appVersion: '5.1.1',
      appAssetVersion: 'aaaaaaaaaaaaaaaa',
      wasmAssetVersion: 'bbbbbbbbbbbbbbbb',
    });

    const onDisk = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(onDisk.bundleVersion).toBe(manifest.bundleVersion);
    expect(onDisk.requiredAssets).toHaveLength(1);
  });

  it('includes the provider-specific fallback models needed for offline startup by default', () => {
    const requiredAssetIds = new Set(DEFAULT_REQUIRED_ASSET_SPECS.map((asset) => asset.id));

    expect(requiredAssetIds.has('gmnet-realworld-global-inline')).toBe(true);
    expect(requiredAssetIds.has('gmnet-realworld-local-inline-webgl')).toBe(true);
    expect(requiredAssetIds.has('gmnet-synthetic-global-inline')).toBe(true);
    expect(requiredAssetIds.has('gmnet-synthetic-local-inline-webgl')).toBe(true);
  });

  it('includes the shipped ONNX Runtime threaded wasm binaries used by startup', () => {
    const requiredAssetIds = new Set(DEFAULT_REQUIRED_ASSET_SPECS.map((asset) => asset.id));

    expect(requiredAssetIds.has('ort-wasm-simd-threaded')).toBe(true);
    expect(requiredAssetIds.has('ort-wasm-simd-threaded-jsep')).toBe(true);
    expect(requiredAssetIds.has('ort-wasm-simd-threaded-asyncify')).toBe(true);
    expect(requiredAssetIds.has('ort-wasm-simd-threaded-jspi')).toBe(true);
  });

  it('includes the shipped ONNX Runtime threaded module shims used by startup', () => {
    const requiredAssetIds = new Set(DEFAULT_REQUIRED_ASSET_SPECS.map((asset) => asset.id));

    expect(requiredAssetIds.has('ort-wasm-simd-threaded-mjs')).toBe(true);
    expect(requiredAssetIds.has('ort-wasm-simd-threaded-asyncify-mjs')).toBe(true);
    expect(requiredAssetIds.has('ort-wasm-simd-threaded-jsep-mjs')).toBe(true);
    expect(requiredAssetIds.has('ort-wasm-simd-threaded-jspi-mjs')).toBe(true);
  });

  it('includes libheif runtime assets in the dedicated cache in the default bundle spec', () => {
    const libheifWasmAsset = DEFAULT_REQUIRED_ASSET_SPECS.find((asset) => asset.id === 'libheif-wasm-bin');
    const libheifBundleAsset = DEFAULT_REQUIRED_ASSET_SPECS.find((asset) => asset.id === 'libheif-bundle-mjs');

    expect(libheifWasmAsset?.cacheName).toBe('uhdr-libheif-assets-runtime-bundle');
    expect(libheifBundleAsset?.cacheName).toBe('uhdr-libheif-assets-runtime-bundle');
  });

  it('includes both jpegli runtime assets in the default offline bundle spec', () => {
    const requiredAssetIds = new Set(DEFAULT_REQUIRED_ASSET_SPECS.map((asset) => asset.id));

    expect(requiredAssetIds.has('jpegli-wasm-js')).toBe(true);
    expect(requiredAssetIds.has('jpegli-wasm-bin')).toBe(true);
  });

  it('adds version query tokens to runtime asset URLs that are requested with cache-busting parameters', async () => {
    const root = makeTempDir();
    fs.mkdirSync(path.join(root, 'public', 'models'), { recursive: true });
    fs.mkdirSync(path.join(root, 'public', 'assets'), { recursive: true });
    fs.writeFileSync(path.join(root, 'public', 'models', 'gmnet-smoke-128.png'), Buffer.from([1, 2, 3]));
    fs.writeFileSync(path.join(root, 'public', 'assets', 'ultrahdr_wasm.js'), Buffer.from([4, 5, 6]));
    fs.writeFileSync(path.join(root, 'public', 'assets', 'libheif.wasm'), Buffer.from([7, 8, 9]));

    const manifest = await buildRuntimeBundleManifest({
      rootDirectory: root,
      requiredAssetSpecs: [
        {
          id: 'smoke',
          sourcePath: 'public/models/gmnet-smoke-128.png',
          url: 'models/gmnet-smoke-128.png',
          cacheName: 'uhdr-ai-models-test',
          kind: 'smoke',
          versionScope: 'app',
        },
        {
          id: 'ultrahdr-wasm-js',
          sourcePath: 'public/assets/ultrahdr_wasm.js',
          url: 'assets/ultrahdr_wasm.js',
          cacheName: 'uhdr-wasm-assets-test',
          kind: 'runtime-script',
          versionScope: 'wasm',
        },
        {
          id: 'libheif-wasm',
          sourcePath: 'public/assets/libheif.wasm',
          url: 'assets/libheif.wasm',
          cacheName: 'uhdr-wasm-assets-test',
          kind: 'wasm',
          versionScope: 'app',
        },
      ],
      appVersion: '5.1.1',
      appAssetVersion: 'app-version-token',
      wasmAssetVersion: 'wasm-version-token',
    });

    expect(manifest.requiredAssets.map((asset) => asset.url)).toEqual([
      'models/gmnet-smoke-128.png?v=app-version-token',
      'assets/ultrahdr_wasm.js?v=wasm-version-token',
      'assets/libheif.wasm?v=app-version-token',
    ]);
  });
});
