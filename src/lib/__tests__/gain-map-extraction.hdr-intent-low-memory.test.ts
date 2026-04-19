/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { runHdrIntentFixtureProbe } from './gain-map-real-fixture.test-utils';

describe('HDR Intent Extraction (Real Files) - Low Memory Packed Path', () => {
  it('keeps the real Main10 HDR HEIF fixture on the packed rgba1010102 path on low-memory tiers', async () => {
    const probe = await runHdrIntentFixtureProbe('test_hdr_no_gain_map.HIF', 'low');

    expect(probe.kind).toBe('hdr-intent');
    expect(probe.format).toBe('rgba1010102');
    expect(probe.ct).toBe('pq');
    expect(probe.strideBytes).toBe(probe.width * 4);
    expect(probe.dataByteLength).toBe(probe.width * probe.height * 4);
    expect(probe.bitsPerPixel).toBe(10);
    expect(probe.diagnosticsEventNames).not.toContain('hdr-intent-format-downgraded');
  }, 30000);
});
