import { sanitizeRuntimeInitOptions } from '../runtime-contract.ts';

export interface WorkerRuntimeAdapterDependencies {
  canUseProcessingWorker: () => boolean;
  getWorkerClient: (options?: Record<string, unknown>) => Promise<{ runtime?: Record<string, unknown>; process: (file: File, options: Record<string, unknown>) => Promise<Blob> }>;
  createWorkerUnavailableError: () => Error;
}

export function createWorkerRuntimeAdapter({
  canUseProcessingWorker,
  getWorkerClient,
  createWorkerUnavailableError,
}: WorkerRuntimeAdapterDependencies) {
  return {
    async initialize(options: Record<string, unknown> = {}) {
      const optionRecord = options as Record<string, unknown> & {
        runtimeInitOptions?: Record<string, unknown>;
        allowWasmOnly?: boolean;
      };
      const allowMainThreadFallback = (options as { allowMainThreadFallback?: boolean })?.allowMainThreadFallback !== false;
      const runtimeInitOptions = sanitizeRuntimeInitOptions({
        ...(optionRecord.runtimeInitOptions || {}),
        ...(optionRecord.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
      });

      if (!canUseProcessingWorker() && !allowMainThreadFallback) {
        throw createWorkerUnavailableError();
      }
      if (!canUseProcessingWorker()) {
        const error = createWorkerUnavailableError();
        (error as Error & { code?: string }).code = 'RUNTIME_INIT_WORKER_UNAVAILABLE';
        throw error;
      }

      const client = await getWorkerClient(runtimeInitOptions);
      const runtimeMetadata = client?.runtime && typeof client.runtime === 'object'
        ? { ...client.runtime } as Record<string, unknown>
        : {};

      return {
        ready: true,
        ...runtimeMetadata,
        runtimeMode: runtimeMetadata?.resolvedExecutionProvider === 'wasm'
          ? 'worker-wasm'
          : 'worker-gpu',
      };
    },

    async process(file: File, options: Record<string, unknown> = {}) {
      const client = await getWorkerClient();
      return client.process(file, { ...options });
    },

    async dispose() {
      // Existing worker lifecycle is shared and process-lifetime scoped.
    },
  };
}
