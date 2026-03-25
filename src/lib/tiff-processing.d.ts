import type { DecodedRasterImage } from './processing-types.ts';

export function processTiff(file: Blob): Promise<DecodedRasterImage>;
