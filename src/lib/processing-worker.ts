import { sanitizeRuntimeInitOptions } from './runtime-contract.ts';

type SharedWorkerState = {
  activeJobs: Map<number, AbortController>;
  completedJobs: Map<number, number>;
  runtimeInitializationPromise: Promise<Record<string, unknown>> | null;
  runtimeInitializationResult: Record<string, unknown> | null;
  runtimeInitializationError: unknown;
  processingCoreModulePromise: Promise<typeof import('./processing-core.ts')> | null;
  runtimeInitializationModulePromise: Promise<typeof import('./runtime-initialization.ts')> | null;
};

function getSharedWorkerState(): SharedWorkerState {
  const workerSelf = self as typeof self & {
    __ULTRAHDR_PROCESSING_WORKER_STATE__?: SharedWorkerState;
  };
  if (!workerSelf.__ULTRAHDR_PROCESSING_WORKER_STATE__) {
    workerSelf.__ULTRAHDR_PROCESSING_WORKER_STATE__ = {
      activeJobs: new Map<number, AbortController>(),
      completedJobs: new Map<number, number>(),
      runtimeInitializationPromise: null,
      runtimeInitializationResult: null,
      runtimeInitializationError: null,
      processingCoreModulePromise: null,
      runtimeInitializationModulePromise: null,
    };
  }
  return workerSelf.__ULTRAHDR_PROCESSING_WORKER_STATE__;
}

type WorkerMessage =
  | { type: 'init'; options?: Record<string, unknown> }
  | { type: 'cancel'; jobId: number }
  | { type: 'process'; jobId: number; file: File; options?: Record<string, unknown> };

function markJobCompleted(jobId: number): void {
  const state = getSharedWorkerState();
  state.completedJobs.set(jobId, Date.now());
  if (state.completedJobs.size > 100) {
    const oldestEntry = state.completedJobs.keys().next();
    if (!oldestEntry.done) {
      state.completedJobs.delete(oldestEntry.value);
    }
  }
}

function emitModuleLoadEvent(
  type: 'init-progress' | 'progress',
  {
    jobId = null,
    status,
    moduleName,
  }: {
    jobId?: number | null;
    status: 'running' | 'passed' | 'failed';
    moduleName: string;
  },
): void {
  const event = {
    stepId: 'worker-module-load',
    status,
    note: `${status === 'running' ? 'Loading' : status === 'passed' ? 'Loaded' : 'Failed to load'} ${moduleName}.`,
    moduleName,
    timestamp: Date.now(),
  };

  if (type === 'progress' && typeof jobId === 'number') {
    self.postMessage({
      type,
      jobId,
      event,
    });
    return;
  }

  self.postMessage({
    type,
    event,
  });
}

async function loadRuntimeInitializationModule(): Promise<typeof import('./runtime-initialization.ts')> {
  const state = getSharedWorkerState();
  if (!state.runtimeInitializationModulePromise) {
    emitModuleLoadEvent('init-progress', {
      status: 'running',
      moduleName: 'runtime initialization module',
    });
    state.runtimeInitializationModulePromise = import('./runtime-initialization.ts')
      .then((module) => {
        emitModuleLoadEvent('init-progress', {
          status: 'passed',
          moduleName: 'runtime initialization module',
        });
        return module;
      })
      .catch((error: unknown) => {
        emitModuleLoadEvent('init-progress', {
          status: 'failed',
          moduleName: 'runtime initialization module',
        });
        state.runtimeInitializationModulePromise = null;
        throw error;
      });
  }
  return state.runtimeInitializationModulePromise;
}

async function loadProcessingCoreModule(jobId: number): Promise<typeof import('./processing-core.ts')> {
  const state = getSharedWorkerState();
  if (!state.processingCoreModulePromise) {
    emitModuleLoadEvent('progress', {
      jobId,
      status: 'running',
      moduleName: 'processing core module',
    });
    state.processingCoreModulePromise = import('./processing-core.ts')
      .then((module) => {
        emitModuleLoadEvent('progress', {
          jobId,
          status: 'passed',
          moduleName: 'processing core module',
        });
        return module;
      })
      .catch((error: unknown) => {
        emitModuleLoadEvent('progress', {
          jobId,
          status: 'failed',
          moduleName: 'processing core module',
        });
        state.processingCoreModulePromise = null;
        throw error;
      });
  }
  return state.processingCoreModulePromise;
}

function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const normalized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    if (typeof (error as { code?: unknown }).code === 'string') {
      normalized.code = (error as { code?: string }).code;
    }
    if (typeof (error as { stepId?: unknown }).stepId === 'string') {
      normalized.stepId = (error as { stepId?: string }).stepId;
    }
    if (typeof (error as { userMessage?: unknown }).userMessage === 'string') {
      normalized.userMessage = (error as { userMessage?: string }).userMessage;
    }
    if ((error as { diagnostics?: unknown }).diagnostics && typeof (error as { diagnostics?: unknown }).diagnostics === 'object') {
      normalized.diagnostics = (error as { diagnostics?: Record<string, unknown> }).diagnostics;
    }
    if (typeof (error as { stackSnippet?: unknown }).stackSnippet === 'string') {
      normalized.stackSnippet = (error as { stackSnippet?: string }).stackSnippet;
    }
    return normalized;
  }

  return {
    name: 'Error',
    message: String(error),
    stack: null,
  };
}

function postError(jobId: number, error: unknown): void {
  self.postMessage({
    type: 'error',
    jobId,
    error: normalizeError(error),
  });
}

function postInitError(error: unknown): void {
  self.postMessage({
    type: 'init-error',
    error: normalizeError(error),
  });
}

async function ensureRuntimeInitialized(initOptions: Record<string, unknown> | null = null): Promise<Record<string, unknown>> {
  const state = getSharedWorkerState();
  if (state.runtimeInitializationResult) {
    return state.runtimeInitializationResult;
  }
  if (state.runtimeInitializationError) {
    throw state.runtimeInitializationError;
  }
  if (state.runtimeInitializationPromise) {
    return state.runtimeInitializationPromise;
  }

  const runtimeInitializationOptions = sanitizeRuntimeInitOptions(initOptions);
  const runtimeInitializationModule = await loadRuntimeInitializationModule();

  state.runtimeInitializationPromise = runtimeInitializationModule.initializeRuntime({
    onProgress: (event) => {
      self.postMessage({
        type: 'init-progress',
        event,
      });
    },
    ...runtimeInitializationOptions,
  })
    .then((result) => {
      state.runtimeInitializationResult = result || {};
      state.runtimeInitializationError = null;
      return state.runtimeInitializationResult;
    })
    .catch((error) => {
      state.runtimeInitializationResult = null;
      state.runtimeInitializationError = error;
      throw error;
    })
    .finally(() => {
      state.runtimeInitializationPromise = null;
    });

  return state.runtimeInitializationPromise;
}

async function handleInitMessage(message: Extract<WorkerMessage, { type: 'init' }>): Promise<void> {
  try {
    const runtime = await ensureRuntimeInitialized(message?.options || null);
    self.postMessage({ type: 'ready', runtime });
  } catch (error) {
    postInitError(error);
  }
}

async function handleProcessMessage(message: Extract<WorkerMessage, { type: 'process' }>): Promise<void> {
  const jobId = Number(message?.jobId);
  if (!Number.isFinite(jobId)) {
    return;
  }

  const state = getSharedWorkerState();
  if (state.activeJobs.has(jobId)) {
    return;
  }
  if (state.completedJobs.has(jobId)) {
    return;
  }

  const controller = new AbortController();
  state.activeJobs.set(jobId, controller);

  try {
    await ensureRuntimeInitialized();
    const file = message.file;
    const options = message.options || {};
    const processingCoreModule = await loadProcessingCoreModule(jobId);
    const blob = await processingCoreModule.processImage(file, {
      ...options,
      abortSignal: controller.signal,
      onProgress: (event) => {
        self.postMessage({ type: 'progress', jobId, event });
      },
    });

    const buffer = await blob.arrayBuffer();
    self.postMessage(
      {
        type: 'result',
        jobId,
        mimeType: blob.type || 'image/jpeg',
        buffer,
      },
      [buffer],
    );
  } catch (error) {
    postError(jobId, error);
  } finally {
    state.activeJobs.delete(jobId);
    markJobCompleted(jobId);
  }
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const message = event?.data;
  if (!message || typeof message !== 'object') {
    return;
  }

  if (message.type === 'init') {
    void handleInitMessage(message);
    return;
  }

  if (message.type === 'cancel') {
    const controller = getSharedWorkerState().activeJobs.get(Number(message.jobId));
    if (controller) {
      controller.abort();
    }
    return;
  }

  if (message.type === 'process') {
    void handleProcessMessage(message);
  }
});
