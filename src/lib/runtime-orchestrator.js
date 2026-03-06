import { createInitialRuntimeState, runtimeStateReducer } from './runtime-state-machine.js';
import { planInitialize, planProcess } from './runtime-planner.js';

function isWorkerCompatibilityError(error) {
  return (
    error?.name === 'ProcessingWorkerUnavailableError'
    || error?.name === 'ProcessingWorkerInitError'
    || error?.name === 'ProcessingWorkerInitTimeout'
  );
}

export function createRuntimeOrchestrator({
  workerAdapter,
  mainThreadAdapter,
  canUseWorker = () => true,
  planner = { planInitialize, planProcess },
}) {
  let state = createInitialRuntimeState();
  const listeners = new Set();
  let activeAdapter = null;

  function publish(nextState) {
    state = nextState;
    for (const listener of listeners) {
      try {
        listener(state);
      } catch {
        // Ignore listener failures.
      }
    }
  }

  function dispatch(type, payload = null) {
    publish(runtimeStateReducer(state, { type, payload }));
  }

  async function runInitializeAdapterEffect(effect, options = {}) {
    if (effect.adapter === 'worker') {
      try {
        const runtime = await workerAdapter.initialize(options);
        activeAdapter = workerAdapter;
        dispatch('INIT_READY', runtime);
        return runtime;
      } catch (error) {
        if (!effect.allowMainThreadFallback || !isWorkerCompatibilityError(error)) {
          dispatch('INIT_FAILED', { error });
          throw error;
        }
        return runInitializeAdapterEffect({
          type: 'initialize-adapter',
          adapter: 'main-thread',
          allowMainThreadFallback: true,
        }, options);
      }
    }

    if (effect.adapter === 'main-thread') {
      const runtime = await mainThreadAdapter.initialize(options);
      activeAdapter = mainThreadAdapter;
      dispatch('INIT_READY', runtime);
      return runtime;
    }

    throw new Error(`Unknown adapter "${effect.adapter}" in runtime initialization effect.`);
  }

  async function runEffects(effects, context = {}) {
    let lastResult;
    for (const effect of effects) {
      switch (effect?.type) {
        case 'dispatch':
          dispatch(effect.eventType, effect.payload || null);
          break;
        case 'initialize-adapter':
          lastResult = await runInitializeAdapterEffect(effect, context.options || {});
          break;
        case 'throw-worker-unavailable': {
          const error = new Error('Processing worker is unavailable in this environment.');
          error.name = 'ProcessingWorkerUnavailableError';
          dispatch('INIT_FAILED', { error });
          throw error;
        }
        case 'ensure-initialized':
          if (!activeAdapter) {
            lastResult = await runEffects(
              planner.planInitialize(state, {
                allowMainThreadFallback: effect.allowMainThreadFallback,
                workerSupported: effect.workerSupported,
              }),
              context,
            );
          }
          break;
        case 'process-with-active-adapter':
          if (!activeAdapter) {
            throw new Error('Processing adapter is unavailable.');
          }
          try {
            lastResult = await activeAdapter.process(context.file, context.options || {});
            dispatch('PROCESS_DONE');
          } catch (error) {
            dispatch('PROCESS_FAILED', { error });
            throw error;
          }
          break;
        default:
          throw new Error(`Unknown runtime effect: ${String(effect?.type || 'undefined')}`);
      }
    }
    return lastResult;
  }

  async function initialize(options = {}) {
    return runEffects(
      planner.planInitialize(state, {
        allowMainThreadFallback: options?.allowMainThreadFallback !== false,
        workerSupported: canUseWorker(),
      }),
      { options },
    );
  }

  async function process(file, options = {}) {
    return runEffects(
      planner.planProcess(state, {
        allowMainThreadFallback: options?.allowMainThreadFallback !== false,
        workerSupported: canUseWorker(),
        hasActiveAdapter: Boolean(activeAdapter),
      }),
      { file, options },
    );
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot() {
    return state;
  }

  async function dispose() {
    const disposePromises = [];
    if (typeof workerAdapter?.dispose === 'function') {
      disposePromises.push(Promise.resolve(workerAdapter.dispose()));
    }
    if (typeof mainThreadAdapter?.dispose === 'function') {
      disposePromises.push(Promise.resolve(mainThreadAdapter.dispose()));
    }
    await Promise.all(disposePromises);
    dispatch('DISPOSED');
  }

  return {
    initialize,
    process,
    subscribe,
    getSnapshot,
    dispose,
  };
}
