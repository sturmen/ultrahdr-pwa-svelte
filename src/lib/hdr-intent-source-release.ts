import type { HdrIntentPayload } from './processing-types.ts';
import { releaseByteSource } from './byte-source-release.ts';

export function releaseHdrIntentSource(
  hdrIntent: HdrIntentPayload,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  const format = hdrIntent.format;
  releaseByteSource(hdrIntent, runtime, (sourceBytes) => ({
    type: 'hdr-intent-source-released',
    trigger,
    sourceBytes,
    format,
  }));
}
