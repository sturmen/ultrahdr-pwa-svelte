export type PreservedUltraHdrRoute = 'finalize-preserved' | 'rotate-preserved-ultrahdr';
export type GeneratedSdrEncodingStrategy = 'bypass-sdr-encode' | 'lossless-rotate-sdr' | 'reencode-sdr';

export interface ProcessingDimensions {
  width: number;
  height: number;
}

export interface PreservedUltraHdrRouteInput {
  rotation: number;
  baseDimensions: ProcessingDimensions | null;
  sourceOrientationTransform: string | null;
  maxLongEdge?: number;
}

export interface GeneratedSdrEncodingStrategyInput {
  originalSdrJpegBytes: Uint8Array | null;
  rotation: number;
  sourceAutoRotation: number;
  sourceOrientationTransform: string | null;
}

function normalizeRotation(rotation: number): number {
  return ((rotation || 0) % 360 + 360) % 360;
}

export function decidePreservedUltraHdrRoute(input: PreservedUltraHdrRouteInput): PreservedUltraHdrRoute {
  const normalizedRotation = normalizeRotation(input.rotation);
  const maxLongEdge = Number.isFinite(input.maxLongEdge) && Number(input.maxLongEdge) > 0
    ? Number(input.maxLongEdge)
    : 8192;
  const isTooLarge = input.baseDimensions !== null
    && (input.baseDimensions.width > maxLongEdge || input.baseDimensions.height > maxLongEdge);
  const needsAutoRotation = input.sourceOrientationTransform !== null;

  if (normalizedRotation === 0 && !isTooLarge && !needsAutoRotation) {
    return 'finalize-preserved';
  }

  return 'rotate-preserved-ultrahdr';
}

export function decideGeneratedSdrEncodingStrategy(
  input: GeneratedSdrEncodingStrategyInput,
): GeneratedSdrEncodingStrategy {
  const normalizedRotation = normalizeRotation(input.rotation);
  const canBypassEncoding =
    input.originalSdrJpegBytes instanceof Uint8Array
    && normalizedRotation === 0
    && input.sourceAutoRotation === 0;

  if (canBypassEncoding) {
    return 'bypass-sdr-encode';
  }

  const canUseLosslessRotation =
    input.originalSdrJpegBytes instanceof Uint8Array
    && normalizedRotation !== 0
    && input.sourceAutoRotation === 0
    && input.sourceOrientationTransform === null
    && (normalizedRotation === 90 || normalizedRotation === 180 || normalizedRotation === 270);

  if (canUseLosslessRotation) {
    return 'lossless-rotate-sdr';
  }

  return 'reencode-sdr';
}
