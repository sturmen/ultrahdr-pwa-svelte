import { releaseByteSource } from './byte-source-release.ts';

export interface GmnetGainMapImageLike {
  data: Uint8ClampedArray | Uint8Array;
}

export function releaseGmnetGainMapSource(
  image: GmnetGainMapImageLike,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  releaseByteSource(image, runtime, (sourceBytes) => ({
    type: 'gmnet-gain-map-source-released',
    trigger,
    sourceBytes,
  }), {
    detachBuffer: true,
    createEmptyData: () => new Uint8ClampedArray(0),
  });
}
