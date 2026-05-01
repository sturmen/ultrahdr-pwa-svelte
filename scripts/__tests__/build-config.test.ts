import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('build warning regressions', () => {
  it('uses browser-safe HEIF adapter imports in production modules', () => {
    const heicProcessing = readFileSync(resolve('src/lib/heic-processing.ts'), 'utf8');
    const heifHdrProcessing = readFileSync(resolve('src/lib/heif-hdr-processing.ts'), 'utf8');
    const libheifBrowser = readFileSync(resolve('src/lib/libheif-browser.ts'), 'utf8');
    const viteConfigSource = readFileSync(resolve('vite.config.ts'), 'utf8');

    expect(heicProcessing).toContain("import libheifFactory from './libheif-browser.js'");
    expect(heifHdrProcessing).toContain("import libheifFactory from './libheif-browser.js'");
    expect(heicProcessing).not.toContain("libheif-js/libheif-wasm/libheif.js");
    expect(heifHdrProcessing).not.toContain("libheif-js/libheif-wasm/libheif.js");
    expect(libheifBrowser).not.toContain("import libheifBundleModule from 'libheif-js/wasm-bundle.js'");
    expect(existsSync(resolve('src/lib/libheif-browser.js'))).toBe(false);
    expect(viteConfigSource).toContain('libheif-bundle.mjs');
  });

  it('prefers external-wasm onnxruntime resolution and copies threaded ORT runtime modules', () => {
    const viteConfigSource = readFileSync(resolve('vite.config.ts'), 'utf8');
    const gmnetSessionSource = readFileSync(resolve('src/lib/gmnet-session.ts'), 'utf8');
    const imageProcessorSource = readFileSync(resolve('src/lib/ImageProcessor.svelte'), 'utf8');

    expect(viteConfigSource).toContain("'onnxruntime-web-use-extern-wasm'");
    expect(viteConfigSource).toContain('manualChunks');
    expect(gmnetSessionSource).not.toContain("import('onnxruntime-web/all')");
    expect(gmnetSessionSource).not.toContain("import('onnxruntime-web/webgl')");
    expect(viteConfigSource).toContain('ort.webgl.min.mjs');
    expect(viteConfigSource).toContain('ort-wasm-simd-threaded*.mjs');
    expect(imageProcessorSource).not.toContain('import { classifyInputProcessingPath } from "./processing-core.js";');
  });

  it('defines a focused strict typecheck for the migrated HDR pipeline modules', () => {
    const packageJsonSource = readFileSync(resolve('package.json'), 'utf8');
    const typecheckConfigSource = readFileSync(resolve('tsconfig.pipeline.json'), 'utf8');

    expect(packageJsonSource).toContain('"typecheck"');
    expect(packageJsonSource).toContain('tsconfig.pipeline.json');
    expect(packageJsonSource).toContain('svelte-check');
    expect(typecheckConfigSource).toContain('"strict": true');
    expect(typecheckConfigSource).toContain('"allowImportingTsExtensions": true');
    expect(typecheckConfigSource).toContain('src/lib/heic-processing.ts');
    expect(typecheckConfigSource).toContain('src/lib/heif-hdr-processing.ts');
    expect(typecheckConfigSource).toContain('src/lib/processing-core.ts');
    expect(typecheckConfigSource).toContain('src/lib/processing-path.ts');
    expect(typecheckConfigSource).toContain('src/lib/processing-types.ts');
  });

  it('authors the ultrahdr wasm bindings in TypeScript instead of JavaScript', () => {
    expect(existsSync(resolve('src/lib/ultrahdr-wasm.ts'))).toBe(true);
    expect(existsSync(resolve('src/lib/ultrahdr-wasm.js'))).toBe(false);
  });
});
