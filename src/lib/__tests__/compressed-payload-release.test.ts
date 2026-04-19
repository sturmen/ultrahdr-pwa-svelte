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

describe('releaseCompressedPayloadBag', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('emits one breadcrumb per non-empty bag field and zeroes each field', async () => {
    const runtime = createRuntime();
    const { releaseCompressedPayloadBag } = await import('../compressed-payload-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const bag = {
      baseJpeg: new Uint8Array(5_000_000),
      gainMapJpeg: new Uint8Array(2_000_000),
      exif: new Uint8Array(5_000),
    };

    releaseCompressedPayloadBag(bag, runtime, 'post-set-compressed-payloads');

    expect(bag.baseJpeg.byteLength).toBe(0);
    expect(bag.gainMapJpeg.byteLength).toBe(0);
    expect(bag.exif.byteLength).toBe(0);

    const events = diagnosticsEvents
      .getRecordedDiagnosticsEvents(runtime)
      .filter((e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.compressedPayloadReleased);
    expect(events).toHaveLength(3);

    const byKind = new Map(events.map((e) => [String(e.context?.kind), e]));
    expect(byKind.get('base-jpeg')).toMatchObject({
      category: 'memory',
      severity: 'info',
      context: { trigger: 'post-set-compressed-payloads', kind: 'base-jpeg', sourceBytes: 5_000_000 },
    });
    expect(byKind.get('gain-map-jpeg')).toMatchObject({
      context: { kind: 'gain-map-jpeg', sourceBytes: 2_000_000 },
    });
    expect(byKind.get('exif')).toMatchObject({
      context: { kind: 'exif', sourceBytes: 5_000 },
    });
  });

  it('skips empty or missing bag fields without emitting breadcrumbs', async () => {
    const runtime = createRuntime();
    const { releaseCompressedPayloadBag } = await import('../compressed-payload-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const bag = {
      baseJpeg: new Uint8Array(0),
      gainMapJpeg: undefined,
      exif: null,
    };

    releaseCompressedPayloadBag(bag, runtime, 'post-set-compressed-payloads');

    const events = diagnosticsEvents
      .getRecordedDiagnosticsEvents(runtime)
      .filter((e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.compressedPayloadReleased);
    expect(events).toHaveLength(0);
  });

  it('supports all four named kinds (sdrJpeg, baseJpeg, gainMapJpeg, exif)', async () => {
    const runtime = createRuntime();
    const { releaseCompressedPayloadBag } = await import('../compressed-payload-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const bag = {
      sdrJpeg: new Uint8Array(100),
      baseJpeg: new Uint8Array(200),
      gainMapJpeg: new Uint8Array(300),
      exif: new Uint8Array(400),
    };

    releaseCompressedPayloadBag(bag, runtime, 'test');

    const kinds = diagnosticsEvents
      .getRecordedDiagnosticsEvents(runtime)
      .filter((e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.compressedPayloadReleased)
      .map((e) => String(e.context?.kind))
      .sort();
    expect(kinds).toEqual(['base-jpeg', 'exif', 'gain-map-jpeg', 'sdr-jpeg']);
  });
});
