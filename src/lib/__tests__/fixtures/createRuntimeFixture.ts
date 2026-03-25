export async function createRuntimeFixture(overrides = {}) {
  const { createProcessingRuntime } = await import('../../processing.js');
  const runtime = createProcessingRuntime(overrides);
  return {
    runtime,
    initialize: (options = {}) => runtime.initialize(options),
    process: (file, options = {}) => runtime.process(file, options),
    subscribe: (listener) => runtime.subscribe(listener),
    snapshot: () => runtime.getSnapshot(),
    dispose: () => runtime.dispose(),
  };
}
