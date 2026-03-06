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
    const originalOffscreenCanvas = globalThis.OffscreenCanvas;
    const originalCreateImageBitmap = globalThis.createImageBitmap;
    const instances = [];

    class MockWorker {
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
      globalThis.OffscreenCanvas = class OffscreenCanvas {};
      globalThis.createImageBitmap = async () => ({});

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
      globalThis.OffscreenCanvas = originalOffscreenCanvas;
      globalThis.createImageBitmap = originalCreateImageBitmap;
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
});
