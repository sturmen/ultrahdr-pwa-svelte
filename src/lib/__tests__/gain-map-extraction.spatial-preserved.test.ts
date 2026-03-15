/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { runHeicFixtureProbe } from './gain-map-real-fixture.test-utils';

describe('Gain Map Extraction (Real Files) - Spatial HEIC Preserved', () => {
  it('extracts the spatial HEIC gain map from the hidden-item path and not the stereoscopic pair', async () => {
    const probe = await runHeicFixtureProbe('test_hdr_heif_spatial_gainmap.HEIC', false);
    const usedIphonePrimaryPath = probe.logLines.some((line) =>
      line.includes('Extracted iPhone hidden gain map item ID')
    );
    const usedAuxFallbackPath = probe.logLines.some((line) =>
      line.includes('Searching for gain map via auxiliary image API')
    );
    const isSameSize = probe.gainMapWidth === probe.sdrWidth && probe.gainMapHeight === probe.sdrHeight;
    const isStereoPair = !probe.isMonochrome && isSameSize;

    expect(probe.kind).toBe('preserved');
    expect(usedIphonePrimaryPath).toBe(true);
    expect(usedAuxFallbackPath).toBe(false);
    expect(probe.isMonochrome).toBe(true);
    expect(isStereoPair).toBe(false);
    expect(probe.gainMapWidth).toBeLessThanOrEqual(probe.sdrWidth ?? 0);
    expect(probe.gainMapHeight).toBeLessThanOrEqual(probe.sdrHeight ?? 0);
  }, 30000);
});
