import { processImage as processImageCore } from './processing-core.js';

const activeJobs = new Map();

function normalizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
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
    self.postMessage({ type: 'ready' });
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
