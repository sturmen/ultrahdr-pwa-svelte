import { processImage as processImageCore } from './processing-core.js';
import { initializeRuntime as initializeRuntimeChecks } from './runtime-initialization.js';

const activeJobs = new Map();
let runtimeInitializationPromise = null;
let runtimeInitializationResult = null;
let runtimeInitializationError = null;

function normalizeError(error) {
  if (error instanceof Error) {
    const normalized = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    if (typeof error.code === 'string') {
      normalized.code = error.code;
    }
    if (typeof error.stepId === 'string') {
      normalized.stepId = error.stepId;
    }
    if (typeof error.userMessage === 'string') {
      normalized.userMessage = error.userMessage;
    }
    if (error.diagnostics && typeof error.diagnostics === 'object') {
      normalized.diagnostics = error.diagnostics;
    }
    if (typeof error.stackSnippet === 'string') {
      normalized.stackSnippet = error.stackSnippet;
    }
    return normalized;
  }

  return {
    name: 'Error',
    message: String(error),
    stack: null,
  };
}

function postError(jobId, error) {
  self.postMessage({
    type: 'error',
    jobId,
    error: normalizeError(error),
  });
}

function postInitError(error) {
  self.postMessage({
    type: 'init-error',
    error: normalizeError(error),
  });
}

async function ensureRuntimeInitialized() {
  if (runtimeInitializationResult) {
    return runtimeInitializationResult;
  }
  if (runtimeInitializationError) {
    throw runtimeInitializationError;
  }
  if (runtimeInitializationPromise) {
    return runtimeInitializationPromise;
  }

  runtimeInitializationPromise = initializeRuntimeChecks({
    onProgress: (event) => {
      self.postMessage({
        type: 'init-progress',
        event,
      });
    },
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

async function handleInitMessage() {
  try {
    const runtime = await ensureRuntimeInitialized();
    self.postMessage({ type: 'ready', runtime });
  } catch (error) {
    postInitError(error);
  }
}

async function handleProcessMessage(message) {
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

self.addEventListener('message', (event) => {
  const message = event?.data;
  if (!message || typeof message !== 'object') {
    return;
  }

  if (message.type === 'init') {
    void handleInitMessage();
    return;
  }

  if (message.type === 'cancel') {
    const jobId = Number(message.jobId);
    const controller = activeJobs.get(jobId);
    if (controller) {
      controller.abort();
    }
    return;
  }

  if (message.type === 'process') {
    void handleProcessMessage(message);
  }
});
