/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { runHeicFixtureProbe } from './gain-map-real-fixture.test-utils';

describe('Gain Map Extraction (Real Files) - Regular HEIC Discard', () => {
  it('returns a decoded raster input for the ITM path when the regular HEIC gain map is discarded', () => {
    return runHeicFixtureProbe('test_hdr_heif_gainmap.HEIC', true).then((probe) => {
      expect(probe.kind).toBe('decoded-raster');
      expect(probe.pixelFormat).toBe('rgba8');
      expect(probe.bitDepth).toBe(8);
      expect(probe.width).toBeGreaterThan(0);
      expect(probe.height).toBeGreaterThan(0);
    });
  }, 30000);
});
