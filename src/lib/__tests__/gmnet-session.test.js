/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const inferenceSessionCreate = vi.fn();

vi.mock('onnxruntime-web/webgpu', () => ({
  env: {},
  InferenceSession: {
    create: inferenceSessionCreate,
  },
}));

vi.mock('onnxruntime-web/wasm', () => ({
  env: {},
  InferenceSession: {
    create: inferenceSessionCreate,
  },
}));

describe('GMNetInferenceSession', () => {
  beforeEach(() => {
    vi.resetModules();
    inferenceSessionCreate.mockReset();
  });

  it('preserves model load diagnostics when session creation fails offline', async () => {
    inferenceSessionCreate.mockRejectedValue(new Error('ORT create failed'));

    const { GMNetInferenceSession } = await import('../gmnet-session.ts');
    const runtime = {
      navigator: {
        gpu: {},
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
      },
      performance: {
        now: () => 100,
      },
      fetch: vi.fn(async (url) => new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: { 'content-type': 'application/octet-stream' },
      })),
    };

    const session = new GMNetInferenceSession({ runtime });

    await expect(
      session.init('realworld', {
        forceExecutionProviders: ['wasm'],
        forceReload: true,
        attemptIndex: 1,
      }),
    ).rejects.toMatchObject({
      message: 'ORT create failed',
      diagnostics: {
        requestedExecutionProviders: ['wasm'],
        modelVariant: 'realworld',
        modelLoadDiagnostics: expect.arrayContaining([
          expect.objectContaining({
            attemptIndex: 1,
            assetLabel: 'GMNet ONNX model',
          }),
          expect.objectContaining({
            attemptIndex: 1,
            assetLabel: 'GMNet ONNX model external data',
          }),
        ]),
      },
    });
  });
});
