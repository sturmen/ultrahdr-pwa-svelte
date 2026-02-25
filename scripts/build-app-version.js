#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const appVersionMetadataPath = path.join(rootDir, '.app-version.json');

export const APP_VERSION_INPUTS = Object.freeze([
  'src/**',
  'public/**',
  'index.html',
  'vite.config.js',
  '.wasm-version.json',
]);

const INPUT_SPECS = Object.freeze([
  { type: 'directory', relativePath: 'src' },
  { type: 'directory', relativePath: 'public' },
  { type: 'file', relativePath: 'index.html' },
  { type: 'file', relativePath: 'vite.config.js' },
  { type: 'file', relativePath: '.wasm-version.json' },
]);

const IGNORED_FILENAMES = new Set(['.DS_Store']);

function isTruthyEnvValue(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

export function isStrictBuildMode(env = process.env) {
  return isTruthyEnvValue(env.WASM_BUILD_STRICT)
    || isTruthyEnvValue(env.CI)
    || String(env.NODE_ENV || '').toLowerCase() === 'production';
}

function listFilesRecursively(directoryPath) {
  const relativeFiles = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })
      .filter((entry) => !IGNORED_FILENAMES.has(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        relativeFiles.push(path.relative(directoryPath, fullPath).split(path.sep).join('/'));
      }
    }
  }

  walk(directoryPath);
  return relativeFiles;
}

function appendMissingInput(hash, spec) {
  const marker = spec.type === 'directory' ? 'MISSING_DIR' : 'MISSING_FILE';
  hash.update(`${marker}:${spec.relativePath}\n`);
}

function appendFileToHash(hash, absolutePath, relativePath) {
  try {
    const content = fs.readFileSync(absolutePath);
    hash.update(`FILE:${relativePath}\n`);
    hash.update(content);
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      console.warn(`Warning: Cannot read ${relativePath} due to permissions (${err.code}). Skipping contents in hash.`);
      hash.update(`ERROR_FILE:${relativePath}\n`);
    } else {
      throw err;
    }
  }
}

export function computeAppAssetVersion({
  rootDirectory = rootDir,
  strictMode = isStrictBuildMode(),
} = {}) {
  const hash = createHash('sha256');

  for (const spec of INPUT_SPECS) {
    const absolutePath = path.join(rootDirectory, spec.relativePath);
    if (!fs.existsSync(absolutePath)) {
      if (strictMode) {
        throw new Error(`Missing required app version input: ${absolutePath}`);
      }
      appendMissingInput(hash, spec);
      continue;
    }

    if (spec.type === 'directory') {
      const files = listFilesRecursively(absolutePath);
      if (files.length === 0) {
        hash.update(`EMPTY_DIR:${spec.relativePath}\n`);
      }
      for (const file of files) {
        const normalized = `${spec.relativePath}/${file}`;
        appendFileToHash(hash, path.join(absolutePath, file), normalized);
      }
      continue;
    }

    appendFileToHash(hash, absolutePath, spec.relativePath);
  }

  return hash.digest('hex').slice(0, 16);
}

export function writeAppVersionMetadata({
  rootDirectory = rootDir,
  metadataPath = appVersionMetadataPath,
  strictMode = isStrictBuildMode(),
} = {}) {
  const appAssetVersion = computeAppAssetVersion({ rootDirectory, strictMode });
  const metadata = {
    appAssetVersion,
    generatedAt: new Date().toISOString(),
    inputs: [...APP_VERSION_INPUTS],
  };

  try {
    fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      console.warn(`Warning: Could not write app metadata to ${metadataPath} (${err.code})`);
    } else {
      throw err;
    }
  }
  return metadata;
}

function main() {
  try {
    const strictMode = isStrictBuildMode();
    const metadata = writeAppVersionMetadata({ strictMode });

    console.log('App asset version metadata written:', appVersionMetadataPath);
    console.log('App asset version:', metadata.appAssetVersion);
    console.log(`Strict app version mode: ${strictMode ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  }
}

const isDirectExecution = process.argv[1]
  && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  main();
}
