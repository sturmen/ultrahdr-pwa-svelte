import { processImage as processImageCore } from './processing-core.js';
import { initializeRuntime as initializeRuntimeChecks } from './runtime-initialization.js';

const activeJobs = new Map();
let runtimeInitializationPromise = null;
let runtimeInitializationResult = null;
let runtimeInitializationError = null;

function normalizeExecutionProvider(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizeCapabilityHint(value, fallbackProvider = null) {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const provider = normalizeExecutionProvider(value.provider)
    || normalizeExecutionProvider(fallbackProvider);
  const gainMapMaxLongEdge = Math.floor(Number(value.gainMapMaxLongEdge));
  const outputMaxLongEdge = Math.floor(Number(value.outputMaxLongEdge));
  if (!provider || !Number.isFinite(gainMapMaxLongEdge) || gainMapMaxLongEdge < 1) {
    return null;
  }
  return {
    provider,
    gainMapMaxLongEdge,
    outputMaxLongEdge: Number.isFinite(outputMaxLongEdge) && outputMaxLongEdge > 0
      ? outputMaxLongEdge
      : gainMapMaxLongEdge * 2,
    source: typeof value.source === 'string' && value.source.length > 0
      ? value.source
      : 'cache',
    attempts: Array.isArray(value.attempts) ? value.attempts : [],
  };
}

function normalizeCapabilityHintsByProvider(rawValue) {
  if (!rawValue || typeof rawValue !== 'object') {
    return null;
  }
  const normalized = {};
  for (const [providerKey, providerCapability] of Object.entries(rawValue)) {
    const provider = normalizeExecutionProvider(providerKey);
    const capability = normalizeCapabilityHint(providerCapability, provider);
    if (!provider || !capability) {
      continue;
    }
    normalized[provider] = capability;
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
}

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

function normalizeRuntimeInitializationOptions(rawOptions) {
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

  const gmnetCapabilityHintsByProvider = normalizeCapabilityHintsByProvider(
    rawOptions.gmnetCapabilityHintsByProvider,
  );
  if (gmnetCapabilityHintsByProvider) {
    normalized.gmnetCapabilityHintsByProvider = gmnetCapabilityHintsByProvider;
  }

  return normalized;
}

async function ensureRuntimeInitialized(initOptions = null) {
  if (runtimeInitializationResult) {
    return runtimeInitializationResult;
  }
  if (runtimeInitializationError) {
    throw runtimeInitializationError;
  }
  if (runtimeInitializationPromise) {
    return runtimeInitializationPromise;
  }

  const runtimeInitializationOptions = normalizeRuntimeInitializationOptions(initOptions);

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

async function handleInitMessage(message) {
  try {
    const runtime = await ensureRuntimeInitialized(message?.options);
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
    const runtime = await ensureRuntimeInitialized();
    const file = message.file;
    const options = message.options || {};
    const runtimeCapabilityHint =
      runtime && typeof runtime === 'object' && runtime.gmnetCapability && typeof runtime.gmnetCapability === 'object'
        ? runtime.gmnetCapability
        : null;
    const processOptions =
      options.gmnetCapabilityHint || !runtimeCapabilityHint
        ? options
        : {
          ...options,
          gmnetCapabilityHint: runtimeCapabilityHint,
        };
    const blob = await processImageCore(file, {
      ...processOptions,
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
    void handleInitMessage(message);
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
