import { createInitialRuntimeState, runtimeStateReducer, type RuntimeState } from './runtime-state-machine.ts';
import { planInitialize, planProcess, type RuntimePlannerEffect } from './runtime-planner.ts';

export interface RuntimeAdapter {
  initialize: (options?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  process: (file: File, options?: Record<string, unknown>) => Promise<Blob>;
  dispose?: () => Promise<void> | void;
}

export interface RuntimePlanner {
  planInitialize: (state: RuntimeState, options?: Record<string, unknown>) => RuntimePlannerEffect[];
  planProcess: (state: RuntimeState, options?: Record<string, unknown>) => RuntimePlannerEffect[];
}

export interface RuntimeOrchestratorOptions {
  workerAdapter: RuntimeAdapter;
  mainThreadAdapter: RuntimeAdapter;
  canUseWorker?: () => boolean;
  planner?: RuntimePlanner;
}

function isWorkerCompatibilityError(error: unknown): boolean {
  return (
    typeof error === 'object'
    && error !== null
    && ('name' in error)
    && (
      (error as { name?: unknown }).name === 'ProcessingWorkerUnavailableError'
      || (error as { name?: unknown }).name === 'ProcessingWorkerInitError'
      || (error as { name?: unknown }).name === 'ProcessingWorkerInitTimeout'
    )
  );
}

export function createRuntimeOrchestrator({
  workerAdapter,
  mainThreadAdapter,
  canUseWorker = () => true,
  planner = { planInitialize, planProcess },
}: RuntimeOrchestratorOptions) {
  let state = createInitialRuntimeState();
  const listeners = new Set<(nextState: RuntimeState) => void>();
  let activeAdapter: RuntimeAdapter | null = null;

  function publish(nextState: RuntimeState): void {
    state = nextState;
    for (const listener of listeners) {
      try {
        listener(state);
      } catch {
        // Ignore listener failures.
      }
    }
  }

  function dispatch(type: string, payload: Record<string, unknown> | null = null): void {
    publish(runtimeStateReducer(state, { type, payload }));
  }

  async function runInitializeAdapterEffect(
    effect: RuntimePlannerEffect,
    options: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    if (effect.type !== 'initialize-adapter') {
      throw new Error(`Unexpected effect passed to initialize handler: ${effect.type}`);
    }

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

    throw new Error(`Unknown adapter "${String(effect.adapter)}" in runtime initialization effect.`);
  }

  async function runEffects(
    effects: RuntimePlannerEffect[],
    context: { options?: Record<string, unknown>; file?: File } = {},
  ): Promise<unknown> {
    let lastResult: unknown;
    for (const effect of effects) {
      switch (effect?.type) {
        case 'dispatch':
          dispatch(effect.eventType, effect.eventType === 'INIT_REQUESTED' ? null : null);
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
            lastResult = await activeAdapter.process(context.file as File, context.options || {});
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

  async function initialize(options: Record<string, unknown> = {}): Promise<unknown> {
    return runEffects(
      planner.planInitialize(state, {
        allowMainThreadFallback: (options as { allowMainThreadFallback?: boolean })?.allowMainThreadFallback !== false,
        workerSupported: canUseWorker(),
      }),
      { options },
    );
  }

  async function process(file: File, options: Record<string, unknown> = {}): Promise<unknown> {
    return runEffects(
      planner.planProcess(state, {
        allowMainThreadFallback: (options as { allowMainThreadFallback?: boolean })?.allowMainThreadFallback !== false,
        workerSupported: canUseWorker(),
        hasActiveAdapter: Boolean(activeAdapter),
      }),
      { file, options },
    );
  }

  function subscribe(listener: (nextState: RuntimeState) => void): () => void {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot(): RuntimeState {
    return state;
  }

  async function dispose(): Promise<void> {
    const disposePromises: Promise<unknown>[] = [];
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
