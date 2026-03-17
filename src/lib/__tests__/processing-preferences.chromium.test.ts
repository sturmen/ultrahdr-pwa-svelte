/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

const CHROMIUM_RUNTIME = {
  navigator: {
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  },
};

describe('processing-preferences on Chromium', () => {
  it('normalizes a webgl backend preference to auto', async () => {
    const { normalizeProcessingPreferences } = await import('../processing-preferences.ts');

    const normalized = normalizeProcessingPreferences(
      { backendPreference: 'webgl' },
      CHROMIUM_RUNTIME,
    );

    expect(normalized.backendPreference).toBe('auto');
  });

  it('migrates a legacy stored webgl preference to auto', async () => {
    const {
      LEGACY_BACKEND_PREFERENCE_STORAGE_KEY,
      PROCESSING_PREFERENCES_STORAGE_KEY,
      loadProcessingPreferences,
    } = await import('../processing-preferences.ts');

    const runtime = {
      ...CHROMIUM_RUNTIME,
      localStorage: {
        getItem(key: string) {
          if (key === PROCESSING_PREFERENCES_STORAGE_KEY) {
            return null;
          }
          if (key === LEGACY_BACKEND_PREFERENCE_STORAGE_KEY) {
            return 'webgl';
          }
          return null;
        },
      },
    };

    const loaded = loadProcessingPreferences(runtime);
    expect(loaded.backendPreference).toBe('auto');
  });
});
