function inferReadyStateFromMode(runtimeMode: unknown): 'ready-main-thread' | 'ready-worker' {
  if (runtimeMode === 'main-thread-wasm') {
    return 'ready-main-thread';
  }
  return 'ready-worker';
}

export interface RuntimeState {
  status: string;
  runtime: (Record<string, unknown> & { runtimeMode?: string }) | null;
  error: unknown;
  progress: unknown;
}

export interface RuntimeEventPayload {
  runtimeMode?: unknown;
  runtime?: (Record<string, unknown> & { runtimeMode?: string }) | null;
  error?: unknown;
  event?: unknown;
}

export interface RuntimeEvent {
  type: string;
  payload?: RuntimeEventPayload | null;
}

export function createInitialRuntimeState(): RuntimeState {
  return {
    status: 'idle',
    runtime: null,
    error: null,
    progress: null,
  };
}

export function runtimeStateReducer(state: RuntimeState, event: RuntimeEvent | null | undefined): RuntimeState {
  if (!event || typeof event !== 'object' || typeof event.type !== 'string') {
    return state;
  }

  const payload = event.payload && typeof event.payload === 'object' ? event.payload : {};

  switch (event.type) {
    case 'INIT_REQUESTED':
      return {
        ...state,
        status: 'initializing',
        error: null,
      };
    case 'INIT_PROGRESS':
      return {
        ...state,
        progress: payload.event || null,
      };
    case 'INIT_READY':
      return {
        ...state,
        status: inferReadyStateFromMode(payload.runtimeMode),
        runtime: { ...payload },
        error: null,
      };
    case 'INIT_FAILED':
      return {
        ...state,
        status: 'failed',
        error: payload.error || null,
      };
    case 'PROCESS_REQUESTED':
      return {
        ...state,
        status: 'processing',
        error: null,
      };
    case 'PROCESS_PROGRESS':
      return {
        ...state,
        progress: payload.event || null,
      };
    case 'PROCESS_DONE':
      return {
        ...state,
        status: inferReadyStateFromMode(state.runtime?.runtimeMode),
      };
    case 'PROCESS_FAILED':
      return {
        ...state,
        status: 'failed',
        error: payload.error || null,
      };
    case 'CANCELLED':
      return {
        ...state,
        status: inferReadyStateFromMode(state.runtime?.runtimeMode),
      };
    case 'RESET':
      return createInitialRuntimeState();
    case 'DISPOSED':
      return {
        ...createInitialRuntimeState(),
        status: 'disposed',
      };
    default:
      return state;
  }
}
