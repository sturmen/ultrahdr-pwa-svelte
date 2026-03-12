const APP_ASSET_VERSION = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
  ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
  : '';

let libheifModulePromise = null;

function appendVersionQuery(url) {
  if (!APP_ASSET_VERSION) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(APP_ASSET_VERSION)}`;
}

function resolveLibheifRuntimeUrl() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return appendVersionQuery(
    `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}assets/libheif-bundle.mjs`,
  );
}

async function loadLibheifBundleModule() {
  if (!libheifModulePromise) {
    const testSpecifier = ['libheif-js', 'wasm-bundle.js'].join('/');
    libheifModulePromise = import.meta.env?.VITEST
      ? import(testSpecifier)
      : import(/* @vite-ignore */ resolveLibheifRuntimeUrl());
  }
  return libheifModulePromise;
}

function isInitializedLibheifModule(moduleValue) {
  if (!moduleValue || typeof moduleValue !== 'object') {
    return false;
  }
  try {
    return typeof moduleValue.HeifDecoder === 'function';
  } catch {
    return false;
  }
}

function resolveLibheifModule(moduleValue) {
  if (isInitializedLibheifModule(moduleValue)) {
    return moduleValue;
  }
  if (isInitializedLibheifModule(moduleValue?.default)) {
    return moduleValue.default;
  }
  if (isInitializedLibheifModule(moduleValue?.['module.exports'])) {
    return moduleValue['module.exports'];
  }
  if (isInitializedLibheifModule(moduleValue?.default?.default)) {
    return moduleValue.default.default;
  }
  return null;
}

function resolveLibheifFactory(moduleValue) {
  if (typeof moduleValue === 'function') {
    return moduleValue;
  }
  if (typeof moduleValue?.default === 'function') {
    return moduleValue.default;
  }
  if (typeof moduleValue?.['module.exports'] === 'function') {
    return moduleValue['module.exports'];
  }
  if (typeof moduleValue?.default?.default === 'function') {
    return moduleValue.default.default;
  }
  return null;
}

export default async function createLibheif(...args) {
  const libheifBundleModule = await loadLibheifBundleModule();
  const initializedLibheifModule = resolveLibheifModule(libheifBundleModule);
  const libheifFactory = resolveLibheifFactory(libheifBundleModule);
  if (initializedLibheifModule) {
    return initializedLibheifModule;
  }
  if (typeof libheifFactory !== 'function') {
    throw new TypeError('libheif browser bundle did not export a callable factory or initialized module');
  }
  return libheifFactory(...args);
}
