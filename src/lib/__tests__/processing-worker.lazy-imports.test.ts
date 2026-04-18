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
  let messageListeners: WorkerListener[] = [];
  let postedMessages: Array<Record<string, unknown>> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    messageListeners = [];
    postedMessages = [];
    Object.defineProperty(globalThis, 'self', {
      configurable: true,
      value: {
        addEventListener: vi.fn((type: string, callback: WorkerListener) => {
          if (type === 'message') {
            messageListeners.push(callback);
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
    expect(messageListeners).toHaveLength(1);

    messageListeners[0]?.({
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
    messageListeners[0]?.({
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

  it('forwards processing options into worker-side processing', async () => {
    await import('../processing-worker.ts');

    messageListeners[0]?.({
      data: {
        type: 'init',
        options: { runtimeMode: 'wasm' },
      },
    } as MessageEvent<Record<string, unknown>>);

    await flushMicrotasks();

    const file = new File([new Uint8Array([1, 2, 3])], 'worker-input.heic', {
      type: 'image/heic',
    });
    messageListeners[0]?.({
      data: {
        type: 'process',
        jobId: 42,
        file,
        options: {
          processingRequestKey: 'queue:42',
        },
      },
    } as MessageEvent<Record<string, unknown>>);

    await flushMicrotasks();

    expect(lazyWorkerMocks.processImageMock).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        processingRequestKey: 'queue:42',
      }),
    );
  });

  it('ignores duplicate worker process messages that replay the same job id', async () => {
    await import('../processing-worker.ts');

    messageListeners[0]?.({
      data: {
        type: 'init',
        options: { runtimeMode: 'wasm' },
      },
    } as MessageEvent<Record<string, unknown>>);

    await flushMicrotasks();

    const file = new File([new Uint8Array([1, 2, 3])], 'worker-input.heic', {
      type: 'image/heic',
    });
    const processMessage = {
      data: {
        type: 'process',
        jobId: 77,
        file,
        options: {
          processingRequestKey: 'queue:77',
        },
      },
    } as MessageEvent<Record<string, unknown>>;

    messageListeners[0]?.(processMessage);
    await flushMicrotasks();
    messageListeners[0]?.(processMessage);
    await flushMicrotasks();

    expect(lazyWorkerMocks.processImageMock).toHaveBeenCalledTimes(1);
    expect(
      postedMessages.filter((message) => message.type === 'result' && message.jobId === 77),
    ).toHaveLength(1);
  });

  it('shares duplicate-job protection across duplicate worker listeners', async () => {
    await import('../processing-worker.ts');
    const firstListener = messageListeners[0];

    vi.resetModules();
    await import('../processing-worker.ts');
    expect(messageListeners).toHaveLength(2);
    const secondListener = messageListeners[1];

    firstListener?.({
      data: {
        type: 'init',
        options: { runtimeMode: 'wasm' },
      },
    } as MessageEvent<Record<string, unknown>>);
    secondListener?.({
      data: {
        type: 'init',
        options: { runtimeMode: 'wasm' },
      },
    } as MessageEvent<Record<string, unknown>>);

    await flushMicrotasks();

    const file = new File([new Uint8Array([1, 2, 3])], 'worker-input.heic', {
      type: 'image/heic',
    });
    const processMessage = {
      data: {
        type: 'process',
        jobId: 88,
        file,
        options: {
          processingRequestKey: 'queue:88',
        },
      },
    } as MessageEvent<Record<string, unknown>>;

    firstListener?.(processMessage);
    secondListener?.(processMessage);
    await flushMicrotasks();

    expect(lazyWorkerMocks.processImageMock).toHaveBeenCalledTimes(1);
    expect(
      postedMessages.filter((message) => message.type === 'result' && message.jobId === 88),
    ).toHaveLength(1);
    expect(
      postedMessages.filter((message) => message.type === 'error' && message.jobId === 88),
    ).toHaveLength(0);
  });

  it('does not emit temporary verbose startup breadcrumbs on worker import', async () => {
    await import('../processing-worker.ts');

    expect(
      postedMessages.some(
        (message) =>
          message.type === 'init-progress'
          && message.event?.phase === 'verbose-debug-breadcrumb',
      ),
    ).toBe(false);
  });
});
