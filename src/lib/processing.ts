import {
  PIPELINE_HISTORY_KEY,
  PIPELINE_PROGRESS_EVENT,
  PIPELINE_STATE_KEY,
} from './pipeline-telemetry.js';
import {
  ensureBundleReady,
  setBundleProviderHint,
} from './offline-runtime-bundle.js';
import {
  RUNTIME_INIT_STEP_LABELS,
  RUNTIME_INIT_STEP_ORDER,
  normalizeExecutionProvider,
  sanitizeRuntimeInitOptions,
} from './runtime-contract.ts';
import {
  canUseProcessingWorker,
  resolveInferenceTimeoutMs,
  resolveWorkerInitTimeoutMs,
} from './runtime-capability-policy.ts';
import {
  STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
  normalizeStartupCapabilityCacheTtlMs,
  readStartupCapabilityCache,
  writeStartupCapabilityCache,
} from './runtime-cache-policy.ts';
import {
  decideInitializationPath,
  decideWorkerFallback,
  isMainThreadFallbackEnabled,
} from './runtime-init-policy.ts';
import {
  createWorkerJobState,
  deriveInferenceHeartbeatEvent,
  reduceWorkerJobState,
} from './worker-job-protocol.ts';
import {
  createInitialProcessingRuntimeState,
  reduceProcessingRuntimeState,
} from './processing-runtime-reducer.ts';
import {
  isIOSLikeRuntime,
  isSafariLikeRuntime,
} from './runtime-detection.ts';

const WORKER_SUPPORT_ERROR = 'Processing worker is unavailable in this environment.';
const WORKER_INIT_ERROR = 'Processing worker failed to initialize.';
const WORKER_MESSAGE_ERROR = 'Processing worker returned an unexpected response.';
const WORKER_STALL_ERROR = 'Processing worker stalled before WASM initialization completed.';
const WORKER_WASM_LOAD_TIMEOUT_MS = 20_000;
const RUNTIME_INIT_FAILURE_TRACE_KEY = 'ultrahdr:runtime-init-failures:v1';
const INFERENCE_STAGE_NAME = 'generate-gain-map';
const INFERENCE_HEARTBEAT_INTERVAL_MS = 5_000;
const INFERENCE_START_NOTE = 'Starting inference...';
const INFERENCE_TIMEOUT_ERROR_MESSAGE = 'Processing worker stalled during GMNet inference.';

export {
  RUNTIME_INIT_STEP_LABELS,
  RUNTIME_INIT_STEP_ORDER,
} from './runtime-contract.ts';

function createRuntimeContext() {
  return {
    workerClientPromise: null,
    workerClientCreationError: null,
    lastRuntimeInitProgressEvent: null,
    runtimeInitProgressTrace: [],
    runtimeInitProgressListeners: new Set(),
    mainThreadRuntimePromise: null,
    mainThreadRuntimeError: null,
  };
}

function createRuntimeFailureTraceRecord({
  error,
  startupTrace = [],
  runtime = globalThis,
}) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  return {
    timestamp: Date.now(),
    stepId: error.stepId || null,
    errorCode: error.code || null,
    userMessage: error.userMessage || error.message || null,
    message: error.message || null,
    stackSnippet: error.stackSnippet || null,
    stack: error.stack || null,
    url: runtime?.location?.href || null,
    navigatorOnline: runtime?.navigator?.onLine,
    diagnostics: error.diagnostics && typeof error.diagnostics === 'object'
      ? { ...error.diagnostics }
      : null,
    runtimeInitTrace: Array.isArray(startupTrace) ? startupTrace : [],
  };
}

function readRuntimeFailureTraceHistory(runtime = globalThis) {
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.getItem !== 'function') {
    return [];
  }
  try {
    const raw = storage.getItem(RUNTIME_INIT_FAILURE_TRACE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function writeRuntimeFailureTraceHistory(history, runtime = globalThis) {
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.setItem !== 'function') {
    return;
  }
  try {
    storage.setItem(RUNTIME_INIT_FAILURE_TRACE_KEY, JSON.stringify(history));
  } catch {
    // Best-effort persistence.
  }
}

function storeRuntimeInitializationFailure({ error, startupTrace, runtime = globalThis }) {
  const record = createRuntimeFailureTraceRecord({ error, startupTrace, runtime });
  if (!record) {
    return null;
  }
  const history = readRuntimeFailureTraceHistory(runtime);
  history.push(record);
  while (history.length > 20) {
    history.shift();
  }
  writeRuntimeFailureTraceHistory(history, runtime);
  return record;
}

function cloneRuntimeInitTraceEvent(event = null) {
  if (!event || typeof event !== 'object') {
    return null;
  }
  return {
    ...event,
    diagnostics:
      event.diagnostics && typeof event.diagnostics === 'object'
        ? { ...event.diagnostics }
        : event.diagnostics,
  };
}

function cloneRuntimeInitFailureRecord(record = null) {
  if (!record || typeof record !== 'object') {
    return null;
  }
  return {
    ...record,
    diagnostics:
      record.diagnostics && typeof record.diagnostics === 'object'
        ? { ...record.diagnostics }
        : record.diagnostics,
    runtimeInitTrace: Array.isArray(record.runtimeInitTrace)
      ? record.runtimeInitTrace.map((event) => cloneRuntimeInitProgressEvent(event))
      : [],
  };
}

function cloneRuntimeInitFailureHistory(history = []) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history.map((record) => cloneRuntimeInitFailureRecord(record));
}

function buildWorkerRuntimeCapabilities(runtime = globalThis) {
  return {
    hasWorker: typeof runtime?.Worker === 'function',
  };
}

function isIPhoneWebKitRuntime(runtime = globalThis) {
  if (!isSafariLikeRuntime(runtime) || !isIOSLikeRuntime(runtime)) {
    return false;
  }
  const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
  const platform = String(runtime?.navigator?.platform || '').toLowerCase();
  return (
    userAgent.includes('iphone')
    || platform.includes('iphone')
    || userAgent.includes('ipod')
    || platform.includes('ipod')
  );
}

function buildWorkerInitDiagnostics({
  runtime = globalThis,
  workerInitTimeoutMs = null,
  runtimeInitOptions = null,
  lastRuntimeInitProgressEvent = null,
} = {}) {
  return {
    ...(Number.isFinite(Number(workerInitTimeoutMs))
      ? { workerInitTimeoutMs: Math.floor(Number(workerInitTimeoutMs)) }
      : {}),
    runtimeCapabilities: buildWorkerRuntimeCapabilities(runtime),
    runtimeInitOptions: runtimeInitOptions && typeof runtimeInitOptions === 'object'
      ? { ...runtimeInitOptions }
      : null,
    lastRuntimeInitProgressEvent: cloneRuntimeInitProgressEvent(lastRuntimeInitProgressEvent),
  };
}

function resolveRuntimeMode(resolvedExecutionProvider, workerBacked) {
  const provider = normalizeExecutionProvider(resolvedExecutionProvider);
  if (workerBacked) {
    return provider === 'wasm' ? 'worker-wasm' : 'worker-gpu';
  }
  return 'main-thread-wasm';
}

function getStartupCapabilityCacheContext(runtime = globalThis) {
  return {
    userAgent: String(runtime?.navigator?.userAgent || ''),
    appVersion: import.meta.env.VITE_APP_VERSION || 'dev',
    assetVersion: import.meta.env.VITE_APP_ASSET_VERSION || 'dev-unversioned-app',
    wasmAssetVersion: import.meta.env.VITE_WASM_ASSET_VERSION || 'dev-unversioned',
  };
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

function publishRuntimeInitProgress(context, eventDetail) {
  const detail = cloneRuntimeInitProgressEvent(eventDetail);
  context.lastRuntimeInitProgressEvent = detail;
  if (!Array.isArray(context.runtimeInitProgressTrace)) {
    context.runtimeInitProgressTrace = [];
  }
  context.runtimeInitProgressTrace.push(detail);
  while (context.runtimeInitProgressTrace.length > 120) {
    context.runtimeInitProgressTrace.shift();
  }
  for (const listener of context.runtimeInitProgressListeners) {
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

async function ensureMainThreadRuntimeInitialized(context, initOptions = {}) {
  const runtimeInitOptions = sanitizeRuntimeInitOptions(initOptions);
  const forcedExecutionProviders = Array.isArray(runtimeInitOptions.forceExecutionProviders)
    ? runtimeInitOptions.forceExecutionProviders
      .map((provider) => normalizeExecutionProvider(provider))
      .filter(Boolean)
    : [];
  const requestedExecutionProviders = forcedExecutionProviders.length > 0
    ? forcedExecutionProviders
    : ['wasm'];
  const resolvedExecutionProvider = requestedExecutionProviders[0] || 'wasm';
  if (context.mainThreadRuntimeError) {
    throw context.mainThreadRuntimeError;
  }

  if (context.mainThreadRuntimePromise) {
    return context.mainThreadRuntimePromise;
  }

  context.mainThreadRuntimePromise = Promise.resolve({
    requestedExecutionProviders,
    resolvedExecutionProvider,
    forcedExecutionProviders: forcedExecutionProviders.length > 0 ? forcedExecutionProviders : null,
    preferCompatibilityStartup: runtimeInitOptions.preferCompatibilityStartup === true,
    runtimeDegraded: true,
  }).catch((error) => {
    context.mainThreadRuntimePromise = null;
    context.mainThreadRuntimeError = error;
    throw error;
  });

  return context.mainThreadRuntimePromise;
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

function initializeWorkerClient(context, initOptions = null) {
  if (!canUseProcessingWorker()) {
    return Promise.resolve(null);
  }

  if (context.workerClientCreationError) {
    return Promise.reject(context.workerClientCreationError);
  }

  return new Promise((resolve, reject) => {
    let worker;
    let initializationSettled = false;
    try {
      worker = new Worker(new URL('./processing-worker.ts', import.meta.url), { type: 'module' });
    } catch (error) {
      const wrappedError = new Error(WORKER_INIT_ERROR);
      wrappedError.cause = error;
      wrappedError.name = 'ProcessingWorkerInitError';
      context.workerClientCreationError = wrappedError;
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

    function startInferenceMonitoring(jobId, detail = null) {
      const job = jobs.get(jobId);
      if (!job) {
        return;
      }

      const nowMs = Date.now();
      if (job.inferenceStartedAtMs === null) {
        job.inferenceStartedAtMs = nowMs;
      }
      if (detail && typeof detail === 'object') {
        job.lastProgressDetail = cloneEventDetail(detail);
      }
      const normalizedProvider = normalizeExecutionProvider(detail?.gmnetExecutionProvider);
      if (normalizedProvider) {
        job.gmnetExecutionProvider = normalizedProvider;
        job.inferenceTimeoutMs = resolveInferenceTimeoutMs(globalThis, normalizedProvider);
      }

      if (job.inferenceHeartbeatIntervalId === null) {
        const hasStartNote = typeof detail?.note === 'string'
          && detail.note.toLowerCase().includes('Starting inference');
        if (!hasStartNote) {
          emitProgressToJob(job, deriveInferenceHeartbeatEvent(job, {
            nowMs,
            inferenceStageName: INFERENCE_STAGE_NAME,
            formatInferenceStatusNote,
          }));
        }

        job.inferenceHeartbeatIntervalId = setInterval(() => {
          const pendingJob = jobs.get(jobId);
          if (!pendingJob) {
            return;
          }
          emitProgressToJob(pendingJob, deriveInferenceHeartbeatEvent(pendingJob, {
            nowMs: Date.now(),
            inferenceStageName: INFERENCE_STAGE_NAME,
            formatInferenceStatusNote,
          }));
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
        context.workerClientCreationError = error;
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
        publishRuntimeInitProgress(context, message.event);
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
                  ...createWorkerJobState({
                    onProgress: typeof options?.onProgress === 'function' ? options.onProgress : null,
                    abortSignal,
                    abortListener,
                    wasmLoadTimeoutId,
                    inferenceTimeoutMs: resolveInferenceTimeoutMs(),
                    nowMs: Date.now(),
                  }),
                  resolve: jobResolve,
                  reject: jobReject,
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
        const reduced = reduceWorkerJobState(job, {
          type: 'WORKER_PROGRESS',
          detail,
          nowMs: Date.now(),
          inferenceStageName: INFERENCE_STAGE_NAME,
          resolveInferenceTimeoutMs: (provider) => resolveInferenceTimeoutMs(globalThis, provider),
        });
        jobs.set(jobId, { ...job, ...reduced.state });
        const updatedJob = jobs.get(jobId);
        for (const command of reduced.commands) {
          switch (command) {
            case 'CLEAR_WASM_TIMEOUT':
              if (updatedJob.wasmLoadTimeoutId !== null) {
                clearTimeout(updatedJob.wasmLoadTimeoutId);
                updatedJob.wasmLoadTimeoutId = null;
              }
              break;
            case 'START_INFERENCE_MONITORING':
              startInferenceMonitoring(jobId, detail);
              break;
            case 'STOP_INFERENCE_MONITORING':
              clearInferenceMonitoring(updatedJob);
              break;
            default:
              throw new Error(`Unknown worker job command: ${String(command)}`);
          }
        }
        emitProgressToJob(updatedJob, detail);
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
    const workerInitTimeoutMs = resolveWorkerInitTimeoutMs(globalThis);
    const hasRuntimeInitOptions = Object.keys(runtimeInitOptions).length > 0;
    worker.postMessage({
      type: 'init',
      ...(hasRuntimeInitOptions ? { options: runtimeInitOptions } : {}),
    });

    setTimeout(() => {
      if (!ready) {
        const timeoutError = new Error(WORKER_INIT_ERROR);
        timeoutError.name = 'ProcessingWorkerInitTimeout';
        timeoutError.code = 'RUNTIME_INIT_WORKER_INIT_TIMEOUT';
        timeoutError.stepId = 'onnx-load';
        timeoutError.userMessage = 'Processing worker failed to initialize before startup timed out.';
        timeoutError.diagnostics = buildWorkerInitDiagnostics({
          runtime: globalThis,
          workerInitTimeoutMs,
          runtimeInitOptions,
          lastRuntimeInitProgressEvent: context.lastRuntimeInitProgressEvent,
        });
        rejectInitialization(timeoutError);
      }
    }, workerInitTimeoutMs);
  });
}

async function getWorkerClient(context, initOptions = null) {
  if (context.workerClientPromise) {
    return context.workerClientPromise;
  }

  context.workerClientPromise = initializeWorkerClient(context, initOptions).catch((error) => {
    context.workerClientPromise = null;
    context.workerClientCreationError = error;
    throw error;
  });

  return context.workerClientPromise;
}

function createWorkerUnavailableError() {
  const error = new Error(WORKER_SUPPORT_ERROR);
  error.name = 'ProcessingWorkerUnavailableError';
  return error;
}

function resetRuntimeInitializationState(context) {
  context.workerClientPromise = null;
  context.workerClientCreationError = null;
  context.mainThreadRuntimePromise = null;
  context.mainThreadRuntimeError = null;
  context.lastRuntimeInitProgressEvent = null;
  context.runtimeInitProgressTrace = [];
}

async function initializeRuntimeInternal(context, options = {}) {
  const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
  const forceRetry = Boolean(options?.forceRetry);
  const startupCapabilityCacheTtlMs = normalizeStartupCapabilityCacheTtlMs(
    options?.startupCapabilityCacheTtlMs,
  );
  const allowMainThreadFallback = isMainThreadFallbackEnabled(options);
  const requestedRuntimeInitOptions = sanitizeRuntimeInitOptions({
    ...(options?.runtimeInitOptions || {}),
    ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
  });
  const offlineStartup = globalThis?.navigator?.onLine === false;
  const preferOfflineCompatibilityStartup = offlineStartup
    && allowMainThreadFallback
    && isIPhoneWebKitRuntime(globalThis);
  const runtimeInitOptions = sanitizeRuntimeInitOptions({
    ...requestedRuntimeInitOptions,
    ...(preferOfflineCompatibilityStartup
      ? {
        preferCompatibilityStartup: true,
        forceExecutionProviders: ['wasm'],
      }
      : {}),
  });
  const startupCapabilityContext = getStartupCapabilityCacheContext(globalThis);
  if (!Array.isArray(runtimeInitOptions.smokeBypassProviders) || runtimeInitOptions.smokeBypassProviders.length === 0) {
    const startupCache = readStartupCapabilityCache(globalThis, {
      ttlMs: startupCapabilityCacheTtlMs,
      expectedContext: startupCapabilityContext,
    });
    if (startupCache?.provider) {
      runtimeInitOptions.smokeBypassProviders = [startupCache.provider];
    }
  }
  const workerSupported = canUseProcessingWorker();
  const forcedExecutionProviders = Array.isArray(runtimeInitOptions.forceExecutionProviders)
    ? runtimeInitOptions.forceExecutionProviders
      .map((provider) => normalizeExecutionProvider(provider))
      .filter(Boolean)
    : [];
  const workerBypassedReason = preferOfflineCompatibilityStartup
    ? 'offline-iphone-webkit-compatibility-startup'
    : null;
  const initPath = preferOfflineCompatibilityStartup
    ? 'main-thread'
    : decideInitializationPath({
      workerSupported,
      allowMainThreadFallback,
    });
  let startupPath = initPath === 'worker'
    ? 'worker'
    : preferOfflineCompatibilityStartup
      ? 'main-thread-offline-compat'
      : 'main-thread';
  const bundleReadiness = await ensureBundleReady({ runtime: globalThis });
  const offlineBundleDecision = {
    ready: bundleReadiness?.ready === true,
    blocked: bundleReadiness?.blocked === true,
    state: bundleReadiness?.state || null,
    bundleVersion: bundleReadiness?.bundleVersion || null,
    diagnostics: bundleReadiness?.diagnostics || null,
  };

  if (!bundleReadiness?.ready) {
    const blocked = bundleReadiness?.blocked === true;
    const error = new Error(
      blocked
        ? 'Runtime bundle is not ready for offline startup.'
        : 'Runtime bundle preparation failed.',
    );
    error.name = 'RuntimeInitializationError';
    error.code = blocked
      ? 'RUNTIME_INIT_OFFLINE_BUNDLE_NOT_READY'
      : 'RUNTIME_INIT_BUNDLE_REPAIR_FAILED';
    error.stepId = 'onnx-load';
    error.userMessage = blocked
      ? 'Offline startup is blocked until the runtime bundle is prepared online.'
      : 'Runtime bundle preparation failed. Retry initialization while online.';
    error.diagnostics = {
      offlineStartup,
      startupPath,
      workerBypassedReason,
      forcedExecutionProviders,
      bundleState: bundleReadiness?.state || null,
      bundleVersion: bundleReadiness?.bundleVersion || null,
      bundleValidatedAtMs: bundleReadiness?.validatedAtMs || null,
      bundleDiagnostics: bundleReadiness?.diagnostics || null,
      offlineBundleDecision,
    };
    throw error;
  }

  if (forceRetry) {
    resetRuntimeInitializationState(context);
  }

  if (initPath === 'error') {
    const error = createWorkerUnavailableError();
    error.code = 'RUNTIME_INIT_WORKER_UNAVAILABLE';
    error.userMessage = 'Processing worker support is unavailable in this environment.';
    error.stepId = 'webgpu-check';
    error.diagnostics = {
      hasWorker: typeof globalThis?.Worker === 'function',
    };
    throw error;
  }

  if (onProgress) {
    context.runtimeInitProgressListeners.add(onProgress);
    if (context.lastRuntimeInitProgressEvent) {
      onProgress(cloneRuntimeInitProgressEvent(context.lastRuntimeInitProgressEvent));
    }
  }

  try {
    if (initPath === 'worker') {
      try {
        const client = await getWorkerClient(context, runtimeInitOptions);
        const runtimeMetadata = client?.runtime && typeof client.runtime === 'object'
          ? { ...client.runtime }
          : {};
        writeStartupCapabilityCache(
          runtimeMetadata.resolvedExecutionProvider,
          globalThis,
          {
            ttlMs: startupCapabilityCacheTtlMs,
            context: startupCapabilityContext,
          },
        );
        await setBundleProviderHint(runtimeMetadata.resolvedExecutionProvider, globalThis);
        return {
          ready: true,
          runtimeMode: resolveRuntimeMode(runtimeMetadata.resolvedExecutionProvider, true),
          offlineStartup,
          startupPath,
          workerBypassedReason,
          forcedExecutionProviders,
          bundleState: bundleReadiness.state || null,
          bundleVersion: bundleReadiness.bundleVersion || null,
          bundleValidatedAtMs: bundleReadiness.validatedAtMs || null,
          ...runtimeMetadata,
        };
      } catch (error) {
        if (
          offlineStartup
          && decideWorkerFallback({ allowMainThreadFallback, error }) === 'fallback'
        ) {
          const fallbackRuntimeOptions = sanitizeRuntimeInitOptions({
            ...runtimeInitOptions,
            preferCompatibilityStartup: true,
            forceExecutionProviders: ['wasm'],
          });
          const runtimeMetadata = await ensureMainThreadRuntimeInitialized(context, fallbackRuntimeOptions);
          startupPath = 'main-thread-offline-worker-fallback';
          await setBundleProviderHint(runtimeMetadata?.resolvedExecutionProvider, globalThis);
          return {
            ready: true,
            runtimeMode: resolveRuntimeMode(runtimeMetadata?.resolvedExecutionProvider, false),
            offlineStartup,
            startupPath,
            workerBypassedReason: 'offline-worker-init-fallback',
            forcedExecutionProviders: ['wasm'],
            bundleState: bundleReadiness.state || null,
            bundleVersion: bundleReadiness.bundleVersion || null,
            bundleValidatedAtMs: bundleReadiness.validatedAtMs || null,
            ...runtimeMetadata,
          };
        }
        throw error;
      }
    }

    const runtimeMetadata = await ensureMainThreadRuntimeInitialized(context, runtimeInitOptions);
    writeStartupCapabilityCache(
      runtimeMetadata?.resolvedExecutionProvider,
      globalThis,
      {
        ttlMs: startupCapabilityCacheTtlMs,
        context: startupCapabilityContext,
      },
    );
    await setBundleProviderHint(runtimeMetadata?.resolvedExecutionProvider, globalThis);
    return {
      ready: true,
      runtimeMode: resolveRuntimeMode(runtimeMetadata?.resolvedExecutionProvider, false),
      offlineStartup,
      startupPath,
      workerBypassedReason,
      forcedExecutionProviders,
      bundleState: bundleReadiness.state || null,
      bundleVersion: bundleReadiness.bundleVersion || null,
      bundleValidatedAtMs: bundleReadiness.validatedAtMs || null,
      ...runtimeMetadata,
    };
  } catch (error) {
    if (error && typeof error === 'object') {
      const runtimeInitProgressTrace = Array.isArray(context.runtimeInitProgressTrace)
        ? context.runtimeInitProgressTrace.map((event) => cloneRuntimeInitProgressEvent(event))
        : [];
      const persistedRecord = storeRuntimeInitializationFailure({
        error,
        startupTrace: runtimeInitProgressTrace,
        runtime: globalThis,
      });
      const runtimeInitFailureHistory = cloneRuntimeInitFailureHistory(
        readRuntimeFailureTraceHistory(globalThis),
      );
      error.runtimeInitProgressTrace = runtimeInitProgressTrace;
      error.runtimeInitFailureHistory = runtimeInitFailureHistory;
      error.diagnostics = {
        ...(error.diagnostics || {}),
        offlineStartup,
        startupPath,
        workerBypassedReason,
        forcedExecutionProviders,
        offlineBundleDecision,
        bundleState: bundleReadiness?.state || null,
        bundleVersion: bundleReadiness?.bundleVersion || null,
        runtimeInitProgressTrace,
        runtimeInitFailureHistory,
      };
      if (persistedRecord) {
        error.diagnostics.runtimeInitFailureHistoryRecordCount = runtimeInitFailureHistory.length;
      }
    }
    throw error;
  } finally {
    if (onProgress) {
      context.runtimeInitProgressListeners.delete(onProgress);
    }
  }
}

async function processImageInternal(context, file, options = {}) {
  const allowMainThreadFallback = isMainThreadFallbackEnabled(options);
  const workerSupported = canUseProcessingWorker();
  const initPath = decideInitializationPath({
    workerSupported,
    allowMainThreadFallback,
  });
  const runtimeInitOptions = sanitizeRuntimeInitOptions({
    ...(options?.runtimeInitOptions || {}),
    ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
  });

  if (initPath === 'error') {
    const error = createWorkerUnavailableError();
    throw error;
  }

  if (initPath === 'main-thread') {
    await ensureMainThreadRuntimeInitialized(context, runtimeInitOptions);
    const processImageMainThread = await loadMainThreadProcessImage();
    return processImageMainThread(file, stripMainThreadOnlyOptions(options));
  }

  try {
    const client = await getWorkerClient(context);
    return client.process(file, { ...options });
  } catch (error) {
    if (decideWorkerFallback({ allowMainThreadFallback, error }) !== 'fallback') {
      throw error;
    }
    await ensureMainThreadRuntimeInitialized(context, runtimeInitOptions);
    const processImageMainThread = await loadMainThreadProcessImage();
    return processImageMainThread(file, stripMainThreadOnlyOptions(options));
  }
}

export function createProcessingRuntime(dependencies = {}) {
  const reducer = typeof dependencies.reducer === 'function'
    ? dependencies.reducer
    : reduceProcessingRuntimeState;
  const initializeRuntimeInternalImpl =
    typeof dependencies.initializeRuntimeInternal === 'function'
      ? dependencies.initializeRuntimeInternal
      : initializeRuntimeInternal;
  const processImageInternalImpl =
    typeof dependencies.processImageInternal === 'function'
      ? dependencies.processImageInternal
      : processImageInternal;
  const listeners = new Set();
  const runtimeContext = createRuntimeContext();
  let snapshot = createInitialProcessingRuntimeState();
  let disposed = false;

  function reduceRuntimeSnapshot(currentSnapshot, patch) {
    return {
      ...currentSnapshot,
      ...patch,
    };
  }

  function emit(nextPartial) {
    snapshot = reduceRuntimeSnapshot(snapshot, nextPartial);
    for (const listener of listeners) {
      try {
        listener(snapshot);
      } catch {
        // Ignore listener errors.
      }
    }
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  async function initialize(options = {}) {
    if (disposed) {
      throw new Error('Processing runtime has been disposed.');
    }

    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
    const passthroughOptions = {
      ...options,
      onProgress: (event) => {
        const progressReduced = reducer(snapshot, {
          type: 'PROGRESS_EVENT',
          detail: event,
        });
        emit(progressReduced.state);
        if (onProgress) {
          onProgress(event);
        }
      },
    };

    const initRequested = reducer(snapshot, {
      type: 'INIT_REQUESTED',
      options: passthroughOptions,
    });
    emit(initRequested.state);

    try {
      const runtime = await interpretRuntimeCommands(initRequested.commands, {
        runtimeContext,
        initializeOptions: passthroughOptions,
        processFile: null,
      });
      const success = reducer(snapshot, {
        type: 'INIT_SUCCEEDED',
        runtime,
      });
      emit(success.state);
      return runtime;
    } catch (error) {
      const failed = reducer(snapshot, {
        type: 'INIT_FAILED',
        error,
      });
      emit(failed.state);
      throw error;
    }
  }

  async function process(file, options = {}) {
    if (disposed) {
      throw new Error('Processing runtime has been disposed.');
    }
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
    const passthroughOptions = {
      ...options,
      onProgress: (event) => {
        const progressReduced = reducer(snapshot, {
          type: 'PROGRESS_EVENT',
          detail: event,
        });
        emit(progressReduced.state);
        if (onProgress) {
          onProgress(event);
        }
      },
    };
    const requested = reducer(snapshot, {
      type: 'PROCESS_REQUESTED',
      file,
      options: passthroughOptions,
    });
    emit(requested.state);
    try {
      const result = await interpretRuntimeCommands(requested.commands, {
        runtimeContext,
        initializeOptions: passthroughOptions,
        processFile: file,
      });
      const success = reducer(snapshot, {
        type: 'PROCESS_SUCCEEDED',
      });
      emit(success.state);
      return result;
    } catch (error) {
      const failed = reducer(snapshot, {
        type: 'PROCESS_FAILED',
        error,
      });
      emit(failed.state);
      throw error;
    }
  }

  async function dispose() {
    disposed = true;
    resetRuntimeInitializationState(runtimeContext);
    const reduced = reducer(snapshot, { type: 'DISPOSED' });
    emit(reduced.state);
  }

  function getSnapshot() {
    return {
      ...snapshot,
    };
  }

  function getRuntimeInitProgressTrace() {
    return Array.isArray(runtimeContext.runtimeInitProgressTrace)
      ? runtimeContext.runtimeInitProgressTrace.map((event) => cloneRuntimeInitProgressEvent(event))
      : [];
  }

  function getRuntimeInitFailureHistory() {
    return cloneRuntimeInitFailureHistory(readRuntimeFailureTraceHistory(globalThis));
  }

  return {
    initialize,
    process,
    subscribe,
    getSnapshot,
    getRuntimeInitProgressTrace,
    getRuntimeInitFailureHistory,
    dispose,
  };

  async function interpretRuntimeCommands(commands, {
    runtimeContext: runtimeContextForCommands,
    initializeOptions,
    processFile,
  }) {
    let lastResult;
    for (const command of Array.isArray(commands) ? commands : []) {
      switch (command?.type) {
        case 'INIT_RUNTIME':
          lastResult = await initializeRuntimeInternalImpl(
            runtimeContextForCommands,
            command.options || initializeOptions || {},
          );
          break;
        case 'PROCESS_IMAGE':
          lastResult = await processImageInternalImpl(
            runtimeContextForCommands,
            command.file || processFile,
            command.options || initializeOptions || {},
          );
          break;
        default:
          throw new Error(`Unknown runtime command: ${String(command?.type || 'undefined')}`);
      }
    }
    return lastResult;
  }
}
