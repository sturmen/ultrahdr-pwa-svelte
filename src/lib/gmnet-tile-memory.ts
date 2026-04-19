import { recordProcessingMemoryDiagnostics } from './diagnostics-events.ts';
import type { GmnetTiledContext } from './gmnet-session.ts';

export type TiledInferenceBuffers = {
  accumIngm: Float32Array;
  weightAccumIngm: Float32Array;
};

export function createTiledInferenceBuffers(pixelCount: number): TiledInferenceBuffers {
  return {
    accumIngm: new Float32Array(pixelCount),
    weightAccumIngm: new Float32Array(pixelCount),
  };
}

export function releaseTiledSourceImageIfComplete(
  context: GmnetTiledContext,
  runtime: typeof globalThis = globalThis,
): boolean {
  if (!context || !Array.isArray(context.tiles)) {
    return false;
  }
  if (context.sourceImageData === null) {
    return false;
  }
  const tileTotal = context.tiles.length;
  if (context.completedTileCount < tileTotal) {
    return false;
  }

  const source = context.sourceImageData;
  const sourceBytes = source?.data?.byteLength ?? null;
  recordProcessingMemoryDiagnostics(runtime, {
    type: 'gmnet-source-image-released',
    trigger: 'last-tile-step',
    sourceBytes,
    tileTotal,
  });
  context.sourceImageData = null;
  return true;
}
