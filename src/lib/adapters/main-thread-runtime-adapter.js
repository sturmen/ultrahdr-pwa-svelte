import { sanitizeRuntimeInitOptions } from '../runtime-contract.js';

export function createMainThreadRuntimeAdapter({
  ensureMainThreadRuntimeInitialized,
  loadMainThreadProcessImage,
  stripMainThreadOnlyOptions,
}) {
  return {
    async initialize(options = {}) {
      const runtimeInitOptions = sanitizeRuntimeInitOptions({
        ...(options?.runtimeInitOptions || {}),
        ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
      });
      const runtimeMetadata = await ensureMainThreadRuntimeInitialized(runtimeInitOptions);
      return {
        ready: true,
        ...runtimeMetadata,
        runtimeMode: 'main-thread-wasm',
      };
    },

    async process(file, options = {}) {
      const runtimeInitOptions = sanitizeRuntimeInitOptions({
        ...(options?.runtimeInitOptions || {}),
        ...(options?.allowWasmOnly === false ? { allowWasmOnly: false } : {}),
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
