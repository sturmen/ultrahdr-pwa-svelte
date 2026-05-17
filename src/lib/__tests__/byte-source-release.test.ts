/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProcessingMemoryDiagnosticsEvent } from '../diagnostics-events.ts';

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

function createReleaseEvent(sourceBytes: number): ProcessingMemoryDiagnosticsEvent {
  return {
    type: 'sdr-pixel-source-released',
    trigger: 'unit-test',
    sourceBytes,
  };
}

describe('releaseByteSource', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('emits the supplied memory breadcrumb and replaces non-empty data with an empty view', async () => {
    const runtime = createRuntime();
    const { releaseByteSource } = await import('../byte-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');
    const source = { data: new Uint8Array(4096) };

    const released = releaseByteSource(source, runtime, createReleaseEvent);

    expect(released).toBe(true);
    expect(source.data.byteLength).toBe(0);
    expect(diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)).toEqual([
      expect.objectContaining({
        category: 'memory',
        severity: 'info',
        name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.sdrPixelSourceReleased,
        context: expect.objectContaining({
          trigger: 'unit-test',
          sourceBytes: 4096,
        }),
      }),
    ]);
  });

  it('skips empty data without emitting diagnostics', async () => {
    const runtime = createRuntime();
    const { releaseByteSource } = await import('../byte-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');
    const source = { data: new Uint8Array(0) };

    const released = releaseByteSource(source, runtime, createReleaseEvent);

    expect(released).toBe(false);
    expect(source.data.byteLength).toBe(0);
    expect(diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)).toEqual([]);
  });

  it('tolerates readonly data properties without throwing', async () => {
    const runtime = createRuntime();
    const { releaseByteSource } = await import('../byte-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');
    const data = new Uint8ClampedArray(128);
    const source = {};
    Object.defineProperty(source, 'data', {
      configurable: true,
      enumerable: true,
      value: data,
      writable: false,
    });

    expect(() =>
      releaseByteSource(
        source as { data: Uint8ClampedArray },
        runtime,
        createReleaseEvent,
        { detachBuffer: true, createEmptyData: () => new Uint8ClampedArray(0) },
      ),
    ).not.toThrow();

    expect(diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)).toHaveLength(1);
  });

  it('detaches the original backing buffer when detach mode is enabled', async () => {
    const { releaseByteSource } = await import('../byte-source-release.ts');
    const data = new Uint8ClampedArray([1, 2, 3, 4]);
    const originalAlias = new Uint8ClampedArray(data.buffer);
    const source = { data };

    releaseByteSource(source, createRuntime(), createReleaseEvent, {
      detachBuffer: true,
      createEmptyData: () => new Uint8ClampedArray(0),
    });

    expect(source.data.byteLength).toBe(0);
    expect(originalAlias.byteLength).toBe(0);
  });
});
