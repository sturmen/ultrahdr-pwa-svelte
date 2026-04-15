import { recordRuntimeInitDiagnostics } from './diagnostics-events.ts';

const RUNTIME_WARMUP_ASSET_VERSION_KEY = 'ultrahdr:runtime-warmup-asset-version:v1';

type RuntimeLike = typeof globalThis;

type WarmupBootstrap = () => Promise<unknown>;

type WarmRuntimeForUpdatedAssetVersionOptions = {
  assetVersion?: string | null;
  runtime?: RuntimeLike;
  loadJpegliBootstrap?: () => Promise<WarmupBootstrap>;
  loadUltraHdrBootstrap?: () => Promise<WarmupBootstrap>;
};

function normalizeAssetVersion(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readLastWarmedAssetVersion(runtime: RuntimeLike): string | null {
  try {
    return normalizeAssetVersion(runtime.localStorage?.getItem(RUNTIME_WARMUP_ASSET_VERSION_KEY));
  } catch {
    return null;
  }
}

function writeLastWarmedAssetVersion(runtime: RuntimeLike, assetVersion: string): void {
  try {
    runtime.localStorage?.setItem(RUNTIME_WARMUP_ASSET_VERSION_KEY, assetVersion);
  } catch {
    // Best-effort only.
  }
}

function classifyWarmupError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalized = message.toLowerCase();
  if (normalized.includes('ultrahdr runtime warmup failed')) {
    return 'ultrahdr-runtime-unavailable';
  }
  if (normalized.includes('jpegli')) {
    return 'jpegli-runtime-warmup-failed';
  }
  if (normalized.includes('ultrahdr')) {
    return 'ultrahdr-runtime-warmup-failed';
  }
  return 'runtime-warmup-failed';
}

async function loadDefaultJpegliBootstrap(): Promise<WarmupBootstrap> {
  const module = await import('./jpegli-decoder.js');
  return module.bootstrapJpegliRuntime;
}

async function loadDefaultUltraHdrBootstrap(): Promise<WarmupBootstrap> {
  const module = await import('./ultrahdr-wasm.js');
  return async () => {
    const available = await module.isAvailable();
    if (!available) {
      throw new Error('UltraHDR runtime warmup failed.');
    }
  };
}

export async function warmRuntimeForUpdatedAssetVersion(
  options: WarmRuntimeForUpdatedAssetVersionOptions = {},
): Promise<boolean> {
  const runtime = options.runtime ?? globalThis;
  const assetVersion = normalizeAssetVersion(
    options.assetVersion ?? import.meta.env.VITE_APP_ASSET_VERSION ?? null,
  );
  if (!assetVersion) {
    return false;
  }

  const previousAssetVersion = readLastWarmedAssetVersion(runtime);
  if (previousAssetVersion === assetVersion) {
    return false;
  }

  const online = runtime.navigator?.onLine !== false;
  recordRuntimeInitDiagnostics(runtime, {
    type: 'asset-version-runtime-warmup-started',
    attempt: 1,
    online,
    trigger: 'app-start',
    assetVersion,
    previousAssetVersion,
  });

  const loadJpegliBootstrap = options.loadJpegliBootstrap ?? loadDefaultJpegliBootstrap;
  const loadUltraHdrBootstrap = options.loadUltraHdrBootstrap ?? loadDefaultUltraHdrBootstrap;

  try {
    const warmJpegli = await loadJpegliBootstrap();
    await warmJpegli();

    const warmUltraHdr = await loadUltraHdrBootstrap();
    const ultraHdrWarmupResult = await warmUltraHdr();
    if (ultraHdrWarmupResult === false) {
      throw new Error('UltraHDR runtime warmup failed.');
    }

    writeLastWarmedAssetVersion(runtime, assetVersion);
    recordRuntimeInitDiagnostics(runtime, {
      type: 'asset-version-runtime-warmup-completed',
      attempt: 1,
      online,
      trigger: 'app-start',
      assetVersion,
      previousAssetVersion,
    });
    return true;
  } catch (error) {
    recordRuntimeInitDiagnostics(runtime, {
      type: 'asset-version-runtime-warmup-failed',
      attempt: 1,
      online,
      trigger: 'app-start',
      assetVersion,
      previousAssetVersion,
      errorCategory: classifyWarmupError(error),
      message: error instanceof Error ? error.message : String(error || ''),
    });
    throw error;
  }
}
