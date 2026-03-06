function normalizeBoolean(value, defaultValue = false) {
  return typeof value === 'boolean' ? value : defaultValue;
}

export function planInitialize(state, options = {}) {
  void state;
  const allowMainThreadFallback = normalizeBoolean(options.allowMainThreadFallback, true);
  const workerSupported = normalizeBoolean(options.workerSupported, true);

  const effects = [{ type: 'dispatch', eventType: 'INIT_REQUESTED' }];

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

export function planProcess(state, options = {}) {
  void state;
  const allowMainThreadFallback = normalizeBoolean(options.allowMainThreadFallback, true);
  const workerSupported = normalizeBoolean(options.workerSupported, true);
  const hasActiveAdapter = normalizeBoolean(options.hasActiveAdapter, false);

  const effects = [];
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
