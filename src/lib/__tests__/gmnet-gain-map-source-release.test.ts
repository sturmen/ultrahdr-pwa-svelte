/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

function createImageLike(byteLength: number) {
  return {
    data: new Uint8ClampedArray(byteLength),
    width: 100,
    height: 100,
  } as { data: Uint8ClampedArray | Uint8Array; width: number; height: number };
}

describe('releaseGmnetGainMapSource', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('zeros the backing data buffer so the GMNet RGBA allocation becomes GC-eligible', async () => {
    const { releaseGmnetGainMapSource } = await import('../gmnet-gain-map-source-release.ts');
    const image = createImageLike(1024 * 1024);
    releaseGmnetGainMapSource(image, createRuntime(), 'post-encode-gain-map');
    expect(image.data.byteLength).toBe(0);
  });

  it('emits gmnet-gain-map-source-released breadcrumb with the original byte length', async () => {
    const runtime = createRuntime();
    const { releaseGmnetGainMapSource } = await import('../gmnet-gain-map-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const image = createImageLike(48_771_072);
    releaseGmnetGainMapSource(image, runtime, 'post-encode-gain-map');

    const events = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime);
    const released = events.find(
      (e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.gmnetGainMapSourceReleased,
    );
    expect(released).toMatchObject({
      category: 'memory',
      severity: 'info',
      context: {
        trigger: 'post-encode-gain-map',
        sourceBytes: 48_771_072,
      },
    });
  });

  it('is idempotent — second call does not re-emit a breadcrumb', async () => {
    const runtime = createRuntime();
    const { releaseGmnetGainMapSource } = await import('../gmnet-gain-map-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const image = createImageLike(1024);
    releaseGmnetGainMapSource(image, runtime, 'post-encode-gain-map');
    releaseGmnetGainMapSource(image, runtime, 'post-encode-gain-map');

    const releasedEvents = diagnosticsEvents
      .getRecordedDiagnosticsEvents(runtime)
      .filter((e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.gmnetGainMapSourceReleased);
    expect(releasedEvents).toHaveLength(1);
  });
});
