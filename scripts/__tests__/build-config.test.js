import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('build warning regressions', () => {
  it('uses browser-safe HEIF adapter imports in production modules', () => {
    const heicProcessing = readFileSync(resolve('src/lib/heic-processing.js'), 'utf8');
    const heifHdrProcessing = readFileSync(resolve('src/lib/heif-hdr-processing.js'), 'utf8');
    const libheifBrowser = readFileSync(resolve('src/lib/libheif-browser.js'), 'utf8');
    const viteConfigSource = readFileSync(resolve('vite.config.js'), 'utf8');

    expect(heicProcessing).toContain("import libheifFactory from './libheif-browser.js'");
    expect(heifHdrProcessing).toContain("import libheifFactory from './libheif-browser.js'");
    expect(heicProcessing).not.toContain("libheif-js/libheif-wasm/libheif.js");
    expect(heifHdrProcessing).not.toContain("libheif-js/libheif-wasm/libheif.js");
    expect(libheifBrowser).not.toContain("import libheifBundleModule from 'libheif-js/wasm-bundle.js'");
    expect(viteConfigSource).toContain('libheif-bundle.mjs');
  });

  it('prefers external-wasm onnxruntime resolution and manual chunking', () => {
    const viteConfigSource = readFileSync(resolve('vite.config.js'), 'utf8');
    const gmnetSessionSource = readFileSync(resolve('src/lib/gmnet-session.js'), 'utf8');
    const imageProcessorSource = readFileSync(resolve('src/lib/ImageProcessor.svelte'), 'utf8');

    expect(viteConfigSource).toContain("'onnxruntime-web-use-extern-wasm'");
    expect(viteConfigSource).toContain('manualChunks');
    expect(gmnetSessionSource).not.toContain("import('onnxruntime-web/all')");
    expect(gmnetSessionSource).not.toContain("import('onnxruntime-web/webgl')");
    expect(viteConfigSource).toContain('ort.webgl.min.mjs');
    expect(imageProcessorSource).not.toContain('import { classifyInputProcessingPath } from "./processing-core.js";');
  });
});
