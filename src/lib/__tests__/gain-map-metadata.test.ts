/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { parseHdrGainMapMetadataFromText } from '../gain-map-metadata.js';

function wrapXmp(descriptionAttributes: string, body = ''): string {
  return [
    '<?xpacket begin=""?>',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    `<rdf:Description xmlns:hdrgm="http://ns.adobe.com/hdr-gain-map/1.0/" hdrgm:Version="1" ${descriptionAttributes}>`,
    body,
    '</rdf:Description>',
    '</rdf:RDF>',
    '</x:xmpmeta>',
  ].join('');
}

function seq(name: string, values: number[]): string {
  return [
    `<hdrgm:${name}>`,
    '<rdf:Seq>',
    ...values.map((value) => `<rdf:li>${value}</rdf:li>`),
    '</rdf:Seq>',
    `</hdrgm:${name}>`,
  ].join('');
}

describe('gain-map metadata XMP parsing', () => {
  it('normalizes Sigma-style negative GainMapMin from log2 XMP into positive linear metadata', () => {
    const metadata = parseHdrGainMapMetadataFromText(wrapXmp(
      'hdrgm:GainMapMin="-0.000026" hdrgm:GainMapMax="3" hdrgm:HDRCapacityMin="0" hdrgm:HDRCapacityMax="3"',
    ));

    expect(metadata).not.toBeNull();
    expect(metadata?.gainMapMin).toEqual([
      expect.closeTo(Math.pow(2, -0.000026), 8),
      expect.closeTo(Math.pow(2, -0.000026), 8),
      expect.closeTo(Math.pow(2, -0.000026), 8),
    ]);
    expect(metadata?.gainMapMin[0]).toBeGreaterThan(0);
    expect(metadata?.gainMapMax).toEqual([
      expect.closeTo(8, 8),
      expect.closeTo(8, 8),
      expect.closeTo(8, 8),
    ]);
    expect(metadata?.hdrCapacityMin).toBe(1);
    expect(metadata?.hdrCapacityMax).toBeCloseTo(8, 8);
  });

  it('expands one-item RDF gain-map arrays across RGB channels after log2-to-linear conversion', () => {
    const metadata = parseHdrGainMapMetadataFromText(wrapXmp(
      'hdrgm:HDRCapacityMin="0" hdrgm:HDRCapacityMax="2"',
      [
        seq('GainMapMin', [-1]),
        seq('GainMapMax', [2]),
        seq('Gamma', [1.2]),
      ].join(''),
    ));

    expect(metadata).not.toBeNull();
    expect(metadata?.gainMapMin).toEqual([
      expect.closeTo(0.5, 8),
      expect.closeTo(0.5, 8),
      expect.closeTo(0.5, 8),
    ]);
    expect(metadata?.gainMapMax).toEqual([
      expect.closeTo(4, 8),
      expect.closeTo(4, 8),
      expect.closeTo(4, 8),
    ]);
    expect(metadata?.gamma).toEqual([1.2, 1.2, 1.2]);
  });

  it('maps three-item RDF gain-map arrays per channel while accepting negative log2 minimum boosts', () => {
    const metadata = parseHdrGainMapMetadataFromText(wrapXmp(
      'hdrgm:HDRCapacityMin="0" hdrgm:HDRCapacityMax="3"',
      [
        seq('GainMapMin', [-0.25, -0.5, -1]),
        seq('GainMapMax', [1, 2, 3]),
        seq('Gamma', [1.0, 1.1, 1.2]),
      ].join(''),
    ));

    expect(metadata).not.toBeNull();
    expect(metadata?.gainMapMin).toEqual([
      expect.closeTo(Math.pow(2, -0.25), 8),
      expect.closeTo(Math.pow(2, -0.5), 8),
      expect.closeTo(Math.pow(2, -1), 8),
    ]);
    expect(metadata?.gainMapMax).toEqual([
      expect.closeTo(2, 8),
      expect.closeTo(4, 8),
      expect.closeTo(8, 8),
    ]);
    expect(metadata?.gamma).toEqual([1.0, 1.1, 1.2]);
  });

  it('returns null when a present numeric gain-map metadata field is invalid', () => {
    const metadata = parseHdrGainMapMetadataFromText(wrapXmp(
      'hdrgm:GainMapMin="not-a-number" hdrgm:GainMapMax="3" hdrgm:HDRCapacityMin="0" hdrgm:HDRCapacityMax="3"',
    ));

    expect(metadata).toBeNull();
  });
});
