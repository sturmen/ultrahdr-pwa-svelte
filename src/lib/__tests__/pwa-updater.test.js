/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  createDefaultPwaUpdateState,
  createPwaUpdateCoordinator,
} from '../pwa-updater.js';
import {
  ensureBundleReady,
  getBundleManifestSummary,
  getBundleStatus,
  repairBundle,
  validateBundle,
} from '../offline-runtime-bundle.js';

vi.mock('../offline-runtime-bundle.js', () => ({
  ensureBundleReady: vi.fn(async () => ({
    ready: true,
    state: 'READY',
    validatedAtMs: 123,
    diagnostics: null,
  })),
  validateBundle: vi.fn(async () => ({
    ready: true,
    state: 'READY',
    validatedAtMs: 123,
    diagnostics: null,
  })),
  repairBundle: vi.fn(async () => ({
    ready: true,
    state: 'READY',
    validatedAtMs: 123,
    diagnostics: null,
  })),
  getBundleStatus: vi.fn(() => ({
    ready: false,
    state: 'EMPTY',
    validatedAtMs: null,
    diagnostics: null,
  })),
  getBundleManifestSummary: vi.fn(async () => ({
    bundleVersion: 'bundle-v1',
    assetCount: 3,
    totalBytes: 6291456,
  })),
}));

const importOriginal = globalThis.__dynamicImport__ || globalThis.__import__;

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createWaitingWorker({ appAssetVersion = 'next-version' } = {}) {
  return {
    postMessage: vi.fn((message, ports = []) => {
      const replyPort = ports[0];
      if (!replyPort || typeof replyPort.postMessage !== 'function') {
        return;
      }
      if (message?.type === 'UHDR_GET_APP_ASSET_VERSION') {
        replyPort.postMessage({
          type: 'UHDR_GET_APP_ASSET_VERSION_RESULT',
          messageId: message?.messageId || null,
          ok: true,
          result: { appAssetVersion },
        });
      }
    }),
  };
}

describe('pwa updater coordinator', () => {
  let registerSWMock;
  let updateSWMock;
  let registrationMock;
  let listeners;
  let intervalCallbacks;
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let setIntervalSpy;
  let clearIntervalSpy;
  let localStorageMock;
  let originalLocalStorage;

  beforeEach(() => {
    listeners = new Map();
    intervalCallbacks = [];

    addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      listeners.set(event, handler);
    });
    removeEventListenerSpy = vi
      .spyOn(window, 'removeEventListener')
      .mockImplementation((event, handler) => {
        if (listeners.get(event) === handler) {
          listeners.delete(event);
        }
      });

    setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation((handler) => {
      intervalCallbacks.push(handler);
      return intervalCallbacks.length;
    });
    clearIntervalSpy = vi.spyOn(window, 'clearInterval').mockImplementation(() => {});
    originalLocalStorage = globalThis.localStorage;
    const store = new Map();
    localStorageMock = {
      getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
      setItem: vi.fn((key, value) => {
        store.set(key, String(value));
      }),
      removeItem: vi.fn((key) => {
        store.delete(key);
      }),
      clear: vi.fn(() => {
        store.clear();
      }),
    };
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: localStorageMock,
    });

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => true,
    });
    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: {},
    });

    registrationMock = {
      update: vi.fn(() => Promise.resolve()),
    };

    updateSWMock = vi.fn(() => Promise.resolve());
    registerSWMock = vi.fn((options) => {
      options.onRegisteredSW?.('/sw.js', registrationMock);
      return updateSWMock;
    });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    if (importOriginal) {
      globalThis.__dynamicImport__ = importOriginal;
      globalThis.__import__ = importOriginal;
    } else {
      delete globalThis.__dynamicImport__;
      delete globalThis.__import__;
    }
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
    vi.restoreAllMocks();
  });

  it('initializes with expected default state', () => {
    const state = createDefaultPwaUpdateState();
    expect(state.updateAvailable).toBe(false);
    expect(state.notificationVisible).toBe(false);
    expect(state.availableVersion).toBe(null);
    expect(state.ignoredVersions).toEqual([]);
    expect(state.pendingUntilIdle).toBe(false);
    expect(state.applying).toBe(false);
    expect(state.bundleReady).toBe(false);
    expect(state.bundleState).toBe('EMPTY');
    expect(state.offlineReadinessAction).toBe('validate');
    expect(state.offlineBundleAssetCount).toBe(null);
    expect(state.offlineBundleTotalBytes).toBe(null);
    expect(state.offlineBundleActionInFlight).toBe(false);
  });

  it('checks for updates on startup/focus/visibility/online and every 30m', async () => {
    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return { registerSW: registerSWMock };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => false,
    });

    await flushPromises();

    expect(registerSWMock).toHaveBeenCalled();
    expect(ensureBundleReady).toHaveBeenCalled();
    expect(registrationMock.update).toHaveBeenCalledTimes(1); // startup

    listeners.get('focus')?.();
    listeners.get('online')?.();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    listeners.get('visibilitychange')?.();
    await flushPromises();

    expect(registrationMock.update).toHaveBeenCalledTimes(2);
    expect(ensureBundleReady).toHaveBeenCalledTimes(2);
    expect(intervalCallbacks).toHaveLength(1);

    await intervalCallbacks[0]();
    expect(registrationMock.update).toHaveBeenCalledTimes(3);

    coordinator.dispose();
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(snapshots.length).toBeGreaterThan(0);
  });

  it('hydrates bundle status from cache snapshot before async validation', async () => {
    getBundleStatus.mockReturnValueOnce({
      ready: true,
      state: 'READY',
      validatedAtMs: 999,
      diagnostics: null,
    });
    ensureBundleReady.mockResolvedValueOnce({
      ready: true,
      state: 'READY',
      validatedAtMs: 1000,
      diagnostics: null,
    });

    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return { registerSW: registerSWMock };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => false,
    });
    await flushPromises();

    const firstWithBundle = snapshots.find((entry) => entry.bundleState === 'READY');
    expect(firstWithBundle).toBeTruthy();
    expect(firstWithBundle.bundleReady).toBe(true);
    expect(firstWithBundle.bundleLastValidatedAt).toBe(999);
    coordinator.dispose();
  });

  it('tracks offline readiness validation and repair actions with manifest summary metadata', async () => {
    getBundleManifestSummary.mockResolvedValue({
      bundleVersion: 'bundle-v2',
      assetCount: 5,
      totalBytes: 10485760,
    });
    validateBundle.mockResolvedValueOnce({
      ready: false,
      state: 'CORRUPT',
      validatedAtMs: 456,
      diagnostics: {
        missingAssetCount: 0,
        mismatchedAssetCount: 2,
      },
    });
    repairBundle.mockResolvedValueOnce({
      ready: true,
      state: 'READY',
      validatedAtMs: 789,
      diagnostics: {
        missingAssetCount: 0,
        mismatchedAssetCount: 0,
      },
    });

    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return { registerSW: registerSWMock };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => false,
    });
    await flushPromises();

    await coordinator.validateOfflineReadiness();
    let latest = snapshots.at(-1);
    expect(validateBundle).toHaveBeenCalled();
    expect(latest.bundleState).toBe('CORRUPT');
    expect(latest.offlineReadinessAction).toBe('repair');
    expect(latest.offlineBundleAssetCount).toBe(5);
    expect(latest.offlineBundleTotalBytes).toBe(10485760);

    await coordinator.repairOfflineReadiness();
    latest = snapshots.at(-1);
    expect(repairBundle).toHaveBeenCalled();
    expect(latest.bundleReady).toBe(true);
    expect(latest.bundleState).toBe('READY');
    expect(latest.offlineReadinessAction).toBe('validate');
    expect(latest.offlineBundleActionInFlight).toBe(false);
    coordinator.dispose();
  });

  it('defers apply while busy and applies when idle', async () => {
    let onNeedRefresh;
    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return {
          registerSW: (options) => {
            onNeedRefresh = options.onNeedRefresh;
            options.onRegisteredSW?.('/sw.js', registrationMock);
            return updateSWMock;
          },
        };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    let busy = true;
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => busy,
    });

    await flushPromises();
    onNeedRefresh?.();
    await flushPromises();

    let latest = snapshots.at(-1);
    expect(latest.updateAvailable).toBe(true);
    expect(latest.pendingUntilIdle).toBe(true);

    await coordinator.applyUpdate();
    expect(updateSWMock).not.toHaveBeenCalled();

    busy = false;
    coordinator.setBusy(false);
    latest = snapshots.at(-1);
    expect(latest.pendingUntilIdle).toBe(false);

    await coordinator.applyUpdate();
    expect(updateSWMock).toHaveBeenCalledWith(true);

    coordinator.dispose();
  });

  it('emits bounded diagnostics breadcrumbs for update availability and deferred activation', async () => {
    let onNeedRefresh;
    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return {
          registerSW: (options) => {
            onNeedRefresh = options.onNeedRefresh;
            options.onRegisteredSW?.('/sw.js', registrationMock);
            return updateSWMock;
          },
        };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const diagnosticEvents = [];
    let busy = true;
    const coordinator = createPwaUpdateCoordinator({
      onDiagnosticEvent: (event) => diagnosticEvents.push(event),
      onStateChange: () => {},
      isBusy: () => busy,
    });

    await flushPromises();
    onNeedRefresh?.();
    await flushPromises();
    await coordinator.applyUpdate();
    busy = false;
    coordinator.setBusy(false);

    expect(diagnosticEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'lifecycle',
          name: 'pwa-update-available',
          severity: 'info',
          context: expect.objectContaining({
            pendingUntilIdle: true,
            updateAvailable: true,
          }),
        }),
        expect.objectContaining({
          category: 'lifecycle',
          name: 'pwa-update-activation-deferred',
          severity: 'warning',
          context: expect.objectContaining({
            reason: 'processing-busy',
          }),
        }),
        expect.objectContaining({
          category: 'lifecycle',
          name: 'pwa-update-awaiting-user-reload',
          severity: 'info',
          context: expect.objectContaining({
            pendingUntilIdle: false,
            updateAvailable: true,
          }),
        }),
      ]),
    );
    coordinator.dispose();
  });

  it('fails silently for offline update checks', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => false,
    });

    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return { registerSW: registerSWMock };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => false,
    });
    await flushPromises();

    expect(registrationMock.update).not.toHaveBeenCalled();
    const latest = snapshots.at(-1);
    expect(latest.lastError).toBe(null);
    coordinator.dispose();
  });

  it('stores dismissed versions, deduplicates, and caps ignored versions at 100 entries', async () => {
    const waitingWorker = createWaitingWorker({ appAssetVersion: 'v-101' });
    registrationMock.waiting = waitingWorker;

    const ignoredVersions = Array.from({ length: 101 }, (_unused, index) => `v-${index}`);
    globalThis.localStorage.setItem(
      'ultrahdr:pwa-update-ignored-versions:v1',
      JSON.stringify(ignoredVersions),
    );

    let onNeedRefresh;
    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return {
          registerSW: (options) => {
            onNeedRefresh = options.onNeedRefresh;
            options.onRegisteredSW?.('/sw.js', registrationMock);
            return updateSWMock;
          },
        };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => false,
    });
    await flushPromises();

    onNeedRefresh?.();
    await flushPromises();
    await coordinator.dismissUpdateNotification();

    const latest = snapshots.at(-1);
    expect(latest.ignoredVersions).toHaveLength(100);
    expect(latest.ignoredVersions).not.toContain('v-0');
    expect(latest.ignoredVersions.at(-1)).toBe('v-101');

    const stored = JSON.parse(
      globalThis.localStorage.getItem('ultrahdr:pwa-update-ignored-versions:v1'),
    );
    expect(stored).toHaveLength(100);
    expect(stored.filter((entry) => entry === 'v-101')).toHaveLength(1);
    coordinator.dispose();
  });

  it('restores ignored versions from storage and falls back to empty on invalid JSON', async () => {
    globalThis.localStorage.setItem('ultrahdr:pwa-update-ignored-versions:v1', '{bad json');

    globalThis.__dynamicImport__ = vi.fn(async (specifier) => {
      if (specifier === 'virtual:pwa-register') {
        return { registerSW: registerSWMock };
      }
      throw new Error(`Unexpected import: ${specifier}`);
    });

    const snapshots = [];
    const coordinator = createPwaUpdateCoordinator({
      onStateChange: (state) => snapshots.push(state),
      isBusy: () => false,
    });
    await flushPromises();

    const latest = snapshots.at(-1);
    expect(latest.ignoredVersions).toEqual([]);
    coordinator.dispose();
  });

  it('uses literal virtual:pwa-register import so Vite can transform it', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/lib/pwa-updater.js');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).toContain("import('virtual:pwa-register')");
    expect(source).not.toContain("import(moduleId)");
    expect(source).not.toContain("'virtual:' + 'pwa-register'");
  });
});
