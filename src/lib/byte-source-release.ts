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
export type TriggeredReleaseByteSourceEventFactory = (
  trigger: string,
  sourceBytes: number,
) => ProcessingMemoryDiagnosticsEvent;
export type ReleaseByteSourceFieldEventFactory<
  TField extends string,
> = (field: TField, sourceBytes: number) => ProcessingMemoryDiagnosticsEvent;

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

export function createByteSourceReleaser(
  createEvent: TriggeredReleaseByteSourceEventFactory,
  options: ReleaseByteSourceOptions = {},
): (
  source: ReleasableByteSource,
  runtime: typeof globalThis,
  trigger: string,
) => boolean {
  return (source, runtime, trigger) =>
    releaseByteSource(source, runtime, (sourceBytes) => createEvent(trigger, sourceBytes), options);
}

export function releaseByteSourceFields<
  TField extends string,
  TBag extends Partial<Record<TField, ReleasableByteSourceData | null | undefined>>,
>(
  bag: TBag,
  fields: readonly TField[],
  runtime: typeof globalThis,
  createEvent: ReleaseByteSourceFieldEventFactory<TField>,
): void {
  for (const field of fields) {
    const source = bag[field];
    if (!source || source.byteLength === 0) {
      continue;
    }
    recordProcessingMemoryDiagnostics(runtime, createEvent(field, source.byteLength));
    bag[field] = new Uint8Array(0) as TBag[TField];
  }
}
