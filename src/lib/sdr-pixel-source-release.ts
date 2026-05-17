import { releaseByteSource } from './byte-source-release.ts';

export interface SdrPixelImageLike {
  data: Uint8ClampedArray | Uint8Array;
}

export function releaseSdrPixelSource(
  image: SdrPixelImageLike,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  releaseByteSource(image, runtime, (sourceBytes) => ({
    type: 'sdr-pixel-source-released',
    trigger,
    sourceBytes,
  }), {
    detachBuffer: true,
    createEmptyData: () => new Uint8ClampedArray(0),
  });
}
