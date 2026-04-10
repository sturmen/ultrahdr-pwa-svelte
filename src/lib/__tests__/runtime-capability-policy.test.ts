import { describe, expect, it } from 'vitest';
import {
  canUseProcessingWorker,
  resolveInferenceTimeoutMs,
  resolveWorkerInitTimeoutMs,
  resolveWorkerWasmLoadTimeoutMs,
} from '../runtime-capability-policy.js';

describe('runtime-capability-policy', () => {
  it('detects processing worker support from runtime capabilities', () => {
    expect(
      canUseProcessingWorker({
        Worker: class Worker {},
        fetch: async () => ({}),
        ImageData: class ImageData {},
      }),
    ).toBe(true);

    expect(
      canUseProcessingWorker({
        Worker: class Worker {},
        fetch: async () => ({}),
        ImageData: class ImageData {},
      }),
    ).toBe(true);

    expect(
      canUseProcessingWorker({
        fetch: async () => ({}),
        ImageData: class ImageData {},
      }),
    ).toBe(false);
  });

  it('resolves worker init timeout based on runtime user agent', () => {
    expect(
      resolveWorkerInitTimeoutMs(
        { navigator: { userAgent: 'Mozilla/5.0 Firefox/123.0' } },
        { defaultTimeoutMs: 100, firefoxTimeoutMs: 200 },
      ),
    ).toBe(200);

    expect(
      resolveWorkerInitTimeoutMs(
        { navigator: { userAgent: 'Mozilla/5.0 Chrome/122.0' } },
        { defaultTimeoutMs: 100, firefoxTimeoutMs: 200 },
      ),
    ).toBe(100);
  });

  it('resolves worker wasm-load timeout based on runtime user agent', () => {
    const safariLikeRuntime = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      },
    };

    expect(
      resolveWorkerWasmLoadTimeoutMs(
        safariLikeRuntime,
        { defaultTimeoutMs: 100, safariLikeTimeoutMs: 200 },
      ),
    ).toBe(200);

    expect(resolveWorkerWasmLoadTimeoutMs(safariLikeRuntime)).toBeGreaterThanOrEqual(180_000);

    expect(
      resolveWorkerWasmLoadTimeoutMs(
        { navigator: { userAgent: 'Mozilla/5.0 Chrome/122.0' } },
        { defaultTimeoutMs: 100, safariLikeTimeoutMs: 200 },
      ),
    ).toBe(100);
  });

  it('resolves inference timeout by provider and runtime', () => {
    expect(
      resolveInferenceTimeoutMs(
        { navigator: { userAgent: 'Mozilla/5.0 Chrome/122.0' } },
        'wasm',
        { defaultTimeoutMs: 100, firefoxTimeoutMs: 200, wasmTimeoutMs: 300 },
      ),
    ).toBe(300);
    expect(
      resolveInferenceTimeoutMs(
        { navigator: { userAgent: 'Mozilla/5.0 Firefox/123.0' } },
        'webgpu',
        { defaultTimeoutMs: 100, firefoxTimeoutMs: 200, wasmTimeoutMs: 300 },
      ),
    ).toBe(200);
    expect(
      resolveInferenceTimeoutMs(
        {
          navigator: {
            userAgent:
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
          },
        },
        'webgl',
        {
          defaultTimeoutMs: 100,
          firefoxTimeoutMs: 200,
          wasmTimeoutMs: 300,
          safariLikeTimeoutMs: 400,
        },
      ),
    ).toBe(400);
  });
});
