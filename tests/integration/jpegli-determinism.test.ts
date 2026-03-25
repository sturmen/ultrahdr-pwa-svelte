import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  __resetJpegliWasmModuleForTests,
  decodeJpegli,
  encodeJpegli,
  encodeJpegliLegacyForTests,
} from '../../src/lib/jpegli-decoder.js';

const PROJECT_ROOT = process.cwd();
const ASSET_DIR = path.resolve(PROJECT_ROOT, 'public', 'assets');
const FIXTURE_PATH = path.resolve(PROJECT_ROOT, 'media', 'test_sdr2.jpg');
const QUALITY = 93;
const require = createRequire(import.meta.url);

function loadWasmFactoryFromAsset() {
  const scriptPath = path.resolve(ASSET_DIR, 'jpegli_wasm.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const evaluateFactory = new Function(
    'require',
    '__dirname',
    '__filename',
    `${source}\n` +
      'return (typeof createJpegliWasm === "function" ? createJpegliWasm : ' +
      '(typeof globalThis !== "undefined" ? globalThis.createJpegliWasm : null));',
  );
  const factory = evaluateFactory(require, ASSET_DIR, scriptPath);
  if (typeof factory !== 'function') {
    throw new Error('Failed to evaluate createJpegliWasm factory from public/assets/jpegli_wasm.js');
  }
  return factory;
}

async function loadFixtureImageData() {
  const fixtureBytes = fs.readFileSync(FIXTURE_PATH);
  return decodeJpegli(new Uint8Array(fixtureBytes));
}

describe('jpegli determinism integration', () => {
  beforeAll(() => {
    const factory = loadWasmFactoryFromAsset();
    const createJpegliWasm = (moduleOptions = {}) => factory({
      ...moduleOptions,
      locateFile: (fileName) => path.resolve(ASSET_DIR, fileName),
    });

    globalThis.window = globalThis.window || {};
    globalThis.window.createJpegliWasm = createJpegliWasm;
    globalThis.createJpegliWasm = createJpegliWasm;
  });

  beforeEach(() => {
    __resetJpegliWasmModuleForTests();
  });

  it('matches legacy bytestream for media/test_sdr2.jpg with true chunk progress', async () => {
    const imageData = await loadFixtureImageData();
    const progressEvents = [];

    const legacy = await encodeJpegliLegacyForTests(imageData, QUALITY);
    const chunked = await encodeJpegli(imageData, QUALITY, {
      chunkRows: 64,
      onProgress: (progress) => progressEvents.push(Number(progress)),
    });

    expect(progressEvents.length).toBeGreaterThan(2);
    expect(progressEvents[0]).toBe(0);
    expect(progressEvents[progressEvents.length - 1]).toBe(100);
    expect(Buffer.compare(Buffer.from(chunked), Buffer.from(legacy))).toBe(0);
  }, 180000);

  it('is deterministic across repeated chunked runs for media/test_sdr2.jpg', async () => {
    const imageData = await loadFixtureImageData();

    const first = await encodeJpegli(imageData, QUALITY, { chunkRows: 64 });
    const second = await encodeJpegli(imageData, QUALITY, { chunkRows: 64 });

    expect(Buffer.compare(Buffer.from(first), Buffer.from(second))).toBe(0);
  }, 180000);
});
