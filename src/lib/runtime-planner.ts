function normalizeBoolean(value: unknown, defaultValue = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

export interface InitializePlannerOptions {
  allowMainThreadFallback?: boolean;
  workerSupported?: boolean;
}

export interface ProcessPlannerOptions {
  allowMainThreadFallback?: boolean;
  workerSupported?: boolean;
  hasActiveAdapter?: boolean;
}

export type RuntimePlannerEffect =
  | { type: 'dispatch'; eventType: 'INIT_REQUESTED' | 'PROCESS_REQUESTED' }
  | {
      type: 'initialize-adapter';
      adapter: 'worker' | 'main-thread';
      allowMainThreadFallback: boolean;
    }
  | {
      type: 'throw-worker-unavailable';
    }
  | {
      type: 'ensure-initialized';
      allowMainThreadFallback: boolean;
      workerSupported: boolean;
    }
  | {
      type: 'process-with-active-adapter';
    };

export function planInitialize(
  state: unknown,
  options: InitializePlannerOptions = {},
): RuntimePlannerEffect[] {
  void state;
  const allowMainThreadFallback = normalizeBoolean(options.allowMainThreadFallback, true);
  const workerSupported = normalizeBoolean(options.workerSupported, true);

  const effects: RuntimePlannerEffect[] = [{ type: 'dispatch', eventType: 'INIT_REQUESTED' }];

  if (workerSupported) {
    effects.push({
      type: 'initialize-adapter',
      adapter: 'worker',
      allowMainThreadFallback,
    });
    return effects;
  }

  if (allowMainThreadFallback) {
    effects.push({
      type: 'initialize-adapter',
      adapter: 'main-thread',
      allowMainThreadFallback,
    });
    return effects;
  }

  effects.push({ type: 'throw-worker-unavailable' });
  return effects;
}

export function planProcess(
  state: unknown,
  options: ProcessPlannerOptions = {},
): RuntimePlannerEffect[] {
  void state;
  const allowMainThreadFallback = normalizeBoolean(options.allowMainThreadFallback, true);
  const workerSupported = normalizeBoolean(options.workerSupported, true);
  const hasActiveAdapter = normalizeBoolean(options.hasActiveAdapter, false);

  const effects: RuntimePlannerEffect[] = [];
  if (!hasActiveAdapter) {
    effects.push({
      type: 'ensure-initialized',
      allowMainThreadFallback,
      workerSupported,
    });
  }
  effects.push({ type: 'dispatch', eventType: 'PROCESS_REQUESTED' });
  effects.push({ type: 'process-with-active-adapter' });
  return effects;
}
