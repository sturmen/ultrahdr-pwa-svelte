/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('onnxruntime-web/webgpu', () => ({
  env: {},
  InferenceSession: { create: vi.fn() },
}));
vi.mock('onnxruntime-web/wasm', () => ({
  env: {},
  InferenceSession: { create: vi.fn() },
}));

function createMemoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key) ?? null : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(String(key), String(value));
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(String(key));
    }),
    clear: vi.fn(() => {
      data.clear();
    }),
  };
}

function createRuntime() {
  return {
    localStorage: createMemoryStorage(),
    navigator: { userAgent: 'UnitTestAgent/1.0' },
  } as unknown as typeof globalThis;
}

describe('resolveTileConfiguration low-tier clamp', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('clamps tileInputSize to 384 on memoryTier=low when no explicit override', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.ts');
    const session = new GMNetInferenceSession({ runtime: createRuntime() });
    const cfg = session.resolveTileConfiguration('wasm', 4032, 3024, {
      localInputMaxLongEdge: 1024,
      memoryTier: 'low',
    });
    expect(cfg.tileInputSize).toBe(384);
  });

  it('does not clamp on memoryTier=high', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.ts');
    const session = new GMNetInferenceSession({ runtime: createRuntime() });
    const cfg = session.resolveTileConfiguration('wasm', 4032, 3024, {
      localInputMaxLongEdge: 1024,
      memoryTier: 'high',
    });
    expect(cfg.tileInputSize).toBe(1024);
  });

  it('honors explicit gmnetTileInputSize even on low tier', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.ts');
    const session = new GMNetInferenceSession({ runtime: createRuntime() });
    const cfg = session.resolveTileConfiguration('wasm', 4032, 3024, {
      gmnetTileInputSize: 256,
      memoryTier: 'low',
    });
    expect(cfg.tileInputSize).toBe(256);
  });
});

describe('releaseTiledSourceImageIfComplete', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('releases sourceImageData once completedTileCount reaches tile total and emits breadcrumb', async () => {
    const runtime = createRuntime();
    const { releaseTiledSourceImageIfComplete } = await import('../gmnet-tile-memory.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const sourceImageData = { data: new Uint8ClampedArray(16 * 16 * 4), width: 16, height: 16 } as ImageData;
    const context = {
      sourceImageData,
      tiles: [{}, {}, {}],
      completedTileCount: 3,
    } as const as unknown as import('../gmnet-session.ts').GmnetTiledContext;

    const released = releaseTiledSourceImageIfComplete(context, runtime);

    expect(released).toBe(true);
    expect(context.sourceImageData).toBeNull();

    const events = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime);
    const releasedEvent = events.find(
      (e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.gmnetSourceImageReleased,
    );
    expect(releasedEvent).toMatchObject({
      category: 'memory',
      severity: 'info',
      context: {
        trigger: 'last-tile-step',
        sourceBytes: 16 * 16 * 4,
        tileTotal: 3,
      },
    });
  });

  it('does nothing when not all tiles are complete', async () => {
    const runtime = createRuntime();
    const { releaseTiledSourceImageIfComplete } = await import('../gmnet-tile-memory.ts');
    const sourceImageData = { data: new Uint8ClampedArray(16 * 16 * 4), width: 16, height: 16 } as ImageData;
    const context = {
      sourceImageData,
      tiles: [{}, {}, {}],
      completedTileCount: 2,
    } as const as unknown as import('../gmnet-session.ts').GmnetTiledContext;

    const released = releaseTiledSourceImageIfComplete(context, runtime);
    expect(released).toBe(false);
    expect(context.sourceImageData).toBe(sourceImageData);
  });

  it('is idempotent when sourceImageData is already null', async () => {
    const runtime = createRuntime();
    const { releaseTiledSourceImageIfComplete } = await import('../gmnet-tile-memory.ts');
    const context = {
      sourceImageData: null,
      tiles: [{}],
      completedTileCount: 1,
    } as const as unknown as import('../gmnet-session.ts').GmnetTiledContext;

    expect(() => releaseTiledSourceImageIfComplete(context, runtime)).not.toThrow();
    expect(releaseTiledSourceImageIfComplete(context, runtime)).toBe(false);
  });
});

describe('accumulator reuse in tiled finalize', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('prepareTiledInference allocates weightAccumIngm alongside accumIngm of the same length', async () => {
    const { createTiledInferenceBuffers } = await import('../gmnet-tile-memory.ts');
    const pixelCount = 100 * 50;
    const buffers = createTiledInferenceBuffers(pixelCount);
    expect(buffers.accumIngm).toBeInstanceOf(Float32Array);
    expect(buffers.weightAccumIngm).toBeInstanceOf(Float32Array);
    expect(buffers.accumIngm.length).toBe(pixelCount);
    expect(buffers.weightAccumIngm.length).toBe(pixelCount);
  });
});
