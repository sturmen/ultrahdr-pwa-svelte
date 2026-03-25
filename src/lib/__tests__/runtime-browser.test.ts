import { describe, expect, it } from 'vitest';
import { hasWebGlSupport, isGmnetWebGlSupportedRuntime } from '../runtime-browser.ts';

describe('runtime-browser', () => {
  it('uses non-canvas WebGL heuristics from runtime globals', () => {
    expect(
      hasWebGlSupport({
        navigator: {
          userAgent: 'Mozilla/5.0 Firefox/123.0',
        },
        WebGLRenderingContext: class WebGLRenderingContext {},
      } as typeof globalThis),
    ).toBe(true);

    expect(
      hasWebGlSupport({
        navigator: {
          userAgent: 'Mozilla/5.0 Firefox/123.0',
        },
      } as typeof globalThis),
    ).toBe(false);
  });

  it('still disables GMNet WebGL fallback on chromium runtimes', () => {
    expect(
      isGmnetWebGlSupportedRuntime({
        navigator: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
        },
        WebGLRenderingContext: class WebGLRenderingContext {},
      } as typeof globalThis),
    ).toBe(false);
  });
});
