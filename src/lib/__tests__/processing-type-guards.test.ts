import { describe, expect, it } from 'vitest';
import {
  isHdrIntentHeifResult,
  isHdrIntentJpegResult,
  isHdrIntentResult,
} from '../processing-type-guards.ts';
import type { HdrIntentResult } from '../processing-types.ts';

const hdrIntent = {
  data: new Uint8Array(4),
  width: 1,
  height: 1,
  strideBytes: 4,
  format: 'rgba1010102',
  cg: 'bt2100',
  ct: 'pq',
  range: 'full',
} as const;

describe('HDR-intent processing type guards', () => {
  it('recognizes HEIF and JPEG HDR-intent result envelopes through one shared guard', () => {
    const heif = { kind: 'hdr-intent-heif', hdrIntent, sourceExifBytes: null };
    const jpeg = { kind: 'hdr-intent-jpeg', hdrIntent, sourceExifBytes: null };

    expect(isHdrIntentHeifResult(heif)).toBe(true);
    expect(isHdrIntentJpegResult(jpeg)).toBe(true);
    expect(isHdrIntentResult(heif)).toBe(true);
    expect(isHdrIntentResult(jpeg)).toBe(true);

    const results: HdrIntentResult[] = [heif, jpeg].filter(isHdrIntentResult);
    expect(results.map((result) => result.kind)).toEqual(['hdr-intent-heif', 'hdr-intent-jpeg']);
  });

  it('rejects lookalike objects without a valid source kind', () => {
    expect(isHdrIntentResult({ kind: 'preserved-heif', hdrIntent })).toBe(false);
    expect(isHdrIntentResult({ kind: 'hdr-intent-jpeg' })).toBe(false);
    expect(isHdrIntentResult(null)).toBe(false);
  });
});
