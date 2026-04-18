/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { createProcessingRuntime } from '../processing.js';

describe('processing runtime API', () => {
  it('creates runtime objects with the expected methods', () => {
    const runtime = createProcessingRuntime();

    expect(typeof runtime.initialize).toBe('function');
    expect(typeof runtime.process).toBe('function');
    expect(typeof runtime.subscribe).toBe('function');
    expect(typeof runtime.getSnapshot).toBe('function');
    expect(typeof runtime.dispose).toBe('function');
  });

  it('isolates worker initialization state across runtime instances', async () => {
    const OriginalWorker = globalThis.Worker;
    const instances: MockWorker[] = [];

    class MockWorker {
      listeners: Map<string, Array<(event: MessageEvent) => void>>;
      posted: Array<{ type: string; options?: { smokeAssetPath?: string } }>;

      constructor() {
        this.listeners = new Map();
        this.posted = [];
        instances.push(this);
      }

      addEventListener(type, callback) {
        if (!this.listeners.has(type)) {
          this.listeners.set(type, []);
        }
        this.listeners.get(type).push(callback);
      }

      postMessage(message) {
        this.posted.push(message);
        if (message.type === 'init') {
          queueMicrotask(() => {
            this.emit('message', {
              data: {
                type: 'ready',
                runtime: {
                  resolvedExecutionProvider: 'webgpu',
                },
              },
            });
          });
        }
      }

      emit(type, event) {
        const callbacks = this.listeners.get(type) || [];
        for (const callback of callbacks) {
          callback(event);
        }
      }

      terminate() {}
    }

    try {
      globalThis.Worker = MockWorker;

      const runtimeA = createProcessingRuntime();
      const runtimeB = createProcessingRuntime();

      await runtimeA.initialize({
        runtimeInitOptions: {
          smokeAssetPath: 'models/a.png',
        },
      });
      await runtimeB.initialize({
        runtimeInitOptions: {
          smokeAssetPath: 'models/b.png',
        },
      });

      expect(instances).toHaveLength(2);
      const initA = instances[0].posted.find((entry) => entry.type === 'init');
      const initB = instances[1].posted.find((entry) => entry.type === 'init');
      expect(initA.options.smokeAssetPath).toBe('models/a.png');
      expect(initB.options.smokeAssetPath).toBe('models/b.png');
    } finally {
      globalThis.Worker = OriginalWorker;
    }
  });

  it('throws on unknown runtime reducer command', async () => {
    const runtime = createProcessingRuntime({
      reducer: () => ({
        state: {
          status: 'idle',
          runtime: null,
          error: null,
          progress: null,
        },
        commands: [{ type: 'UNKNOWN_COMMAND' }],
      }),
      initializeRuntimeInternal: vi.fn(),
      processImageInternal: vi.fn(),
    });

    await expect(runtime.initialize()).rejects.toThrow(/unknown runtime command/i);
  });

  it('joins concurrent process requests that share a processingRequestKey', async () => {
    const { getRecordedDiagnosticsEvents, DIAGNOSTICS_EVENT_NAMES } = await import('../diagnostics-events.ts');
    window.localStorage.clear();
    delete window.__ultrahdrDiagnosticsRecorder;
    const deferred = Promise.withResolvers<Blob>();
    const processImageInternal = vi.fn(async () => deferred.promise);
    const runtime = createProcessingRuntime({
      processImageInternal,
    });
    const file = new File([new Uint8Array([1])], 'input.heic', { type: 'image/heic' });

    const firstPromise = runtime.process(file, {
      processingRequestKey: 'queue:7',
    });
    const secondPromise = runtime.process(file, {
      processingRequestKey: 'queue:7',
    });

    expect(processImageInternal).toHaveBeenCalledTimes(1);
    expect(getRecordedDiagnosticsEvents(window)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: DIAGNOSTICS_EVENT_NAMES.runtime.processAttemptStarted,
          context: expect.objectContaining({
            processingRequestKey: 'queue:7',
            attemptNumber: 1,
          }),
        }),
        expect.objectContaining({
          name: DIAGNOSTICS_EVENT_NAMES.runtime.processRequestDeduplicated,
          context: expect.objectContaining({
            processingRequestKey: 'queue:7',
          }),
        }),
      ]),
    );

    const resultBlob = new Blob(['ok'], { type: 'image/jpeg' });
    deferred.resolve(resultBlob);

    await expect(firstPromise).resolves.toBe(resultBlob);
    await expect(secondPromise).resolves.toBe(resultBlob);
    expect(processImageInternal).toHaveBeenCalledTimes(1);
  });

  it('records runtime processing attempt breadcrumbs for each process execution', async () => {
    const { getRecordedDiagnosticsEvents, DIAGNOSTICS_EVENT_NAMES } = await import('../diagnostics-events.ts');
    window.localStorage.clear();
    delete window.__ultrahdrDiagnosticsRecorder;
    const processImageInternal = vi.fn(async () => new Blob(['ok'], { type: 'image/jpeg' }));
    const runtime = createProcessingRuntime({
      processImageInternal,
    });
    const file = new File([new Uint8Array([1])], 'input.heic', { type: 'image/heic' });

    await runtime.process(file, {
      processingRequestKey: 'queue:9',
    });

    expect(getRecordedDiagnosticsEvents(window)).toEqual([
      expect.objectContaining({
        name: DIAGNOSTICS_EVENT_NAMES.runtime.processAttemptStarted,
        context: expect.objectContaining({
          processingRequestKey: 'queue:9',
          attemptNumber: 1,
        }),
      }),
      expect.objectContaining({
        name: DIAGNOSTICS_EVENT_NAMES.runtime.processAttemptCompleted,
        context: expect.objectContaining({
          processingRequestKey: 'queue:9',
          attemptNumber: 1,
        }),
      }),
    ]);
  });

});
