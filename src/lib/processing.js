import {
  PIPELINE_HISTORY_KEY,
  PIPELINE_PROGRESS_EVENT,
  PIPELINE_STATE_KEY,
} from './pipeline-telemetry.js';

const WORKER_SUPPORT_ERROR = 'Processing worker is unavailable in this environment.';
const WORKER_INIT_ERROR = 'Processing worker failed to initialize.';
const WORKER_MESSAGE_ERROR = 'Processing worker returned an unexpected response.';
const WORKER_STALL_ERROR = 'Processing worker stalled before WASM initialization completed.';
const WORKER_WASM_LOAD_TIMEOUT_MS = 20_000;
const WORKER_INIT_TIMEOUT_MS = 15_000;
const INFERENCE_STAGE_NAME = 'generate-gain-map';
const INFERENCE_HEARTBEAT_INTERVAL_MS = 5_000;
const INFERENCE_TIMEOUT_DEFAULT_MS = 180_000;
const INFERENCE_TIMEOUT_FIREFOX_MS = 600_000;
const INFERENCE_TIMEOUT_WASM_MS = 600_000;
const INFERENCE_START_NOTE = 'Starting inference; application may appear hung while AI model executes.';
const INFERENCE_TIMEOUT_ERROR_MESSAGE = 'Processing worker stalled during GMNet inference.';

export const RUNTIME_INIT_STEP_ORDER = Object.freeze([
  'onnx-load',
  'webgpu-check',
  'gmnet-session-init',
  'gmnet-provider-verify',
  'gmnet-smoke-run',
  'startup-ready',
]);

export const RUNTIME_INIT_STEP_LABELS = Object.freeze({
  'onnx-load': 'Load ONNX Runtime',
  'webgpu-check': 'Check WebGPU availability',
  'gmnet-session-init': 'Initialize GMNet session',
  'gmnet-provider-verify': 'Verify GMNet execution provider',
  'gmnet-smoke-run': 'Run GMNet smoke test (128x128)',
  'startup-ready': 'Finalize startup readiness',
});

let workerClientPromise = null;
let workerClientCreationError = null;
let lastRuntimeInitProgressEvent = null;
const runtimeInitProgressListeners = new Set();

function canUseProcessingWorker(runtime = globalThis) {
  return (
    typeof runtime?.Worker === 'function' &&
    typeof runtime?.OffscreenCanvas !== 'undefined' &&
    typeof runtime?.createImageBitmap === 'function' &&
    typeof runtime?.fetch === 'function' &&
    typeof runtime?.ImageData !== 'undefined'
  );
}

function createAbortError() {
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Operation aborted', 'AbortError');
  }
  const error = new Error('Operation aborted');
  error.name = 'AbortError';
  return error;
}

function normalizeWorkerError(raw) {
  if (!raw || typeof raw !== 'object') {
    return new Error(String(raw || WORKER_MESSAGE_ERROR));
  }

  const error = new Error(String(raw.message || WORKER_MESSAGE_ERROR));
  if (raw.name) {
    error.name = String(raw.name);
  }
  if (raw.stack) {
    error.stack = String(raw.stack);
  }
  if (raw.code) {
    error.code = String(raw.code);
  }
  if (raw.stepId) {
    error.stepId = String(raw.stepId);
  }
  if (raw.userMessage) {
    error.userMessage = String(raw.userMessage);
  }
  if (raw.stackSnippet) {
    error.stackSnippet = String(raw.stackSnippet);
  }
  if (raw.diagnostics && typeof raw.diagnostics === 'object') {
    error.diagnostics = { ...raw.diagnostics };
  }
  return error;
}

function cloneEventDetail(eventDetail) {
  if (!eventDetail || typeof eventDetail !== 'object') {
    return eventDetail;
  }

  return {
    ...eventDetail,
    stageDurationsMs: eventDetail.stageDurationsMs
      ? { ...eventDetail.stageDurationsMs }
      : eventDetail.stageDurationsMs,
    error: eventDetail.error ? { ...eventDetail.error } : eventDetail.error,
  };
}

function cloneRuntimeInitProgressEvent(eventDetail) {
  if (!eventDetail || typeof eventDetail !== 'object') {
    return eventDetail;
  }

  return {
    ...eventDetail,
    diagnostics:
      eventDetail.diagnostics && typeof eventDetail.diagnostics === 'object'
        ? { ...eventDetail.diagnostics }
        : eventDetail.diagnostics,
  };
}

function publishRuntimeInitProgress(eventDetail) {
  const detail = cloneRuntimeInitProgressEvent(eventDetail);
  lastRuntimeInitProgressEvent = detail;
  for (const listener of runtimeInitProgressListeners) {
    try {
      listener(detail);
    } catch (callbackError) {
      console.warn('[Process] Runtime initialization progress callback failed:', callbackError);
    }
  }
}

function publishWorkerTelemetry(eventDetail) {
  if (!eventDetail || typeof window === 'undefined') {
    return;
  }

  const detail = cloneEventDetail(eventDetail);
  window[PIPELINE_STATE_KEY] = detail;

  const history = Array.isArray(window[PIPELINE_HISTORY_KEY])
    ? window[PIPELINE_HISTORY_KEY]
    : [];
  history.push(detail);
  if (history.length > 200) {
    history.splice(0, history.length - 200);
  }
  window[PIPELINE_HISTORY_KEY] = history;

  if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent(PIPELINE_PROGRESS_EVENT, { detail }));
  }
}

function stripNonSerializableOptions(options = {}) {
  const sanitized = { ...options };
  delete sanitized.onProgress;
  delete sanitized.abortSignal;
  return sanitized;
}

function isFirefoxRuntime(runtime = globalThis) {
  const userAgent = String(runtime?.navigator?.userAgent || '');
  return /firefox\//i.test(userAgent);
}

function normalizeExecutionProvider(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function resolveInferenceTimeoutMs(runtime = globalThis, executionProvider = null) {
  if (normalizeExecutionProvider(executionProvider) === 'wasm') {
    return INFERENCE_TIMEOUT_WASM_MS;
  }
  return isFirefoxRuntime(runtime)
    ? INFERENCE_TIMEOUT_FIREFOX_MS
    : INFERENCE_TIMEOUT_DEFAULT_MS;
}

function formatInferenceStatusNote(provider, elapsedMs = 0) {
  const normalizedProvider =
    typeof provider === 'string' && provider.trim().length > 0
      ? provider.trim().toLowerCase()
      : null;
  const runtimeSuffix = normalizedProvider ? ` Runtime: ${normalizedProvider}.` : '';
  if (elapsedMs < INFERENCE_HEARTBEAT_INTERVAL_MS) {
    return `${INFERENCE_START_NOTE}${runtimeSuffix}`;
  }
  const elapsedSeconds = Math.max(1, Math.floor(elapsedMs / 1000));
  return `${INFERENCE_START_NOTE}${runtimeSuffix} Still running (${elapsedSeconds}s).`;
}

function initializeWorkerClient() {
  if (!canUseProcessingWorker()) {
    return Promise.resolve(null);
  }

  if (workerClientCreationError) {
    return Promise.reject(workerClientCreationError);
  }

  return new Promise((resolve, reject) => {
    let worker;
    let initializationSettled = false;
    try {
      worker = new Worker(new URL('./processing-worker.js', import.meta.url), { type: 'module' });
    } catch (error) {
      const wrappedError = new Error(WORKER_INIT_ERROR);
      wrappedError.cause = error;
      wrappedError.name = 'ProcessingWorkerInitError';
      workerClientCreationError = wrappedError;
      reject(wrappedError);
      return;
    }

    const jobs = new Map();
    let nextJobId = 1;
    let ready = false;
    let runtimeMetadata = {};

    function emitProgressToJob(job, detail) {
      publishWorkerTelemetry(detail);
      try {
        job.onProgress?.(detail);
      } catch (callbackError) {
        console.warn('[Process] Progress callback failed:', callbackError);
      }
    }

    function clearInferenceMonitoring(job) {
      if (job.inferenceHeartbeatIntervalId !== null) {
        clearInterval(job.inferenceHeartbeatIntervalId);
        job.inferenceHeartbeatIntervalId = null;
      }
      if (job.inferenceTimeoutId !== null) {
        clearTimeout(job.inferenceTimeoutId);
        job.inferenceTimeoutId = null;
      }
      job.inferenceStartedAtMs = null;
    }

    function createInferenceTimeoutError(job) {
      const timeoutError = new Error(INFERENCE_TIMEOUT_ERROR_MESSAGE);
      timeoutError.name = 'ProcessingWorkerInferenceTimeoutError';
      const detail = {
        phase: 'stage-error',
        stage: INFERENCE_STAGE_NAME,
        note: INFERENCE_TIMEOUT_ERROR_MESSAGE,
        timestamp: Date.now(),
        syntheticHeartbeat: true,
        gmnetExecutionProvider: job.gmnetExecutionProvider || null,
        error: {
          name: timeoutError.name,
          message: timeoutError.message,
        },
      };
      return { timeoutError, detail };
    }

    function armInferenceTimeout(jobId, job) {
      if (job.inferenceTimeoutId !== null) {
        clearTimeout(job.inferenceTimeoutId);
      }
      const nowMs = Date.now();
      const inferenceStartedAtMs = job.inferenceStartedAtMs || nowMs;
      const elapsedMs = Math.max(0, nowMs - inferenceStartedAtMs);
      const remainingMs = Math.max(1, job.inferenceTimeoutMs - elapsedMs);
      job.inferenceTimeoutId = setTimeout(() => {
        const pendingJob = jobs.get(jobId);
        if (!pendingJob) {
          return;
        }
        const { timeoutError, detail } = createInferenceTimeoutError(pendingJob);
        emitProgressToJob(pendingJob, detail);
        worker.postMessage({ type: 'cancel', jobId });
        pendingJob.reject(timeoutError);
        disposeJob(jobId);
      }, remainingMs);
    }

    function updateInferenceTimeoutForProvider(jobId, job, provider = null) {
      const normalizedProvider = normalizeExecutionProvider(provider);
      if (!normalizedProvider) {
        return;
      }
      job.gmnetExecutionProvider = normalizedProvider;
      const nextTimeoutMs = resolveInferenceTimeoutMs(globalThis, normalizedProvider);
      if (nextTimeoutMs === job.inferenceTimeoutMs) {
        return;
      }
      job.inferenceTimeoutMs = nextTimeoutMs;
      if (job.inferenceStartedAtMs !== null) {
        armInferenceTimeout(jobId, job);
      }
    }

    function buildInferenceHeartbeatEvent(job, nowMs = Date.now()) {
      const baseDetail = job.lastProgressDetail && typeof job.lastProgressDetail === 'object'
        ? cloneEventDetail(job.lastProgressDetail)
        : {};
      const inferenceStartedAtMs = job.inferenceStartedAtMs || nowMs;
      const elapsedMs = Math.max(0, nowMs - inferenceStartedAtMs);
      const previousStageProgress = Number(baseDetail.stageProgress);
      const inferredStageProgress = Number.isFinite(previousStageProgress)
        ? Math.max(previousStageProgress, Math.min(95, previousStageProgress + 1))
        : Math.min(95, Math.max(1, Math.floor(elapsedMs / 15_000) + 1));
      const baseElapsedMs = Number(baseDetail.elapsedMs);
      const elapsedDeltaMs = Math.max(0, nowMs - (job.lastWorkerMessageAtMs || nowMs));

      return {
        ...baseDetail,
        phase: 'stage-progress',
        stage: INFERENCE_STAGE_NAME,
        stageProgress: inferredStageProgress,
        note: formatInferenceStatusNote(job.gmnetExecutionProvider, elapsedMs),
        timestamp: Date.now(),
        elapsedMs: Number.isFinite(baseElapsedMs)
          ? baseElapsedMs + elapsedDeltaMs
          : baseElapsedMs,
        syntheticHeartbeat: true,
        gmnetExecutionProvider: job.gmnetExecutionProvider || null,
      };
    }

    function startInferenceMonitoring(jobId, detail = null) {
      const job = jobs.get(jobId);
      if (!job) {
        return;
      }

      const nowMs = Date.now();
      if (job.inferenceStartedAtMs === null) {
        job.inferenceStartedAtMs = nowMs;
      }
      updateInferenceTimeoutForProvider(jobId, job, detail?.gmnetExecutionProvider);
      if (detail && typeof detail === 'object') {
        job.lastProgressDetail = cloneEventDetail(detail);
      }

      if (job.inferenceHeartbeatIntervalId === null) {
        const hasStartNote = typeof detail?.note === 'string'
          && detail.note.toLowerCase().includes('application may appear hung');
        if (!hasStartNote) {
          emitProgressToJob(job, buildInferenceHeartbeatEvent(job, nowMs));
        }

        job.inferenceHeartbeatIntervalId = setInterval(() => {
          const pendingJob = jobs.get(jobId);
          if (!pendingJob) {
            return;
          }
          emitProgressToJob(pendingJob, buildInferenceHeartbeatEvent(pendingJob));
        }, INFERENCE_HEARTBEAT_INTERVAL_MS);
      }

      armInferenceTimeout(jobId, job);
    }

    function rejectInitialization(error) {
      if (initializationSettled || ready) {
        return;
      }
      initializationSettled = true;
      if (error?.name !== 'ProcessingWorkerInitTimeout') {
        workerClientCreationError = error;
      }
      reject(error);
      worker.terminate();
    }

    function disposeJob(jobId) {
      const job = jobs.get(jobId);
      if (!job) {
        return;
      }

      if (job.abortSignal && job.abortListener) {
        job.abortSignal.removeEventListener('abort', job.abortListener);
      }
      if (job.wasmLoadTimeoutId !== null) {
        clearTimeout(job.wasmLoadTimeoutId);
        job.wasmLoadTimeoutId = null;
      }
      clearInferenceMonitoring(job);
      jobs.delete(jobId);
    }

    function rejectAllPending(error) {
      for (const [jobId, job] of jobs.entries()) {
        job.reject(error);
        disposeJob(jobId);
      }
    }

    worker.addEventListener('error', (event) => {
      const error = event?.error instanceof Error
        ? event.error
        : new Error(event?.message || WORKER_INIT_ERROR);
      error.name = error.name || 'ProcessingWorkerRuntimeError';
      if (!ready) {
        const initError = new Error(
          `${WORKER_INIT_ERROR}${error.message ? `: ${error.message}` : ''}`
        );
        initError.name = 'ProcessingWorkerInitError';
        initError.cause = error;
        rejectInitialization(initError);
        return;
      }
      rejectAllPending(error);
    });

    worker.addEventListener('messageerror', () => {
      const error = new Error('Processing worker communication error.');
      error.name = 'ProcessingWorkerMessageError';
      if (!ready) {
        const initError = new Error(`${WORKER_INIT_ERROR}: ${error.message}`);
        initError.name = 'ProcessingWorkerInitError';
        initError.cause = error;
        rejectInitialization(initError);
        return;
      }
      rejectAllPending(error);
    });

    worker.addEventListener('message', (event) => {
      const message = event?.data;
      if (!message || typeof message !== 'object') {
        return;
      }

      if (message.type === 'init-progress') {
        publishRuntimeInitProgress(message.event);
        return;
      }

      if (message.type === 'init-error') {
        const initError = normalizeWorkerError(message.error);
        if (!initError.name || initError.name === 'Error') {
          initError.name = 'RuntimeInitializationError';
        }
        rejectInitialization(initError);
        return;
      }

      if (message.type === 'ready') {
        if (!ready) {
          ready = true;
          runtimeMetadata = message.runtime && typeof message.runtime === 'object'
            ? { ...message.runtime }
            : {};
          initializationSettled = true;
          resolve({
            runtime: runtimeMetadata,
            process(file, options = {}) {
              if (!ready) {
                return Promise.reject(new Error(WORKER_INIT_ERROR));
              }

              if (options?.abortSignal?.aborted) {
                return Promise.reject(createAbortError());
              }

              const jobId = nextJobId++;
              const payload = {
                type: 'process',
                jobId,
                file,
                options: stripNonSerializableOptions(options),
              };

              return new Promise((jobResolve, jobReject) => {
                const abortSignal = options?.abortSignal || null;
                let abortListener = null;
                const wasmLoadTimeoutId = setTimeout(() => {
                  const pendingJob = jobs.get(jobId);
                  if (!pendingJob || !pendingJob.awaitingWasmLoadCompletion) {
                    return;
                  }

                  const timeoutError = new Error(WORKER_STALL_ERROR);
                  timeoutError.name = 'ProcessingWorkerTimeoutError';
                  worker.postMessage({ type: 'cancel', jobId });
                  pendingJob.reject(timeoutError);
                  disposeJob(jobId);
                }, WORKER_WASM_LOAD_TIMEOUT_MS);

                if (abortSignal) {
                  abortListener = () => {
                    worker.postMessage({ type: 'cancel', jobId });
                  };
                  abortSignal.addEventListener('abort', abortListener, { once: true });
                }

                jobs.set(jobId, {
                  resolve: jobResolve,
                  reject: jobReject,
                  onProgress: typeof options?.onProgress === 'function' ? options.onProgress : null,
                  abortSignal,
                  abortListener,
                  awaitingWasmLoadCompletion: true,
                  wasmLoadTimeoutId,
                  inferenceHeartbeatIntervalId: null,
                  inferenceTimeoutId: null,
                  inferenceStartedAtMs: null,
                  inferenceTimeoutMs: resolveInferenceTimeoutMs(),
                  gmnetExecutionProvider: null,
                  lastProgressDetail: null,
                  lastWorkerMessageAtMs: Date.now(),
                });

                worker.postMessage(payload);
              });
            },
          });
        }
        return;
      }

      const jobId = Number(message.jobId);
      if (!Number.isFinite(jobId) || !jobs.has(jobId)) {
        return;
      }

      const job = jobs.get(jobId);

      if (message.type === 'progress') {
        const detail = cloneEventDetail(message.event);
        job.lastWorkerMessageAtMs = Date.now();
        if (detail && typeof detail === 'object') {
          job.lastProgressDetail = cloneEventDetail(detail);
          updateInferenceTimeoutForProvider(jobId, job, detail.gmnetExecutionProvider);
        }
        if (
          job.awaitingWasmLoadCompletion &&
          detail?.stage === 'wasm-load' &&
          (detail.phase === 'stage-complete' || detail.phase === 'stage-error')
        ) {
          job.awaitingWasmLoadCompletion = false;
          if (job.wasmLoadTimeoutId !== null) {
            clearTimeout(job.wasmLoadTimeoutId);
            job.wasmLoadTimeoutId = null;
          }
        }
        if (
          detail?.stage === INFERENCE_STAGE_NAME &&
          (detail?.phase === 'stage-start' || detail?.phase === 'stage-progress')
        ) {
          startInferenceMonitoring(jobId, detail);
        } else if (
          detail?.stage === INFERENCE_STAGE_NAME &&
          (detail?.phase === 'stage-complete' || detail?.phase === 'stage-error')
        ) {
          clearInferenceMonitoring(job);
        } else if (detail?.phase === 'stage-start' && job.inferenceHeartbeatIntervalId !== null) {
          clearInferenceMonitoring(job);
        }
        emitProgressToJob(job, detail);
        return;
      }

      if (message.type === 'result') {
        disposeJob(jobId);
        const mimeType = typeof message.mimeType === 'string' ? message.mimeType : 'image/jpeg';
        const buffer = message.buffer;
        if (!(buffer instanceof ArrayBuffer)) {
          job.reject(new Error(WORKER_MESSAGE_ERROR));
          return;
        }
        job.resolve(new Blob([buffer], { type: mimeType }));
        return;
      }

      if (message.type === 'error') {
        disposeJob(jobId);
        job.reject(normalizeWorkerError(message.error));
        return;
      }

      disposeJob(jobId);
      job.reject(new Error(WORKER_MESSAGE_ERROR));
    });

    worker.postMessage({ type: 'init' });

    setTimeout(() => {
      if (!ready) {
        const timeoutError = new Error(WORKER_INIT_ERROR);
        timeoutError.name = 'ProcessingWorkerInitTimeout';
        rejectInitialization(timeoutError);
      }
    }, WORKER_INIT_TIMEOUT_MS);
  });
}

async function getWorkerClient() {
  if (workerClientPromise) {
    return workerClientPromise;
  }

  workerClientPromise = initializeWorkerClient().catch((error) => {
    workerClientPromise = null;
    workerClientCreationError = error;
    throw error;
  });

  return workerClientPromise;
}

function createWorkerUnavailableError() {
  const error = new Error(WORKER_SUPPORT_ERROR);
  error.name = 'ProcessingWorkerUnavailableError';
  return error;
}

function resetRuntimeInitializationState() {
  workerClientPromise = null;
  workerClientCreationError = null;
  lastRuntimeInitProgressEvent = null;
}

export async function initializeRuntime(options = {}) {
  const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
  const forceRetry = Boolean(options?.forceRetry);

  if (forceRetry) {
    resetRuntimeInitializationState();
  }

  if (!canUseProcessingWorker()) {
    const error = createWorkerUnavailableError();
    error.code = 'RUNTIME_INIT_WORKER_UNAVAILABLE';
    error.userMessage = 'Processing worker support is unavailable in this environment.';
    error.stepId = 'webgpu-check';
    error.diagnostics = {
      hasWorker: typeof globalThis?.Worker === 'function',
      hasOffscreenCanvas: typeof globalThis?.OffscreenCanvas !== 'undefined',
      hasCreateImageBitmap: typeof globalThis?.createImageBitmap === 'function',
    };
    throw error;
  }

  if (onProgress) {
    runtimeInitProgressListeners.add(onProgress);
    if (lastRuntimeInitProgressEvent) {
      onProgress(cloneRuntimeInitProgressEvent(lastRuntimeInitProgressEvent));
    }
  }

  try {
    const client = await getWorkerClient();
    const runtimeMetadata = client?.runtime && typeof client.runtime === 'object'
      ? { ...client.runtime }
      : {};
    return {
      ready: true,
      ...runtimeMetadata,
    };
  } finally {
    if (onProgress) {
      runtimeInitProgressListeners.delete(onProgress);
    }
  }
}

export async function processImage(file, options = {}) {
  if (!canUseProcessingWorker()) {
    const error = createWorkerUnavailableError();
    throw error;
  }

  const client = await getWorkerClient();

  return client.process(file, options);
}
