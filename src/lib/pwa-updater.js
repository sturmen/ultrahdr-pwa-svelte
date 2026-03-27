import {
  ensureBundleReady,
  getBundleManifestSummary,
  getBundleStatus,
  repairBundle,
  validateBundle,
} from './offline-runtime-bundle.js';

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;
const IGNORED_VERSIONS_STORAGE_KEY = 'ultrahdr:pwa-update-ignored-versions:v1';
const IGNORED_VERSIONS_LIMIT = 100;
const UHDR_GET_APP_ASSET_VERSION = 'UHDR_GET_APP_ASSET_VERSION';

function isRepairRequiredState(bundleState) {
  return bundleState === 'CORRUPT'
    || bundleState === 'FAILED'
    || bundleState === 'STALE';
}

function resolveOfflineReadinessAction({ ready, state }) {
  if (ready === true) {
    return 'validate';
  }
  if (isRepairRequiredState(state)) {
    return 'repair';
  }
  return 'validate';
}

function now() {
  return Date.now();
}

function canUseServiceWorker() {
  return typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && 'serviceWorker' in navigator;
}

function normalizeVersion(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeIgnoredVersions(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  const deduped = [];
  const seen = new Set();
  for (const candidate of input) {
    const version = normalizeVersion(candidate);
    if (!version) {
      continue;
    }
    if (seen.has(version)) {
      continue;
    }
    seen.add(version);
    deduped.push(version);
  }
  if (deduped.length <= IGNORED_VERSIONS_LIMIT) {
    return deduped;
  }
  return deduped.slice(-IGNORED_VERSIONS_LIMIT);
}

function readIgnoredVersions(runtime = globalThis) {
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.getItem !== 'function') {
    return [];
  }

  try {
    const raw = storage.getItem(IGNORED_VERSIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return normalizeIgnoredVersions(parsed);
  } catch {
    return [];
  }
}

function writeIgnoredVersions(ignoredVersions, runtime = globalThis) {
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.setItem !== 'function') {
    return;
  }
  try {
    storage.setItem(IGNORED_VERSIONS_STORAGE_KEY, JSON.stringify(ignoredVersions));
  } catch {
    // Best-effort only.
  }
}

function appendIgnoredVersion(ignoredVersions, version) {
  const normalized = normalizeVersion(version);
  if (!normalized) {
    return normalizeIgnoredVersions(ignoredVersions);
  }
  const next = normalizeIgnoredVersions(ignoredVersions).filter((entry) => entry !== normalized);
  next.push(normalized);
  return normalizeIgnoredVersions(next);
}

function isIgnoredVersion(ignoredVersions, version) {
  const normalized = normalizeVersion(version);
  if (!normalized) {
    return false;
  }
  return ignoredVersions.includes(normalized);
}

async function loadRegisterSwModule() {
  if (typeof globalThis.__dynamicImport__ === 'function') {
    return globalThis.__dynamicImport__('virtual:pwa-register');
  }
  return import('virtual:pwa-register');
}

function resolveVersionFromMessagePayload(payload) {
  const version = payload?.result?.appAssetVersion;
  return normalizeVersion(version);
}

async function queryWaitingWorkerAssetVersion(swRegistration) {
  const waitingWorker = swRegistration?.waiting;
  if (!waitingWorker || typeof waitingWorker.postMessage !== 'function') {
    return null;
  }
  if (typeof MessageChannel === 'undefined') {
    return null;
  }

  const messageId = `UHDR_ASSET_VERSION_${now()}_${Math.random().toString(16).slice(2)}`;
  try {
    const result = await new Promise((resolve) => {
      const channel = new MessageChannel();
      const timeoutId = setTimeout(() => {
        channel.port1.onmessage = null;
        resolve(null);
      }, 1500);

      channel.port1.onmessage = (event) => {
        clearTimeout(timeoutId);
        const payload = event?.data;
        if (!payload || payload.messageId !== messageId || payload.ok !== true) {
          resolve(null);
          return;
        }
        resolve(resolveVersionFromMessagePayload(payload));
      };

      waitingWorker.postMessage(
        {
          type: UHDR_GET_APP_ASSET_VERSION,
          messageId,
        },
        [channel.port2],
      );
    });
    return normalizeVersion(result);
  } catch {
    return null;
  }
}

export function createDefaultPwaUpdateState() {
  return {
    supported: canUseServiceWorker(),
    updateAvailable: false,
    notificationVisible: false,
    availableVersion: null,
    ignoredVersions: [],
    pendingUntilIdle: false,
    applying: false,
    offlineReady: false,
    bundleReady: false,
    bundleState: 'EMPTY',
    bundleDiagnostics: null,
    bundleError: null,
    bundleLastValidatedAt: null,
    offlineReadinessAction: 'validate',
    offlineBundleAssetCount: null,
    offlineBundleTotalBytes: null,
    offlineBundleActionInFlight: false,
    offlineBundleActionError: null,
    lastCheckAt: null,
    lastError: null,
  };
}

export function createPwaUpdateCoordinator({
  onStateChange = () => {},
  isBusy = () => false,
} = {}) {
  let state = {
    ...createDefaultPwaUpdateState(),
    ignoredVersions: readIgnoredVersions(globalThis),
  };
  let disposed = false;
  let registration = null;
  let updateSw = null;
  let intervalId = null;
  let inFlightUpdateCheck = null;
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
    const bundleState = typeof bundleResult.state === 'string' ? bundleResult.state : 'EMPTY';
    const bundleReady = bundleResult.ready === true;
    patchState({
      offlineReady: bundleReady,
      bundleReady,
      bundleState,
      bundleDiagnostics:
        bundleResult.diagnostics && typeof bundleResult.diagnostics === 'object'
          ? { ...bundleResult.diagnostics }
          : null,
      bundleError: bundleResult.error || null,
      bundleLastValidatedAt: Number.isFinite(Number(bundleResult.validatedAtMs))
        ? Math.floor(Number(bundleResult.validatedAtMs))
        : null,
      offlineReadinessAction: resolveOfflineReadinessAction({
        ready: bundleReady,
        state: bundleState,
      }),
      offlineBundleActionError: null,
    });
  }

  async function syncBundleManifestSummary() {
    try {
      const manifestSummary = await getBundleManifestSummary({ runtime: globalThis });
      if (!manifestSummary || typeof manifestSummary !== 'object') {
        return null;
      }
      patchState({
        offlineBundleAssetCount: Number.isFinite(Number(manifestSummary.assetCount))
          ? Math.floor(Number(manifestSummary.assetCount))
          : null,
        offlineBundleTotalBytes: Number.isFinite(Number(manifestSummary.totalBytes))
          ? Math.floor(Number(manifestSummary.totalBytes))
          : null,
      });
      return manifestSummary;
    } catch {
      return null;
    }
  }

  async function syncBundleReadiness() {
    try {
      await syncBundleManifestSummary();
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

  async function runOfflineBundleAction(action) {
    const bundleAction = action === 'repair' ? repairBundle : validateBundle;
    const offlineReadinessAction = action === 'repair' ? 'repair' : 'validate';
    patchState({
      offlineBundleActionInFlight: true,
      offlineBundleActionError: null,
      offlineReadinessAction,
    });
    await syncBundleManifestSummary();

    try {
      const result = await bundleAction({ runtime: globalThis });
      patchBundleState(result);
      return result?.ready === true;
    } catch (error) {
      patchState({
        offlineBundleActionError: String(error?.message || error),
      });
      return false;
    } finally {
      patchState({ offlineBundleActionInFlight: false });
    }
  }

  async function checkForUpdates() {
    if (disposed || !registration || typeof registration.update !== 'function') {
      return false;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return false;
    }
    if (inFlightUpdateCheck) {
      return inFlightUpdateCheck;
    }

    inFlightUpdateCheck = (async () => {
      try {
        await registration.update();
        patchState({ lastCheckAt: now() });
        return true;
      } catch {
        return false;
      } finally {
        inFlightUpdateCheck = null;
      }
    })();

    return inFlightUpdateCheck;
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

  async function onNeedRefresh() {
    const availableVersion = await queryWaitingWorkerAssetVersion(registration);
    const ignored = isIgnoredVersion(state.ignoredVersions, availableVersion);
    patchState({
      updateAvailable: true,
      notificationVisible: !ignored,
      availableVersion,
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
    void syncBundleManifestSummary();

    try {
      const { registerSW } = await loadRegisterSwModule();
      updateSw = registerSW({
        immediate: true,
        onNeedRefresh() {
          void onNeedRefresh();
        },
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

  async function dismissUpdateNotification() {
    const nextIgnored = appendIgnoredVersion(state.ignoredVersions, state.availableVersion);
    writeIgnoredVersions(nextIgnored, globalThis);
    patchState({
      ignoredVersions: nextIgnored,
      notificationVisible: false,
    });
    return true;
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
    dismissUpdateNotification,
    checkForUpdates,
    dispose,
    getState: () => ({ ...state }),
    repairOfflineReadiness: () => runOfflineBundleAction('repair'),
    setBusy,
    validateOfflineReadiness: () => runOfflineBundleAction('validate'),
  };
}
