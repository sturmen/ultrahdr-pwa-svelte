import { getSharedDiagnosticsRecorder } from './diagnostics.ts';

export const PIPELINE_PROGRESS_EVENT = 'ultrahdr:processing-progress';
export const PIPELINE_STATE_KEY = '__ultrahdrPipelineState';
export const PIPELINE_HISTORY_KEY = '__ultrahdrPipelineHistory';

const HISTORY_LIMIT = 200;

export interface PipelineTelemetryEvent extends Record<string, unknown> {
  pipelineId: string;
  phase: string;
}

export interface PipelineTelemetry {
  pipelineId: string;
  emit: (phase: string, payload?: Record<string, unknown>) => PipelineTelemetryEvent;
  emitStageProgress: (
    stage: string,
    stageProgress: number,
    payload?: Record<string, unknown>,
  ) => PipelineTelemetryEvent;
  runStage: <T>(
    stage: string,
    fn: () => Promise<T> | T,
    payload?: Record<string, unknown>,
  ) => Promise<T>;
  complete: (payload?: Record<string, unknown>) => void;
  fail: (error: unknown, payload?: Record<string, unknown>) => void;
}

export interface PipelineTelemetryContext {
  pipelineId?: string;
  fileName?: string;
  fileSize?: number;
  fileIndex?: number;
  totalFiles?: number;
  onProgress?: (event: PipelineTelemetryEvent) => void;
}

type EventTargetLike = typeof globalThis & {
  [PIPELINE_STATE_KEY]?: PipelineTelemetryEvent;
  [PIPELINE_HISTORY_KEY]?: PipelineTelemetryEvent[];
};

function getNowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function getEventTarget(): EventTargetLike | null {
  if (typeof window !== 'undefined') {
    return window as EventTargetLike;
  }
  if (typeof globalThis !== 'undefined') {
    return globalThis as EventTargetLike;
  }
  return null;
}

function normalizeError(error: unknown): { name?: string; message: string; stack?: string } {
  if (!error) {
    return { message: 'Unknown error' };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

function clampPercentage(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, numeric));
}

function publishProgress(detail: PipelineTelemetryEvent): void {
  const target = getEventTarget();
  if (!target) {
    return;
  }

  target[PIPELINE_STATE_KEY] = detail;

  const history = Array.isArray(target[PIPELINE_HISTORY_KEY]) ? target[PIPELINE_HISTORY_KEY] : [];
  history.push(detail);
  if (history.length > HISTORY_LIMIT) {
    history.splice(0, history.length - HISTORY_LIMIT);
  }
  target[PIPELINE_HISTORY_KEY] = history;

  try {
    const diagnosticsRecorder = getSharedDiagnosticsRecorder(target);
    diagnosticsRecorder.record({
      category: 'pipeline',
      name: detail.phase || 'pipeline-event',
      severity:
        detail.phase === 'stage-error' || detail.phase === 'pipeline-error'
          ? 'error'
          : 'info',
      context: {
        pipelineId: detail.pipelineId || null,
        stage: detail.stage || null,
        stageProgress: detail.stageProgress ?? null,
        note: detail.note || null,
        fileIndex: detail.fileIndex ?? null,
        totalFiles: detail.totalFiles ?? null,
        elapsedMs: detail.elapsedMs ?? null,
        processingPath: detail.processingPath || null,
        gmnetExecutionProvider: detail.gmnetExecutionProvider || null,
        gmnetMemoryMode: detail.gmnetMemoryMode || null,
        gmnetCheckpointTilesCompleted: detail.gmnetCheckpointTilesCompleted ?? null,
        gmnetCheckpointTilesTotal: detail.gmnetCheckpointTilesTotal ?? null,
        gmnetCheckpointResumed: detail.gmnetCheckpointResumed ?? null,
        substage: detail.substage || null,
      },
    });
  } catch {
    // Diagnostics must not interfere with pipeline progress delivery.
  }

  if (typeof target.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    target.dispatchEvent(new CustomEvent(PIPELINE_PROGRESS_EVENT, { detail }));
  }
}

export function createPipelineTelemetry(
  context: PipelineTelemetryContext = {},
): PipelineTelemetry {
  const pipelineId = context.pipelineId || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const pipelineStartMs = getNowMs();
  const stageDurationsMs: Record<string, number> = {};
  let sequence = 0;
  const onProgress = typeof context.onProgress === 'function' ? context.onProgress : null;

  function emit(phase: string, payload: Record<string, unknown> = {}): PipelineTelemetryEvent {
    const detail: PipelineTelemetryEvent = {
      pipelineId,
      phase,
      sequence: sequence++,
      timestamp: Date.now(),
      elapsedMs: getNowMs() - pipelineStartMs,
      stageDurationsMs: { ...stageDurationsMs },
      fileName: context.fileName || null,
      fileSize: context.fileSize ?? null,
      fileIndex: context.fileIndex ?? null,
      totalFiles: context.totalFiles ?? null,
      ...payload,
    };

    publishProgress(detail);

    if (onProgress) {
      try {
        onProgress(detail);
      } catch (callbackError) {
        console.warn('[Process] Progress callback failed:', callbackError);
      }
    }

    return detail;
  }

  function emitStageProgress(
    stage: string,
    stageProgress: number,
    payload: Record<string, unknown> = {},
  ): PipelineTelemetryEvent {
    return emit('stage-progress', {
      stage,
      stageProgress: clampPercentage(stageProgress),
      ...payload,
    });
  }

  async function runStage<T>(
    stage: string,
    fn: () => Promise<T> | T,
    payload: Record<string, unknown> = {},
  ): Promise<T> {
    const stageStartMs = getNowMs();
    emit('stage-start', { stage, ...payload });

    try {
      const result = await fn();
      const durationMs = getNowMs() - stageStartMs;
      stageDurationsMs[stage] = durationMs;
      emit('stage-complete', { stage, durationMs, ...payload });
      return result;
    } catch (error) {
      const durationMs = getNowMs() - stageStartMs;
      stageDurationsMs[stage] = durationMs;
      emit('stage-error', { stage, durationMs, error: normalizeError(error), ...payload });
      throw error;
    }
  }

  function complete(payload: Record<string, unknown> = {}): void {
    emit('pipeline-complete', {
      stage: 'pipeline',
      durationMs: getNowMs() - pipelineStartMs,
      ...payload,
    });
  }

  function fail(error: unknown, payload: Record<string, unknown> = {}): void {
    emit('pipeline-error', {
      stage: 'pipeline',
      durationMs: getNowMs() - pipelineStartMs,
      error: normalizeError(error),
      ...payload,
    });
  }

  emit('pipeline-start', { stage: 'pipeline' });

  return {
    pipelineId,
    emit,
    emitStageProgress,
    runStage,
    complete,
    fail,
  };
}
