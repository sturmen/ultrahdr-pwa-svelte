/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { DIAGNOSTICS_REPORTS_KEY } from '../diagnostics.ts';

const previewMocks = vi.hoisted(() => ({
  runtimeProcessMock: vi.fn(),
  loadQueueStateMock: vi.fn(async () => null),
  storeQueueStateMock: vi.fn(async () => {}),
  clearQueueStateMock: vi.fn(async () => {}),
  normalizePersistedQueueStateMock: vi.fn((snapshot: unknown) => snapshot),
  storeQueueInputFileMock: vi.fn(async () => {}),
  getQueueInputFileMock: vi.fn(async (_queueId: number) => null),
  storeQueueOutputBlobMock: vi.fn(async () => {}),
  getQueueOutputBlobMock: vi.fn(async (_queueId: number) => null),
  storeQueuePreviewBlobMock: vi.fn(async () => {}),
  getQueuePreviewBlobMock: vi.fn(async (_queueId: number) => null),
  storeQueueOutputPreviewBlobMock: vi.fn(async () => {}),
  getQueueOutputPreviewBlobMock: vi.fn(async (_queueId: number) => null),
  deleteQueuePayloadsMock: vi.fn(async () => {}),
  clearSessionQueuePayloadsMock: vi.fn(async () => {}),
  shouldPauseForStorageWriteMock: vi.fn(async () => ({
    pause: false,
    remaining: 1024 * 1024 * 1024,
    requiredBytes: 0,
  })),
  probeInputProcessingPathFromHeadersMock: vi.fn(async () => 'unknown'),
  classifyInputProcessingPathMock: vi.fn(async () => 'unknown'),
  loadImageDataMock: vi.fn(async (file: Blob) => ({
    imageData: new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1),
    width: 1,
    height: 1,
  })),
  resizeImageDataMock: vi.fn(async (imageData: ImageData) => imageData),
  imageDataToJpegBlobMock: vi.fn(async () => new Blob(['jpeg-preview'], { type: 'image/jpeg' })),
  processTiffMock: vi.fn(async () => ({
    data: new Uint8Array([0, 255, 0, 255]),
    width: 1,
    height: 1,
    strideBytes: 4,
    pixelFormat: 'rgba8' as const,
    bitDepth: 8,
  })),
  decodeHeifPreviewImageMock: vi.fn(async () => ({
    data: new Uint8Array([0, 0, 255, 255]),
    width: 1,
    height: 1,
    strideBytes: 4,
    pixelFormat: 'rgba8' as const,
    bitDepth: 8,
  })),
}));

vi.mock('../share-store.ts', () => ({
  clearQueueState: previewMocks.clearQueueStateMock,
  loadQueueState: previewMocks.loadQueueStateMock,
  normalizePersistedQueueState: previewMocks.normalizePersistedQueueStateMock,
  storeQueueState: previewMocks.storeQueueStateMock,
  storeQueueInputFile: previewMocks.storeQueueInputFileMock,
  getQueueInputFile: previewMocks.getQueueInputFileMock,
  storeQueueOutputBlob: previewMocks.storeQueueOutputBlobMock,
  getQueueOutputBlob: previewMocks.getQueueOutputBlobMock,
  storeQueuePreviewBlob: previewMocks.storeQueuePreviewBlobMock,
  getQueuePreviewBlob: previewMocks.getQueuePreviewBlobMock,
  storeQueueOutputPreviewBlob: previewMocks.storeQueueOutputPreviewBlobMock,
  getQueueOutputPreviewBlob: previewMocks.getQueueOutputPreviewBlobMock,
  deleteQueuePayloads: previewMocks.deleteQueuePayloadsMock,
  clearSessionQueuePayloads: previewMocks.clearSessionQueuePayloadsMock,
  shouldPauseForStorageWrite: previewMocks.shouldPauseForStorageWriteMock,
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
  getProcessingProfile: vi.fn(() => ({
    memoryTier: 'mid',
  })),
}));

vi.mock('../processing-path.js', () => ({
  probeInputProcessingPathFromHeaders:
    previewMocks.probeInputProcessingPathFromHeadersMock,
  classifyInputProcessingPath: previewMocks.classifyInputProcessingPathMock,
}));

vi.mock('../image-utils.js', () => ({
  loadImageData: previewMocks.loadImageDataMock,
  resizeImageData: previewMocks.resizeImageDataMock,
  imageDataToJpegBlob: previewMocks.imageDataToJpegBlobMock,
}));

vi.mock('../tiff-processing.js', () => ({
  processTiff: previewMocks.processTiffMock,
}));

vi.mock('../heic-processing.js', () => ({
  decodeHeifPreviewImage: previewMocks.decodeHeifPreviewImageMock,
}));

import ImageProcessor from '../ImageProcessor.svelte';

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createRuntime() {
  return {
    process: previewMocks.runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

function createMemoryStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(String(key), String(value));
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(String(key));
    }),
    clear: vi.fn(() => {
      data.clear();
    }),
  };
}

describe('ImageProcessor input previews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
    previewMocks.loadQueueStateMock.mockResolvedValue(null);
    previewMocks.getQueueInputFileMock.mockImplementation(async (queueId: number) =>
      new File([`stored-${queueId}`], `photo-${queueId}.jpg`, { type: 'image/jpeg' }),
    );
    previewMocks.getQueueOutputBlobMock.mockResolvedValue(null);
    previewMocks.getQueuePreviewBlobMock.mockResolvedValue(null);
    previewMocks.probeInputProcessingPathFromHeadersMock.mockResolvedValue('unknown');
    previewMocks.loadImageDataMock.mockImplementation(async () => ({
      imageData: new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1),
      width: 1,
      height: 1,
    }));
    previewMocks.resizeImageDataMock.mockImplementation(async (imageData: ImageData) => imageData);
    previewMocks.imageDataToJpegBlobMock.mockImplementation(
      async () => new Blob(['jpeg-preview'], { type: 'image/jpeg' }),
    );
    previewMocks.processTiffMock.mockImplementation(async () => ({
      data: new Uint8Array([0, 255, 0, 255]),
      width: 1,
      height: 1,
      strideBytes: 4,
      pixelFormat: 'rgba8',
      bitDepth: 8,
    }));
    previewMocks.decodeHeifPreviewImageMock.mockImplementation(async () => ({
      data: new Uint8Array([0, 0, 255, 255]),
      width: 1,
      height: 1,
      strideBytes: 4,
      pixelFormat: 'rgba8',
      bitDepth: 8,
    }));
    previewMocks.runtimeProcessMock.mockResolvedValue(
      new Blob(['converted'], { type: 'image/jpeg' }),
    );
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

  it('uses TIFF decoding to persist a browser-safe jpeg preview for TIFF inputs', async () => {
    previewMocks.loadImageDataMock.mockRejectedValueOnce(
      new Error('browser cannot decode TIFF preview source'),
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['tiff'], 'scan.tiff', { type: 'image/tiff' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(previewMocks.storeQueuePreviewBlobMock).toHaveBeenCalled();
    });

    expect(previewMocks.processTiffMock).toHaveBeenCalledTimes(1);
    const previewBlob = previewMocks.storeQueuePreviewBlobMock.mock.calls.at(-1)?.[1];
    expect(previewBlob).toBeInstanceOf(Blob);
    expect(previewBlob?.type).toBe('image/jpeg');
  });

  it('repairs restored queue items with missing previews by regenerating and persisting a jpeg preview', async () => {
    previewMocks.loadQueueStateMock.mockResolvedValue({
      workflowState: 'PROCESSING_ACTIVE',
      settingsVersion: 2,
      launchSource: 'regular',
      hasPending: true,
      updatedAt: 123,
      queue: [
        {
          id: 7,
          name: 'scan.tiff',
          status: 'queued',
          settingsVersion: 2,
          error: null,
          processingPath: 'unknown',
        },
      ],
    });
    previewMocks.getQueueInputFileMock.mockResolvedValue(
      new File(['tiff'], 'scan.tiff', { type: 'image/tiff' }),
    );
    previewMocks.loadImageDataMock.mockRejectedValueOnce(
      new Error('browser cannot decode restored TIFF preview source'),
    );

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(previewMocks.storeQueuePreviewBlobMock).toHaveBeenCalledWith(
        7,
        expect.any(Blob),
      );
    });

    const previewBlob = previewMocks.storeQueuePreviewBlobMock.mock.calls.at(-1)?.[1];
    expect(previewBlob?.type).toBe('image/jpeg');
  });

  it('defers raw HDR HEIF preview persistence and fills it in asynchronously as jpeg', async () => {
    const hdrPreviewGate = createDeferred<{
      data: Uint8Array;
      width: number;
      height: number;
      strideBytes: number;
      pixelFormat: 'rgba8';
      bitDepth: number;
    }>();
    previewMocks.probeInputProcessingPathFromHeadersMock.mockResolvedValue('hdr-intent');
    previewMocks.loadImageDataMock.mockRejectedValueOnce(
      new Error('browser cannot decode HDR HEIF preview source'),
    );
    previewMocks.decodeHeifPreviewImageMock.mockImplementationOnce(
      async () => hdrPreviewGate.promise,
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['hdr-heif'], 'photo.hif', { type: 'image/heif' })],
        runtime: createRuntime(),
      },
    });

    await Promise.resolve();

    expect(previewMocks.storeQueuePreviewBlobMock).not.toHaveBeenCalled();

    hdrPreviewGate.resolve({
      data: new Uint8Array([0, 0, 255, 255]),
      width: 1,
      height: 1,
      strideBytes: 4,
      pixelFormat: 'rgba8',
      bitDepth: 8,
    });

    await waitFor(() => {
      expect(previewMocks.storeQueuePreviewBlobMock).toHaveBeenCalled();
    });

    const previewBlob = previewMocks.storeQueuePreviewBlobMock.mock.calls.at(-1)?.[1];
    expect(previewBlob?.type).toBe('image/jpeg');
  });

  it('records a deferred preview diagnostics breadcrumb and keeps the queue healthy when jpegli preview decode fails', async () => {
    previewMocks.probeInputProcessingPathFromHeadersMock.mockResolvedValue('hdr-intent');
    previewMocks.loadImageDataMock.mockRejectedValueOnce(
      new Error('browser cannot decode HDR HEIF preview source'),
    );
    previewMocks.decodeHeifPreviewImageMock.mockRejectedValueOnce(
      new Error('Jpegli WASM module failed to load'),
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['hdr-heif'], 'photo.hif', { type: 'image/heif' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      const persisted = JSON.parse(
        window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
      ) as { events: Array<{ name: string; severity: string; context: Record<string, unknown> }> };
      expect(
        persisted.events.some((event) => event.name === 'deferred-input-preview-failed'),
      ).toBe(true);
    });

    expect(previewMocks.storeQueuePreviewBlobMock).not.toHaveBeenCalled();
    expect(screen.getAllByTestId('workflow-card-0').length).toBeGreaterThan(0);

    const persisted = JSON.parse(
      window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
    ) as { events: Array<{ name: string; severity: string; context: Record<string, unknown> }> };
    const previewFailure = persisted.events.find(
      (event) => event.name === 'deferred-input-preview-failed',
    );
    expect(previewFailure).toEqual(
      expect.objectContaining({
        severity: 'warning',
        context: expect.objectContaining({
          queueId: 0,
          trigger: 'deferred-input-preview',
          errorCategory: 'jpegli-load-failed',
        }),
      }),
    );
  });
});
