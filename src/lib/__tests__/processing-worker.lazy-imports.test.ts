/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const lazyWorkerMocks = vi.hoisted(() => ({
  processingCoreModuleLoads: vi.fn(),
  runtimeInitializationModuleLoads: vi.fn(),
  processImageMock: vi.fn(async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })),
  initializeRuntimeMock: vi.fn(async () => ({ resolvedExecutionProvider: 'wasm' })),
}));

vi.mock('../processing-core.ts', () => {
  lazyWorkerMocks.processingCoreModuleLoads();
  return {
    processImage: lazyWorkerMocks.processImageMock,
  };
});

vi.mock('../runtime-initialization.ts', () => {
  lazyWorkerMocks.runtimeInitializationModuleLoads();
  return {
    initializeRuntime: lazyWorkerMocks.initializeRuntimeMock,
  };
});

vi.mock('../runtime-contract.ts', () => ({
  sanitizeRuntimeInitOptions: vi.fn((options: Record<string, unknown> | null = null) => options || {}),
}));

type WorkerListener = (event: MessageEvent<Record<string, unknown>>) => void;

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('processing worker lazy imports', () => {
  const originalSelf = globalThis.self;
  let messageListener: WorkerListener | null = null;
  let postedMessages: Array<Record<string, unknown>> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    messageListener = null;
    postedMessages = [];
    Object.defineProperty(globalThis, 'self', {
      configurable: true,
      value: {
        addEventListener: vi.fn((type: string, callback: WorkerListener) => {
          if (type === 'message') {
            messageListener = callback;
          }
        }),
        postMessage: vi.fn((message: Record<string, unknown>) => {
          postedMessages.push(message);
        }),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'self', {
      configurable: true,
      value: originalSelf,
    });
  });

  it('defers runtime and processing imports until init and process messages are handled', async () => {
    await import('../processing-worker.ts');

    expect(lazyWorkerMocks.runtimeInitializationModuleLoads).not.toHaveBeenCalled();
    expect(lazyWorkerMocks.processingCoreModuleLoads).not.toHaveBeenCalled();
    expect(messageListener).not.toBeNull();

    messageListener?.({
      data: {
        type: 'init',
        options: { runtimeMode: 'wasm' },
      },
    } as MessageEvent<Record<string, unknown>>);

    await flushMicrotasks();

    expect(lazyWorkerMocks.runtimeInitializationModuleLoads).toHaveBeenCalledTimes(1);
    expect(lazyWorkerMocks.processingCoreModuleLoads).not.toHaveBeenCalled();
    expect(postedMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'init-progress',
          event: expect.objectContaining({
            stepId: 'worker-module-load',
            status: 'running',
          }),
        }),
        expect.objectContaining({
          type: 'ready',
          runtime: expect.objectContaining({
            resolvedExecutionProvider: 'wasm',
          }),
        }),
      ]),
    );

    const file = new File([new Uint8Array([1, 2, 3])], 'worker-input.jpg', {
      type: 'image/jpeg',
    });
    messageListener?.({
      data: {
        type: 'process',
        jobId: 41,
        file,
        options: {},
      },
    } as MessageEvent<Record<string, unknown>>);

    await flushMicrotasks();

    expect(lazyWorkerMocks.processingCoreModuleLoads).toHaveBeenCalledTimes(1);
    expect(lazyWorkerMocks.processImageMock).toHaveBeenCalledTimes(1);
    expect(postedMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'progress',
          jobId: 41,
          event: expect.objectContaining({
            stepId: 'worker-module-load',
            status: 'passed',
          }),
        }),
        expect.objectContaining({
          type: 'result',
          jobId: 41,
          mimeType: 'image/jpeg',
        }),
      ]),
    );
  });
});
