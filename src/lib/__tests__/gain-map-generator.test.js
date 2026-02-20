/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

function createTestImageData() {
  return new ImageData(
    new Uint8ClampedArray([
      120, 120, 120, 255,
      140, 140, 140, 255,
      160, 160, 160, 255,
      180, 180, 180, 255,
    ]),
    2,
    2,
  );
}

function createNonFlatGainMapRgba(width = 2, height = 2) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const value = (x + y) % 256;
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }
  return data;
}

function createFlatGainMapRgba(width = 2, height = 2, value = 0) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }
  return data;
}

describe('GmnetGainMapGenerator', () => {
  it('throws when GMNet runtime is unsupported', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const run = vi.fn(async () => new Uint8ClampedArray(2 * 2 * 4));
    const session = {
      run,
      on: vi.fn(),
      off: vi.fn(),
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch: undefined,
        document: undefined,
        OffscreenCanvas: undefined,
      },
    });

    await expect(generator.generate(createTestImageData(), {})).rejects.toThrow(
      /GMNet runtime is not supported/i,
    );
    expect(run).not.toHaveBeenCalled();
  });

  it('throws when heuristic path is requested with useGmnet=false', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const run = vi.fn(async () => new Uint8ClampedArray(2 * 2 * 4));
    const session = {
      run,
      on: vi.fn(),
      off: vi.fn(),
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    await expect(
      generator.generate(createTestImageData(), { useGmnet: false }),
    ).rejects.toThrow(/GMNet is required/i);
    expect(run).not.toHaveBeenCalled();
  });

  it('throws when AI generation fails instead of falling back', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const run = vi.fn(async () => {
      throw new Error('gmnet init failed');
    });
    const session = {
      run,
      on: vi.fn(),
      off: vi.fn(),
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    await expect(generator.generate(createTestImageData(), {})).rejects.toThrow(
      /gmnet init failed/i,
    );
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('forwards gmnetModelVariant to the ONNX session run call', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const run = vi.fn(async () => createNonFlatGainMapRgba());
    const session = {
      run,
      on: vi.fn(),
      off: vi.fn(),
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    await generator.generate(createTestImageData(), { gmnetModelVariant: 'synthetic' });
    expect(run).toHaveBeenCalledWith(expect.any(ImageData), {
      gmnetModelVariant: 'synthetic',
    });
  });

  it('emits inference start note and execution provider telemetry', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    let runtimeListener = null;
    const run = vi.fn(async () => {
      runtimeListener?.({
        executionProvider: 'webgpu',
        requestedExecutionProviders: ['webgpu', 'wasm'],
      });
      return createNonFlatGainMapRgba();
    });
    const session = {
      run,
      on: vi.fn((event, callback) => {
        if (event === 'runtime') {
          runtimeListener = callback;
        }
      }),
      off: vi.fn(),
    };
    const onStageProgress = vi.fn();

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    await generator.generate(createTestImageData(), { onStageProgress });

    expect(onStageProgress).toHaveBeenCalledWith(
      0,
      expect.stringMatching(/starting inference/i),
      expect.objectContaining({
        gmnetExecutionProvider: null,
      }),
    );
    expect(onStageProgress).toHaveBeenCalledWith(
      expect.any(Number),
      expect.stringMatching(/webgpu/i),
      expect.objectContaining({
        gmnetExecutionProvider: 'webgpu',
      }),
    );
  });

  it('throws when GMNet output is near-flat', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const run = vi.fn(async () => new Uint8ClampedArray(2 * 2 * 4));
    const session = {
      run,
      on: vi.fn(),
      off: vi.fn(),
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    await expect(generator.generate(createTestImageData(), {})).rejects.toThrow(
      /near-flat/i,
    );
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('retries once with webgl when webgpu output is near-flat', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    let runtimeListener = null;
    const run = vi.fn(async (_imageData, options = {}) => {
      if (Array.isArray(options.forceExecutionProviders) && options.forceExecutionProviders[0] === 'webgl') {
        runtimeListener?.({ executionProvider: 'webgl' });
        return createNonFlatGainMapRgba();
      }
      runtimeListener?.({ executionProvider: 'webgpu' });
      return createFlatGainMapRgba();
    });
    const session = {
      run,
      on: vi.fn((event, callback) => {
        if (event === 'runtime') {
          runtimeListener = callback;
        }
      }),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    const result = await generator.generate(createTestImageData(), {});
    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[0][1]).toEqual({ gmnetModelVariant: undefined });
    expect(run.mock.calls[1][1]).toEqual({
      gmnetModelVariant: undefined,
      forceExecutionProviders: ['webgl'],
    });
  });

  it('fails when webgpu and webgl outputs are both near-flat', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    let runtimeListener = null;
    const run = vi.fn(async (_imageData, options = {}) => {
      if (Array.isArray(options.forceExecutionProviders) && options.forceExecutionProviders[0] === 'webgl') {
        runtimeListener?.({ executionProvider: 'webgl' });
      } else {
        runtimeListener?.({ executionProvider: 'webgpu' });
      }
      return createFlatGainMapRgba();
    });
    const session = {
      run,
      on: vi.fn((event, callback) => {
        if (event === 'runtime') {
          runtimeListener = callback;
        }
      }),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: {
        fetch,
        document,
        ImageData,
      },
    });

    await expect(generator.generate(createTestImageData(), {})).rejects.toThrow(/near-flat/i);
    expect(run).toHaveBeenCalledTimes(2);
  });
});
