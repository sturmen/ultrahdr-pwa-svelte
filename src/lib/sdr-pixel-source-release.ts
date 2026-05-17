import { createByteSourceReleaser } from './byte-source-release.ts';

export interface SdrPixelImageLike {
  data: Uint8ClampedArray | Uint8Array;
}

const releaseSdrPixelBytes = createByteSourceReleaser((trigger, sourceBytes) => ({
  type: 'sdr-pixel-source-released',
  trigger,
  sourceBytes,
}), {
  detachBuffer: true,
  createEmptyData: () => new Uint8ClampedArray(0),
});

export function releaseSdrPixelSource(
  image: SdrPixelImageLike,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  releaseSdrPixelBytes(image, runtime, trigger);
}
