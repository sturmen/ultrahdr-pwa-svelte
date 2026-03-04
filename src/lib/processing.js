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
const WORKER_INIT_TIMEOUT_DEFAULT_MS = 240_000;
const WORKER_INIT_TIMEOUT_FIREFOX_MS = 300_000;
const INFERENCE_STAGE_NAME = 'generate-gain-map';
const INFERENCE_HEARTBEAT_INTERVAL_MS = 5_000;
const INFERENCE_TIMEOUT_DEFAULT_MS = 180_000;
const INFERENCE_TIMEOUT_FIREFOX_MS = 600_000;
const INFERENCE_TIMEOUT_WASM_MS = 600_000;
const INFERENCE_START_NOTE = 'Starting inference...';
const INFERENCE_TIMEOUT_ERROR_MESSAGE = 'Processing worker stalled during GMNet inference.';
const STARTUP_CAPABILITY_CACHE_KEY = 'ultrahdr:runtime-startup-cache:v1';
const STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS = 86_400_000;

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
  'gmnet-smoke-run': 'Run GMNet smoke test',
  'startup-ready': 'Finalize startup readiness',
});

let workerClientPromise = null;
let workerClientCreationError = null;
let lastRuntimeInitProgressEvent = null;
const runtimeInitProgressListeners = new Set();
let mainThreadRuntimePromise = null;
let mainThreadRuntimeError = null;

function isMainThreadFallbackEnabled(options = {}) {
  return options?.allowMainThreadFallback !== false;
}

function resolveRuntimeMode(resolvedExecutionProvider, workerBacked) {
  const provider = normalizeExecutionProvider(resolvedExecutionProvider);
  if (workerBacked) {
    return provider === 'wasm' ? 'worker-wasm' : 'worker-gpu';
  }
  return 'main-thread-wasm';
}

function isWorkerCompatibilityError(error) {
  return (
    error?.name === 'ProcessingWorkerUnavailableError'
    || error?.name === 'ProcessingWorkerInitError'
    || error?.name === 'ProcessingWorkerInitTimeout'
  );
}

function canUseProcessingWorker(runtime = globalThis) {
  return (
    typeof runtime?.Worker === 'function' &&
    typeof runtime?.OffscreenCanvas !== 'undefined' &&
    typeof runtime?.createImageBitmap === 'function' &&
    typeof runtime?.fetch === 'function' &&
    typeof runtime?.ImageData !== 'undefined'
  );
}

function normalizeStartupCapabilityCacheTtlMs(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS;
  }
  return Math.floor(numeric);
}

function getStartupCapabilityCacheContext(runtime = globalThis) {
  return {
    userAgent: String(runtime?.navigator?.userAgent || ''),
    appVersion: import.meta.env.VITE_APP_VERSION || 'dev',
    assetVersion: import.meta.env.VITE_APP_ASSET_VERSION || 'dev-unversioned-app',
    wasmAssetVersion: import.meta.env.VITE_WASM_ASSET_VERSION || 'dev-unversioned',
  };
}

function readStartupCapabilityCache(runtime = globalThis, ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS) {
  if (ttlMs <= 0) {
    return null;
  }

  const storage = runtime?.localStorage;
  if (!storage || typeof storage.getItem !== 'function') {
    return null;
  }

  try {
    const raw = storage.getItem(STARTUP_CAPABILITY_CACHE_KEY);
    if (typeof raw !== 'string' || raw.trim().length === 0) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const updatedAtMs = Number(parsed.updatedAtMs);
    if (!Number.isFinite(updatedAtMs)) {
      return null;
    }
    if ((Date.now() - updatedAtMs) > ttlMs) {
      return null;
    }

    const expected = getStartupCapabilityCacheContext(runtime);
    if (
      parsed.userAgent !== expected.userAgent
      || parsed.appVersion !== expected.appVersion
      || parsed.assetVersion !== expected.assetVersion
      || parsed.wasmAssetVersion !== expected.wasmAssetVersion
    ) {
      return null;
    }

    const provider = normalizeExecutionProvider(parsed.resolvedExecutionProvider);
    if (!provider) {
      return null;
    }

    return {
      provider,
      updatedAtMs,
    };
  } catch {
    return null;
  }
}

function writeStartupCapabilityCache(
  resolvedExecutionProvider,
  runtime = globalThis,
  ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
) {
  if (ttlMs <= 0) {
    return;
  }
  const provider = normalizeExecutionProvider(resolvedExecutionProvider);
  if (!provider) {
    return;
  }

  const storage = runtime?.localStorage;
  if (!storage || typeof storage.setItem !== 'function') {
    return;
  }

  try {
    const context = getStartupCapabilityCacheContext(runtime);
    storage.setItem(
      STARTUP_CAPABILITY_CACHE_KEY,
      JSON.stringify({
        updatedAtMs: Date.now(),
        resolvedExecutionProvider: provider,
        ...context,
      }),
    );
  } catch {
    // Best-effort persistence only.
  }
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
  const { probeAttempt: _probeAttempt, probeAttempts: _probeAttempts, ...rest } = eventDetail;

  const gmnetCapability = rest.gmnetCapability && typeof rest.gmnetCapability === 'object'
    ? {
      ...rest.gmnetCapability,
      attempts: Array.isArray(rest.gmnetCapability.attempts)
        ? rest.gmnetCapability.attempts.map((attempt) => (
          attempt && typeof attempt === 'object'
            ? {
              ...attempt,
              error: attempt.error && typeof attempt.error === 'object'
                ? { ...attempt.error }
                : attempt.error,
            }
            : attempt
        ))
        : rest.gmnetCapability.attempts,
    }
    : rest.gmnetCapability;

  return {
    ...rest,
    gmnetCapability,
    diagnostics:
      rest.diagnostics && typeof rest.diagnostics === 'object'
        ? { ...rest.diagnostics }
        : rest.diagnostics,
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

function sanitizeRuntimeInitOptions(rawOptions) {
  if (!rawOptions || typeof rawOptions !== 'object') {
    return {};
  }

  const normalized = {};

  if (typeof rawOptions.smokeAssetPath === 'string') {
    const smokeAssetPath = rawOptions.smokeAssetPath.trim();
    if (smokeAssetPath.length > 0) {
      normalized.smokeAssetPath = smokeAssetPath;
    }
  }

  if (typeof rawOptions.modelVariant === 'string') {
    const modelVariant = rawOptions.modelVariant.trim();
    if (modelVariant.length > 0) {
      normalized.modelVariant = modelVariant;
    }
  }

  const forceSmokeFailure = rawOptions.forceSmokeFailure;
  if (
    forceSmokeFailure === true
    || forceSmokeFailure === 1
    || forceSmokeFailure === '1'
    || (typeof forceSmokeFailure === 'string' && forceSmokeFailure.trim().toLowerCase() === 'true')
  ) {
    normalized.forceSmokeFailure = true;
  }

  if (rawOptions.allowWasmOnly === false) {
    normalized.allowWasmOnly = false;
  }

  if (Array.isArray(rawOptions.forceExecutionProviders) && rawOptions.forceExecutionProviders.length > 0) {
    normalized.forceExecutionProviders = rawOptions.forceExecutionProviders.filter(
      (provider) => typeof provider === 'string' && provider.trim().length > 0,
    );
  }

  if (Array.isArray(rawOptions.smokeBypassProviders) && rawOptions.smokeBypassProviders.length > 0) {
    const smokeBypassProviders = rawOptions.smokeBypassProviders
      .map((provider) => normalizeExecutionProvider(provider))
      .filter(Boolean);
    if (smokeBypassProviders.length > 0) {
      normalized.smokeBypassProviders = Array.from(new Set(smokeBypassProviders));
    }
  }

  return normalized;
}

function readRuntimeInitOptionsFromQuery(runtime = globalThis) {
  const search = typeof runtime?.location?.search === 'string'
    ? runtime.location.search
    : '';
  if (!search) {
    return {};
  }

  try {
    const params = new URLSearchParams(search);
    const smokeAssetPath = params.get('__uhdr_test_smoke_asset_path');
    const modelVariant = params.get('__uhdr_test_model_variant');
    const forceSmokeFailure = params.get('__uhdr_test_force_smoke_failure');
    return sanitizeRuntimeInitOptions({
      smokeAssetPath,
      modelVariant,
      forceSmokeFailure,
    });
  } catch (_error) {
    return {};
  }
}

function getTestRuntimeInitOptions(runtime = globalThis) {
  const queryOptions = readRuntimeInitOptionsFromQuery(runtime);
  const globalOptions = sanitizeRuntimeInitOptions(runtime?.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS);
  const merged = {
    ...queryOptions,
    ...globalOptions,
  };
  return Object.keys(merged).length > 0 ? merged : null;
}

function resolveInferenceTimeoutMs(runtime = globalThis, executionProvider = null) {
  if (normalizeExecutionProvider(executionProvider) === 'wasm') {
    return INFERENCE_TIMEOUT_WASM_MS;
  }
  return isFirefoxRuntime(runtime)
    ? INFERENCE_TIMEOUT_FIREFOX_MS
    : INFERENCE_TIMEOUT_DEFAULT_MS;
}

function resolveWorkerInitTimeoutMs(runtime = globalThis) {
  return isFirefoxRuntime(runtime)
    ? WORKER_INIT_TIMEOUT_FIREFOX_MS
    : WORKER_INIT_TIMEOUT_DEFAULT_MS;
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

async function loadMainThreadProcessImage() {
  const module = await import('./processing-core.js');
  if (typeof module?.processImage !== 'function') {
    throw new Error('Main-thread image processor is unavailable.');
  }
  return module.processImage;
}

async function ensureMainThreadRuntimeInitialized(initOptions = {}) {
  void initOptions;
  if (mainThreadRuntimeError) {
    throw mainThreadRuntimeError;
  }

  if (mainThreadRuntimePromise) {
    return mainThreadRuntimePromise;
  }

  mainThreadRuntimePromise = Promise.resolve({
    requestedExecutionProviders: ['wasm'],
    resolvedExecutionProvider: 'wasm',
    runtimeDegraded: true,
  }).catch((error) => {
    mainThreadRuntimePromise = null;
    mainThreadRuntimeError = error;
    throw error;
  });

  return mainThreadRuntimePromise;
}

function stripMainThreadOnlyOptions(options = {}) {
  const {
    allowMainThreadFallback: _allowMainThreadFallback,
    runtimeInitOptions: _runtimeInitOptions,
    allowWasmOnly: _allowWasmOnly,
    startupCapabilityCacheTtlMs: _startupCapabilityCacheTtlMs,
    ...rest
  } = options || {};
  return rest;
}

function initializeWorkerClient(initOptions = null) {
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

    const explicitRuntimeInitOptions = sanitizeRuntimeInitOptions(initOptions);
    const testRuntimeInitOptions = getTestRuntimeInitOptions(globalThis);
    const runtimeInitOptions = sanitizeRuntimeInitOptions({
      ...(testRuntimeInitOptions || {}),
      ...explicitRuntimeInitOptions,
    });
    const hasRuntimeInitOptions = Object.keys(runtimeInitOptions).length > 0;
    worker.postMessage({
      type: 'init',
      ...(hasRuntimeInitOptions ? { options: runtimeInitOptions } : {}),
    });

    setTimeout(() => {
      if (!ready) {
        const timeoutError = new Error(WORKER_INIT_ERROR);
        timeoutError.name = 'ProcessingWorkerInitTimeout';
        rejectInitialization(timeoutError);
      }
    }, resolveWorkerInitTimeoutMs(globalThis));
  });
}

async function getWorkerClient(initOptions = null) {
  if (workerClientPromise) {
    return workerClientPromise;
  }

  workerClientPromise = initializeWorkerClient(initOptions).catch((error) => {
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
  mainThreadRuntimePromise = null;
  mainThreadRuntimeError = null;
  lastRuntimeInitProgressEvent = null;
}

export async function initializeRuntime(options = {}) {
  const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
  const forceRetry = Boolean(options?.forceRetry);
  const startupCapabilityCacheTtlMs = normalizeStartupCapabilityCacheTtlMs(
    options?.startupCapabilityCacheTtlMs,
  );
  const runtimeInitOptions = sanitizeRuntimeInitOptions({
    ...(options?.runtimeInitOptions || {}),
    ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
  });
  if (!Array.isArray(runtimeInitOptions.smokeBypassProviders) || runtimeInitOptions.smokeBypassProviders.length === 0) {
    const startupCache = readStartupCapabilityCache(globalThis, startupCapabilityCacheTtlMs);
    if (startupCache?.provider) {
      runtimeInitOptions.smokeBypassProviders = [startupCache.provider];
    }
  }
  const allowMainThreadFallback = isMainThreadFallbackEnabled(options);

  if (forceRetry) {
    resetRuntimeInitializationState();
  }

  if (!canUseProcessingWorker() && !allowMainThreadFallback) {
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
    if (canUseProcessingWorker()) {
      const client = await getWorkerClient(runtimeInitOptions);
      const runtimeMetadata = client?.runtime && typeof client.runtime === 'object'
        ? { ...client.runtime }
        : {};
      writeStartupCapabilityCache(
        runtimeMetadata.resolvedExecutionProvider,
        globalThis,
        startupCapabilityCacheTtlMs,
      );
      return {
        ready: true,
        runtimeMode: resolveRuntimeMode(runtimeMetadata.resolvedExecutionProvider, true),
        ...runtimeMetadata,
      };
    }

    const runtimeMetadata = await ensureMainThreadRuntimeInitialized(runtimeInitOptions);
    writeStartupCapabilityCache(
      runtimeMetadata?.resolvedExecutionProvider,
      globalThis,
      startupCapabilityCacheTtlMs,
    );
    return {
      ready: true,
      runtimeMode: resolveRuntimeMode(runtimeMetadata?.resolvedExecutionProvider, false),
      ...runtimeMetadata,
    };
  } finally {
    if (onProgress) {
      runtimeInitProgressListeners.delete(onProgress);
    }
  }
}

export async function processImage(file, options = {}) {
  const allowMainThreadFallback = isMainThreadFallbackEnabled(options);
  const runtimeInitOptions = sanitizeRuntimeInitOptions({
    ...(options?.runtimeInitOptions || {}),
    ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
  });

  if (!canUseProcessingWorker() && !allowMainThreadFallback) {
    const error = createWorkerUnavailableError();
    throw error;
  }

  if (!canUseProcessingWorker()) {
    await ensureMainThreadRuntimeInitialized(runtimeInitOptions);
    const processImageMainThread = await loadMainThreadProcessImage();
    return processImageMainThread(file, stripMainThreadOnlyOptions(options));
  }

  try {
    const client = await getWorkerClient();
    return client.process(file, { ...options });
  } catch (error) {
    if (!allowMainThreadFallback || !isWorkerCompatibilityError(error)) {
      throw error;
    }
    await ensureMainThreadRuntimeInitialized(runtimeInitOptions);
    const processImageMainThread = await loadMainThreadProcessImage();
    return processImageMainThread(file, stripMainThreadOnlyOptions(options));
  }
}
