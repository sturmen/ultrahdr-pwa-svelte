/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { runHeicFixtureProbe } from './gain-map-real-fixture.test-utils';

describe('Gain Map Extraction (Real Files) - Spatial HEIC Discard', () => {
  it('returns a PNG file when the spatial HEIC gain map is discarded', () => {
    return runHeicFixtureProbe('test_hdr_heif_spatial_gainmap.HEIC', true).then((probe) => {
      expect(probe.kind).toBe('discarded');
      expect(probe.fileType).toBe('image/png');
    });
  }, 30000);
});
