import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../package.json' with { type: 'json' };
import { REQUIRED_RUNTIME_ASSET_DESCRIPTORS } from '../src/lib/runtime-asset-definitions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIRECTORY = path.resolve(__dirname, '..');
const APP_VERSION_METADATA_PATH = path.join(ROOT_DIRECTORY, '.app-version.json');
const WASM_VERSION_METADATA_PATH = path.join(ROOT_DIRECTORY, '.wasm-version.json');
const DEFAULT_OUTPUT_PATH = path.join(
  ROOT_DIRECTORY,
  'public',
  'models',
  'runtime-bundle-manifest.json',
);

type VersionScope = 'app' | 'wasm';
type AssetKind = 'model' | 'smoke' | 'runtime-script' | 'wasm';

export type RequiredAssetSpec = {
  id: string;
  sourcePath: string;
  url: string;
  cacheName: string;
  kind: AssetKind;
  versionScope?: VersionScope;
};

function toRequiredAssetSpec(
  descriptor: (typeof REQUIRED_RUNTIME_ASSET_DESCRIPTORS)[number],
): RequiredAssetSpec {
  return {
    id: descriptor.id,
    sourcePath: descriptor.sourcePath,
    url: descriptor.path,
    cacheName: descriptor.bundleCacheName,
    kind: descriptor.kind,
    versionScope: descriptor.versionKind === 'none' ? undefined : descriptor.versionKind,
  };
}

type BundleVersionOptions = {
  appVersion: string;
  appAssetVersion: string;
  wasmAssetVersion: string;
};

export const DEFAULT_REQUIRED_ASSET_SPECS: readonly RequiredAssetSpec[] = Object.freeze([
  {
    id: 'gmnet-realworld-global',
    sourcePath: 'public/models/gmnet-realworld-global.onnx',
    url: 'models/gmnet-realworld-global.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-realworld-global-data',
    sourcePath: 'public/models/gmnet-realworld-global.onnx.data',
    url: 'models/gmnet-realworld-global.onnx.data',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-realworld-local',
    sourcePath: 'public/models/gmnet-realworld-local.onnx',
    url: 'models/gmnet-realworld-local.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-realworld-local-data',
    sourcePath: 'public/models/gmnet-realworld-local.onnx.data',
    url: 'models/gmnet-realworld-local.onnx.data',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-realworld-global-inline',
    sourcePath: 'public/models/gmnet-realworld-global-inline.onnx',
    url: 'models/gmnet-realworld-global-inline.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-realworld-local-inline-webgl',
    sourcePath: 'public/models/gmnet-realworld-local-inline-webgl.onnx',
    url: 'models/gmnet-realworld-local-inline-webgl.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-synthetic-global',
    sourcePath: 'public/models/gmnet-synthetic-global.onnx',
    url: 'models/gmnet-synthetic-global.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-synthetic-global-data',
    sourcePath: 'public/models/gmnet-synthetic-global.onnx.data',
    url: 'models/gmnet-synthetic-global.onnx.data',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-synthetic-local',
    sourcePath: 'public/models/gmnet-synthetic-local.onnx',
    url: 'models/gmnet-synthetic-local.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-synthetic-local-data',
    sourcePath: 'public/models/gmnet-synthetic-local.onnx.data',
    url: 'models/gmnet-synthetic-local.onnx.data',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-synthetic-global-inline',
    sourcePath: 'public/models/gmnet-synthetic-global-inline.onnx',
    url: 'models/gmnet-synthetic-global-inline.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-synthetic-local-inline-webgl',
    sourcePath: 'public/models/gmnet-synthetic-local-inline-webgl.onnx',
    url: 'models/gmnet-synthetic-local-inline-webgl.onnx',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'model',
    versionScope: 'app',
  },
  {
    id: 'gmnet-smoke-asset',
    sourcePath: 'public/models/gmnet-smoke-128.png',
    url: 'models/gmnet-smoke-128.png',
    cacheName: 'uhdr-ai-models-runtime-bundle',
    kind: 'smoke',
    versionScope: 'app',
  },
  ...REQUIRED_RUNTIME_ASSET_DESCRIPTORS.map(toRequiredAssetSpec),
]);

function appendVersionQuery(url: string, version: string): string {
  if (typeof version !== 'string' || version.trim().length === 0) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version.trim())}`;
}

function resolveVersionedAssetUrl(assetSpec: RequiredAssetSpec, { appAssetVersion, wasmAssetVersion }: BundleVersionOptions): string {
  if (assetSpec.versionScope === 'app') {
    return appendVersionQuery(assetSpec.url, appAssetVersion);
  }
  if (assetSpec.versionScope === 'wasm') {
    return appendVersionQuery(assetSpec.url, wasmAssetVersion);
  }
  return assetSpec.url;
}

function readVersionMetadata(metadataPath: string, key: string, fallbackValue: string): string {
  if (!fs.existsSync(metadataPath)) {
    return fallbackValue;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as Record<string, unknown>;
    if (typeof parsed?.[key] === 'string' && parsed[key].trim().length > 0) {
      return parsed[key].trim();
    }
    return fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function createSha256Hex(buffer: Uint8Array): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function resolveBundleVersion({ appVersion, appAssetVersion, wasmAssetVersion }: BundleVersionOptions): string {
  return `${appVersion}|${appAssetVersion}|${wasmAssetVersion}`;
}

export async function buildRuntimeBundleManifest({
  rootDirectory = ROOT_DIRECTORY,
  requiredAssetSpecs = DEFAULT_REQUIRED_ASSET_SPECS,
  appVersion = packageJson.version,
  appAssetVersion = readVersionMetadata(APP_VERSION_METADATA_PATH, 'appAssetVersion', 'dev-unversioned-app'),
  wasmAssetVersion = readVersionMetadata(WASM_VERSION_METADATA_PATH, 'wasmAssetVersion', 'dev-unversioned'),
}: {
  rootDirectory?: string;
  requiredAssetSpecs?: readonly RequiredAssetSpec[];
  appVersion?: string;
  appAssetVersion?: string;
  wasmAssetVersion?: string;
} = {}) {
  const resolvedRoot = path.resolve(rootDirectory);
  const requiredAssets = requiredAssetSpecs.map((assetSpec) => {
    const sourceAbsolutePath = path.resolve(resolvedRoot, assetSpec.sourcePath);
    if (!fs.existsSync(sourceAbsolutePath)) {
      throw new Error(`Required runtime bundle asset is missing: ${assetSpec.sourcePath}`);
    }

    const bytes = fs.readFileSync(sourceAbsolutePath);
    return {
      id: assetSpec.id,
      url: resolveVersionedAssetUrl(assetSpec, { appVersion, appAssetVersion, wasmAssetVersion }),
      cacheName: assetSpec.cacheName,
      kind: assetSpec.kind,
      byteLength: bytes.byteLength,
      sha256: createSha256Hex(bytes),
    };
  });

  return {
    bundleVersion: resolveBundleVersion({ appVersion, appAssetVersion, wasmAssetVersion }),
    generatedAt: new Date().toISOString(),
    requiredAssets,
  };
}

export async function writeRuntimeBundleManifest({
  outputPath = DEFAULT_OUTPUT_PATH,
  ...options
}: {
  outputPath?: string;
  rootDirectory?: string;
  requiredAssetSpecs?: readonly RequiredAssetSpec[];
  appVersion?: string;
  appAssetVersion?: string;
  wasmAssetVersion?: string;
} = {}) {
  const manifest = await buildRuntimeBundleManifest(options);
  const resolvedOutputPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
  fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return manifest;
}

async function main(): Promise<void> {
  const manifest = await writeRuntimeBundleManifest();
  console.log(
    `[build-runtime-bundle-manifest] wrote ${DEFAULT_OUTPUT_PATH} with ${manifest.requiredAssets.length} assets.`,
  );
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  main().catch((error: unknown) => {
    console.error('[build-runtime-bundle-manifest] failed:', error);
    process.exit(1);
  });
}
