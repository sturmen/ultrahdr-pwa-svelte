export type InitializationPath = 'worker' | 'main-thread' | 'error';
export type WorkerFallbackDecision = 'fallback' | 'throw';

export interface MainThreadFallbackOptions {
  allowMainThreadFallback?: boolean;
}

export interface WorkerCompatibilityErrorLike {
  name?: string;
}

export interface InitializationPathOptions {
  workerSupported: boolean;
  allowMainThreadFallback: boolean;
}

export interface WorkerFallbackOptions {
  allowMainThreadFallback: boolean;
  error: WorkerCompatibilityErrorLike;
}

export function isMainThreadFallbackEnabled(options: MainThreadFallbackOptions = {}): boolean {
  return options?.allowMainThreadFallback !== false;
}

export function isWorkerCompatibilityError(error: WorkerCompatibilityErrorLike | null | undefined): boolean {
  return (
    error?.name === 'ProcessingWorkerUnavailableError'
    || error?.name === 'ProcessingWorkerInitError'
    || error?.name === 'ProcessingWorkerInitTimeout'
  );
}

export function decideInitializationPath({
  workerSupported,
  allowMainThreadFallback,
}: InitializationPathOptions): InitializationPath {
  if (workerSupported) {
    return 'worker';
  }
  return allowMainThreadFallback ? 'main-thread' : 'error';
}

export function decideWorkerFallback({
  allowMainThreadFallback,
  error,
}: WorkerFallbackOptions): WorkerFallbackDecision {
  return allowMainThreadFallback && isWorkerCompatibilityError(error)
    ? 'fallback'
    : 'throw';
}
