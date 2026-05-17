import { releaseByteSourceFields } from './byte-source-release.ts';

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
  releaseByteSourceFields(bag, FIELD_ORDER, runtime, (field, sourceBytes) => ({
    type: 'compressed-payload-released',
    trigger,
    kind: FIELD_TO_KIND[field],
    sourceBytes,
  }));
}
