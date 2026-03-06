import { describe, expect, it, vi } from 'vitest';
import { createRuntimeOrchestrator } from '../runtime-orchestrator.js';

describe('runtime-orchestrator', () => {
  it('uses worker adapter when available', async () => {
    const workerAdapter = {
      initialize: vi.fn(async () => ({ resolvedExecutionProvider: 'webgpu', runtimeMode: 'worker-gpu' })),
      process: vi.fn(async () => new Blob([new Uint8Array([1])], { type: 'image/jpeg' })),
      dispose: vi.fn(),
    };
    const mainThreadAdapter = {
      initialize: vi.fn(async () => ({ resolvedExecutionProvider: 'wasm', runtimeMode: 'main-thread-wasm' })),
      process: vi.fn(),
      dispose: vi.fn(),
    };
    const runtime = createRuntimeOrchestrator({
      workerAdapter,
      mainThreadAdapter,
      canUseWorker: () => true,
    });

    const init = await runtime.initialize();
    const result = await runtime.process(new File([new Uint8Array([1])], 'a.jpg', { type: 'image/jpeg' }));

    expect(init.runtimeMode).toBe('worker-gpu');
    expect(result).toBeInstanceOf(Blob);
    expect(workerAdapter.initialize).toHaveBeenCalledTimes(1);
    expect(workerAdapter.process).toHaveBeenCalledTimes(1);
    expect(mainThreadAdapter.initialize).not.toHaveBeenCalled();
  });

  it('falls back to main thread when worker init fails and fallback is allowed', async () => {
    const workerAdapter = {
      initialize: vi.fn(async () => {
        const error = new Error('worker init failed');
        error.name = 'ProcessingWorkerInitError';
        throw error;
      }),
      process: vi.fn(),
      dispose: vi.fn(),
    };
    const mainThreadAdapter = {
      initialize: vi.fn(async () => ({ resolvedExecutionProvider: 'wasm', runtimeMode: 'main-thread-wasm' })),
      process: vi.fn(async () => new Blob([new Uint8Array([1])], { type: 'image/jpeg' })),
      dispose: vi.fn(),
    };
    const runtime = createRuntimeOrchestrator({
      workerAdapter,
      mainThreadAdapter,
      canUseWorker: () => true,
    });

    const init = await runtime.initialize({ allowMainThreadFallback: true });
    const result = await runtime.process(new File([new Uint8Array([2])], 'b.jpg', { type: 'image/jpeg' }));

    expect(init.runtimeMode).toBe('main-thread-wasm');
    expect(result).toBeInstanceOf(Blob);
    expect(mainThreadAdapter.initialize).toHaveBeenCalledTimes(1);
    expect(mainThreadAdapter.process).toHaveBeenCalledTimes(1);
  });

  it('supports subscriptions and snapshot reads', async () => {
    const workerAdapter = {
      initialize: vi.fn(async () => ({ resolvedExecutionProvider: 'webgpu', runtimeMode: 'worker-gpu' })),
      process: vi.fn(async () => new Blob([new Uint8Array([3])], { type: 'image/jpeg' })),
      dispose: vi.fn(),
    };
    const mainThreadAdapter = {
      initialize: vi.fn(),
      process: vi.fn(),
      dispose: vi.fn(),
    };
    const runtime = createRuntimeOrchestrator({
      workerAdapter,
      mainThreadAdapter,
      canUseWorker: () => true,
    });
    const listener = vi.fn();
    const unsubscribe = runtime.subscribe(listener);

    await runtime.initialize();
    expect(runtime.getSnapshot().status).toBe('ready-worker');
    unsubscribe();
    await runtime.dispose();
    expect(listener).toHaveBeenCalled();
  });

  it('throws when planner returns an unknown effect', async () => {
    const runtime = createRuntimeOrchestrator({
      workerAdapter: {
        initialize: vi.fn(),
        process: vi.fn(),
        dispose: vi.fn(),
      },
      mainThreadAdapter: {
        initialize: vi.fn(),
        process: vi.fn(),
        dispose: vi.fn(),
      },
      planner: {
        planInitialize: () => [{ type: 'unknown-effect' }],
        planProcess: () => [{ type: 'unknown-effect' }],
      },
    });

    await expect(runtime.initialize()).rejects.toThrow(/unknown runtime effect/i);
  });
});
