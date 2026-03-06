import { normalizeExecutionProvider } from './runtime-contract.js';

export function createWorkerJobState({
  onProgress,
  abortSignal,
  abortListener,
  wasmLoadTimeoutId,
  inferenceTimeoutMs,
  nowMs,
}) {
  return {
    onProgress,
    abortSignal,
    abortListener,
    awaitingWasmLoadCompletion: true,
    wasmLoadTimeoutId,
    inferenceHeartbeatIntervalId: null,
    inferenceTimeoutId: null,
    inferenceStartedAtMs: null,
    inferenceTimeoutMs,
    gmnetExecutionProvider: null,
    lastProgressDetail: null,
    lastWorkerMessageAtMs: nowMs,
  };
}

export function reduceWorkerJobState(
  state,
  {
    type,
    detail = null,
    nowMs = Date.now(),
    inferenceStageName = 'generate-gain-map',
    resolveInferenceTimeoutMs = () => state.inferenceTimeoutMs,
  } = {},
) {
  if (!state || typeof state !== 'object') {
    return { state, commands: [] };
  }

  if (type !== 'WORKER_PROGRESS' || !detail || typeof detail !== 'object') {
    return {
      state: {
        ...state,
        lastWorkerMessageAtMs: nowMs,
      },
      commands: [],
    };
  }

  const nextState = {
    ...state,
    lastWorkerMessageAtMs: nowMs,
    lastProgressDetail: detail,
  };
  const commands = [];

  const normalizedProvider = normalizeExecutionProvider(detail.gmnetExecutionProvider);
  if (normalizedProvider) {
    nextState.gmnetExecutionProvider = normalizedProvider;
    const nextTimeoutMs = resolveInferenceTimeoutMs(normalizedProvider);
    if (Number.isFinite(nextTimeoutMs) && nextTimeoutMs > 0) {
      nextState.inferenceTimeoutMs = nextTimeoutMs;
    }
  }

  if (
    nextState.awaitingWasmLoadCompletion
    && detail.stage === 'wasm-load'
    && (detail.phase === 'stage-complete' || detail.phase === 'stage-error')
  ) {
    nextState.awaitingWasmLoadCompletion = false;
    commands.push('CLEAR_WASM_TIMEOUT');
  }

  if (
    detail.stage === inferenceStageName
    && (detail.phase === 'stage-start' || detail.phase === 'stage-progress')
  ) {
    if (nextState.inferenceStartedAtMs === null) {
      nextState.inferenceStartedAtMs = nowMs;
    }
    commands.push('START_INFERENCE_MONITORING');
  } else if (
    detail.stage === inferenceStageName
    && (detail.phase === 'stage-complete' || detail.phase === 'stage-error')
  ) {
    commands.push('STOP_INFERENCE_MONITORING');
  } else if (detail.phase === 'stage-start' && nextState.inferenceHeartbeatIntervalId !== null) {
    commands.push('STOP_INFERENCE_MONITORING');
  }

  return { state: nextState, commands };
}

export function deriveInferenceHeartbeatEvent(
  state,
  {
    nowMs = Date.now(),
    inferenceStageName = 'generate-gain-map',
    formatInferenceStatusNote = () => 'Starting inference...',
  } = {},
) {
  const baseDetail = state.lastProgressDetail && typeof state.lastProgressDetail === 'object'
    ? { ...state.lastProgressDetail }
    : {};
  const inferenceStartedAtMs = state.inferenceStartedAtMs || nowMs;
  const elapsedMs = Math.max(0, nowMs - inferenceStartedAtMs);
  const previousStageProgress = Number(baseDetail.stageProgress);
  const inferredStageProgress = Number.isFinite(previousStageProgress)
    ? Math.max(previousStageProgress, Math.min(95, previousStageProgress + 1))
    : Math.min(95, Math.max(1, Math.floor(elapsedMs / 15_000) + 1));
  const baseElapsedMs = Number(baseDetail.elapsedMs);
  const elapsedDeltaMs = Math.max(0, nowMs - (state.lastWorkerMessageAtMs || nowMs));

  return {
    ...baseDetail,
    phase: 'stage-progress',
    stage: inferenceStageName,
    stageProgress: inferredStageProgress,
    note: formatInferenceStatusNote(state.gmnetExecutionProvider, elapsedMs),
    timestamp: nowMs,
    elapsedMs: Number.isFinite(baseElapsedMs)
      ? baseElapsedMs + elapsedDeltaMs
      : baseElapsedMs,
    syntheticHeartbeat: true,
    gmnetExecutionProvider: state.gmnetExecutionProvider || null,
  };
}
