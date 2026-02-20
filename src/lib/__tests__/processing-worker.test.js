/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PIPELINE_HISTORY_KEY,
  PIPELINE_STATE_KEY,
} from '../pipeline-telemetry.js';

const processImageCoreMock = vi.fn(async () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' }));

vi.mock('../processing-core.js', () => ({
  processImage: processImageCoreMock,
  throwIfAborted: vi.fn(),
  getConstrainedDimensions: vi.fn(() => ({ width: 1, height: 1, changed: false })),
  __resetGainMapGeneratorForTests: vi.fn(),
  generateGainMapData: vi.fn(),
  readFileAsDataURL: vi.fn(),
}));

class MockWorker {
  static instances = [];
  static onInit = null;
  static onProcess = null;
  static onCancel = null;

  constructor() {
    this.listeners = new Map();
    this.posted = [];
    MockWorker.instances.push(this);
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  emit(type, event) {
    const callbacks = this.listeners.get(type) || [];
    for (const callback of callbacks) {
      callback(event);
    }
  }

  postMessage(message) {
    this.posted.push(message);

    if (message.type === 'init') {
      if (typeof MockWorker.onInit === 'function') {
        MockWorker.onInit(this, message);
        return;
      }
      queueMicrotask(() => {
        this.emit('message', { data: { type: 'ready' } });
      });
      return;
    }

    if (message.type === 'process') {
      if (typeof MockWorker.onProcess === 'function') {
        MockWorker.onProcess(this, message);
        return;
      }

      queueMicrotask(() => {
        this.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-progress',
              stage: 'generate-gain-map',
              stageProgress: 33,
            },
          },
        });
      });

      queueMicrotask(() => {
        const buffer = new Uint8Array([9, 8, 7]).buffer;
        this.emit('message', {
          data: {
            type: 'result',
            jobId: message.jobId,
            mimeType: 'image/jpeg',
            buffer,
          },
        });
      });
      return;
    }

    if (message.type === 'cancel' && typeof MockWorker.onCancel === 'function') {
      MockWorker.onCancel(this, message);
    }
  }

  terminate() {
    // no-op for test
  }
}

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('processing worker wrapper', () => {
  const originalWorker = globalThis.Worker;
  const originalOffscreenCanvas = globalThis.OffscreenCanvas;
  const originalCreateImageBitmap = globalThis.createImageBitmap;
  const originalUserAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');

  beforeEach(() => {
    vi.resetModules();
    processImageCoreMock.mockClear();
    MockWorker.instances = [];
    MockWorker.onInit = null;
    MockWorker.onProcess = null;
    MockWorker.onCancel = null;
    delete window[PIPELINE_STATE_KEY];
    delete window[PIPELINE_HISTORY_KEY];
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    globalThis.OffscreenCanvas = originalOffscreenCanvas;
    globalThis.createImageBitmap = originalCreateImageBitmap;
    if (originalUserAgentDescriptor) {
      Object.defineProperty(window.navigator, 'userAgent', originalUserAgentDescriptor);
    }
    vi.useRealTimers();
  });

  it('fails fast when worker runtime is unavailable instead of falling back to main thread', async () => {
    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = undefined;
    globalThis.createImageBitmap = undefined;

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1])], 'input.jpg', { type: 'image/jpeg' });

    await expect(processImage(file, {})).rejects.toMatchObject({
      name: 'ProcessingWorkerUnavailableError',
    });
    expect(processImageCoreMock).not.toHaveBeenCalled();
  });

  it('fails fast when worker initialization fails instead of falling back to main thread', async () => {
    globalThis.Worker = class BrokenWorker {
      constructor() {
        throw new Error('worker init broke');
      }
    };
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1])], 'input.jpg', { type: 'image/jpeg' });

    await expect(processImage(file, {})).rejects.toMatchObject({
      name: 'ProcessingWorkerInitError',
    });
    expect(processImageCoreMock).not.toHaveBeenCalled();
  });

  it('initializeRuntime emits init-progress updates before resolving ready', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();
    const onProgress = vi.fn();
    MockWorker.onInit = (worker) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'init-progress',
            event: {
              stepId: 'webgpu-check',
              status: 'running',
              note: 'Checking WebGPU runtime support...',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'init-progress',
            event: {
              stepId: 'webgpu-check',
              status: 'passed',
              note: 'WebGPU runtime is available.',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', { data: { type: 'ready' } });
      });
    };

    const { initializeRuntime } = await import('../processing.js');
    await initializeRuntime({ onProgress });

    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        stepId: 'webgpu-check',
        status: 'running',
      }),
    );
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        stepId: 'webgpu-check',
        status: 'passed',
      }),
    );
  });

  it('initializeRuntime rejects with structured init-error payload from worker', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();
    MockWorker.onInit = (worker) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'init-error',
            error: {
              name: 'RuntimeInitializationError',
              message: 'WebGPU is unavailable in this environment.',
              code: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
              stepId: 'webgpu-check',
              userMessage: 'WebGPU is unavailable in this environment.',
              diagnostics: {
                hasNavigatorGpu: false,
              },
            },
          },
        });
      });
    };

    const { initializeRuntime } = await import('../processing.js');
    await expect(initializeRuntime()).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
      stepId: 'webgpu-check',
      diagnostics: expect.objectContaining({
        hasNavigatorGpu: false,
      }),
    });
  });

  it('uses worker processing and forwards progress telemetry', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();

    const resultPromise = processImage(file, { onProgress });
    await flush();
    const result = await resultPromise;

    expect(processImageCoreMock).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(Blob);
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
      }),
    );
    expect(window[PIPELINE_STATE_KEY]).toEqual(
      expect.objectContaining({ phase: 'stage-progress' }),
    );
    expect(Array.isArray(window[PIPELINE_HISTORY_KEY])).toBe(true);
  });

  it('sends cancel message and returns AbortError when aborted', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    MockWorker.onProcess = () => {
      // Wait for explicit cancel
    };
    MockWorker.onCancel = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'error',
            jobId: message.jobId,
            error: {
              name: 'AbortError',
              message: 'Operation aborted',
            },
          },
        });
      });
    };

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const controller = new AbortController();

    const promise = processImage(file, { abortSignal: controller.signal });
    await flush();
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });

    const worker = MockWorker.instances[0];
    expect(worker.posted.some((message) => message.type === 'cancel')).toBe(true);
  });

  it('rejects with a worker-timeout error when a worker job stalls with no messages', async () => {
    vi.useFakeTimers();
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    MockWorker.onProcess = () => {
      // Simulate a stuck worker job: no progress/result/error messages.
    };

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const promise = processImage(file, {});
    const rejection = expect(promise).rejects.toMatchObject({ name: 'ProcessingWorkerTimeoutError' });

    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(25_000);

    await rejection;
  });

  it('emits heartbeat progress during long inference with a user-facing status note', async () => {
    vi.useFakeTimers();
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    MockWorker.onProcess = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-complete',
              stage: 'wasm-load',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-start',
              stage: 'generate-gain-map',
              note: 'Starting inference; application may appear hung while AI model executes.',
              stageProgress: 0,
            },
          },
        });
      });
    };
    MockWorker.onCancel = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'error',
            jobId: message.jobId,
            error: {
              name: 'AbortError',
              message: 'Operation aborted',
            },
          },
        });
      });
    };

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();
    const controller = new AbortController();

    const promise = processImage(file, { onProgress, abortSignal: controller.signal });
    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(16_000);

    const heartbeatCalls = onProgress.mock.calls
      .map(([event]) => event)
      .filter((event) => event?.syntheticHeartbeat === true);
    expect(heartbeatCalls.length).toBeGreaterThan(0);
    expect(heartbeatCalls[0]).toEqual(
      expect.objectContaining({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        note: expect.stringMatching(/application may appear hung/i),
      }),
    );

    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('uses a longer inference timeout policy for Firefox before cancelling a stalled inference', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:132.0) Gecko/20100101 Firefox/132.0',
    });
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    MockWorker.onProcess = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-complete',
              stage: 'wasm-load',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-start',
              stage: 'generate-gain-map',
              stageProgress: 0,
            },
          },
        });
      });
    };

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    let settled = false;
    const promise = processImage(file, {});
    promise.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );

    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(181_000);
    await Promise.resolve();
    expect(settled).toBe(false);

    const rejection = expect(promise).rejects.toMatchObject({
      name: 'ProcessingWorkerInferenceTimeoutError',
    });
    await vi.advanceTimersByTimeAsync(500_000);
    await rejection;
  });

  it('extends inference timeout when runtime telemetry switches from webgpu to wasm', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    });
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    MockWorker.onProcess = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-complete',
              stage: 'wasm-load',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-start',
              stage: 'generate-gain-map',
              stageProgress: 0,
              gmnetExecutionProvider: 'webgpu',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-progress',
              stage: 'generate-gain-map',
              stageProgress: 1,
              gmnetExecutionProvider: 'wasm',
              note: 'Starting inference; application may appear hung while AI model executes. Runtime: wasm.',
            },
          },
        });
      });
    };

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    let settled = false;
    const promise = processImage(file, {});
    promise.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );

    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(181_000);
    await Promise.resolve();
    expect(settled).toBe(false);

    const rejection = expect(promise).rejects.toMatchObject({
      name: 'ProcessingWorkerInferenceTimeoutError',
    });
    await vi.advanceTimersByTimeAsync(500_000);
    await rejection;
  });

  it('emits stage-error telemetry before rejecting when inference timeout occurs', async () => {
    vi.useFakeTimers();
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    MockWorker.onProcess = (worker, message) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-complete',
              stage: 'wasm-load',
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'progress',
            jobId: message.jobId,
            event: {
              phase: 'stage-start',
              stage: 'generate-gain-map',
              stageProgress: 0,
            },
          },
        });
      });
    };

    const { processImage } = await import('../processing.js');
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();

    const promise = processImage(file, { onProgress });
    const rejection = expect(promise).rejects.toMatchObject({
      name: 'ProcessingWorkerInferenceTimeoutError',
    });

    await Promise.resolve();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(190_000);
    await rejection;

    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: 'stage-error',
        stage: 'generate-gain-map',
      }),
    );
  });
});
