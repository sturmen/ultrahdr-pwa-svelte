import type { HdrIntentPayload } from './processing-types.ts';
import { createByteSourceReleaser } from './byte-source-release.ts';

export function releaseHdrIntentSource(
  hdrIntent: HdrIntentPayload,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  const format = hdrIntent.format;
  createByteSourceReleaser((releaseTrigger, sourceBytes) => ({
    type: 'hdr-intent-source-released',
    trigger: releaseTrigger,
    sourceBytes,
    format,
  }))(hdrIntent, runtime, trigger);
}
