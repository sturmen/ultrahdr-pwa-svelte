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

function createRuntime(userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36') {
  return {
    fetch,
    document,
    ImageData,
    navigator: {
      userAgent,
    },
  };
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
      runtime: createRuntime(),
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
      runtime: createRuntime(),
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
      runtime: createRuntime(),
    });

    await generator.generate(createTestImageData(), { gmnetModelVariant: 'synthetic' });
    expect(run).toHaveBeenCalledWith(
      expect.any(ImageData),
      expect.objectContaining({
        gmnetModelVariant: 'synthetic',
        localInputMaxLongEdge: expect.any(Number),
      }),
    );
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
      runtime: createRuntime(),
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
      runtime: createRuntime(),
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
      runtime: createRuntime(),
    });

    const result = await generator.generate(createTestImageData(), {});
    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[0][1]).toEqual({
      gmnetModelVariant: undefined,
      localInputMaxLongEdge: expect.any(Number),
    });
    expect(run.mock.calls[1][1]).toEqual({
      gmnetModelVariant: undefined,
      localInputMaxLongEdge: expect.any(Number),
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
      runtime: createRuntime(),
    });

    await expect(generator.generate(createTestImageData(), {})).rejects.toThrow(/near-flat/i);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('does not retry with webgl on non-chromium runtimes when webgpu output is near-flat', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    let runtimeListener = null;
    const run = vi.fn(async () => {
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
      runtime: createRuntime('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:129.0) Gecko/20100101 Firefox/129.0'),
    });

    await expect(generator.generate(createTestImageData(), {})).rejects.toThrow(/near-flat/i);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('retries with webgl when webgpu inference throws a runtime error', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    let runtimeListener = null;
    const run = vi.fn(async (_imageData, options = {}) => {
      if (Array.isArray(options.forceExecutionProviders) && options.forceExecutionProviders[0] === 'webgl') {
        runtimeListener?.({ executionProvider: 'webgl' });
        return createNonFlatGainMapRgba();
      }
      runtimeListener?.({ executionProvider: 'webgpu' });
      throw new Error('webgpu pipeline compile failure');
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
      runtime: createRuntime(),
    });

    const result = await generator.generate(createTestImageData(), {});
    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[1][1]).toEqual({
      gmnetModelVariant: undefined,
      localInputMaxLongEdge: expect.any(Number),
      forceExecutionProviders: ['webgl'],
    });
  });

  it('resolves capability by probing on non-firefox runtimes and caches per provider', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const capability = {
      provider: 'webgpu',
      gainMapMaxLongEdge: 640,
      outputMaxLongEdge: 1280,
      source: 'probe',
      attempts: [{ candidateLongEdge: 640, status: 'passed' }],
    };
    const session = {
      run: vi.fn(async () => createNonFlatGainMapRgba()),
      resolveGainMapCapability: vi.fn(async () => capability),
      on: vi.fn(),
      off: vi.fn(),
    };
    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    const first = await generator.resolveCapability({ gmnetModelVariant: 'realworld' });
    const second = await generator.resolveCapability({ gmnetModelVariant: 'realworld' });

    expect(first).toEqual(capability);
    expect(second).toEqual(capability);
    expect(session.resolveGainMapCapability).toHaveBeenCalledTimes(1);
  });

  it('resolves capability by probing on firefox runtimes', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const capability = {
      provider: 'webgpu',
      gainMapMaxLongEdge: 512,
      outputMaxLongEdge: 1024,
      source: 'probe',
      attempts: [{ candidateLongEdge: 512, status: 'passed' }],
    };
    const session = {
      run: vi.fn(async () => createNonFlatGainMapRgba()),
      resolveGainMapCapability: vi.fn(async () => capability),
      on: vi.fn(),
      off: vi.fn(),
    };
    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:129.0) Gecko/20100101 Firefox/129.0'),
    });

    const resolved = await generator.resolveCapability({ gmnetModelVariant: 'realworld' });

    expect(resolved).toEqual(capability);
    expect(session.resolveGainMapCapability).toHaveBeenCalledTimes(1);
  });

  it('uses capabilityHint to skip probing when hint is valid', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    const session = {
      run: vi.fn(async () => createNonFlatGainMapRgba()),
      resolveGainMapCapability: vi.fn(async () => ({
        provider: 'webgpu',
        gainMapMaxLongEdge: 512,
        outputMaxLongEdge: 1024,
        source: 'probe',
        attempts: [],
      })),
      on: vi.fn(),
      off: vi.fn(),
    };
    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    const hint = {
      provider: 'webgpu',
      gainMapMaxLongEdge: 320,
      outputMaxLongEdge: 640,
      source: 'cache',
      attempts: [],
    };
    const resolved = await generator.resolveCapability({ capabilityHint: hint });

    expect(resolved).toEqual(hint);
    expect(session.resolveGainMapCapability).not.toHaveBeenCalled();
  });

  it('emits capability metadata in stage progress during generate()', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.js');
    let runtimeListener = null;
    const capability = {
      provider: 'webgpu',
      gainMapMaxLongEdge: 512,
      outputMaxLongEdge: 1024,
      source: 'probe',
      attempts: [{ candidateLongEdge: 512, status: 'passed' }],
    };
    const session = {
      run: vi.fn(async () => {
        runtimeListener?.({ executionProvider: 'webgpu' });
        return createNonFlatGainMapRgba();
      }),
      resolveGainMapCapability: vi.fn(async () => capability),
      on: vi.fn((event, callback) => {
        if (event === 'runtime') {
          runtimeListener = callback;
        }
      }),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };
    const onStageProgress = vi.fn();
    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    await generator.generate(createTestImageData(), { onStageProgress });

    expect(onStageProgress).toHaveBeenCalledWith(
      expect.any(Number),
      expect.stringMatching(/capability/i),
      expect.objectContaining({
        gmnetCapability: expect.objectContaining({
          provider: 'webgpu',
          gainMapMaxLongEdge: 512,
          outputMaxLongEdge: 1024,
        }),
      }),
    );
  });
});
