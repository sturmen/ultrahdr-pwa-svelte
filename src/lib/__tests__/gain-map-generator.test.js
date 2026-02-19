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
      return new Uint8ClampedArray(2 * 2 * 4);
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
});
