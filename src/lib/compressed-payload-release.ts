import { recordProcessingMemoryDiagnostics } from './diagnostics-events.ts';

export interface CompressedPayloadBag {
  sdrJpeg?: Uint8Array | null;
  baseJpeg?: Uint8Array | null;
  gainMapJpeg?: Uint8Array | null;
  exif?: Uint8Array | null;
}

const FIELD_TO_KIND: Record<keyof CompressedPayloadBag, string> = {
  sdrJpeg: 'sdr-jpeg',
  baseJpeg: 'base-jpeg',
  gainMapJpeg: 'gain-map-jpeg',
  exif: 'exif',
};

const FIELD_ORDER: (keyof CompressedPayloadBag)[] = ['sdrJpeg', 'baseJpeg', 'gainMapJpeg', 'exif'];

export function releaseCompressedPayloadBag(
  bag: CompressedPayloadBag,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  for (const field of FIELD_ORDER) {
    const buffer = bag[field];
    if (!buffer || buffer.byteLength === 0) {
      continue;
    }
    recordProcessingMemoryDiagnostics(runtime, {
      type: 'compressed-payload-released',
      trigger,
      kind: FIELD_TO_KIND[field],
      sourceBytes: buffer.byteLength,
    });
    bag[field] = new Uint8Array(0);
  }
}
