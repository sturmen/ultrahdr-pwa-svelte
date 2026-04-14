/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import ImageProcessor from '../ImageProcessor.svelte';
import { DIAGNOSTICS_ACTIVE_SESSION_KEY } from '../diagnostics.ts';
import { storeQueuePreviewBlob, storeQueueState } from '../share-store.ts';

const runtimeProcessMock = vi.fn();

type Deferred<T = unknown> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

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
  getProcessingProfile: vi.fn(() => ({
    memoryTier: 'mid',
  })),
}));

vi.mock('../share-store.ts', () => ({
  clearSessionQueuePayloads: vi.fn(async () => {}),
  clearQueueState: vi.fn(async () => {}),
  deleteQueuePayloads: vi.fn(async () => {}),
  getQueueInputFile: vi.fn(async (queueId) =>
    new File([`input-${queueId}`], `photo-${queueId}.jpg`, { type: 'image/jpeg' })),
  getQueueOutputBlob: vi.fn(async () => new Blob(['done'], { type: 'image/jpeg' })),
  getQueueOutputPreviewBlob: vi.fn(async () => new Blob(['preview'], { type: 'image/jpeg' })),
  loadQueueState: vi.fn(async () => null),
  normalizePersistedQueueState: vi.fn((snapshot) => snapshot),
  shouldPauseForStorageWrite: vi.fn(async () => ({
    pause: false,
    remaining: 1024 * 1024 * 1024,
    requiredBytes: 0,
  })),
  storeQueueInputFile: vi.fn(async () => {}),
  storeQueueOutputBlob: vi.fn(async () => {}),
  storeQueueOutputPreviewBlob: vi.fn(async () => {}),
  storeQueuePreviewBlob: vi.fn(async () => {}),
  storeQueueState: vi.fn(async () => {}),
}));

function createDeferred<T = unknown>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeFile(name = 'photo.jpg') {
  return new File(['file'], name, { type: 'image/jpeg' });
}

function createRuntime() {
  return {
    process: runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

describe('ImageProcessor lifecycle durability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeProcessMock.mockReset();
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
    runtimeProcessMock.mockImplementationOnce(async () => {
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
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
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

  it('clears stale background evidence when the tab becomes visible again during processing', async () => {
    const processingGate = createDeferred();
    runtimeProcessMock.mockImplementationOnce(async () => {
      await processingGate.promise;
      return new Blob(['done'], { type: 'image/jpeg' });
    });

    render(ImageProcessor, {
      props: {
        files: [makeFile()],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    const persisted = JSON.parse(
      window.localStorage.getItem(DIAGNOSTICS_ACTIVE_SESSION_KEY) || 'null',
    ) as Record<string, unknown> | null;
    const snapshot = (persisted?.processingSnapshot || {}) as Record<string, unknown>;
    expect(snapshot.documentHidden).toBe(false);
    expect(snapshot.lastPageHideAt).toBeNull();

    processingGate.resolve();
  });

  it('flushes queue state to storage when pagehide fires', async () => {
    const processingGate = createDeferred();
    runtimeProcessMock.mockImplementationOnce(async () => {
      await processingGate.promise;
      return new Blob(['done'], { type: 'image/jpeg' });
    });

    render(ImageProcessor, {
      props: {
        files: [makeFile()],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
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

  it('does not reopen the diagnostics popup after an idle background relaunch', async () => {
    const firstRender = render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await Promise.resolve();
    window.dispatchEvent(new Event('pagehide'));
    firstRender.unmount();

    expect(window.localStorage.getItem(DIAGNOSTICS_ACTIVE_SESSION_KEY)).toBeTruthy();

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await Promise.resolve();
    expect(screen.queryByTestId('diagnostics-report-dialog')).not.toBeInTheDocument();
  });

  it('reopens the diagnostics popup after a foreground interrupted processing relaunch', async () => {
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-foreground',
        active: true,
        processingActiveAtLastPersist: false,
        cleanExit: false,
        updatedAt: 2000,
        processingSnapshot: {
          currentQueueId: 0,
          queueIndex: 0,
          totalFiles: 2,
          currentStage: 'generate-gain-map',
          currentPhase: 'stage-progress',
          documentHidden: false,
          lastPageHideAt: null,
          recentPipelineBreadcrumbs: [],
        },
      }),
    );

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('diagnostics-report-dialog')).toBeInTheDocument();
      expect(screen.getByText(/foreground-kill-recovered/i)).toBeInTheDocument();
    });
  });

  it('uses scheduler.postTask for non-urgent queue persistence when available', async () => {
    const processingGate = createDeferred();
    runtimeProcessMock.mockImplementationOnce(async () => {
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
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
      expect(postTask).toHaveBeenCalled();
    });

    processingGate.resolve();
  });

  it('stores a jpeg preview without creating a graphics element', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string | HTMLElementTagNameMap[keyof HTMLElementTagNameMap], options?: ElementCreationOptions) => {
      if (String(tagName).toLowerCase() === ['can', 'vas'].join('')) {
        throw new Error('graphics elements should not be used for previews');
      }
      return originalCreateElement(tagName as string, options);
    });

    const pngBytes = await readFile(path.resolve(process.cwd(), 'fixtures/exif_matrix.png'));
    render(ImageProcessor, {
      props: {
        files: [new File([pngBytes], 'photo.png', { type: 'image/png' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(vi.mocked(storeQueuePreviewBlob)).toHaveBeenCalled();
    });

    const previewBlob = vi.mocked(storeQueuePreviewBlob).mock.calls.at(-1)?.[1];
    expect(previewBlob).toBeInstanceOf(Blob);
    expect(previewBlob?.type).toBe('image/jpeg');
    expect(createElementSpy).not.toHaveBeenCalledWith(expect.stringMatching(/^can(?:vas)$/i));
  }, 15_000);
});
