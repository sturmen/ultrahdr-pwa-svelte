import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../package.json' with { type: 'json' };

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

export const DEFAULT_REQUIRED_ASSET_SPECS = Object.freeze([
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
  {
    id: 'ultrahdr-wasm-js',
    sourcePath: 'public/assets/ultrahdr_wasm.js',
    url: 'assets/ultrahdr_wasm.js',
    cacheName: 'uhdr-wasm-assets-runtime-bundle',
    kind: 'runtime-script',
    versionScope: 'wasm',
  },
  {
    id: 'ultrahdr-wasm-bin',
    sourcePath: 'public/assets/ultrahdr_wasm.wasm',
    url: 'assets/ultrahdr_wasm.wasm',
    cacheName: 'uhdr-wasm-assets-runtime-bundle',
    kind: 'wasm',
    versionScope: 'wasm',
  },
  {
    id: 'jpegli-wasm-js',
    sourcePath: 'public/assets/jpegli_wasm.js',
    url: 'assets/jpegli_wasm.js',
    cacheName: 'uhdr-wasm-assets-runtime-bundle',
    kind: 'runtime-script',
    versionScope: 'wasm',
  },
  {
    id: 'jpegli-wasm-bin',
    sourcePath: 'public/assets/jpegli_wasm.wasm',
    url: 'assets/jpegli_wasm.wasm',
    cacheName: 'uhdr-wasm-assets-runtime-bundle',
    kind: 'wasm',
    versionScope: 'wasm',
  },
  {
    id: 'libheif-wasm-bin',
    sourcePath: 'node_modules/libheif-js/libheif-wasm/libheif.wasm',
    url: 'assets/libheif.wasm',
    cacheName: 'uhdr-libheif-assets-runtime-bundle',
    kind: 'wasm',
    versionScope: 'app',
  },
  {
    id: 'ort-wasm-simd-threaded-asyncify',
    sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.asyncify.wasm',
    url: 'assets/ort-wasm-simd-threaded.asyncify.wasm',
    cacheName: 'uhdr-onnx-wasm-runtime-bundle',
    kind: 'wasm',
  },
  {
    id: 'ort-wasm-simd-threaded-jsep',
    sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
    url: 'assets/ort-wasm-simd-threaded.jsep.wasm',
    cacheName: 'uhdr-onnx-wasm-runtime-bundle',
    kind: 'wasm',
  },
  {
    id: 'ort-wasm-simd-threaded-jspi',
    sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jspi.wasm',
    url: 'assets/ort-wasm-simd-threaded.jspi.wasm',
    cacheName: 'uhdr-onnx-wasm-runtime-bundle',
    kind: 'wasm',
  },
  {
    id: 'ort-wasm-simd-threaded',
    sourcePath: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
    url: 'assets/ort-wasm-simd-threaded.wasm',
    cacheName: 'uhdr-onnx-wasm-runtime-bundle',
    kind: 'wasm',
  },
]);

function appendVersionQuery(url, version) {
  if (typeof version !== 'string' || version.trim().length === 0) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version.trim())}`;
}

function resolveVersionedAssetUrl(assetSpec, { appAssetVersion, wasmAssetVersion }) {
  if (assetSpec?.versionScope === 'app') {
    return appendVersionQuery(assetSpec.url, appAssetVersion);
  }
  if (assetSpec?.versionScope === 'wasm') {
    return appendVersionQuery(assetSpec.url, wasmAssetVersion);
  }
  return assetSpec.url;
}

function readVersionMetadata(metadataPath, key, fallbackValue) {
  if (!fs.existsSync(metadataPath)) {
    return fallbackValue;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    if (typeof parsed?.[key] === 'string' && parsed[key].trim().length > 0) {
      return parsed[key].trim();
    }
    return fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function createSha256Hex(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function resolveBundleVersion({ appVersion, appAssetVersion, wasmAssetVersion }) {
  return `${appVersion}|${appAssetVersion}|${wasmAssetVersion}`;
}

export async function buildRuntimeBundleManifest({
  rootDirectory = ROOT_DIRECTORY,
  requiredAssetSpecs = DEFAULT_REQUIRED_ASSET_SPECS,
  appVersion = packageJson.version,
  appAssetVersion = readVersionMetadata(APP_VERSION_METADATA_PATH, 'appAssetVersion', 'dev-unversioned-app'),
  wasmAssetVersion = readVersionMetadata(WASM_VERSION_METADATA_PATH, 'wasmAssetVersion', 'dev-unversioned'),
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
      url: resolveVersionedAssetUrl(assetSpec, { appAssetVersion, wasmAssetVersion }),
      cacheName: assetSpec.cacheName,
      kind: assetSpec.kind,
      byteLength: bytes.byteLength,
      sha256: createSha256Hex(bytes),
    };
  });

  return {
    bundleVersion: resolveBundleVersion({
      appVersion,
      appAssetVersion,
      wasmAssetVersion,
    }),
    generatedAt: new Date().toISOString(),
    requiredAssets,
  };
}

export async function writeRuntimeBundleManifest({
  rootDirectory = ROOT_DIRECTORY,
  outputPath = DEFAULT_OUTPUT_PATH,
  requiredAssetSpecs = DEFAULT_REQUIRED_ASSET_SPECS,
  appVersion = packageJson.version,
  appAssetVersion = readVersionMetadata(APP_VERSION_METADATA_PATH, 'appAssetVersion', 'dev-unversioned-app'),
  wasmAssetVersion = readVersionMetadata(WASM_VERSION_METADATA_PATH, 'wasmAssetVersion', 'dev-unversioned'),
} = {}) {
  const manifest = await buildRuntimeBundleManifest({
    rootDirectory,
    requiredAssetSpecs,
    appVersion,
    appAssetVersion,
    wasmAssetVersion,
  });

  const resolvedOutputPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
  fs.writeFileSync(resolvedOutputPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeRuntimeBundleManifest()
    .then((manifest) => {
      console.log(
        `[build-runtime-bundle-manifest] wrote ${DEFAULT_OUTPUT_PATH} with ${manifest.requiredAssets.length} assets.`,
      );
    })
    .catch((error) => {
      console.error('[build-runtime-bundle-manifest] failed:', error);
      process.exitCode = 1;
    });
}
