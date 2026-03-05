import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildRuntimeBundleManifest,
  resolveBundleVersion,
  writeRuntimeBundleManifest,
} from '../build-runtime-bundle-manifest.js';

const tempRoots = [];

function makeTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ultrahdr-runtime-bundle-test-'));
  tempRoots.push(tempDir);
  return tempDir;
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
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
});
