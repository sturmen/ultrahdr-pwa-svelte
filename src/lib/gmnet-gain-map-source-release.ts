import { createByteSourceReleaser } from './byte-source-release.ts';

export interface GmnetGainMapImageLike {
  data: Uint8ClampedArray | Uint8Array;
}

const releaseGmnetGainMapBytes = createByteSourceReleaser((trigger, sourceBytes) => ({
  type: 'gmnet-gain-map-source-released',
  trigger,
  sourceBytes,
}), {
  detachBuffer: true,
  createEmptyData: () => new Uint8ClampedArray(0),
});

export function releaseGmnetGainMapSource(
  image: GmnetGainMapImageLike,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  releaseGmnetGainMapBytes(image, runtime, trigger);
}
