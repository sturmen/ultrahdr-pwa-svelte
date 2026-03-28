/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

const storageMocks = vi.hoisted(() => ({
  runtimeProcessMock: vi.fn(),
  loadQueueStateMock: vi.fn(async () => null),
  storeQueueStateMock: vi.fn(async () => {}),
  clearQueueStateMock: vi.fn(async () => {}),
  normalizePersistedQueueStateMock: vi.fn((snapshot) => snapshot),
  storeQueueInputFileMock: vi.fn(async () => {}),
  getQueueInputFileMock: vi.fn(async (_queueId: number) => null),
  storeQueueOutputBlobMock: vi.fn(async () => {}),
  getQueueOutputBlobMock: vi.fn(async (_queueId: number) => null),
  storeQueuePreviewBlobMock: vi.fn(async () => {}),
  getQueuePreviewBlobMock: vi.fn(async (_queueId: number) => null),
  deleteQueuePayloadsMock: vi.fn(async () => {}),
  clearSessionQueuePayloadsMock: vi.fn(async () => {}),
  shouldPauseForStorageWriteMock: vi.fn(async () => ({
    pause: false,
    remaining: 1024 * 1024 * 1024,
    requiredBytes: 0,
  })),
}));

const {
  runtimeProcessMock,
  loadQueueStateMock,
  storeQueueStateMock,
  clearQueueStateMock,
  normalizePersistedQueueStateMock,
  storeQueueInputFileMock,
  getQueueInputFileMock,
  storeQueueOutputBlobMock,
  getQueueOutputBlobMock,
  storeQueuePreviewBlobMock,
  getQueuePreviewBlobMock,
  deleteQueuePayloadsMock,
  clearSessionQueuePayloadsMock,
  shouldPauseForStorageWriteMock,
} = storageMocks;

vi.mock('../share-store.ts', () => ({
  clearQueueState: storageMocks.clearQueueStateMock,
  loadQueueState: storageMocks.loadQueueStateMock,
  normalizePersistedQueueState: storageMocks.normalizePersistedQueueStateMock,
  storeQueueState: storageMocks.storeQueueStateMock,
  storeQueueInputFile: storageMocks.storeQueueInputFileMock,
  getQueueInputFile: storageMocks.getQueueInputFileMock,
  storeQueueOutputBlob: storageMocks.storeQueueOutputBlobMock,
  getQueueOutputBlob: storageMocks.getQueueOutputBlobMock,
  storeQueuePreviewBlob: storageMocks.storeQueuePreviewBlobMock,
  getQueuePreviewBlob: storageMocks.getQueuePreviewBlobMock,
  deleteQueuePayloads: storageMocks.deleteQueuePayloadsMock,
  clearSessionQueuePayloads: storageMocks.clearSessionQueuePayloadsMock,
  shouldPauseForStorageWrite: storageMocks.shouldPauseForStorageWriteMock,
}));

vi.mock('../capabilities.js', () => ({
  getCapabilities: vi.fn(() => ({
    userAgent: 'test-agent',
    deviceMemory: 8,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isStandalone: false,
    supportsShare: false,
    supportsFileShare: false,
    supportsShareTarget: true,
    supportsWakeLock: false,
    supportsOffscreenWorker: true,
  })),
}));

import ImageProcessor from '../ImageProcessor.svelte';

function createDeferred() {
  let resolve: (value?: Blob | PromiseLike<Blob>) => void;
  let reject: (reason?: unknown) => void;
  const promise = new Promise<Blob>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
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

function makeFiles(count = 1) {
  return Array.from({ length: count }, (_, index) =>
    new File([`input-${index}`], `photo-${index}.jpg`, { type: 'image/jpeg' }),
  );
}

describe('ImageProcessor storage-backed queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadQueueStateMock.mockReset();
    loadQueueStateMock.mockResolvedValue(null);
    normalizePersistedQueueStateMock.mockReset();
    normalizePersistedQueueStateMock.mockImplementation((snapshot) => snapshot);
    getQueueInputFileMock.mockReset();
    getQueueInputFileMock.mockResolvedValue(null);
    getQueueOutputBlobMock.mockReset();
    getQueueOutputBlobMock.mockResolvedValue(null);
    getQueuePreviewBlobMock.mockReset();
    getQueuePreviewBlobMock.mockResolvedValue(null);
    runtimeProcessMock.mockReset();
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
    Object.defineProperty(window.navigator, 'setAppBadge', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
    Object.defineProperty(window.navigator, 'clearAppBadge', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
  });

  it('persists inputs and hydrates only the active queue item from storage for processing', async () => {
    const files = makeFiles(2);
    const hydratedFirst = new File(['stored-0'], 'photo-0.jpg', { type: 'image/jpeg' });
    const firstGate = createDeferred();

    getQueueInputFileMock
      .mockResolvedValueOnce(hydratedFirst)
      .mockResolvedValueOnce(new File(['stored-1'], 'photo-1.jpg', { type: 'image/jpeg' }));
    runtimeProcessMock
      .mockImplementationOnce(async (file: File) => {
        expect(await file.text()).toBe('stored-0');
        await firstGate.promise;
        return new Blob(['output-0'], { type: 'image/jpeg' });
      })
      .mockImplementationOnce(async (file: File) => {
        expect(await file.text()).toBe('stored-1');
        return new Blob(['output-1'], { type: 'image/jpeg' });
      });

    render(ImageProcessor, {
      props: {
        files,
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(storeQueueInputFileMock).toHaveBeenCalledTimes(2);
      expect(getQueueInputFileMock).toHaveBeenCalledWith(0);
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    firstGate.resolve(new Blob(['ok'], { type: 'image/jpeg' }));

    await waitFor(() => {
      expect(getQueueInputFileMock).toHaveBeenCalledWith(1);
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
  });

  it('restores recoverable pending queue work and resumes it automatically on launch', async () => {
    loadQueueStateMock.mockResolvedValue({
      workflowState: 'PROCESSING_ACTIVE',
      settingsVersion: 3,
      launchSource: 'regular',
      hasPending: true,
      updatedAt: 123,
      queue: [
        {
          id: 7,
          name: 'restored.jpg',
          status: 'queued',
          settingsVersion: 3,
          error: null,
          processingPath: 'unknown',
        },
      ],
    });
    getQueueInputFileMock.mockResolvedValue(
      new File(['restored-input'], 'restored.jpg', { type: 'image/jpeg' }),
    );
    getQueuePreviewBlobMock.mockResolvedValue(
      new Blob(['preview'], { type: 'image/jpeg' }),
    );
    runtimeProcessMock.mockResolvedValue(
      new Blob(['restored-output'], { type: 'image/jpeg' }),
    );

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(loadQueueStateMock).toHaveBeenCalledTimes(1);
      expect(getQueueInputFileMock).toHaveBeenCalledWith(7);
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/resumed 1/i)).toBeInTheDocument();
    });
  });

  it('marks unrecoverable pending queue items as failed instead of silently dropping them', async () => {
    loadQueueStateMock.mockResolvedValue({
      workflowState: 'PROCESSING_ACTIVE',
      settingsVersion: 2,
      launchSource: 'regular',
      hasPending: true,
      updatedAt: 456,
      queue: [
        {
          id: 3,
          name: 'missing.jpg',
          status: 'queued',
          settingsVersion: 2,
          error: null,
          processingPath: 'unknown',
        },
      ],
    });
    getQueueInputFileMock.mockResolvedValue(null);

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(runtimeProcessMock).not.toHaveBeenCalled();
      expect(screen.getByText(/1 missing/i)).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('tab-results'));
    expect(screen.getByText(/restore failed: input missing/i)).toBeInTheDocument();
  });

  it('retries only failed restored items from the overflow actions', async () => {
    loadQueueStateMock.mockResolvedValue({
      workflowState: 'ERROR_RECOVERABLE',
      settingsVersion: 1,
      launchSource: 'regular',
      hasPending: false,
      updatedAt: 789,
      queue: [
        {
          id: 0,
          name: 'failed.jpg',
          status: 'failed',
          settingsVersion: 1,
          error: 'Decode failed',
          processingPath: 'unknown',
        },
        {
          id: 1,
          name: 'done.jpg',
          status: 'completed',
          settingsVersion: 1,
          error: null,
          processingPath: 'generated',
        },
      ],
    });
    getQueueInputFileMock.mockImplementation(async (queueId: number) => {
      if (queueId === 0) {
        return new File(['retry-input'], 'failed.jpg', { type: 'image/jpeg' });
      }
      return new File(['done-input'], 'done.jpg', { type: 'image/jpeg' });
    });
    getQueuePreviewBlobMock.mockResolvedValue(
      new Blob(['preview'], { type: 'image/jpeg' }),
    );
    runtimeProcessMock.mockResolvedValue(
      new Blob(['retry-output'], { type: 'image/jpeg' }),
    );

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('queue-overflow-trigger')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('queue-overflow-trigger'));
    await fireEvent.click(screen.getByRole('button', { name: /^retry failed$/i }));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(runtimeProcessMock.mock.calls[0][0]).toBeInstanceOf(File);
    expect(await runtimeProcessMock.mock.calls[0][0].text()).toBe('retry-input');
  });

  it('stores outputs and loads them lazily from storage when exporting', async () => {
    const outputBlob = new Blob(['stored-output'], { type: 'image/jpeg' });
    getQueueInputFileMock.mockResolvedValue(new File(['stored-0'], 'photo-0.jpg', { type: 'image/jpeg' }));
    getQueueOutputBlobMock.mockResolvedValue(outputBlob);
    runtimeProcessMock.mockResolvedValue(new Blob(['runtime-output'], { type: 'image/jpeg' }));

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(ImageProcessor, {
      props: {
        files: makeFiles(1),
        runtime: createRuntime(),
      },
    });

    await fireEvent.click(screen.getByTestId('tab-results'));
    await waitFor(() => {
      expect(storeQueueOutputBlobMock).toHaveBeenCalledWith(0, expect.any(Blob));
      expect(screen.getByRole('button', { name: /^export \(1\)$/i })).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByRole('button', { name: /^export \(1\)$/i }));
    await fireEvent.click(screen.getByRole('button', { name: /^download$/i }));

    await waitFor(() => {
      expect(getQueueOutputBlobMock).toHaveBeenCalledWith(0);
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it('deletes queue payloads when an item is removed and clears session payloads on discard all', async () => {
    getQueueInputFileMock.mockResolvedValue(new File(['stored-0'], 'photo-0.jpg', { type: 'image/jpeg' }));
    runtimeProcessMock.mockResolvedValue(new Blob(['runtime-output'], { type: 'image/jpeg' }));

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(ImageProcessor, {
      props: {
        files: makeFiles(1),
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-0')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTitle('Remove image'));

    await waitFor(() => {
      expect(deleteQueuePayloadsMock).toHaveBeenCalledWith(0);
      expect(clearSessionQueuePayloadsMock).toHaveBeenCalled();
    });
  });

  it('pauses and shows a notice when storage headroom is too low', async () => {
    shouldPauseForStorageWriteMock.mockResolvedValueOnce({
      pause: true,
      remaining: 1024,
      requiredBytes: 4096,
    });

    render(ImageProcessor, {
      props: {
        files: makeFiles(1),
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(runtimeProcessMock).not.toHaveBeenCalled();
      expect(screen.getByTestId('notice-message')).toHaveTextContent(/storage/i);
    });
  });
});
