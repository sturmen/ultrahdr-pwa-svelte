/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class HangingInitWorker {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  postMessage(_message) {
    // Intentionally do nothing to keep startup pending until timeout.
  }

  terminate() {
    // no-op
  }
}

describe('processing worker init timeout', () => {
  const originalWorker = globalThis.Worker;
  const originalOffscreenCanvas = globalThis.OffscreenCanvas;
  const originalCreateImageBitmap = globalThis.createImageBitmap;

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    globalThis.Worker = HangingInitWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.Worker = originalWorker;
    globalThis.OffscreenCanvas = originalOffscreenCanvas;
    globalThis.createImageBitmap = originalCreateImageBitmap;
    vi.restoreAllMocks();
  });

  it('allows more startup time on Firefox before declaring init timeout', async () => {
    vi.spyOn(globalThis.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
    );

    const { initializeRuntime } = await import('../processing.js');
    const initPromise = initializeRuntime();

    const settled = { value: false };
    initPromise.catch(() => {
      settled.value = true;
    });

    await vi.advanceTimersByTimeAsync(200_000);
    expect(settled.value).toBe(false);

    await vi.advanceTimersByTimeAsync(130_000);
    await expect(initPromise).rejects.toMatchObject({
      name: 'ProcessingWorkerInitTimeout',
    });
  });
});
