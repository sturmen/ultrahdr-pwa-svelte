import { processImage as processImageCore } from './processing-core.ts';
import { initializeRuntime as initializeRuntimeChecks } from './runtime-initialization.ts';
import { sanitizeRuntimeInitOptions } from './runtime-contract.ts';

const activeJobs = new Map<number, AbortController>();
let runtimeInitializationPromise: Promise<Record<string, unknown>> | null = null;
let runtimeInitializationResult: Record<string, unknown> | null = null;
let runtimeInitializationError: unknown = null;

type WorkerMessage =
  | { type: 'init'; options?: Record<string, unknown> }
  | { type: 'cancel'; jobId: number }
  | { type: 'process'; jobId: number; file: File; options?: Record<string, unknown> };

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
  if (runtimeInitializationResult) {
    return runtimeInitializationResult;
  }
  if (runtimeInitializationError) {
    throw runtimeInitializationError;
  }
  if (runtimeInitializationPromise) {
    return runtimeInitializationPromise;
  }

  const runtimeInitializationOptions = sanitizeRuntimeInitOptions(initOptions);

  runtimeInitializationPromise = initializeRuntimeChecks({
    onProgress: (event) => {
      self.postMessage({
        type: 'init-progress',
        event,
      });
    },
    ...runtimeInitializationOptions,
  })
    .then((result) => {
      runtimeInitializationResult = result || {};
      runtimeInitializationError = null;
      return runtimeInitializationResult;
    })
    .catch((error) => {
      runtimeInitializationResult = null;
      runtimeInitializationError = error;
      throw error;
    })
    .finally(() => {
      runtimeInitializationPromise = null;
    });

  return runtimeInitializationPromise;
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

  if (activeJobs.has(jobId)) {
    postError(jobId, new Error(`Duplicate processing job id: ${jobId}`));
    return;
  }

  const controller = new AbortController();
  activeJobs.set(jobId, controller);

  try {
    await ensureRuntimeInitialized();
    const file = message.file;
    const options = message.options || {};
    const blob = await processImageCore(file, {
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
    activeJobs.delete(jobId);
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
    const controller = activeJobs.get(Number(message.jobId));
    if (controller) {
      controller.abort();
    }
    return;
  }

  if (message.type === 'process') {
    void handleProcessMessage(message);
  }
});
