import {
  fetchRuntimeAssetText,
  getRuntimeAssetCacheName,
  buildRuntimeAssetDiagnosticsContext,
  resolveRuntimeAssetUrl,
} from './runtime-assets.ts';
import {
  LIBHEIF_BUNDLE_SCRIPT_ASSET,
  LIBHEIF_WASM_BINARY_ASSET,
} from './runtime-asset-definitions.ts';
import { recordRuntimeAssetDiagnostics } from './diagnostics-events.ts';

type LibheifFactoryOptions = {
  wasmBinary: ArrayBuffer;
  locateFile?: (path: string) => string;
};

type InitializedLibheifModule = {
  HeifDecoder: new () => unknown;
};

type LibheifFactory = (
  options: LibheifFactoryOptions,
) => Promise<InitializedLibheifModule> | InitializedLibheifModule;

type LibheifBundleModule = {
  default?: unknown;
  'module.exports'?: unknown;
};

let libheifModulePromise: Promise<LibheifBundleModule | InitializedLibheifModule | LibheifFactory> | null = null;

function isInitializedLibheifModule(moduleValue: unknown): moduleValue is InitializedLibheifModule {
  if (!moduleValue || typeof moduleValue !== 'object') {
    return false;
  }
  try {
    return typeof (moduleValue as { HeifDecoder?: unknown }).HeifDecoder === 'function';
  } catch {
    return false;
  }
}

function resolveLibheifModule(moduleValue: unknown): InitializedLibheifModule | null {
  const candidate = moduleValue as LibheifBundleModule | null | undefined;
  if (isInitializedLibheifModule(moduleValue)) {
    return moduleValue;
  }
  if (isInitializedLibheifModule(candidate?.default)) {
    return candidate.default;
  }
  if (isInitializedLibheifModule(candidate?.['module.exports'])) {
    return candidate['module.exports'];
  }
  if (isInitializedLibheifModule((candidate?.default as LibheifBundleModule | null | undefined)?.default)) {
    return (candidate?.default as LibheifBundleModule).default as InitializedLibheifModule;
  }
  return null;
}

function resolveLibheifFactory(moduleValue: unknown): LibheifFactory | null {
  const candidate = moduleValue as LibheifBundleModule | null | undefined;
  if (typeof moduleValue === 'function') {
    return moduleValue as LibheifFactory;
  }
  if (typeof candidate?.default === 'function') {
    return candidate.default as LibheifFactory;
  }
  if (typeof candidate?.['module.exports'] === 'function') {
    return candidate['module.exports'] as LibheifFactory;
  }
  const nestedDefault = (candidate?.default as LibheifBundleModule | null | undefined)?.default;
  if (typeof nestedDefault === 'function') {
    return nestedDefault as LibheifFactory;
  }
  return null;
}

async function loadLibheifBundleModule(): Promise<LibheifBundleModule | InitializedLibheifModule | LibheifFactory> {
  if (!libheifModulePromise) {
    libheifModulePromise = (async () => {
      const { asset: sourceText, cacheSource } = await fetchRuntimeAssetText(LIBHEIF_BUNDLE_SCRIPT_ASSET);
      if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
        throw new Error('libheif browser bundle module was empty');
      }
      recordRuntimeAssetDiagnostics(globalThis, {
        type: 'libheif-bundle-module-fetched',
        trigger: 'module-load',
        ...(buildRuntimeAssetDiagnosticsContext(LIBHEIF_BUNDLE_SCRIPT_ASSET, {
          cacheName: getRuntimeAssetCacheName(LIBHEIF_BUNDLE_SCRIPT_ASSET),
          cacheSource,
          byteLength: sourceText.length,
        }) as {
          assetId: string | null;
          versionKind: 'app' | 'wasm' | 'none' | null;
          cacheName: string | null;
          cacheSource: string | null;
          byteLength: number | null;
          errorCategory: string | null;
        }),
      });
      const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(sourceText)}`;
      return import(/* @vite-ignore */ moduleUrl) as Promise<LibheifBundleModule>;
    })();
  }
  return libheifModulePromise;
}

export default async function createLibheif(...args: [LibheifFactoryOptions]): Promise<InitializedLibheifModule> {
  const libheifBundleModule = await loadLibheifBundleModule();
  const initializedLibheifModule = resolveLibheifModule(libheifBundleModule);
  const libheifFactory = resolveLibheifFactory(libheifBundleModule);
  if (initializedLibheifModule) {
    return initializedLibheifModule;
  }
  if (typeof libheifFactory !== 'function') {
    throw new TypeError('libheif browser bundle did not export a callable factory or initialized module');
  }
  return libheifFactory({
    ...args[0],
    locateFile: (path: string) => {
      if (path.endsWith('.wasm')) {
        return resolveRuntimeAssetUrl(LIBHEIF_WASM_BINARY_ASSET);
      }
      return args[0]?.locateFile?.(path) ?? path;
    },
  });
}
