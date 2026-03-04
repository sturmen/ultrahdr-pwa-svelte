const DEFAULT_PROCESSING_LOCK_NAME = 'ultrahdr:processing-queue';

let activeLockByRuntime = new WeakMap();

function normalizeRuntimeToken(runtime) {
  if (!runtime || (typeof runtime !== 'object' && typeof runtime !== 'function')) {
    return null;
  }
  return runtime;
}

function resolveLocksApi(runtime = globalThis) {
  return runtime?.navigator?.locks || null;
}

export async function acquireProcessingLock({
  runtime = globalThis,
  lockName = DEFAULT_PROCESSING_LOCK_NAME,
} = {}) {
  const locksApi = resolveLocksApi(runtime);
  if (!locksApi || typeof locksApi.request !== 'function') {
    return true;
  }

  const runtimeToken = normalizeRuntimeToken(runtime);
  if (runtimeToken && activeLockByRuntime.has(runtimeToken)) {
    return true;
  }

  let resolveAcquired;
  const acquiredPromise = new Promise((resolve) => {
    resolveAcquired = resolve;
  });

  let releaseGateResolve;
  const releaseGate = new Promise((resolve) => {
    releaseGateResolve = resolve;
  });

  const requestPromise = locksApi.request(
    lockName,
    { mode: 'exclusive', ifAvailable: true },
    async (lock) => {
      if (!lock) {
        resolveAcquired(false);
        return false;
      }
      resolveAcquired(true);
      await releaseGate;
      return true;
    },
  ).catch((error) => {
    resolveAcquired(false);
    throw error;
  });

  const acquired = await acquiredPromise;
  if (!acquired) {
    try {
      await requestPromise;
    } catch {
      // Ignore lock request failures and fall back to disabled lock behavior.
    }
    return false;
  }

  if (runtimeToken) {
    activeLockByRuntime.set(runtimeToken, {
      release: releaseGateResolve,
      requestPromise,
    });
  }
  return true;
}

export async function releaseProcessingLock({ runtime = globalThis } = {}) {
  const runtimeToken = normalizeRuntimeToken(runtime);
  if (!runtimeToken) {
    return;
  }
  const activeLock = activeLockByRuntime.get(runtimeToken);
  if (!activeLock) {
    return;
  }

  activeLockByRuntime.delete(runtimeToken);
  try {
    activeLock.release?.();
    await activeLock.requestPromise;
  } catch {
    // Ignore release failures.
  }
}

export function __resetProcessingLocksForTests() {
  activeLockByRuntime = new WeakMap();
}
