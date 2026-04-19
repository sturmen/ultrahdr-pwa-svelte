import type { HdrIntentPayload } from './processing-types.ts';
import { recordProcessingMemoryDiagnostics } from './diagnostics-events.ts';

export function releaseHdrIntentSource(
  hdrIntent: HdrIntentPayload,
  runtime: typeof globalThis = globalThis,
  trigger: string,
): void {
  const sourceBytes = hdrIntent.data.byteLength;
  const format = hdrIntent.format;

  if (sourceBytes === 0) {
    return;
  }

  recordProcessingMemoryDiagnostics(runtime, {
    type: 'hdr-intent-source-released',
    trigger,
    sourceBytes,
    format,
  });

  hdrIntent.data = new Uint8Array(0);
}
