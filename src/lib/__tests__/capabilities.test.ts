/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

import { getCapabilities, getProcessingProfile } from '../capabilities.js';

type RuntimeOverrideInput = {
  navigator?: Record<string, unknown>;
  window?: Record<string, unknown>;
  Worker?: typeof Worker | undefined;
  fetch?: typeof fetch | undefined;
  ImageData?: typeof ImageData | undefined;
};

function createRuntime(overrides: RuntimeOverrideInput = {}) {
  return {
    navigator: {
      userAgent: 'Mozilla/5.0',
      deviceMemory: undefined,
      canShare: undefined,
      wakeLock: undefined,
      standalone: false,
      ...overrides.navigator,
    },
    window: {
      matchMedia: () => ({ matches: false }),
      ...overrides.window,
    },
    Worker: overrides.Worker,
    fetch: overrides.fetch,
    ImageData: overrides.ImageData,
  };
}

describe('capabilities', () => {
  it('detects iOS and assigns low memory tier by default', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      },
      window: {
        matchMedia: () => ({ matches: true }),
      },
    });

    const caps = getCapabilities(runtime);
    const profile = getProcessingProfile(caps);

    expect(caps.isIOS).toBe(true);
    expect(caps.isAndroid).toBe(false);
    expect(caps.isStandalone).toBe(true);
    expect(profile.memoryTier).toBe('low');
    expect(Object.keys(profile)).toEqual(['memoryTier']);
  });

  it('assigns mid tier for Android class devices with moderate memory', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/122.0 Mobile Safari/537.36',
        deviceMemory: 8,
      },
      Worker: function Worker() {},
      fetch: async () => ({}),
      ImageData,
    });

    const caps = getCapabilities(runtime);
    const profile = getProcessingProfile(caps);

    expect(caps.isAndroid).toBe(true);
    expect(caps.supportsOffscreenWorker).toBe(true);
    expect(profile.memoryTier).toBe('mid');
  });

  it('assigns high tier for high memory non-iOS devices', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0 Safari/537.36',
        deviceMemory: 16,
      },
    });

    const profile = getProcessingProfile(getCapabilities(runtime));
    expect(profile.memoryTier).toBe('high');
    expect(Object.keys(profile)).toEqual(['memoryTier']);
  });

  it('defaults desktop browsers with unknown memory to mid tier', () => {
    const runtime = createRuntime({
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:124.0) Gecko/20100101 Firefox/124.0',
        deviceMemory: undefined,
      },
    });

    const profile = getProcessingProfile(getCapabilities(runtime));

    expect(profile.memoryTier).toBe('mid');
    expect(Object.keys(profile)).toEqual(['memoryTier']);
  });
});
