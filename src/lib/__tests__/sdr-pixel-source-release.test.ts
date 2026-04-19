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

describe('releaseSdrPixelSource', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('zeros the backing data buffer so the large RGBA allocation becomes GC-eligible', async () => {
    const { releaseSdrPixelSource } = await import('../sdr-pixel-source-release.ts');
    const image = createImageLike(1024 * 1024);
    expect(image.data.byteLength).toBe(1024 * 1024);

    releaseSdrPixelSource(image, createRuntime(), 'post-encode-sdr-to-jpeg');

    expect(image.data.byteLength).toBe(0);
  });

  it('emits sdr-pixel-source-released breadcrumb with original byte length', async () => {
    const runtime = createRuntime();
    const { releaseSdrPixelSource } = await import('../sdr-pixel-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const image = createImageLike(48_771_072);
    releaseSdrPixelSource(image, runtime, 'post-encode-sdr-to-jpeg');

    const events = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime);
    const released = events.find(
      (e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.sdrPixelSourceReleased,
    );
    expect(released).toMatchObject({
      category: 'memory',
      severity: 'info',
      context: {
        trigger: 'post-encode-sdr-to-jpeg',
        sourceBytes: 48_771_072,
      },
    });
  });

  it('is safe to call twice without re-emitting a breadcrumb', async () => {
    const runtime = createRuntime();
    const { releaseSdrPixelSource } = await import('../sdr-pixel-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const image = createImageLike(1024);
    releaseSdrPixelSource(image, runtime, 'post-encode-sdr-to-jpeg');
    expect(() => releaseSdrPixelSource(image, runtime, 'post-encode-sdr-to-jpeg')).not.toThrow();
    expect(image.data.byteLength).toBe(0);

    const releasedEvents = diagnosticsEvents
      .getRecordedDiagnosticsEvents(runtime)
      .filter((e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.sdrPixelSourceReleased);
    expect(releasedEvents).toHaveLength(1);
  });
});
