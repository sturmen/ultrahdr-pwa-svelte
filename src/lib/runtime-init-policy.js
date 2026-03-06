export function isMainThreadFallbackEnabled(options = {}) {
  return options?.allowMainThreadFallback !== false;
}

export function isWorkerCompatibilityError(error) {
  return (
    error?.name === 'ProcessingWorkerUnavailableError'
    || error?.name === 'ProcessingWorkerInitError'
    || error?.name === 'ProcessingWorkerInitTimeout'
  );
}

export function decideInitializationPath({
  workerSupported,
  allowMainThreadFallback,
}) {
  if (workerSupported) {
    return 'worker';
  }
  return allowMainThreadFallback ? 'main-thread' : 'error';
}

export function decideWorkerFallback({
  allowMainThreadFallback,
  error,
}) {
  return allowMainThreadFallback && isWorkerCompatibilityError(error)
    ? 'fallback'
    : 'throw';
}
