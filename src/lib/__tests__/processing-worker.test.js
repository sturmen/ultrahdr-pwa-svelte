/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PIPELINE_HISTORY_KEY,
  PIPELINE_STATE_KEY,
} from '../pipeline-telemetry.js';
import { createRuntimeFixture } from './fixtures/createRuntimeFixture.js';

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

  it('falls back to main-thread processing when worker runtime is unavailable', async () => {
    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = undefined;
    globalThis.createImageBitmap = undefined;

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1])], 'input.jpg', { type: 'image/jpeg' });

    const result = await process(file, {});
    expect(result).toBeInstanceOf(Blob);
    expect(processImageCoreMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to main-thread processing when worker initialization fails', async () => {
    globalThis.Worker = class BrokenWorker {
      constructor() {
        throw new Error('worker init broke');
      }
    };
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1])], 'input.jpg', { type: 'image/jpeg' });

    const result = await process(file, {});
    expect(result).toBeInstanceOf(Blob);
    expect(processImageCoreMock).toHaveBeenCalledTimes(1);
  });

  it('can disable main-thread fallback for worker runtime unavailability', async () => {
    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = undefined;
    globalThis.createImageBitmap = undefined;

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1])], 'input.jpg', { type: 'image/jpeg' });

    await expect(process(file, { allowMainThreadFallback: false })).rejects.toMatchObject({
      name: 'ProcessingWorkerUnavailableError',
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
        worker.emit('message', {
          data: {
            type: 'ready',
            runtime: {
              resolvedExecutionProvider: 'webgl',
            },
          },
        });
      });
    };

    const { initialize } = await createRuntimeFixture();
    const result = await initialize({ onProgress });

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
    expect(result).toEqual(
      expect.objectContaining({
        ready: true,
        resolvedExecutionProvider: 'webgl',
        runtimeMode: 'worker-gpu',
      }),
    );
  });

  it('initializeRuntime exposes worker-wasm runtime mode when startup resolves to WASM', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();
    MockWorker.onInit = (worker) => {
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'ready',
            runtime: {
              resolvedExecutionProvider: 'wasm',
            },
          },
        });
      });
    };

    const { initialize } = await createRuntimeFixture();
    const result = await initialize();

    expect(result).toEqual(
      expect.objectContaining({
        ready: true,
        resolvedExecutionProvider: 'wasm',
        runtimeMode: 'worker-wasm',
      }),
    );
  });

  it('initializeRuntime falls back to main thread and reports main-thread-wasm runtime mode', async () => {
    globalThis.Worker = undefined;
    globalThis.OffscreenCanvas = undefined;
    globalThis.createImageBitmap = undefined;

    const { initialize } = await createRuntimeFixture();
    const result = await initialize();

    expect(result).toEqual(
      expect.objectContaining({
        ready: true,
        resolvedExecutionProvider: 'wasm',
        runtimeMode: 'main-thread-wasm',
      }),
    );
  });

  it('initializeRuntime strips legacy probe fields from init-progress payloads', async () => {
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
              stepId: 'gmnet-smoke-run',
              status: 'running',
              note: 'Testing 2048x2048 capability (webgpu)...',
              probeAttempt: {
                provider: 'webgpu',
                candidateLongEdge: 2048,
                status: 'running',
              },
              probeAttempts: [
                { provider: 'webgpu', candidateLongEdge: 2048, status: 'passed' },
              ],
              gmnetCapabilitySource: 'cache',
              gmnetCapability: {
                provider: 'webgpu',
                gainMapMaxLongEdge: 2048,
                outputMaxLongEdge: 4096,
                source: 'cache',
                attempts: [{ provider: 'webgpu', candidateLongEdge: 2048, status: 'passed' }],
              },
            },
          },
        });
      });
      queueMicrotask(() => {
        worker.emit('message', {
          data: {
            type: 'ready',
            runtime: {
              resolvedExecutionProvider: 'webgpu',
            },
          },
        });
      });
    };

    const { initialize } = await createRuntimeFixture();
    await initialize({ onProgress });

    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        stepId: 'gmnet-smoke-run',
        gmnetCapabilitySource: 'cache',
        gmnetCapability: expect.objectContaining({
          provider: 'webgpu',
          gainMapMaxLongEdge: 2048,
          outputMaxLongEdge: 4096,
        }),
      }),
    );
    const smokeEvent = onProgress.mock.calls
      .map(([event]) => event)
      .find((event) => event?.stepId === 'gmnet-smoke-run');
    expect(smokeEvent?.probeAttempt).toBeUndefined();
    expect(smokeEvent?.probeAttempts).toBeUndefined();
  });

  it('does not forward gmnetCapabilityHintsByProvider in initializeRuntime init options', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    const { initialize } = await createRuntimeFixture();
    await initialize({
      runtimeInitOptions: {
        gmnetCapabilityHintsByProvider: {
          webgpu: {
            provider: 'webgpu',
            gainMapMaxLongEdge: 4094,
            outputMaxLongEdge: 8192,
            source: 'cache',
            attempts: [{ provider: 'webgpu', candidateLongEdge: 4094, status: 'passed' }],
          },
        },
        smokeAssetPath: 'models/gmnet-smoke-explicit.png',
      },
    });

    const worker = MockWorker.instances[0];
    const initMessage = worker.posted.find((message) => message.type === 'init');
    expect(initMessage?.options).toEqual(
      expect.objectContaining({
        smokeAssetPath: 'models/gmnet-smoke-explicit.png',
      }),
    );
    expect(initMessage?.options?.gmnetCapabilityHintsByProvider).toBeUndefined();
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
                attemptFailures: [
                  {
                    provider: 'webgpu',
                    errorCode: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
                  },
                ],
              },
            },
          },
        });
      });
    };

    const { initialize } = await createRuntimeFixture();
    await expect(initialize()).rejects.toMatchObject({
      name: 'RuntimeInitializationError',
      code: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
      stepId: 'webgpu-check',
      diagnostics: expect.objectContaining({
        hasNavigatorGpu: false,
        attemptFailures: expect.any(Array),
      }),
    });
  });

  it('uses worker processing and forwards progress telemetry', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();

    const resultPromise = process(file, { onProgress });
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

  it('forwards gmnet execution provider progress payloads on non-probe stages', async () => {
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
              phase: 'stage-progress',
              stage: 'generate-gain-map',
              gmnetExecutionProvider: 'webgl',
              note: 'Running tile 1/4',
            },
          },
        });
      });
      queueMicrotask(() => {
        const buffer = new Uint8Array([1, 2, 3]).buffer;
        worker.emit('message', {
          data: {
            type: 'result',
            jobId: message.jobId,
            mimeType: 'image/jpeg',
            buffer,
          },
        });
      });
    };

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();

    await process(file, { onProgress });

    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        stage: 'generate-gain-map',
        gmnetExecutionProvider: 'webgl',
      }),
    );
  });

  it('forwards gmnetCheckpointing process option to worker jobs', async () => {
    globalThis.Worker = MockWorker;
    globalThis.OffscreenCanvas = class OffscreenCanvas {};
    globalThis.createImageBitmap = vi.fn();

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2])], 'input.jpg', { type: 'image/jpeg' });

    await process(file, {
      gmnetCheckpointing: 'force',
    });

    const worker = MockWorker.instances[0];
    const processMessage = worker.posted.find((message) => message.type === 'process');
    expect(processMessage?.options).toEqual(
      expect.objectContaining({
        gmnetCheckpointing: 'force',
      }),
    );
  });

  it('forwards checkpoint telemetry metadata through progress callbacks', async () => {
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
              phase: 'stage-progress',
              stage: 'generate-gain-map',
              stageProgress: 40,
              gmnetExecutionProvider: 'webgpu',
              gmnetMemoryMode: 'checkpointed',
              gmnetCheckpointTilesCompleted: 2,
              gmnetCheckpointTilesTotal: 8,
              gmnetCheckpointResumed: true,
            },
          },
        });
      });
      queueMicrotask(() => {
        const buffer = new Uint8Array([1, 2, 3]).buffer;
        worker.emit('message', {
          data: {
            type: 'result',
            jobId: message.jobId,
            mimeType: 'image/jpeg',
            buffer,
          },
        });
      });
    };

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();

    await process(file, { onProgress });
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        gmnetMemoryMode: 'checkpointed',
        gmnetCheckpointTilesCompleted: 2,
        gmnetCheckpointTilesTotal: 8,
        gmnetCheckpointResumed: true,
      }),
    );
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

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const controller = new AbortController();

    const promise = process(file, { abortSignal: controller.signal });
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

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const promise = process(file, {});
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

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();
    const controller = new AbortController();

    const promise = process(file, { onProgress, abortSignal: controller.signal });
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
        note: expect.stringMatching(/starting inference/i),
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

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    let settled = false;
    const promise = process(file, {});
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

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    let settled = false;
    const promise = process(file, {});
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

    const { process } = await createRuntimeFixture();
    const file = new File([new Uint8Array([1, 2, 3])], 'input.jpg', { type: 'image/jpeg' });
    const onProgress = vi.fn();

    const promise = process(file, { onProgress });
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
