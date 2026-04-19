import { recordProcessingMemoryDiagnostics } from './diagnostics-events.ts';
import { detachArrayBuffer } from './detach-array-buffer.ts';

export interface GmnetGainMapImageLike {
  data: Uint8ClampedArray | Uint8Array;
}

export function releaseGmnetGainMapSource(
  image: GmnetGainMapImageLike,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  const sourceBytes = image.data.byteLength;
  if (sourceBytes === 0) {
    return;
  }

  recordProcessingMemoryDiagnostics(runtime, {
    type: 'gmnet-gain-map-source-released',
    trigger,
    sourceBytes,
  });

  const buffer = image.data.buffer;
  detachArrayBuffer(buffer);

  try {
    (image as { data: Uint8ClampedArray | Uint8Array }).data = new Uint8ClampedArray(0);
  } catch {
    // `.data` is readonly on DOM ImageData; the buffer detach above is what frees memory.
  }
}
