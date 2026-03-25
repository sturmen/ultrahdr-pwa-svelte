import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
import { vi } from 'vitest';
import { execFile as execFileCallback } from 'child_process';

export type PreservedHeicResult = {
  gainMap: ImageData;
  sdr: ImageData;
  name: string;
  gainMapMetadata?: unknown;
  gainMapHeadroom?: unknown;
};

const execFile = promisify(execFileCallback);

type HeicFixtureProbe = {
  kind: 'preserved' | 'discarded';
  fileType?: string;
  gainMapWidth?: number;
  gainMapHeight?: number;
  sdrWidth?: number;
  sdrHeight?: number;
  isMonochrome?: boolean;
  hasNonZeroPixels?: boolean;
  logLines: string[];
};

export function installRealFixtureConsoleSpies() {
  const originalLog = global.console.log;
  const originalError = global.console.error;
  const originalWarn = global.console.warn;

  global.console.log = vi.fn((...args: unknown[]) => process.stdout.write(args.join(' ') + '\n'));
  global.console.error = vi.fn((...args: unknown[]) => process.stderr.write(args.join(' ') + '\n'));
  global.console.warn = vi.fn((...args: unknown[]) => process.stderr.write(args.join(' ') + '\n'));

  return () => {
    global.console.log = originalLog;
    global.console.error = originalError;
    global.console.warn = originalWarn;
  };
}

export function installLibheifFetchMock() {
  const originalFetch = global.fetch;

  global.fetch = vi.fn(async (url: URL | string) => {
    if (url.toString().includes('libheif.wasm')) {
      const wasmPath = path.resolve(process.cwd(), 'node_modules/libheif-js/libheif-wasm/libheif.wasm');
      const assetsWasm = path.resolve(process.cwd(), 'assets', 'libheif.wasm');
      let buffer: Buffer;

      if (fs.existsSync(wasmPath)) {
        buffer = fs.readFileSync(wasmPath);
      } else if (fs.existsSync(assetsWasm)) {
        buffer = fs.readFileSync(assetsWasm);
      } else {
        throw new Error(`Could not find libheif.wasm at ${wasmPath} or ${assetsWasm}`);
      }

      return {
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)),
      } as Response;
    }

    if (!originalFetch) {
      throw new Error(`Unexpected fetch without original implementation: ${String(url)}`);
    }

    return originalFetch(url);
  });

  return () => {
    global.fetch = originalFetch;
  };
}

export function loadTestFile(filename: string) {
  const mediaPath = path.resolve(process.cwd(), 'media');
  const filePath = path.join(mediaPath, filename);
  const buffer = fs.readFileSync(filePath);
  const file = new File([buffer], filename, { type: 'image/heic' });

  if (!file.arrayBuffer) {
    file.arrayBuffer = async () => new Uint8Array(buffer).buffer;
  }

  return { file, buffer };
}

export function isMonochrome(imageData: ImageData, tolerance = 5) {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const step = Math.max(1, Math.floor(pixelCount / 1000));
  let maxDiff = 0;
  let colorPixelCount = 0;

  for (let i = 0; i < pixelCount; i += step) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
    maxDiff = Math.max(maxDiff, diff);
    if (diff > tolerance) {
      colorPixelCount++;
    }
  }

  const sampledCount = Math.ceil(pixelCount / step);
  const colorRatio = colorPixelCount / sampledCount;

  return {
    isMonochrome: colorRatio < 0.05,
    maxDiff,
    colorRatio,
    sampledCount,
  };
}

export async function runHeicFixtureProbe(
  filename: string,
  discardGainMap: boolean,
): Promise<HeicFixtureProbe> {
  const configPath = path.resolve(process.cwd(), 'vite.config.test.ts');
const childProgram = `
import fs from 'fs';
import path from 'path';
import { createServer, loadConfigFromFile, mergeConfig } from 'vite';

const filename = process.env.HEIC_FIXTURE_FILENAME;
const discardFlag = process.env.HEIC_DISCARD_GAIN_MAP;
const discardGainMap = discardFlag === 'true';
const logs = [];
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
const originalImageData = global.ImageData;

console.log = (...args) => {
  logs.push(args.join(' '));
  originalLog(...args);
};
console.warn = (...args) => {
  logs.push(args.join(' '));
  originalWarn(...args);
};
console.error = (...args) => {
  logs.push(args.join(' '));
  originalError(...args);
};

const loaded = await loadConfigFromFile({ command: 'serve', mode: 'test' }, ${JSON.stringify(configPath)});
const config = mergeConfig(loaded.config, {
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, entries: [] },
  define: { 'import.meta.env.VITEST': 'true' },
  server: { middlewareMode: true, hmr: false },
});
const server = await createServer(config);
const originalFetch = global.fetch;

class ImageDataShim {
  constructor(data, width, height, options = {}) {
    this.data = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
    this.width = width;
    this.height = height;
    this.colorSpace = options.colorSpace || 'srgb';
  }
}

global.ImageData = typeof originalImageData === 'function' ? originalImageData : ImageDataShim;

function isMonochrome(imageData, tolerance = 5) {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  const step = Math.max(1, Math.floor(pixelCount / 1000));
  let colorPixelCount = 0;

  for (let i = 0; i < pixelCount; i += step) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
    if (diff > tolerance) {
      colorPixelCount++;
    }
  }

  const sampledCount = Math.ceil(pixelCount / step);
  return (colorPixelCount / sampledCount) < 0.05;
}

global.fetch = async (url) => {
  if (url.toString().includes('libheif.wasm')) {
    const wasmPath = path.resolve(process.cwd(), 'node_modules/libheif-js/libheif-wasm/libheif.wasm');
    const assetsWasm = path.resolve(process.cwd(), 'assets', 'libheif.wasm');
    const buffer = fs.existsSync(wasmPath) ? fs.readFileSync(wasmPath) : fs.readFileSync(assetsWasm);
    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    };
  }
  return originalFetch(url);
};

try {
  const mod = await server.ssrLoadModule('/src/lib/heic-processing.js');
  const filePath = path.resolve(process.cwd(), 'media', filename);
  const buffer = fs.readFileSync(filePath);
  const file = new File([buffer], filename, { type: 'image/heic' });
  const result = await mod.processHeic(file, { discardGainMap });

  if (result instanceof File) {
    console.log(JSON.stringify({
      kind: 'discarded',
      fileType: result.type,
      logLines: logs,
    }));
  } else {
    const hasNonZeroPixels = Array.from(result.gainMap.data.slice(0, 100)).some((value) => value > 0);
    console.log(JSON.stringify({
      kind: 'preserved',
      gainMapWidth: result.gainMap.width,
      gainMapHeight: result.gainMap.height,
      sdrWidth: result.sdr.width,
      sdrHeight: result.sdr.height,
      isMonochrome: isMonochrome(result.gainMap),
      hasNonZeroPixels,
      logLines: logs,
    }));
  }
} finally {
  global.fetch = originalFetch;
  global.ImageData = originalImageData;
  await server.close();
}
`.trim();

  const { stdout } = await execFile(
    process.execPath,
    [
      '--max-old-space-size=8192',
      '--input-type=module',
      '-e',
      childProgram,
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        HEIC_FIXTURE_FILENAME: filename,
        HEIC_DISCARD_GAIN_MAP: discardGainMap ? 'true' : 'false',
      },
      maxBuffer: 8 * 1024 * 1024,
    },
  );

  const lines = stdout.trim().split('\n').map((line) => line.trim()).filter(Boolean);
  const summaryLine = lines[lines.length - 1];
  return JSON.parse(summaryLine) as HeicFixtureProbe;
}
