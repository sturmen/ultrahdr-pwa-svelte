export interface ProcessingRuntimeState {
  status: string;
  runtime: (Record<string, unknown> & { runtimeMode?: string }) | null;
  error: unknown;
  progress: unknown;
}

export interface ProcessingRuntimeEvent {
  type: string;
  options?: Record<string, unknown>;
  runtime?: (Record<string, unknown> & { runtimeMode?: string }) | null;
  error?: unknown;
  file?: File;
  detail?: unknown;
}

export interface ProcessingRuntimeCommand {
  type: 'INIT_RUNTIME' | 'PROCESS_IMAGE';
  options?: Record<string, unknown>;
  file?: File;
}

export interface ProcessingRuntimeReduction {
  state: ProcessingRuntimeState;
  commands: ProcessingRuntimeCommand[];
}

function readyStatusFromRuntime(
  runtime: (Record<string, unknown> & { runtimeMode?: string }) | null | undefined,
): 'ready-main-thread' | 'ready-worker' {
  return runtime?.runtimeMode === 'main-thread-wasm'
    ? 'ready-main-thread'
    : 'ready-worker';
}

export function createInitialProcessingRuntimeState(): ProcessingRuntimeState {
  return {
    status: 'idle',
    runtime: null,
    error: null,
    progress: null,
  };
}

export function reduceProcessingRuntimeState(
  state: ProcessingRuntimeState,
  event: ProcessingRuntimeEvent | null | undefined,
): ProcessingRuntimeReduction {
  if (!event || typeof event !== 'object' || typeof event.type !== 'string') {
    return { state, commands: [] };
  }

  switch (event.type) {
    case 'INIT_REQUESTED':
      return {
        state: {
          ...state,
          status: 'initializing',
          error: null,
        },
        commands: [
          {
            type: 'INIT_RUNTIME',
            options: event.options || {},
          },
        ],
      };
    case 'INIT_SUCCEEDED':
      return {
        state: {
          ...state,
          status: readyStatusFromRuntime(event.runtime),
          runtime: event.runtime || null,
          error: null,
        },
        commands: [],
      };
    case 'INIT_FAILED':
      return {
        state: {
          ...state,
          status: 'failed',
          error: event.error || null,
        },
        commands: [],
      };
    case 'PROCESS_REQUESTED':
      return {
        state: {
          ...state,
          status: 'processing',
          error: null,
        },
        commands: [
          {
            type: 'PROCESS_IMAGE',
            file: event.file,
            options: event.options || {},
          },
        ],
      };
    case 'PROCESS_SUCCEEDED':
      return {
        state: {
          ...state,
          status: readyStatusFromRuntime(state.runtime),
          error: null,
        },
        commands: [],
      };
    case 'PROCESS_FAILED':
      return {
        state: {
          ...state,
          status: 'failed',
          error: event.error || null,
        },
        commands: [],
      };
    case 'PROGRESS_EVENT':
      return {
        state: {
          ...state,
          progress: event.detail || null,
        },
        commands: [],
      };
    case 'DISPOSED':
      return {
        state: {
          ...state,
          status: 'disposed',
        },
        commands: [],
      };
    default:
      return { state, commands: [] };
  }
}
