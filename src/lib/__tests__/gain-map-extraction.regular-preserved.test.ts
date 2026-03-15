/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { runHeicFixtureProbe } from './gain-map-real-fixture.test-utils';

describe('Gain Map Extraction (Real Files) - Regular HEIC Preserved', () => {
  it('extracts a monochrome preserved gain map payload from the regular HEIC fixture', async () => {
    const probe = await runHeicFixtureProbe('test_hdr_heif_gainmap.HEIC', false);

    expect(probe.kind).toBe('preserved');
    expect(probe.gainMapWidth).toBeGreaterThan(0);
    expect(probe.gainMapHeight).toBeGreaterThan(0);
    expect(probe.isMonochrome).toBe(true);
    expect(probe.gainMapWidth).toBeLessThanOrEqual(probe.sdrWidth ?? 0);
    expect(probe.gainMapHeight).toBeLessThanOrEqual(probe.sdrHeight ?? 0);
  }, 30000);
});
