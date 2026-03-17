/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { initializeRuntime } from '../runtime-initialization.ts';

function createSmokeImageData(width = 128, height = 128): ImageData {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(127);
  for (let index = 3; index < pixels.length; index += 4) {
    pixels[index] = 255;
  }
  return new globalThis.ImageData(pixels, width, height);
}

function createSmokeOutputRgba(width = 128, height = 128): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const value = (x + y) % 256;
      pixels[idx] = value;
      pixels[idx + 1] = value;
      pixels[idx + 2] = value;
      pixels[idx + 3] = 255;
    }
  }
  return pixels;
}

function createChromiumRuntimeWithWebGlOnly() {
  return {
    navigator: {
      gpu: undefined,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      platform: 'MacIntel',
      hardwareConcurrency: 8,
    },
    document: {
      createElement: () => ({
        getContext: (type: string) => {
          if (type === 'webgl' || type === 'experimental-webgl') {
            return { clear: () => {} };
          }
          return null;
        },
      }),
    },
    OffscreenCanvas: undefined,
    createImageBitmap: undefined,
    crossOriginIsolated: true,
  };
}

describe('runtime initialization on Chromium', () => {
  it('skips WebGL fallback and initializes with wasm when Chromium lacks WebGPU', async () => {
    const runtime = createChromiumRuntimeWithWebGlOnly();
    const attemptOrder: string[] = [];
    const session = {
      init: vi.fn(async (_variant: string, options: { forceExecutionProviders?: string[] } = {}) => {
        const provider = options.forceExecutionProviders?.[0] ?? null;
        attemptOrder.push(provider ?? 'unknown');
        session.activeExecutionProvider = provider;
      }),
      resolveGainMapCapability: vi.fn(),
      run: vi.fn(async () => createSmokeOutputRgba()),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: null as string | null,
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
    });

    expect(attemptOrder).toEqual(['wasm']);
    expect(result.requestedExecutionProviders).toEqual(['wasm']);
    expect(result.resolvedExecutionProvider).toBe('wasm');
  });
});
