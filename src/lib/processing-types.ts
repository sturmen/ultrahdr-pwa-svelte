import type { GainMapMetadata } from './gain-map-metadata.js';

export type HdrIntentColorGamut = 'bt2100' | 'displayp3' | 'bt709';
export type HdrIntentColorTransfer = 'pq' | 'hlg' | 'linear' | 'srgb';
export type HdrIntentColorRange = 'full' | 'limited';

export interface PackedHdrIntentPayload {
  data: Uint8Array;
  width: number;
  height: number;
  strideBytes: number;
  format: 'rgba1010102';
  cg: HdrIntentColorGamut;
  ct: 'pq' | 'hlg';
  range: HdrIntentColorRange;
}

export interface FloatHdrIntentPayload {
  data: Uint8Array;
  width: number;
  height: number;
  strideBytes: number;
  format: 'rgbaf16';
  cg: HdrIntentColorGamut;
  ct: 'linear';
  range: HdrIntentColorRange;
}

export type HdrIntentPayload = PackedHdrIntentPayload | FloatHdrIntentPayload;

export interface HdrIntentHeifResult {
  kind: 'hdr-intent-heif';
  hdrIntent: HdrIntentPayload;
  sourceExifBytes: Uint8Array | null;
}

export interface HdrIntentJpegResult {
  kind: 'hdr-intent-jpeg';
  hdrIntent: HdrIntentPayload;
  sourceExifBytes: Uint8Array | null;
}

export type HdrIntentResult = HdrIntentHeifResult | HdrIntentJpegResult;

export interface DecodedRasterImage {
  data: Uint8Array | Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
  strideBytes: number;
  pixelFormat: 'rgba8';
  bitDepth: number;
}

export interface PreservedHeifResult {
  sdr: DecodedRasterImage;
  gainMap: DecodedRasterImage;
  gainMapMetadata?: GainMapMetadata | null;
  gainMapHeadroom?: number | null;
  name: string;
}

export type ProcessingPathClassification = 'generated' | 'preserved' | 'hdr-intent' | 'unknown';

export interface HdrIntentTelemetry {
  hdrIntentFormat: HdrIntentPayload['format'];
  hdrIntentPayloadBytes: number;
  hdrIntentEstimatedPeakBytes: number;
}
