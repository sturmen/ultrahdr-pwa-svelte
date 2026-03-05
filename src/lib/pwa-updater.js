import { ensureBundleReady, getBundleStatus } from './offline-runtime-bundle.js';
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

function now() {
  return Date.now();
}

function canUseServiceWorker() {
  return typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && 'serviceWorker' in navigator;
}

async function loadRegisterSwModule() {
  if (typeof globalThis.__dynamicImport__ === 'function') {
    return globalThis.__dynamicImport__('virtual:pwa-register');
  }
  return import('virtual:pwa-register');
}

export function createDefaultPwaUpdateState() {
  return {
    supported: canUseServiceWorker(),
    checking: false,
    updateAvailable: false,
    pendingUntilIdle: false,
    applying: false,
    offlineReady: false,
    bundleReady: false,
    bundleState: 'EMPTY',
    bundleError: null,
    bundleLastValidatedAt: null,
    lastCheckAt: null,
    lastError: null,
  };
}

export function createPwaUpdateCoordinator({
  onStateChange = () => {},
  isBusy = () => false,
} = {}) {
  let state = createDefaultPwaUpdateState();
  let disposed = false;
  let registration = null;
  let updateSw = null;
  let intervalId = null;
  const listeners = [];

  function emit() {
    onStateChange({ ...state });
  }

  function patchState(changes) {
    state = { ...state, ...changes };
    emit();
  }

  function patchBundleState(bundleResult) {
    if (!bundleResult || typeof bundleResult !== 'object') {
      return;
    }
    patchState({
      bundleReady: bundleResult.ready === true,
      bundleState: typeof bundleResult.state === 'string' ? bundleResult.state : 'EMPTY',
      bundleError: bundleResult.error || null,
      bundleLastValidatedAt: Number.isFinite(Number(bundleResult.validatedAtMs))
        ? Math.floor(Number(bundleResult.validatedAtMs))
        : null,
    });
  }

  async function syncBundleReadiness() {
    try {
      const result = await ensureBundleReady({ runtime: globalThis });
      patchBundleState(result);
      return result;
    } catch (error) {
      patchBundleState({
        ready: false,
        state: 'FAILED',
        validatedAtMs: null,
        error: String(error?.message || error),
      });
      return null;
    }
  }

  async function checkForUpdates() {
    if (disposed || !registration || typeof registration.update !== 'function') {
      return false;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return false;
    }

    patchState({ checking: true, lastError: null });
    try {
      await registration.update();
      patchState({ lastCheckAt: now() });
      return true;
    } catch (error) {
      patchState({ lastError: String(error?.message || error) });
      return false;
    } finally {
      patchState({ checking: false });
    }
  }

  function updatePendingStateFromBusy() {
    if (!state.updateAvailable) {
      if (state.pendingUntilIdle) {
        patchState({ pendingUntilIdle: false });
      }
      return;
    }

    const busy = Boolean(isBusy());
    if (state.pendingUntilIdle !== busy) {
      patchState({ pendingUntilIdle: busy });
    }
  }

  function onNeedRefresh() {
    patchState({
      updateAvailable: true,
      pendingUntilIdle: Boolean(isBusy()),
      applying: false,
    });
  }

  function scheduleUpdateChecks() {
    if (intervalId !== null || typeof window === 'undefined') {
      return;
    }

    const onFocus = () => {
      void checkForUpdates();
    };
    const onOnline = () => {
      void checkForUpdates();
      void syncBundleReadiness();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('visibilitychange', onVisibilityChange);

    listeners.push(() => window.removeEventListener('focus', onFocus));
    listeners.push(() => window.removeEventListener('online', onOnline));
    listeners.push(() => window.removeEventListener('visibilitychange', onVisibilityChange));

    intervalId = window.setInterval(() => {
      void checkForUpdates();
    }, UPDATE_CHECK_INTERVAL_MS);
  }

  async function init() {
    if (!canUseServiceWorker()) {
      patchState({ supported: false });
      return;
    }

    patchBundleState(getBundleStatus(globalThis));

    try {
      const { registerSW } = await loadRegisterSwModule();
      updateSw = registerSW({
        immediate: true,
        onNeedRefresh,
        onOfflineReady() {
          patchState({ offlineReady: true });
        },
        onRegisteredSW(_swUrl, swRegistration) {
          registration = swRegistration || null;
          scheduleUpdateChecks();
          void checkForUpdates();
          void syncBundleReadiness();
        },
        onRegisterError(error) {
          patchState({ lastError: String(error?.message || error) });
        },
      });
    } catch (error) {
      // Keep app functional in local test/dev environments where virtual:pwa-register is unavailable.
      patchState({
        supported: false,
        lastError: String(error?.message || error),
      });
    }
  }

  async function applyUpdate() {
    if (!state.updateAvailable || typeof updateSw !== 'function') {
      return false;
    }
    if (Boolean(isBusy())) {
      patchState({ pendingUntilIdle: true });
      return false;
    }

    patchState({ applying: true, lastError: null, pendingUntilIdle: false });
    try {
      await updateSw(true);
      return true;
    } catch (error) {
      patchState({ applying: false, lastError: String(error?.message || error) });
      return false;
    }
  }

  function setBusy(isProcessingBusy) {
    if (isProcessingBusy) {
      if (state.updateAvailable && !state.pendingUntilIdle) {
        patchState({ pendingUntilIdle: true });
      }
      return;
    }
    updatePendingStateFromBusy();
  }

  function dispose() {
    disposed = true;
    if (intervalId !== null && typeof window !== 'undefined') {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    while (listeners.length > 0) {
      const disposeListener = listeners.pop();
      disposeListener?.();
    }
  }

  emit();
  void init();

  return {
    applyUpdate,
    checkForUpdates,
    dispose,
    getState: () => ({ ...state }),
    setBusy,
  };
}
