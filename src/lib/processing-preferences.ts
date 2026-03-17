import {
  clampMaxContentBoostStops,
  DEFAULT_MAX_CONTENT_BOOST_STOPS,
} from './max-content-boost.js';
import { isChromiumRuntime } from './runtime-browser.ts';
export const PROCESSING_PREFERENCES_STORAGE_KEY = 'ultrahdr:processing-preferences:v1';

export const LEGACY_BACKEND_PREFERENCE_STORAGE_KEY = 'ultrahdr:backend-preference:v1';
const LEGACY_BACKEND_PREFERENCE_GLOBAL_KEY = '__ULTRAHDR_BACKEND_PREFERENCE';
const PROCESSING_PREFERENCES_RUNTIME_KEY = '__ULTRAHDR_PROCESSING_PREFERENCES';

const SUPPORTED_BACKEND_PREFERENCES = Object.freeze(['auto', 'webgpu', 'webgl', 'wasm']);
const SUPPORTED_GMNET_CHECKPOINTING_PREFERENCES = Object.freeze(['off', 'auto', 'force']);
const SUPPORTED_QUALITY_VALUES = Object.freeze([1.0, 0.95, 0.75, 0.5]);

export const DEFAULT_PROCESSING_PREFERENCES = Object.freeze({
  backendPreference: 'auto',
  gmnetCheckpointingPreference: 'auto',
  maxContentBoostStops: DEFAULT_MAX_CONTENT_BOOST_STOPS,

  quality: 0.95,
  useJpegli: false,
  discardGainMap: false,
  stripExif: false,
  keepScreenAwake: true,
  rotation: 0,
});

function isSmartphoneRuntime(runtime = globalThis) {
  const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
  const maxTouchPoints = Number(runtime?.navigator?.maxTouchPoints || 0);
  return (
    /android/.test(userAgent)
    || /(iphone|ipad|ipod)/.test(userAgent)
    || (/(macintosh|mac os x)/.test(userAgent) && maxTouchPoints > 1)
  );
}

function getRuntimeDefaultPreferences(runtime = globalThis) {
  return {
    ...DEFAULT_PROCESSING_PREFERENCES,
    useJpegli: !isSmartphoneRuntime(runtime),
  };
}

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function normalizeBackendPreference(value, runtime = globalThis) {
  const normalized = normalizeString(value);
  if (normalized === 'webgl' && isChromiumRuntime(runtime)) {
    return DEFAULT_PROCESSING_PREFERENCES.backendPreference;
  }
  if (SUPPORTED_BACKEND_PREFERENCES.includes(normalized)) {
    return normalized;
  }
  return DEFAULT_PROCESSING_PREFERENCES.backendPreference;
}

function normalizeCheckpointingPreference(value) {
  const normalized = normalizeString(value);
  if (SUPPORTED_GMNET_CHECKPOINTING_PREFERENCES.includes(normalized)) {
    return normalized;
  }
  return DEFAULT_PROCESSING_PREFERENCES.gmnetCheckpointingPreference;
}

function normalizeMaxContentBoostStops(value) {
  return clampMaxContentBoostStops(value);
}

function normalizeQuality(value) {
  const numeric = Number(value);
  if (SUPPORTED_QUALITY_VALUES.includes(numeric)) {
    return numeric;
  }
  return DEFAULT_PROCESSING_PREFERENCES.quality;
}

function normalizeRotation(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_PROCESSING_PREFERENCES.rotation;
  }
  const normalized = ((Math.round(numeric) % 360) + 360) % 360;
  return normalized;
}

function normalizeBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

function isWebKitRuntime(runtime = globalThis) {
  const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
  if (!userAgent.includes('applewebkit')) {
    return false;
  }
  if (
    userAgent.includes('chrome')
    || userAgent.includes('chromium')
    || userAgent.includes('crios')
    || userAgent.includes('firefox')
    || userAgent.includes('fxios')
    || userAgent.includes('edg/')
    || userAgent.includes('edgios')
    || userAgent.includes('opr/')
  ) {
    return false;
  }
  return true;
}

export function normalizeProcessingPreferences(rawPreferences, runtime = globalThis) {
  const raw = rawPreferences && typeof rawPreferences === 'object'
    ? rawPreferences
    : {};
  const defaults = getRuntimeDefaultPreferences(runtime);
  return {
    backendPreference: normalizeBackendPreference(raw.backendPreference, runtime),
    gmnetCheckpointingPreference: normalizeCheckpointingPreference(raw.gmnetCheckpointingPreference),
    maxContentBoostStops: normalizeMaxContentBoostStops(raw.maxContentBoostStops),
    quality: normalizeQuality(raw.quality),
    useJpegli: normalizeBoolean(raw.useJpegli, defaults.useJpegli),
    discardGainMap: normalizeBoolean(raw.discardGainMap, DEFAULT_PROCESSING_PREFERENCES.discardGainMap),
    stripExif: normalizeBoolean(raw.stripExif, DEFAULT_PROCESSING_PREFERENCES.stripExif),
    keepScreenAwake: normalizeBoolean(raw.keepScreenAwake, DEFAULT_PROCESSING_PREFERENCES.keepScreenAwake),
    rotation: normalizeRotation(raw.rotation),
  };
}

function readStorageItem(storage, key) {
  try {
    if (!storage || typeof storage.getItem !== 'function') {
      return null;
    }
    return storage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function writeStorageItem(storage, key, value) {
  try {
    if (!storage || typeof storage.setItem !== 'function') {
      return;
    }
    storage.setItem(key, value);
  } catch (_error) {
    // Best-effort persistence only.
  }
}

export function loadProcessingPreferences(runtime = globalThis) {
  const storage = runtime?.localStorage || null;
  const rawNext = readStorageItem(storage, PROCESSING_PREFERENCES_STORAGE_KEY);
  if (typeof rawNext === 'string' && rawNext.trim().length > 0) {
      try {
      const parsed = JSON.parse(rawNext);
      return normalizeProcessingPreferences(parsed, runtime);
    } catch (_error) {
      // Continue to runtime/legacy fallbacks.
    }
  }

  if (runtime?.[PROCESSING_PREFERENCES_RUNTIME_KEY] && typeof runtime[PROCESSING_PREFERENCES_RUNTIME_KEY] === 'object') {
    return normalizeProcessingPreferences(
      runtime[PROCESSING_PREFERENCES_RUNTIME_KEY],
      runtime,
    );
  }

  const legacyStoragePreference = normalizeString(
    readStorageItem(storage, LEGACY_BACKEND_PREFERENCE_STORAGE_KEY),
  );
  const legacyRuntimePreference = normalizeString(
    runtime?.[LEGACY_BACKEND_PREFERENCE_GLOBAL_KEY],
  );
  const legacyBackendPreference = legacyStoragePreference || legacyRuntimePreference;
  if (legacyBackendPreference) {
    return normalizeProcessingPreferences({
      ...getRuntimeDefaultPreferences(runtime),
      backendPreference: legacyBackendPreference,
    }, runtime);
  }

  return getRuntimeDefaultPreferences(runtime);
}

export function saveProcessingPreferences(preferences, runtime = globalThis) {
  const normalized = normalizeProcessingPreferences(preferences, runtime);
  const serialized = JSON.stringify(normalized);
  const storage = runtime?.localStorage || null;

  writeStorageItem(storage, PROCESSING_PREFERENCES_STORAGE_KEY, serialized);
  writeStorageItem(storage, LEGACY_BACKEND_PREFERENCE_STORAGE_KEY, normalized.backendPreference);
  runtime[PROCESSING_PREFERENCES_RUNTIME_KEY] = { ...normalized };
  runtime[LEGACY_BACKEND_PREFERENCE_GLOBAL_KEY] = normalized.backendPreference;

  return normalized;
}

export function resolveCheckpointingForRun(preference, runtime = globalThis) {
  const normalizedPreference = normalizeCheckpointingPreference(preference);
  if (normalizedPreference === 'auto') {
    return isWebKitRuntime(runtime) ? 'force' : 'off';
  }
  return normalizedPreference;
}
