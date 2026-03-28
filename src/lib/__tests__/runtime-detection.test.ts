import { describe, expect, it } from 'vitest';

import {
  getRuntimeDetectionProfile,
  hasWebGlSupport,
  isAndroidRuntime,
  isChromiumRuntime,
  isFirefoxRuntime,
  isIOSLikeRuntime,
  isMobileRuntime,
  isSafariLikeRuntime,
  isWebKitRuntime,
  isWindowsRuntime,
} from '../runtime-detection.ts';

type RuntimeOverrideInput = {
  navigator?: Record<string, unknown>;
  WebGLRenderingContext?: typeof WebGLRenderingContext;
  WebGL2RenderingContext?: typeof WebGL2RenderingContext;
};

function createRuntime(overrides: RuntimeOverrideInput = {}) {
  return {
    navigator: {
      userAgent: '',
      platform: '',
      maxTouchPoints: 0,
      ...overrides.navigator,
    },
    WebGLRenderingContext: overrides.WebGLRenderingContext,
    WebGL2RenderingContext: overrides.WebGL2RenderingContext,
  } as typeof globalThis;
}

describe('runtime-detection', () => {
  it('builds a normalized detection profile for chromium android runtimes', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/133.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv81',
      },
      WebGLRenderingContext: class WebGLRenderingContext {},
    });

    expect(getRuntimeDetectionProfile(runtime)).toEqual({
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/133.0.0.0 Mobile Safari/537.36',
      platform: 'Linux armv81',
      maxTouchPoints: 0,
      isAndroid: true,
      isChromium: true,
      isFirefox: false,
      isIOSLike: false,
      isMobile: true,
      isSafariLike: false,
      isWebKit: true,
      isWindows: false,
      hasWebGlSupport: true,
    });
  });

  it('treats touch-enabled macOS safari as iOS-like mobile webkit', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
    });

    expect(isWebKitRuntime(runtime)).toBe(true);
    expect(isSafariLikeRuntime(runtime)).toBe(true);
    expect(isIOSLikeRuntime(runtime)).toBe(true);
    expect(isMobileRuntime(runtime)).toBe(true);
  });

  it('distinguishes firefox desktop from safari-like webkit branches', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:124.0) Gecko/20100101 Firefox/124.0',
        platform: 'MacIntel',
      },
    });

    expect(isFirefoxRuntime(runtime)).toBe(true);
    expect(isChromiumRuntime(runtime)).toBe(false);
    expect(isWebKitRuntime(runtime)).toBe(false);
    expect(isSafariLikeRuntime(runtime)).toBe(false);
  });

  it('detects windows from platform when user agent is sparse', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent: 'UnitTestAgent/1.0',
        platform: 'Win32',
      },
    });

    expect(isWindowsRuntime(runtime)).toBe(true);
    expect(isAndroidRuntime(runtime)).toBe(false);
  });
});
