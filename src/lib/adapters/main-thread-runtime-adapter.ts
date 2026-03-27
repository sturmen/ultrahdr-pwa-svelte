import { sanitizeRuntimeInitOptions } from '../runtime-contract.ts';

export interface MainThreadRuntimeAdapterDependencies {
  ensureMainThreadRuntimeInitialized: (options: Record<string, unknown>) => Promise<Record<string, unknown>>;
  loadMainThreadProcessImage: () => Promise<(file: File, options: Record<string, unknown>) => Promise<Blob>>;
  stripMainThreadOnlyOptions: (options: Record<string, unknown>) => Record<string, unknown>;
}

export function createMainThreadRuntimeAdapter({
  ensureMainThreadRuntimeInitialized,
  loadMainThreadProcessImage,
  stripMainThreadOnlyOptions,
}: MainThreadRuntimeAdapterDependencies) {
  return {
    async initialize(options: Record<string, unknown> = {}) {
      const optionRecord = options as Record<string, unknown> & {
        runtimeInitOptions?: Record<string, unknown>;
        allowWasmOnly?: boolean;
      };
      const runtimeInitOptions = sanitizeRuntimeInitOptions({
        ...(optionRecord.runtimeInitOptions || {}),
        ...(optionRecord.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
      });
      const runtimeMetadata = await ensureMainThreadRuntimeInitialized(runtimeInitOptions);
      return {
        ready: true,
        ...runtimeMetadata,
        runtimeMode: 'main-thread-wasm',
      };
    },

    async process(file: File, options: Record<string, unknown> = {}) {
      const optionRecord = options as Record<string, unknown> & {
        runtimeInitOptions?: Record<string, unknown>;
        allowWasmOnly?: boolean;
      };
      const runtimeInitOptions = sanitizeRuntimeInitOptions({
        ...(optionRecord.runtimeInitOptions || {}),
        ...(optionRecord.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
      });
      await ensureMainThreadRuntimeInitialized(runtimeInitOptions);
      const processImageMainThread = await loadMainThreadProcessImage();
      return processImageMainThread(file, stripMainThreadOnlyOptions(options));
    },

    async dispose() {
      // Main-thread runtime has no adapter-level disposable resources.
    },
  };
}
