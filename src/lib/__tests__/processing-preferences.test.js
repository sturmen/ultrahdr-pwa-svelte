/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

describe('processing-preferences', () => {
  it('normalizes invalid schema values to safe defaults', async () => {
    const {
      DEFAULT_PROCESSING_PREFERENCES,
      normalizeProcessingPreferences,
    } = await import('../processing-preferences.js');

    const normalized = normalizeProcessingPreferences({
      backendPreference: 'invalid-provider',
      gmnetCheckpointingPreference: 'invalid-mode',
      maxContentBoostStops: 'nan',
      quality: 0.1,
      useJpegli: 'yes',
      discardGainMap: 1,
      stripExif: null,
      keepScreenAwake: undefined,
      rotation: 'invalid',
    });

    expect(normalized).toEqual(DEFAULT_PROCESSING_PREFERENCES);
  });

  it('clamps numeric preferences to supported ranges', async () => {
    const { normalizeProcessingPreferences } = await import('../processing-preferences.js');

    const normalized = normalizeProcessingPreferences({
      maxContentBoostStops: 99,
      quality: 1.0,
      rotation: -450,
    });

    expect(normalized.maxContentBoostStops).toBe(4);
    expect(normalized.quality).toBe(1.0);
    expect(normalized.rotation).toBe(270);
  });

  it('loads defaults when storage is unavailable or payload is invalid', async () => {
    const {
      DEFAULT_PROCESSING_PREFERENCES,
      loadProcessingPreferences,
    } = await import('../processing-preferences.js');

    const noStorageRuntime = {};
    expect(loadProcessingPreferences(noStorageRuntime)).toEqual(
      DEFAULT_PROCESSING_PREFERENCES,
    );

    const invalidStorageRuntime = {
      localStorage: {
        getItem(key) {
          if (key === 'ultrahdr:processing-preferences:v1') {
            return '{';
          }
          return null;
        },
      },
    };
    expect(loadProcessingPreferences(invalidStorageRuntime)).toEqual(
      DEFAULT_PROCESSING_PREFERENCES,
    );
  });

  it('migrates legacy backend preference key when new key is absent', async () => {
    const {
      LEGACY_BACKEND_PREFERENCE_STORAGE_KEY,
      PROCESSING_PREFERENCES_STORAGE_KEY,
      loadProcessingPreferences,
      normalizeProcessingPreferences,
    } = await import('../processing-preferences.js');

    const runtime = {
      localStorage: {
        getItem(key) {
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
    const expected = normalizeProcessingPreferences({
      backendPreference: 'webgl',
    });
    expect(loaded).toEqual(expected);
  });

  it('resolves auto checkpointing to force on Safari and off on non-Safari', async () => {
    const { resolveCheckpointingForRun } = await import('../processing-preferences.js');

    const safariRuntime = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      },
    };
    const chromeRuntime = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      },
    };

    expect(resolveCheckpointingForRun('auto', safariRuntime)).toBe('force');
    expect(resolveCheckpointingForRun('auto', chromeRuntime)).toBe('off');
    expect(resolveCheckpointingForRun('force', chromeRuntime)).toBe('force');
    expect(resolveCheckpointingForRun('off', safariRuntime)).toBe('off');
  });

  it('saves and reloads a normalized preferences payload', async () => {
    const {
      PROCESSING_PREFERENCES_STORAGE_KEY,
      loadProcessingPreferences,
      saveProcessingPreferences,
    } = await import('../processing-preferences.js');

    const storage = new Map();
    const runtime = {
      localStorage: {
        getItem(key) {
          return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
          storage.set(key, String(value));
        },
      },
    };

    saveProcessingPreferences({
      backendPreference: 'wasm',
      gmnetCheckpointingPreference: 'force',
      maxContentBoostStops: 3.2,
      quality: 0.75,
      useJpegli: true,
      discardGainMap: true,
      stripExif: true,
      keepScreenAwake: false,
      rotation: 90,
    }, runtime);

    expect(storage.has(PROCESSING_PREFERENCES_STORAGE_KEY)).toBe(true);
    expect(loadProcessingPreferences(runtime)).toEqual(
      expect.objectContaining({
        backendPreference: 'wasm',
        gmnetCheckpointingPreference: 'force',
        quality: 0.75,
        rotation: 90,
      }),
    );
  });
});
