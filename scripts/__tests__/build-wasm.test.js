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
    const jpegliJsPath = path.join(tempDir, 'jpegli_wasm.js');
    const jpegliWasmPath = path.join(tempDir, 'jpegli_wasm.wasm');
    const jpegtranJsPath = path.join(tempDir, 'jpegtran_wasm.js');
    const jpegtranWasmPath = path.join(tempDir, 'jpegtran_wasm.wasm');

    fs.writeFileSync(jsPath, 'console.log("wrapper");\n', 'utf8');
    fs.writeFileSync(wasmPath, Buffer.from([0x00, 0x61, 0x73, 0x6d]));
    fs.writeFileSync(jpegliJsPath, 'console.log("jpegli");\n', 'utf8');
    fs.writeFileSync(jpegliWasmPath, Buffer.from([0x00, 0x61, 0x73, 0x6d]));
    fs.writeFileSync(jpegtranJsPath, 'console.log("jpegtran");\n', 'utf8');
    fs.writeFileSync(jpegtranWasmPath, Buffer.from([0x00, 0x61, 0x73, 0x6d]));

    const tokenA = computeWasmAssetVersionFromFiles([
      wasmPath,
      jsPath,
      jpegliJsPath,
      jpegliWasmPath,
      jpegtranJsPath,
      jpegtranWasmPath,
    ]);
    const tokenB = computeWasmAssetVersion(tempDir);

    expect(tokenA).toMatch(/^[a-f0-9]{16}$/);
    expect(tokenB).toBe(tokenA);
  });

  it('writes .wasm-version metadata with computed asset hash', () => {
    const tempDir = makeTempDir();
    const metadataPath = path.join(tempDir, '.wasm-version.json');
    fs.writeFileSync(path.join(tempDir, 'ultrahdr_wasm.js'), 'console.log("a");\n', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'ultrahdr_wasm.wasm'), Buffer.from([1, 2, 3, 4]));
    fs.writeFileSync(path.join(tempDir, 'jpegli_wasm.js'), 'console.log("b");\n', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'jpegli_wasm.wasm'), Buffer.from([5, 6, 7, 8]));
    fs.writeFileSync(path.join(tempDir, 'jpegtran_wasm.js'), 'console.log("c");\n', 'utf8');
    fs.writeFileSync(path.join(tempDir, 'jpegtran_wasm.wasm'), Buffer.from([9, 10, 11, 12]));

    const metadata = writeWasmVersionMetadata(tempDir, metadataPath);
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    expect(metadata.wasmAssetVersion).toMatch(/^[a-f0-9]{16}$/);
    expect(parsed.wasmAssetVersion).toBe(metadata.wasmAssetVersion);
    expect(parsed.files).toEqual([
      'ultrahdr_wasm.js',
      'ultrahdr_wasm.wasm',
      'jpegli_wasm.js',
      'jpegli_wasm.wasm',
      'jpegtran_wasm.js',
      'jpegtran_wasm.wasm',
    ]);
    expect(typeof parsed.generatedAt).toBe('string');
  });
});

describe('ultrahdr wasm dimension guard', () => {
  it('enforces UHDR_MAX_DIMENSION=16384 in CMake configuration', () => {
    const cmakePath = path.resolve(process.cwd(), 'ultrahdr-wasm/CMakeLists.txt');
    const cmakeContent = fs.readFileSync(cmakePath, 'utf8');
    expect(cmakeContent).toMatch(
      /set\(UHDR_MAX_DIMENSION\s+16384\s+CACHE\s+STRING\s+"Maximum image dimension"\s+FORCE\)/,
    );
  });

  it('includes jpegtran wasm assets in the service worker cache matcher', () => {
    const swPath = path.resolve(process.cwd(), 'src/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent).toMatch(/jpegtran_wasm/);
    expect(swContent).toMatch(/isUltraHdrWasmAssetUrl/);
  });

  it('supports runtime bundle prepare/validate/repair message commands in the service worker', () => {
    const swPath = path.resolve(process.cwd(), 'src/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent).toMatch(/UHDR_PREPARE_BUNDLE/);
    expect(swContent).toMatch(/UHDR_VALIDATE_BUNDLE/);
    expect(swContent).toMatch(/UHDR_REPAIR_BUNDLE/);
    expect(swContent).toMatch(/UHDR_GET_APP_ASSET_VERSION/);
    expect(swContent).toContain("addEventListener('message'");
  });

  it('documents lossless jpegtran wasm rotation behavior in README', () => {
    const readmePath = path.resolve(process.cwd(), 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    expect(readmeContent).toMatch(/Lossless JPEG Rotation \(jpegtran WASM\)/);
    expect(readmeContent).toMatch(/rotateJpeg\(inputBytes, transform, options\?\)/);
  });

  it('documents the end-to-end processing pipelines in a Mermaid diagram in README', () => {
    const readmePath = path.resolve(process.cwd(), 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    expect(readmeContent).toMatch(/## Processing Pipelines/);
    expect(readmeContent).toMatch(/```mermaid/);
    expect(readmeContent).toMatch(/flowchart LR/);
    expect(readmeContent).toMatch(/subgraph\s+.*Input Classification Stage/);
    expect(readmeContent).toMatch(/subgraph\s+.*Image Decode Stage/);
    expect(readmeContent).toMatch(/subgraph\s+.*Rotation Normalization Stage/);
    expect(readmeContent).toMatch(/subgraph\s+.*Gain Map Decision Stage/);
    expect(readmeContent).toMatch(/subgraph\s+.*Final Encode Stage/);
    expect(readmeContent).not.toMatch(/S1\["Input Classification"\]/);
    expect(readmeContent).not.toMatch(/S2\["Image Decode"\]/);
    expect(readmeContent).not.toMatch(/S3\["Rotation Normalization"\]/);
    expect(readmeContent).not.toMatch(/S4\["Gain Map Decision"\]/);
    expect(readmeContent).not.toMatch(/S5\["Final Encode"\]/);
    expect(readmeContent).toMatch(/Standard JPEG without gain map/);
    expect(readmeContent).toMatch(/UltraHDR JPEG with embedded gain map/);
    expect(readmeContent).toMatch(/HEIC\/HEIF with native gain map/);
    expect(readmeContent).toMatch(/HIF HDR-intent input/);
    expect(readmeContent).toMatch(/discardGainMap=false/);
    expect(readmeContent).toMatch(/discardGainMap=true/);
    expect(readmeContent).toMatch(/preserve-with-rotation/);
    expect(readmeContent).toMatch(/GMNet generation path/);
    expect(readmeContent).toMatch(/HDR-intent HEIF API-0 encode path/);
    expect(readmeContent).toMatch(/O_ROT\{"rotation != 0\?"\}/);
    expect(readmeContent).toMatch(/O_EXIF\{"EXIF auto-rotation present\?"\}/);
    expect(readmeContent).toMatch(/O_DISCARD\{"discardGainMap=false\?"\}/);
    expect(readmeContent).toMatch(/O_PRESERVE_ZERO\{"rotation=0 and no auto-rotation\/resize\?"\}/);
    expect(readmeContent).toMatch(/O_PRESERVE_LOSSLESS\{"Lossless preserved-component rotation eligible\?"\}/);
    expect(readmeContent).toMatch(/O_HEIC_ZERO\{"rotation=0\?"\}/);
    expect(readmeContent).toMatch(/O_RESIZE\{"Resize\/constrain needed\?"\}/);
  });

  it('pins CMake policy minimum when configuring jpegtran wasm build', () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/build-jpegtran-wasm.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    expect(scriptContent).toMatch(/CMAKE_POLICY_VERSION_MINIMUM=3\.5/);
  });

  it('retries jpegtran wasm build after clearing emscripten cache on failure', () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/build-jpegtran-wasm.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    expect(scriptContent).toMatch(/emcc --clear-cache/);
    expect(scriptContent).toMatch(/Retrying jpegtran WASM build/);
    expect(scriptContent).toMatch(/retryPrefix/);
    expect(scriptContent).toMatch(/emcmake cmake/);
  });

  it('configures jpegtran wasm to avoid try_compile executable linking under emscripten', () => {
    const cmakePath = path.resolve(process.cwd(), 'jpegtran-wasm/CMakeLists.txt');
    const cmakeContent = fs.readFileSync(cmakePath, 'utf8');
    expect(cmakeContent).toMatch(/CMAKE_TRY_COMPILE_TARGET_TYPE\s+STATIC_LIBRARY/);
    expect(cmakeContent).toMatch(/EMSCRIPTEN_CACHE_PATH/);
  });

  it('passes UHDR_BUILD_DEPS=1 to emcmake configure to avoid host JPEG dependency failures', () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/build-wasm.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    expect(scriptContent).toMatch(/-DUHDR_BUILD_DEPS=1/);
  });
});
