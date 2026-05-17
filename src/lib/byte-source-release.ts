import {
  recordProcessingMemoryDiagnostics,
  type ProcessingMemoryDiagnosticsEvent,
} from './diagnostics-events.ts';
import { detachArrayBuffer } from './detach-array-buffer.ts';

export type ReleasableByteSourceData = Uint8Array | Uint8ClampedArray;

export interface ReleasableByteSource {
  readonly data: ReleasableByteSourceData;
}

export interface ReleaseByteSourceOptions {
  detachBuffer?: boolean;
  createEmptyData?: (sourceData: ReleasableByteSourceData) => ReleasableByteSourceData;
}

export type ReleaseByteSourceEventFactory = (sourceBytes: number) => ProcessingMemoryDiagnosticsEvent;

function createDefaultEmptyData(sourceData: ReleasableByteSourceData): ReleasableByteSourceData {
  return sourceData instanceof Uint8ClampedArray
    ? new Uint8ClampedArray(0)
    : new Uint8Array(0);
}

export function releaseByteSource(
  source: ReleasableByteSource,
  runtime: typeof globalThis = globalThis,
  createEvent: ReleaseByteSourceEventFactory,
  options: ReleaseByteSourceOptions = {},
): boolean {
  const sourceData = source.data;
  const sourceBytes = sourceData.byteLength;
  if (sourceBytes === 0) {
    return false;
  }

  recordProcessingMemoryDiagnostics(runtime, createEvent(sourceBytes));

  if (options.detachBuffer) {
    detachArrayBuffer(sourceData.buffer);
  }

  try {
    (source as { data: ReleasableByteSourceData }).data =
      options.createEmptyData?.(sourceData) ?? createDefaultEmptyData(sourceData);
  } catch {
    // DOM ImageData exposes readonly `.data`; detached buffers still release memory.
  }

  return true;
}
