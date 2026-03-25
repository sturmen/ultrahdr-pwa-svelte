/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

const storageMocks = vi.hoisted(() => ({
  runtimeProcessMock: vi.fn(),
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
  clearQueueState: vi.fn(async () => {}),
  loadQueueState: vi.fn(async () => null),
  storeQueueState: vi.fn(async () => {}),
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
