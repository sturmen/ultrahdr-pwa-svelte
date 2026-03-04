/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';
import { processImage } from '../processing';
import { storeQueueState } from '../share-store.js';

vi.mock('../processing', () => ({
  processImage: vi.fn(),
}));

vi.mock('../capabilities.js', () => ({
  getCapabilities: vi.fn(() => ({
    userAgent: 'test-agent',
    deviceMemory: 8,
    isIOS: false,
    isAndroid: true,
    isSafari: false,
    isStandalone: false,
    supportsShare: false,
    supportsFileShare: false,
    supportsShareTarget: true,
    supportsWakeLock: true,
    supportsOffscreenWorker: true,
  })),
}));

vi.mock('../share-store.js', () => ({
  clearQueueState: vi.fn(async () => {}),
  loadQueueState: vi.fn(async () => null),
  storeQueueState: vi.fn(async () => {}),
}));

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeFile(name = 'photo.jpg') {
  return new File(['file'], name, { type: 'image/jpeg' });
}

describe('ImageProcessor lifecycle durability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete globalThis.scheduler;
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('reacquires wake lock when tab becomes visible again during active queue processing', async () => {
    const processingGate = createDeferred();
    vi.mocked(processImage).mockImplementationOnce(async () => {
      await processingGate.promise;
      return new Blob(['done'], { type: 'image/jpeg' });
    });

    const releaseListeners = [];
    const requestWakeLock = vi.fn(async () => ({
      addEventListener: vi.fn((type, callback) => {
        if (type === 'release' && typeof callback === 'function') {
          releaseListeners.push(callback);
        }
      }),
      release: vi.fn(async () => {}),
    }));
    Object.defineProperty(window.navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: requestWakeLock,
      },
    });

    let hidden = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });

    render(ImageProcessor, {
      props: {
        files: [makeFile()],
      },
    });

    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(1);
      expect(requestWakeLock).toHaveBeenCalledTimes(1);
    });

    hidden = true;
    document.dispatchEvent(new Event('visibilitychange'));
    releaseListeners.forEach((listener) => listener());

    hidden = false;
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => {
      expect(requestWakeLock).toHaveBeenCalledTimes(2);
    });

    processingGate.resolve();
  });

  it('flushes queue state to storage when pagehide fires', async () => {
    const processingGate = createDeferred();
    vi.mocked(processImage).mockImplementationOnce(async () => {
      await processingGate.promise;
      return new Blob(['done'], { type: 'image/jpeg' });
    });

    render(ImageProcessor, {
      props: {
        files: [makeFile()],
      },
    });

    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(1);
    });
    await Promise.resolve();

    const callCountBeforePageHide = vi.mocked(storeQueueState).mock.calls.length;
    window.dispatchEvent(new Event('pagehide'));

    await waitFor(() => {
      expect(vi.mocked(storeQueueState).mock.calls.length).toBeGreaterThan(
        callCountBeforePageHide,
      );
    });

    processingGate.resolve();
  });

  it('uses scheduler.postTask for non-urgent queue persistence when available', async () => {
    const processingGate = createDeferred();
    vi.mocked(processImage).mockImplementationOnce(async () => {
      await processingGate.promise;
      return new Blob(['done'], { type: 'image/jpeg' });
    });

    const postTask = vi.fn(async (task) => {
      await task();
    });
    globalThis.scheduler = {
      postTask,
    };

    render(ImageProcessor, {
      props: {
        files: [makeFile()],
      },
    });

    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(1);
      expect(postTask).toHaveBeenCalled();
    });

    processingGate.resolve();
  });
});
