export interface ConstrainedDimensions {
  width: number;
  height: number;
  changed: boolean;
}

/**
 * Cap a raster's long edge to `maxLongEdge`, preserving aspect ratio.
 * Returns `changed: false` when the source already fits.
 */
export function constrainHdrIntentDimensions(
  sourceWidth: number,
  sourceHeight: number,
  maxLongEdge: number,
): ConstrainedDimensions {
  const longEdge = Math.max(sourceWidth, sourceHeight);
  if (longEdge <= maxLongEdge) {
    return { width: sourceWidth, height: sourceHeight, changed: false };
  }
  const scale = maxLongEdge / longEdge;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  return { width, height, changed: true };
}
