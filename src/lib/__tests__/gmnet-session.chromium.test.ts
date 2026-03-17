/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

function createChromiumRuntimeWithWebGlOnly() {
  return {
    navigator: {
      gpu: undefined,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      platform: 'MacIntel',
    },
    document: {
      createElement: () => ({
        getContext: (type: string) => {
          if (type === 'webgl' || type === 'experimental-webgl') {
            return { clear: () => {} };
          }
          return null;
        },
      }),
    },
    OffscreenCanvas: undefined,
  };
}

describe('GMNetInferenceSession on Chromium', () => {
  it('rejects explicitly forced webgl because Chromium WebGL is disabled for GMNet', async () => {
    const { GMNetInferenceSession } = await import('../gmnet-session.ts');
    const session = new GMNetInferenceSession({
      runtime: createChromiumRuntimeWithWebGlOnly(),
    });

    await expect(
      session.init('realworld', {
        forceExecutionProviders: ['webgl'],
        forceReload: true,
      }),
    ).rejects.toMatchObject({
      name: 'GmnetWebGlUnavailableError',
      message: expect.stringMatching(/disabled on chromium/i),
    });
  });
});
