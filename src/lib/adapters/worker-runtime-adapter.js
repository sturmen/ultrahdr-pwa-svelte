import { sanitizeRuntimeInitOptions } from '../runtime-contract.js';

export function createWorkerRuntimeAdapter({
  canUseProcessingWorker,
  getWorkerClient,
  createWorkerUnavailableError,
}) {
  return {
    async initialize(options = {}) {
      const allowMainThreadFallback = options?.allowMainThreadFallback !== false;
      const runtimeInitOptions = sanitizeRuntimeInitOptions({
        ...(options?.runtimeInitOptions || {}),
        ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
      });

      if (!canUseProcessingWorker() && !allowMainThreadFallback) {
        throw createWorkerUnavailableError();
      }
      if (!canUseProcessingWorker()) {
        const error = createWorkerUnavailableError();
        error.code = 'RUNTIME_INIT_WORKER_UNAVAILABLE';
        throw error;
      }

      const client = await getWorkerClient(runtimeInitOptions);
      const runtimeMetadata = client?.runtime && typeof client.runtime === 'object'
        ? { ...client.runtime }
        : {};

      return {
        ready: true,
        ...runtimeMetadata,
        runtimeMode: runtimeMetadata?.resolvedExecutionProvider === 'wasm'
          ? 'worker-wasm'
          : 'worker-gpu',
      };
    },

    async process(file, options = {}) {
      const client = await getWorkerClient();
      return client.process(file, { ...options });
    },

    async dispose() {
      // Existing worker lifecycle is shared and process-lifetime scoped.
    },
  };
}
