/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HdrIntentPayload } from '../processing-types.ts';

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

function createHdrIntent(byteLength: number): HdrIntentPayload {
  return {
    data: new Uint8Array(byteLength),
    width: 100,
    height: 100,
    strideBytes: 400,
    format: 'rgba1010102',
    cg: 'bt2100',
    ct: 'pq',
    range: 'full',
  };
}

describe('releaseHdrIntentSource', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('zeros the backing data buffer so the large allocation becomes GC-eligible', async () => {
    const { releaseHdrIntentSource } = await import('../hdr-intent-source-release.ts');
    const hdrIntent = createHdrIntent(1024 * 1024);
    expect(hdrIntent.data.byteLength).toBe(1024 * 1024);

    releaseHdrIntentSource(hdrIntent, createRuntime(), 'post-set-hdr-intent-image');

    expect(hdrIntent.data.byteLength).toBe(0);
  });

  it('emits hdr-intent-source-released breadcrumb with the original byte length and format', async () => {
    const runtime = createRuntime();
    const { releaseHdrIntentSource } = await import('../hdr-intent-source-release.ts');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const hdrIntent = createHdrIntent(48_771_072);
    releaseHdrIntentSource(hdrIntent, runtime, 'post-set-hdr-intent-image');

    const events = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime);
    const released = events.find(
      (e) => e.name === diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.hdrIntentSourceReleased,
    );
    expect(released).toBeTruthy();
    expect(released).toMatchObject({
      category: 'memory',
      severity: 'info',
      context: {
        trigger: 'post-set-hdr-intent-image',
        sourceBytes: 48_771_072,
        format: 'rgba1010102',
      },
    });
  });

  it('is safe to call twice without throwing', async () => {
    const runtime = createRuntime();
    const { releaseHdrIntentSource } = await import('../hdr-intent-source-release.ts');
    const hdrIntent = createHdrIntent(1024);
    releaseHdrIntentSource(hdrIntent, runtime, 'post-set-hdr-intent-image');
    expect(() => releaseHdrIntentSource(hdrIntent, runtime, 'post-set-hdr-intent-image')).not.toThrow();
    expect(hdrIntent.data.byteLength).toBe(0);
  });
});
