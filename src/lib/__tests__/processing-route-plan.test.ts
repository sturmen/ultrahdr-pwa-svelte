import { describe, expect, it } from 'vitest';
import {
  decideGeneratedSdrEncodingStrategy,
  decidePreservedUltraHdrRoute,
} from '../processing-route-plan.ts';

describe('processing-route-plan', () => {
  it('chooses a direct preserved rebuild when rotation is zero and no alignment work is needed', () => {
    const input = Object.freeze({
      rotation: 0,
      baseDimensions: Object.freeze({ width: 4000, height: 3000 }),
      sourceOrientationTransform: null,
      maxLongEdge: 8192,
    });

    expect(decidePreservedUltraHdrRoute(input)).toBe('finalize-preserved');
    expect(input).toEqual({
      rotation: 0,
      baseDimensions: { width: 4000, height: 3000 },
      sourceOrientationTransform: null,
      maxLongEdge: 8192,
    });
  });

  it('chooses preserved re-encode when alignment or resize work is needed', () => {
    expect(
      decidePreservedUltraHdrRoute({
        rotation: 0,
        baseDimensions: { width: 9000, height: 4000 },
        sourceOrientationTransform: null,
        maxLongEdge: 8192,
      }),
    ).toBe('rotate-preserved-ultrahdr');

    expect(
      decidePreservedUltraHdrRoute({
        rotation: 0,
        baseDimensions: { width: 4000, height: 3000 },
        sourceOrientationTransform: '90',
        maxLongEdge: 8192,
      }),
    ).toBe('rotate-preserved-ultrahdr');

    expect(
      decidePreservedUltraHdrRoute({
        rotation: 90,
        baseDimensions: { width: 4000, height: 3000 },
        sourceOrientationTransform: null,
        maxLongEdge: 8192,
      }),
    ).toBe('rotate-preserved-ultrahdr');
  });

  it('treats generated-path SDR rotation as lossless only when the source is eligible', () => {
    expect(
      decideGeneratedSdrEncodingStrategy({
        originalSdrJpegBytes: new Uint8Array([1, 2, 3]),
        rotation: 0,
        sourceAutoRotation: 0,
        sourceOrientationTransform: null,
      }),
    ).toBe('bypass-sdr-encode');

    expect(
      decideGeneratedSdrEncodingStrategy({
        originalSdrJpegBytes: new Uint8Array([1, 2, 3]),
        rotation: 90,
        sourceAutoRotation: 0,
        sourceOrientationTransform: null,
      }),
    ).toBe('lossless-rotate-sdr');

    expect(
      decideGeneratedSdrEncodingStrategy({
        originalSdrJpegBytes: new Uint8Array([1, 2, 3]),
        rotation: 90,
        sourceAutoRotation: 90,
        sourceOrientationTransform: null,
      }),
    ).toBe('reencode-sdr');
  });
});
