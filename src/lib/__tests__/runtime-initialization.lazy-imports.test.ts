/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const lazyRuntimeMocks = vi.hoisted(() => ({
  jimpModuleLoads: vi.fn(),
  pngModuleLoads: vi.fn(),
  smokeRasterSurfaceCleanup: vi.fn(async () => undefined),
  smokeRasterSurfaceReadResized: vi.fn(async () => createSmokeImageData()),
}));

vi.mock('jimp', () => {
  lazyRuntimeMocks.jimpModuleLoads();
  throw new Error('Jimp should not load during runtime initialization.');
});

vi.mock('fast-png', () => {
  lazyRuntimeMocks.pngModuleLoads();
  throw new Error('fast-png should not load during runtime initialization.');
});

vi.mock('../image-utils.js', () => ({
  loadImageData: vi.fn(async () => ({
    imageData: createSmokeImageData(),
    width: 128,
    height: 128,
    rasterSurface: {
      width: 128,
      height: 128,
      readResized: lazyRuntimeMocks.smokeRasterSurfaceReadResized,
      cleanup: lazyRuntimeMocks.smokeRasterSurfaceCleanup,
    },
  })),
}));

function createSmokeImageData(width = 128, height = 128): ImageData {
  const pixels = new Uint8ClampedArray(width * height * 4).fill(127);
  for (let index = 3; index < pixels.length; index += 4) {
    pixels[index] = 255;
  }
  return new ImageData(pixels, width, height);
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

describe('runtime initialization lazy imports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    lazyRuntimeMocks.smokeRasterSurfaceCleanup.mockClear();
    lazyRuntimeMocks.smokeRasterSurfaceReadResized.mockClear();
  });

  it('initializes with a provided smoke image loader without importing raster decode dependencies', async () => {
    const { initializeRuntime } = await import('../runtime-initialization.ts');

    const session = {
      init: vi.fn(async (_variant: string, options: { forceExecutionProviders?: string[] } = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      run: vi.fn(async () => createSmokeOutputRgba()),
      resolveGainMapCapability: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const result = await initializeRuntime({
      runtime: {
        navigator: {
          gpu: {
            requestAdapter: vi.fn(async () => ({ name: 'mock-adapter' })),
          },
          userAgent: 'UnitTestAgent/1.0',
          platform: 'UnitTestOS',
          hardwareConcurrency: 8,
        },
        fetch: vi.fn(),
        crossOriginIsolated: true,
      },
      sessionFactory: () => session,
      loadSmokeImageData: vi.fn(async () => createSmokeImageData()),
    });

    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(lazyRuntimeMocks.jimpModuleLoads).not.toHaveBeenCalled();
    expect(lazyRuntimeMocks.pngModuleLoads).not.toHaveBeenCalled();
  });

  it('cleans up decoded smoke raster surfaces after default smoke image loading', async () => {
    const { initializeRuntime } = await import('../runtime-initialization.ts');

    const session = {
      init: vi.fn(async (_variant: string, options: { forceExecutionProviders?: string[] } = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      run: vi.fn(async () => createSmokeOutputRgba()),
      resolveGainMapCapability: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const runtime = {
      navigator: {
        gpu: {
          requestAdapter: vi.fn(async () => ({ name: 'mock-adapter' })),
        },
        userAgent: 'UnitTestAgent/1.0',
        platform: 'UnitTestOS',
        hardwareConcurrency: 8,
      },
      fetch: vi.fn(async () => ({
        ok: true,
        blob: async () => new Blob(['smoke'], { type: 'image/png' }),
      })),
      crossOriginIsolated: true,
    };

    const result = await initializeRuntime({
      runtime,
      sessionFactory: () => session,
    });

    expect(result.resolvedExecutionProvider).toBe('webgpu');
    expect(lazyRuntimeMocks.smokeRasterSurfaceCleanup).toHaveBeenCalledTimes(1);
  });

  it('reads the default smoke image through raster-surface resizing', async () => {
    const { initializeRuntime } = await import('../runtime-initialization.ts');

    const session = {
      init: vi.fn(async (_variant: string, options: { forceExecutionProviders?: string[] } = {}) => {
        session.activeExecutionProvider = options.forceExecutionProviders?.[0] || 'webgpu';
      }),
      run: vi.fn(async () => createSmokeOutputRgba()),
      resolveGainMapCapability: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const runtime = {
      navigator: {
        gpu: {
          requestAdapter: vi.fn(async () => ({ name: 'mock-adapter' })),
        },
        userAgent: 'UnitTestAgent/1.0',
        platform: 'UnitTestOS',
        hardwareConcurrency: 8,
      },
      fetch: vi.fn(async () => ({
        ok: true,
        blob: async () => new Blob(['smoke'], { type: 'image/png' }),
      })),
      crossOriginIsolated: true,
    };

    await initializeRuntime({
      runtime,
      sessionFactory: () => session,
    });

    expect(lazyRuntimeMocks.smokeRasterSurfaceReadResized).toHaveBeenCalledWith(128, 128);
  });
});
