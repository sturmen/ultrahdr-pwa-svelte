import {
  buildRuntimeBundleCacheNames,
  resolveRuntimeBundleCacheName,
} from './runtime-bundle-asset-map.js';
const OFFLINE_BUNDLE_MANIFEST_PATH = 'models/runtime-bundle-manifest.json';
export const OFFLINE_BUNDLE_STORAGE_KEY = 'ultrahdr:offline-bundle:v1';

export const BUNDLE_STATES = Object.freeze({
  EMPTY: 'EMPTY',
  PREPARING: 'PREPARING',
  READY: 'READY',
  STALE: 'STALE',
  CORRUPT: 'CORRUPT',
  REPAIRING: 'REPAIRING',
  FAILED: 'FAILED',
});

const bundleStatusListeners = new Set();
let inflightEnsurePromise = null;
let inflightPreparePromise = null;
const CACHE_NAMES = buildRuntimeBundleCacheNames(
  typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
    : '',
);

function resolveBaseUrl() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function resolveAssetUrl(assetPath) {
  const normalized = String(assetPath || '').replace(/^\/+/, '');
  return `${resolveBaseUrl()}${normalized}`;
}

function resolveManifestUrl() {
  return resolveAssetUrl(OFFLINE_BUNDLE_MANIFEST_PATH);
}

function normalizeBundleState(state) {
  if (typeof state !== 'string') {
    return BUNDLE_STATES.EMPTY;
  }
  const normalized = state.trim().toUpperCase();
  if (BUNDLE_STATES[normalized]) {
    return BUNDLE_STATES[normalized];
  }
  return BUNDLE_STATES.EMPTY;
}

function readBundleRecord(runtime = globalThis) {
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.getItem !== 'function') {
    return null;
  }

  try {
    const raw = storage.getItem(OFFLINE_BUNDLE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return {
      bundleVersion: typeof parsed.bundleVersion === 'string' ? parsed.bundleVersion : null,
      ready: parsed.ready === true,
      state: normalizeBundleState(parsed.state),
      validatedAtMs: Number.isFinite(Number(parsed.validatedAtMs))
        ? Math.floor(Number(parsed.validatedAtMs))
        : null,
      manifestDigest: typeof parsed.manifestDigest === 'string' ? parsed.manifestDigest : null,
      resolvedExecutionProviderHint:
        typeof parsed.resolvedExecutionProviderHint === 'string'
          ? parsed.resolvedExecutionProviderHint
          : null,
      diagnosticsSummary:
        parsed.diagnosticsSummary && typeof parsed.diagnosticsSummary === 'object'
          ? { ...parsed.diagnosticsSummary }
          : null,
    };
  } catch {
    return null;
  }
}

function writeBundleRecord(record, runtime = globalThis) {
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.setItem !== 'function') {
    return;
  }

  try {
    storage.setItem(OFFLINE_BUNDLE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Best-effort persistence only.
  }
}

function emitBundleStatus(event) {
  for (const listener of bundleStatusListeners) {
    try {
      listener(event);
    } catch (_error) {
      // Best-effort listener fan-out.
    }
  }
}

export function subscribeBundleStatus(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  bundleStatusListeners.add(listener);
  return () => {
    bundleStatusListeners.delete(listener);
  };
}

function createManifestDigest(manifest) {
  const payload = JSON.stringify(manifest || {});
  let hash = 2166136261;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

async function hashBufferDefault(buffer, runtime = globalThis) {
  const subtle = runtime?.crypto?.subtle || globalThis?.crypto?.subtle;
  if (!subtle || typeof subtle.digest !== 'function') {
    throw new Error('crypto.subtle.digest is unavailable for bundle hash verification.');
  }

  const digest = await subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Runtime bundle manifest is invalid.');
  }
  if (typeof manifest.bundleVersion !== 'string' || manifest.bundleVersion.trim().length === 0) {
    throw new Error('Runtime bundle manifest bundleVersion is required.');
  }
  if (!Array.isArray(manifest.requiredAssets)) {
    throw new Error('Runtime bundle manifest requiredAssets must be an array.');
  }

  for (const asset of manifest.requiredAssets) {
    if (!asset || typeof asset !== 'object') {
      throw new Error('Runtime bundle manifest asset entries must be objects.');
    }
    if (typeof asset.id !== 'string' || asset.id.trim().length === 0) {
      throw new Error('Runtime bundle manifest asset id is required.');
    }
    if (typeof asset.url !== 'string' || asset.url.trim().length === 0) {
      throw new Error(`Runtime bundle manifest asset url is required for ${asset.id}.`);
    }
    if (typeof asset.cacheName !== 'string' || asset.cacheName.trim().length === 0) {
      throw new Error(`Runtime bundle manifest cacheName is required for ${asset.id}.`);
    }
    if (typeof asset.sha256 !== 'string' || asset.sha256.trim().length !== 64) {
      throw new Error(`Runtime bundle manifest sha256 is required for ${asset.id}.`);
    }
  }

  return manifest;
}

async function loadManifestDefault({ runtime = globalThis } = {}) {
  const fetchFn = runtime?.fetch || globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    throw new Error('fetch is unavailable for runtime bundle manifest loading.');
  }

  const manifestUrl = resolveManifestUrl();
  const response = await fetchFn.call(runtime, manifestUrl, { credentials: 'same-origin' });
  if (!response?.ok) {
    throw new Error(`Failed to fetch runtime bundle manifest: ${response?.status || 'unknown'}.`);
  }

  const manifest = await response.json();
  return validateManifest(manifest);
}

function buildDiagnosticsSummary({ missingAssets = [], mismatchedAssets = [], staleVersion = false } = {}) {
  return {
    missingAssetCount: missingAssets.length,
    mismatchedAssetCount: mismatchedAssets.length,
    staleVersion,
    missingAssetIds: missingAssets.map((asset) => asset.id),
    mismatchedAssetIds: mismatchedAssets.map((asset) => asset.id),
  };
}

function resolveRuntimeStartupOnline(runtime = globalThis) {
  return runtime?.navigator?.onLine !== false;
}

async function invokeServiceWorkerBundleCommand(runtime, type, timeoutMs = 20_000) {
  const serviceWorkerContainer = runtime?.navigator?.serviceWorker;
  let messageTarget = serviceWorkerContainer?.controller || null;

  if (!messageTarget && serviceWorkerContainer?.ready) {
    try {
      const registration = await serviceWorkerContainer.ready;
      if (registration?.active && typeof registration.active.postMessage === 'function') {
        messageTarget = registration.active;
      }
    } catch {
      messageTarget = null;
    }
  }

  if (!messageTarget || typeof messageTarget.postMessage !== 'function') {
    return null;
  }
  if (typeof MessageChannel === 'undefined') {
    return null;
  }

  const messageId = `${type}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timeoutId = setTimeout(() => {
      channel.port1.onmessage = null;
      reject(new Error(`Service worker bundle command timed out: ${type}`));
    }, timeoutMs);

    channel.port1.onmessage = (event) => {
      clearTimeout(timeoutId);
      const payload = event?.data;
      if (!payload || payload.messageId !== messageId) {
        resolve(null);
        return;
      }
      if (payload.ok !== true) {
        reject(new Error(payload?.error?.message || `Service worker bundle command failed: ${type}`));
        return;
      }
      resolve(payload.result || null);
    };

    messageTarget.postMessage({ type, messageId }, [channel.port2]);
  });
}

export function decideRuntimeStartup({ online, bundleState }) {
  const normalizedState = normalizeBundleState(bundleState);
  if (normalizedState === BUNDLE_STATES.READY) {
    return {
      startupMode: 'ready',
      allowRuntimeInit: true,
      blockReason: null,
      repairAction: 'none',
    };
  }

  if (!online) {
    return {
      startupMode: 'blocked',
      allowRuntimeInit: false,
      blockReason: 'offline-bundle-not-ready',
      repairAction: 'required-before-start',
    };
  }

  return {
    startupMode: 'repairing',
    allowRuntimeInit: false,
    blockReason: null,
    repairAction: 'required-before-start',
  };
}

export function getBundleStatus(runtime = globalThis) {
  const record = readBundleRecord(runtime);
  if (!record) {
    return {
      ready: false,
      state: BUNDLE_STATES.EMPTY,
      bundleVersion: null,
      validatedAtMs: null,
      diagnostics: null,
    };
  }

  return {
    ready: record.ready === true,
    state: normalizeBundleState(record.state),
    bundleVersion: record.bundleVersion || null,
    validatedAtMs: record.validatedAtMs || null,
    resolvedExecutionProviderHint: record.resolvedExecutionProviderHint || null,
    diagnostics: record.diagnosticsSummary || null,
  };
}

export async function validateBundle({
  runtime = globalThis,
  manifest,
  loadManifest = loadManifestDefault,
  hashBuffer = hashBufferDefault,
} = {}) {
  try {
    const swResult = await invokeServiceWorkerBundleCommand(runtime, 'UHDR_VALIDATE_BUNDLE');
    if (swResult && typeof swResult === 'object' && typeof swResult.state === 'string') {
      const existingRecord = readBundleRecord(runtime);
      writeBundleRecord({
        bundleVersion: swResult.bundleVersion || existingRecord?.bundleVersion || null,
        ready: swResult.ready === true,
        state: normalizeBundleState(swResult.state),
        validatedAtMs: Number.isFinite(Number(swResult.validatedAtMs))
          ? Math.floor(Number(swResult.validatedAtMs))
          : Date.now(),
        manifestDigest: swResult.manifestDigest || existingRecord?.manifestDigest || null,
        resolvedExecutionProviderHint: existingRecord?.resolvedExecutionProviderHint || null,
        diagnosticsSummary: swResult.diagnostics || null,
      }, runtime);
      emitBundleStatus(swResult);
      return swResult;
    }
  } catch {
    // Fall through to local validation path.
  }

  const resolvedManifest = validateManifest(
    manifest || (await loadManifest({ runtime })),
  );

  const cacheStorage = runtime?.caches || globalThis.caches;
  if (!cacheStorage || typeof cacheStorage.open !== 'function') {
    const diagnostics = buildDiagnosticsSummary({ staleVersion: false });
    const result = {
      ready: false,
      state: BUNDLE_STATES.FAILED,
      blocked: resolveRuntimeStartupOnline(runtime) === false,
      bundleVersion: resolvedManifest.bundleVersion,
      validatedAtMs: Date.now(),
      manifestDigest: createManifestDigest(resolvedManifest),
      diagnostics,
    };
    writeBundleRecord({
      bundleVersion: result.bundleVersion,
      ready: result.ready,
      state: result.state,
      validatedAtMs: result.validatedAtMs,
      manifestDigest: result.manifestDigest,
      diagnosticsSummary: diagnostics,
    }, runtime);
    emitBundleStatus(result);
    return result;
  }

  const missingAssets = [];
  const mismatchedAssets = [];

  for (const requiredAsset of resolvedManifest.requiredAssets) {
    const cacheName = resolveRuntimeBundleCacheName(requiredAsset.url, CACHE_NAMES) || requiredAsset.cacheName;
    const cache = await cacheStorage.open(cacheName);
    const assetUrl = resolveAssetUrl(requiredAsset.url);
    const response = await cache.match(assetUrl);
    if (!response) {
      missingAssets.push({ id: requiredAsset.id, url: requiredAsset.url });
      continue;
    }

    const bytes = await response.arrayBuffer();
    if (Number.isFinite(Number(requiredAsset.byteLength)) && Number(requiredAsset.byteLength) !== bytes.byteLength) {
      mismatchedAssets.push({ id: requiredAsset.id, url: requiredAsset.url, reason: 'byteLength' });
      continue;
    }

    const digest = await hashBuffer(bytes, runtime);
    if (digest !== requiredAsset.sha256) {
      mismatchedAssets.push({ id: requiredAsset.id, url: requiredAsset.url, reason: 'sha256' });
    }
  }

  const staleVersion = Boolean(
    readBundleRecord(runtime)?.bundleVersion
    && readBundleRecord(runtime)?.bundleVersion !== resolvedManifest.bundleVersion,
  );

  const diagnostics = buildDiagnosticsSummary({
    missingAssets,
    mismatchedAssets,
    staleVersion,
  });

  const ready = missingAssets.length === 0 && mismatchedAssets.length === 0;
  let state = BUNDLE_STATES.READY;
  if (!ready && mismatchedAssets.length > 0) {
    state = BUNDLE_STATES.CORRUPT;
  } else if (!ready && staleVersion) {
    state = BUNDLE_STATES.STALE;
  } else if (!ready) {
    state = BUNDLE_STATES.EMPTY;
  }

  const result = {
    ready,
    state,
    blocked: !ready && resolveRuntimeStartupOnline(runtime) === false,
    bundleVersion: resolvedManifest.bundleVersion,
    validatedAtMs: Date.now(),
    manifestDigest: createManifestDigest(resolvedManifest),
    diagnostics,
  };

  const existingRecord = readBundleRecord(runtime);
  writeBundleRecord({
    bundleVersion: result.bundleVersion,
    ready: result.ready,
    state: result.state,
    validatedAtMs: result.validatedAtMs,
    manifestDigest: result.manifestDigest,
    resolvedExecutionProviderHint: existingRecord?.resolvedExecutionProviderHint || null,
    diagnosticsSummary: diagnostics,
  }, runtime);

  emitBundleStatus(result);
  return result;
}

async function prepareBundleInternal({
  runtime = globalThis,
  force = false,
  manifest,
  loadManifest = loadManifestDefault,
  hashBuffer = hashBufferDefault,
  stateOverride = BUNDLE_STATES.PREPARING,
} = {}) {
  const resolvedManifest = validateManifest(
    manifest || (await loadManifest({ runtime })),
  );

  const currentRecord = readBundleRecord(runtime);
  if (
    !force
    && currentRecord?.ready === true
    && currentRecord?.bundleVersion === resolvedManifest.bundleVersion
  ) {
    return validateBundle({ runtime, manifest: resolvedManifest, hashBuffer });
  }

  writeBundleRecord({
    bundleVersion: resolvedManifest.bundleVersion,
    ready: false,
    state: stateOverride,
    validatedAtMs: Date.now(),
    manifestDigest: createManifestDigest(resolvedManifest),
    resolvedExecutionProviderHint: currentRecord?.resolvedExecutionProviderHint || null,
    diagnosticsSummary: null,
  }, runtime);

  const fetchFn = runtime?.fetch || globalThis.fetch;
  const cacheStorage = runtime?.caches || globalThis.caches;
  if (typeof fetchFn !== 'function' || !cacheStorage || typeof cacheStorage.open !== 'function') {
    const diagnostics = buildDiagnosticsSummary({ staleVersion: false });
    const failedResult = {
      ready: false,
      state: BUNDLE_STATES.FAILED,
      blocked: resolveRuntimeStartupOnline(runtime) === false,
      bundleVersion: resolvedManifest.bundleVersion,
      validatedAtMs: Date.now(),
      manifestDigest: createManifestDigest(resolvedManifest),
      diagnostics,
    };
    writeBundleRecord({
      bundleVersion: failedResult.bundleVersion,
      ready: false,
      state: failedResult.state,
      validatedAtMs: failedResult.validatedAtMs,
      manifestDigest: failedResult.manifestDigest,
      resolvedExecutionProviderHint: currentRecord?.resolvedExecutionProviderHint || null,
      diagnosticsSummary: diagnostics,
    }, runtime);
    emitBundleStatus(failedResult);
    return failedResult;
  }

  for (const requiredAsset of resolvedManifest.requiredAssets) {
    const assetUrl = resolveAssetUrl(requiredAsset.url);
    const response = await fetchFn.call(runtime, assetUrl, { credentials: 'same-origin' });
    if (!response?.ok) {
      const diagnostics = {
        ...buildDiagnosticsSummary({ staleVersion: false }),
        failedAssetId: requiredAsset.id,
        failedAssetUrl: requiredAsset.url,
        failedAssetStatus: response?.status || null,
      };
      const failedResult = {
        ready: false,
        state: BUNDLE_STATES.FAILED,
        blocked: resolveRuntimeStartupOnline(runtime) === false,
        bundleVersion: resolvedManifest.bundleVersion,
        validatedAtMs: Date.now(),
        manifestDigest: createManifestDigest(resolvedManifest),
        diagnostics,
      };
      writeBundleRecord({
        bundleVersion: failedResult.bundleVersion,
        ready: false,
        state: failedResult.state,
        validatedAtMs: failedResult.validatedAtMs,
        manifestDigest: failedResult.manifestDigest,
        resolvedExecutionProviderHint: currentRecord?.resolvedExecutionProviderHint || null,
        diagnosticsSummary: diagnostics,
      }, runtime);
      emitBundleStatus(failedResult);
      return failedResult;
    }

    const cacheName = resolveRuntimeBundleCacheName(requiredAsset.url, CACHE_NAMES) || requiredAsset.cacheName;
    const cache = await cacheStorage.open(cacheName);
    await cache.put(assetUrl, response.clone());
  }

  return validateBundle({ runtime, manifest: resolvedManifest, hashBuffer });
}

export async function prepareBundle(options = {}) {
  if (inflightPreparePromise) {
    return inflightPreparePromise;
  }

  inflightPreparePromise = (async () => {
    try {
      const swResult = await invokeServiceWorkerBundleCommand(
        options?.runtime || globalThis,
        'UHDR_PREPARE_BUNDLE',
      );
      if (swResult && typeof swResult === 'object' && typeof swResult.state === 'string') {
        const runtime = options?.runtime || globalThis;
        const existingRecord = readBundleRecord(runtime);
        writeBundleRecord({
          bundleVersion: swResult.bundleVersion || existingRecord?.bundleVersion || null,
          ready: swResult.ready === true,
          state: normalizeBundleState(swResult.state),
          validatedAtMs: Number.isFinite(Number(swResult.validatedAtMs))
            ? Math.floor(Number(swResult.validatedAtMs))
            : Date.now(),
          manifestDigest: swResult.manifestDigest || existingRecord?.manifestDigest || null,
          resolvedExecutionProviderHint: existingRecord?.resolvedExecutionProviderHint || null,
          diagnosticsSummary: swResult.diagnostics || null,
        }, runtime);
        emitBundleStatus(swResult);
        return swResult;
      }
    } catch {
      // Fall through to local preparation path.
    }

    return prepareBundleInternal(options);
  })().finally(() => {
    inflightPreparePromise = null;
  });
  return inflightPreparePromise;
}

export async function repairBundle(options = {}) {
  try {
    const runtime = options?.runtime || globalThis;
    const swResult = await invokeServiceWorkerBundleCommand(runtime, 'UHDR_REPAIR_BUNDLE');
    if (swResult && typeof swResult === 'object' && typeof swResult.state === 'string') {
      const existingRecord = readBundleRecord(runtime);
      writeBundleRecord({
        bundleVersion: swResult.bundleVersion || existingRecord?.bundleVersion || null,
        ready: swResult.ready === true,
        state: normalizeBundleState(swResult.state),
        validatedAtMs: Number.isFinite(Number(swResult.validatedAtMs))
          ? Math.floor(Number(swResult.validatedAtMs))
          : Date.now(),
        manifestDigest: swResult.manifestDigest || existingRecord?.manifestDigest || null,
        resolvedExecutionProviderHint: existingRecord?.resolvedExecutionProviderHint || null,
        diagnosticsSummary: swResult.diagnostics || null,
      }, runtime);
      emitBundleStatus(swResult);
      return swResult;
    }
  } catch {
    // Fall through to local repair path.
  }

  return prepareBundleInternal({
    ...options,
    force: true,
    stateOverride: BUNDLE_STATES.REPAIRING,
  });
}

export async function ensureBundleReady({
  runtime = globalThis,
  loadManifest = loadManifestDefault,
  hashBuffer = hashBufferDefault,
} = {}) {
  if (inflightEnsurePromise) {
    return inflightEnsurePromise;
  }

  inflightEnsurePromise = (async () => {
    const online = resolveRuntimeStartupOnline(runtime);
    const cacheStorage = runtime?.caches || globalThis.caches;
    const record = readBundleRecord(runtime);
    if (!cacheStorage || typeof cacheStorage.open !== 'function') {
      const unsupportedResult = {
        ready: online,
        blocked: !online,
        state: BUNDLE_STATES.FAILED,
        bundleVersion: null,
        validatedAtMs: null,
        diagnostics: {
          reason: 'cache-storage-unavailable',
        },
      };
      emitBundleStatus(unsupportedResult);
      return unsupportedResult;
    }

    if (!online) {
      if (record?.ready === true) {
        try {
          const swValidation = await invokeServiceWorkerBundleCommand(runtime, 'UHDR_VALIDATE_BUNDLE');
          if (swValidation?.ready === true && typeof swValidation === 'object') {
            return {
              ...swValidation,
              blocked: swValidation.ready !== true,
            };
          }
        } catch {
          // Fall back to the last known readiness record when offline.
        }

        const readyResult = {
          ready: true,
          blocked: false,
          state: record.state || BUNDLE_STATES.READY,
          bundleVersion: record.bundleVersion || null,
          validatedAtMs: record.validatedAtMs || null,
          diagnostics: record.diagnosticsSummary || null,
        };
        emitBundleStatus(readyResult);
        return readyResult;
      }

      const state = record?.state || BUNDLE_STATES.EMPTY;
      const blockedResult = {
        ready: false,
        blocked: true,
        state,
        bundleVersion: record?.bundleVersion || null,
        validatedAtMs: record?.validatedAtMs || null,
        diagnostics: record?.diagnosticsSummary || {
          reason: 'offline-without-ready-bundle',
        },
      };
      emitBundleStatus(blockedResult);
      return blockedResult;
    }

    const manifest = await loadManifest({ runtime });

    if (record?.ready === true && record.bundleVersion === manifest.bundleVersion) {
      const validationResult = await validateBundle({ runtime, manifest, hashBuffer });
      if (validationResult.ready) {
        return {
          ...validationResult,
          blocked: false,
        };
      }
    }

    const prepared = await prepareBundle({ runtime, manifest, loadManifest, hashBuffer });
    if (prepared.ready) {
      return {
        ...prepared,
        blocked: false,
      };
    }

    const repaired = await repairBundle({ runtime, manifest, loadManifest, hashBuffer });
    return {
      ...repaired,
      blocked: false,
    };
  })().finally(() => {
    inflightEnsurePromise = null;
  });

  return inflightEnsurePromise;
}

export async function setBundleProviderHint(provider, runtime = globalThis) {
  if (typeof provider !== 'string' || provider.trim().length === 0) {
    return;
  }

  const current = readBundleRecord(runtime);
  if (!current || current.ready !== true) {
    return;
  }

  writeBundleRecord({
    ...current,
    resolvedExecutionProviderHint: provider.trim().toLowerCase(),
  }, runtime);
}
