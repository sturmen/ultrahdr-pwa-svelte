/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

function createTestImageData(width = 4, height = 4) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 120;
    data[i + 1] = 120;
    data[i + 2] = 120;
    data[i + 3] = 255;
  }
  return new ImageData(data, width, height);
}

function createNonFlatGainMapRgba(width = 4, height = 4) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const value = ((x + y) * 20) % 255;
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }
  return data;
}

function createOffsetGainMapRgba(width = 4, height = 4, offset = 60) {
  const data = createNonFlatGainMapRgba(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const value = Math.max(0, Math.min(255, (data[i] ?? 0) + offset));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  return data;
}

function createRuntime() {
  return {
    fetch,
    ImageData,
    OffscreenCanvas: class OffscreenCanvas {},
    document,
    navigator: {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    },
  };
}

describe('GmnetGainMapGenerator (split/tile primary, probe-free)', () => {
  it('treats fetch-plus-imagedata runtimes as supported even without canvas globals', async () => {
    const { isGmnetRuntimeSupported } = await import('../gain-map-generator.ts');

    expect(
      isGmnetRuntimeSupported({
        fetch,
        ImageData,
        document: undefined,
        OffscreenCanvas: undefined,
      } as typeof globalThis),
    ).toBe(true);
  });

  it('throws when GMNet runtime is unsupported', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');
    const session = {
      run: vi.fn(),
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
    expect(session.run).not.toHaveBeenCalled();
  });

  it('throws when heuristic path is requested with useGmnet=false', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');
    const session = {
      run: vi.fn(),
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
    expect(session.run).not.toHaveBeenCalled();
  });

  it('uses prepare/runTileStep/finalize tiled APIs as the primary inference path', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const session = {
      prepareTiledInference: vi.fn(async () => ({
        tiles: [{ tileIndex: 0 }, { tileIndex: 1 }, { tileIndex: 2 }],
      })),
      runTileStep: vi
        .fn()
        .mockResolvedValueOnce({ tileIndex: 0, tileTotal: 3, gmnetTileIndex: 0, gmnetTileTotal: 3 })
        .mockResolvedValueOnce({ tileIndex: 1, tileTotal: 3, gmnetTileIndex: 1, gmnetTileTotal: 3 })
        .mockResolvedValueOnce({ tileIndex: 2, tileTotal: 3, gmnetTileIndex: 2, gmnetTileTotal: 3 }),
      finalizeTiledInference: vi.fn(() => createNonFlatGainMapRgba(4, 4)),
      run: vi.fn(async () => {
        throw new Error('run() should not be called when tiled APIs are present');
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    const result = await generator.generate(createTestImageData(4, 4), {});

    expect(session.prepareTiledInference).toHaveBeenCalledTimes(1);
    expect(session.runTileStep).toHaveBeenCalledTimes(3);
    expect(session.finalizeTiledInference).toHaveBeenCalledTimes(1);
    expect(session.run).not.toHaveBeenCalled();
    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(result.gainMapImageData.width).toBe(4);
    expect(result.gainMapImageData.height).toBe(4);
  });

  it('falls back in auto mode with provider order webgpu -> webgl -> wasm', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const session = {
      run: vi.fn(async (_imageData, options = {}) => {
        const forced = Array.isArray(options.forceExecutionProviders)
          ? options.forceExecutionProviders[0]
          : null;
        if (!forced) {
          throw new Error('webgpu failed');
        }
        if (forced === 'webgl') {
          throw new Error('webgl failed');
        }
        if (forced === 'wasm') {
          return createNonFlatGainMapRgba(4, 4);
        }
        throw new Error(`unexpected provider ${forced}`);
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    const result = await generator.generate(createTestImageData(4, 4), {});

    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(session.run).toHaveBeenCalledTimes(3);
    expect(session.run.mock.calls[0][1]?.forceExecutionProviders).toBeUndefined();
    expect(session.run.mock.calls[1][1]?.forceExecutionProviders).toEqual(['webgl']);
    expect(session.run.mock.calls[2][1]?.forceExecutionProviders).toEqual(['wasm']);
  });

  it('falls back from an explicitly forced webgl request when the webgl parity probe diverges from wasm', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const session = {
      run: vi.fn(async (_imageData, options = {}) => {
        const forced = Array.isArray(options.forceExecutionProviders)
          ? options.forceExecutionProviders[0]
          : null;
        if (forced === 'webgl') {
          return createOffsetGainMapRgba(4, 4, 90);
        }
        if (forced === 'wasm') {
          return createNonFlatGainMapRgba(4, 4);
        }
        throw new Error(`unexpected provider ${forced}`);
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    const result = await generator.generate(createTestImageData(4, 4), {
      forceExecutionProviders: ['webgl'],
    });

    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(session.run.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(session.run.mock.calls[0]?.[1]?.forceExecutionProviders).toEqual(['webgl']);
    expect(session.run.mock.calls.at(-1)?.[1]?.forceExecutionProviders).toEqual(['wasm']);
  });

  it('does not fallback when a non-webgl backend is explicitly forced', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const session = {
      run: vi.fn(async (_imageData, options = {}) => {
        const forced = Array.isArray(options.forceExecutionProviders)
          ? options.forceExecutionProviders[0]
          : null;
        if (forced === 'webgpu') {
          throw new Error('forced webgpu failed');
        }
        return createNonFlatGainMapRgba(4, 4);
      }),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    await expect(
      generator.generate(createTestImageData(4, 4), { forceExecutionProviders: ['webgpu'] }),
    ).rejects.toThrow(/forced webgpu failed/i);

    expect(session.run).toHaveBeenCalledTimes(1);
    expect(session.run.mock.calls[0][1]?.forceExecutionProviders).toEqual(['webgpu']);
  });

  it('does not require resolveGainMapCapability to run tiled inference', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const session = {
      resolveGainMapCapability: vi.fn(async () => {
        throw new Error('legacy capability probing should not run');
      }),
      prepareTiledInference: vi.fn(async () => ({
        tiles: [{ tileIndex: 0 }],
      })),
      runTileStep: vi.fn(async () => ({ tileIndex: 0, tileTotal: 1 })),
      finalizeTiledInference: vi.fn(() => createNonFlatGainMapRgba(4, 4)),
      run: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    const result = await generator.generate(createTestImageData(4, 4), {});

    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(session.resolveGainMapCapability).not.toHaveBeenCalled();
  });

  it('emits provider/tile-centric progress metadata without gmnet capability metadata', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const onStageProgress = vi.fn();
    const session = {
      prepareTiledInference: vi.fn(async () => ({
        tiles: [{ tileIndex: 0 }, { tileIndex: 1 }],
      })),
      runTileStep: vi
        .fn()
        .mockResolvedValueOnce({ tileIndex: 0, tileTotal: 2, gmnetTileIndex: 0, gmnetTileTotal: 2 })
        .mockResolvedValueOnce({ tileIndex: 1, tileTotal: 2, gmnetTileIndex: 1, gmnetTileTotal: 2 }),
      finalizeTiledInference: vi.fn(() => createNonFlatGainMapRgba(4, 4)),
      run: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    await generator.generate(createTestImageData(4, 4), { onStageProgress });

    const metadataPayloads = onStageProgress.mock.calls
      .map(([, , metadata]) => metadata)
      .filter((metadata) => metadata && typeof metadata === 'object');

    expect(metadataPayloads.length).toBeGreaterThan(0);
    expect(metadataPayloads.some((metadata) => metadata.gmnetExecutionProvider === 'webgpu')).toBe(true);
    expect(metadataPayloads.some((metadata) => Number.isFinite(metadata.gmnetTileIndex))).toBe(true);
    expect(metadataPayloads.some((metadata) => 'gmnetCapability' in metadata)).toBe(false);
    expect(metadataPayloads.some((metadata) => 'gmnetCapabilitySource' in metadata)).toBe(false);
  });

  it('uses checkpoint mode metadata and persists tile progress when gmnetCheckpointing is forced', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');

    const onStageProgress = vi.fn();
    const checkpointStore = {
      loadSnapshot: vi.fn(async () => null),
      saveSnapshot: vi.fn(async () => {}),
      clearSnapshot: vi.fn(async () => {}),
    };
    const session = {
      prepareTiledInference: vi.fn(async () => ({
        sourceWidth: 4,
        sourceHeight: 4,
        accumIngm: new Float32Array(16),
        tiles: [{ tileIndex: 0 }, { tileIndex: 1 }],
        tileCompleted: new Uint8Array(2),
        completedTileCount: 0,
      })),
      runTileStep: vi
        .fn()
        .mockResolvedValueOnce({ tileIndex: 0, tileTotal: 2, gmnetTileIndex: 0, gmnetTileTotal: 2 })
        .mockResolvedValueOnce({ tileIndex: 1, tileTotal: 2, gmnetTileIndex: 1, gmnetTileTotal: 2 }),
      finalizeTiledInference: vi.fn(() => createNonFlatGainMapRgba(4, 4)),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      checkpointStoreFactory: () => checkpointStore,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    await generator.generate(createTestImageData(4, 4), {
      gmnetCheckpointing: 'force',
      onStageProgress,
    });

    expect(checkpointStore.loadSnapshot).toHaveBeenCalledTimes(1);
    expect(checkpointStore.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(checkpointStore.clearSnapshot).toHaveBeenCalledTimes(1);

    const metadataPayloads = onStageProgress.mock.calls
      .map(([, , metadata]) => metadata)
      .filter((metadata) => metadata && typeof metadata === 'object');
    expect(metadataPayloads.some((metadata) => metadata.gmnetMemoryMode === 'checkpointed')).toBe(true);
    expect(
      metadataPayloads.some(
        (metadata) =>
          Number.isFinite(metadata.gmnetCheckpointTilesCompleted)
          && Number.isFinite(metadata.gmnetCheckpointTilesTotal),
      ),
    ).toBe(true);
  });

  it('resumes tile execution from persisted checkpoint state when available', async () => {
    const { GmnetGainMapGenerator } = await import('../gain-map-generator.ts');
    const onStageProgress = vi.fn();
    const checkpointStore = {
      loadSnapshot: vi.fn(async () => ({
        sourceWidth: 4,
        sourceHeight: 4,
        tileTotal: 3,
        completedTileCount: 1,
        tileCompleted: new Uint8Array([1, 0, 0]),
        accumIngm: new Float32Array(16).fill(0.25),
      })),
      saveSnapshot: vi.fn(async () => {}),
      clearSnapshot: vi.fn(async () => {}),
    };
    const context = {
      sourceWidth: 4,
      sourceHeight: 4,
      accumIngm: new Float32Array(16),
      tiles: [{ tileIndex: 0 }, { tileIndex: 1 }, { tileIndex: 2 }],
      tileCompleted: new Uint8Array(3),
      completedTileCount: 0,
    };
    const session = {
      prepareTiledInference: vi.fn(async () => context),
      runTileStep: vi
        .fn()
        .mockResolvedValueOnce({ tileIndex: 1, tileTotal: 3, gmnetTileIndex: 1, gmnetTileTotal: 3 })
        .mockResolvedValueOnce({ tileIndex: 2, tileTotal: 3, gmnetTileIndex: 2, gmnetTileTotal: 3 }),
      finalizeTiledInference: vi.fn(() => createNonFlatGainMapRgba(4, 4)),
      on: vi.fn(),
      off: vi.fn(),
      activeExecutionProvider: 'webgpu',
    };

    const generator = new GmnetGainMapGenerator({
      sessionFactory: () => session,
      checkpointStoreFactory: () => checkpointStore,
      buildMetadata: () => ({ hdrCapacityMax: 2.3 }),
      runtime: createRuntime(),
    });

    await generator.generate(createTestImageData(4, 4), {
      gmnetCheckpointing: 'force',
      onStageProgress,
    });

    expect(session.runTileStep).toHaveBeenCalledTimes(2);
    expect(session.runTileStep).toHaveBeenNthCalledWith(1, context, 1);
    expect(session.runTileStep).toHaveBeenNthCalledWith(2, context, 2);
    expect(onStageProgress).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(String),
      expect.objectContaining({
        gmnetCheckpointResumed: true,
      }),
    );
  });
});
