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

const importOriginal = globalThis.__dynamicImport__ || globalThis.__import__;

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
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
    vi.restoreAllMocks();
  });

  it('initializes with expected default state', () => {
    const state = createDefaultPwaUpdateState();
    expect(state.updateAvailable).toBe(false);
    expect(state.pendingUntilIdle).toBe(false);
    expect(state.applying).toBe(false);
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
    expect(registrationMock.update).toHaveBeenCalledTimes(1); // startup

    listeners.get('focus')?.();
    listeners.get('online')?.();
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    listeners.get('visibilitychange')?.();
    await flushPromises();

    expect(registrationMock.update).toHaveBeenCalledTimes(4);
    expect(intervalCallbacks).toHaveLength(1);

    await intervalCallbacks[0]();
    expect(registrationMock.update).toHaveBeenCalledTimes(5);

    coordinator.dispose();
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(snapshots.length).toBeGreaterThan(0);
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

  it('uses literal virtual:pwa-register import so Vite can transform it', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/lib/pwa-updater.js');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).toContain("import('virtual:pwa-register')");
    expect(source).not.toContain("import(moduleId)");
    expect(source).not.toContain("'virtual:' + 'pwa-register'");
  });
});
