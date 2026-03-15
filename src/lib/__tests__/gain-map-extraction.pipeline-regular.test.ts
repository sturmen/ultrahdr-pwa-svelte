/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { runHeicFixtureProbe } from './gain-map-real-fixture.test-utils';

describe('Gain Map Extraction (Real Files) - Pipeline Preservation Regular', () => {
  it('preserves the regular HEIC extraction result in the shape expected by the pipeline', async () => {
    const probe = await runHeicFixtureProbe('test_hdr_heif_gainmap.HEIC', false);

    expect(probe.kind).toBe('preserved');
    expect(probe.hasNonZeroPixels).toBe(true);
  }, 30000);
});
