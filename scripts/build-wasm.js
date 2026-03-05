#!/usr/bin/env node
/**
 * Build script for libultrahdr WASM module
 *
 * This script handles the Emscripten build process for libultrahdr,
 * including:
 * - Checking for emsdk installation
 * - Configuring CMake with Emscripten toolchain
 * - Building the ultrahdr_wasm target
 * - Copying output files to the public/assets directory
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';
import { buildJpegliWasm } from './build-jpegli-wasm.js';
import { buildJpegtranWasm } from './build-jpegtran-wasm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const wasmWrapperDir = path.join(rootDir, 'ultrahdr-wasm');
const emsdkDir = path.join(rootDir, 'emsdk');
const outputDir = path.join(rootDir, 'public', 'assets');
const buildDir = path.join(wasmWrapperDir, 'build');
const wasmVersionMetadataPath = path.join(rootDir, '.wasm-version.json');
const REQUIRED_WASM_FILES = Object.freeze([
    'ultrahdr_wasm.js',
    'ultrahdr_wasm.wasm',
    'jpegli_wasm.js',
    'jpegli_wasm.wasm',
    'jpegtran_wasm.js',
    'jpegtran_wasm.wasm',
]);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Building libultrahdr WASM module...');
console.log(`Root directory: ${rootDir}`);
console.log(`WASM wrapper directory: ${wasmWrapperDir}`);
console.log(`emsdk directory: ${emsdkDir}`);
console.log(`Build directory: ${buildDir}`);
console.log(`Output directory: ${outputDir}`);

function isTruthyEnvValue(value) {
    return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

export function isStrictBuildMode(env = process.env) {
    return isTruthyEnvValue(env.WASM_BUILD_STRICT)
        || isTruthyEnvValue(env.CI)
        || String(env.NODE_ENV || '').toLowerCase() === 'production';
}

/**
 * Run a command with logging
 * @param {string} command
 * @param {object} options
 */
function runCommand(command, options = {}) {
    console.log(`\n> ${command}\n`);
    execSync(command, {
        stdio: 'inherit',
        ...options
    });
}

/**
 * Check if emsdk is installed and activated
 */
function checkEmsdk() {
    console.log('\n=== Checking emsdk installation ===');

    // Check if emsdk directory exists
    if (!fs.existsSync(emsdkDir)) {
        console.error('ERROR: emsdk directory not found at:', emsdkDir);
        console.error('Please run: git submodule update --init');
        process.exit(1);
    }

    // Check if emcmake is available in PATH
    try {
        execSync('which emcmake', { stdio: 'pipe' });
        console.log('emcmake found in PATH');
        return true;
    } catch (e) {
        // Try to find in emsdk directory
        const emsdkEnv = path.join(emsdkDir, 'emsdk_env.sh');
        if (fs.existsSync(emsdkEnv)) {
            console.log('emsdk environment script found, will source it');
            return true;
        } else {
            console.error('ERROR: emcmake not found. Please activate emsdk:');
            console.error('  cd emsdk && ./emsdk install latest && ./emsdk activate latest');
            console.error('  source ./emsdk_env.sh');
            process.exit(1);
        }
    }
}

/**
 * Configure and build WASM module
 */
function buildWasm() {
    console.log('\n=== Configuring and building WASM module ===');

    // Clean and create build directory
    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true });
    }
    fs.mkdirSync(buildDir, { recursive: true });

    // Configure with emcmake
    runCommand(`emcmake cmake -DCMAKE_BUILD_TYPE=Release ..`, { cwd: buildDir });

    // Build
    runCommand(`emmake make -j4`, { cwd: buildDir });

    console.log('\n=== Building Jpegli WASM module ===');
    buildJpegliWasm();
    console.log('\n=== Building Jpegtran WASM module ===');
    buildJpegtranWasm();
}

function hasExistingAssets() {
    return REQUIRED_WASM_FILES.every((file) => fs.existsSync(path.join(outputDir, file)));
}

export function resolveBuildFailureStrategy({ strictMode, hasAssets }) {
    if (!strictMode && hasAssets) {
        return 'fallback';
    }
    return 'throw';
}

export function computeWasmAssetVersionFromFiles(files) {
    const hash = createHash('sha256');
    const normalizedFiles = [...files].sort();
    for (const filePath of normalizedFiles) {
        hash.update(path.basename(filePath));
        hash.update(fs.readFileSync(filePath));
    }
    return hash.digest('hex').slice(0, 16);
}

export function computeWasmAssetVersion(outputDirectory = outputDir) {
    const filePaths = REQUIRED_WASM_FILES.map((file) => path.join(outputDirectory, file));

    for (const filePath of filePaths) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Cannot compute WASM asset version; missing file: ${filePath}`);
        }
    }

    return computeWasmAssetVersionFromFiles(filePaths);
}

export function writeWasmVersionMetadata(
    outputDirectory = outputDir,
    metadataPath = wasmVersionMetadataPath
) {
    const wasmAssetVersion = computeWasmAssetVersion(outputDirectory);
    const metadata = {
        wasmAssetVersion,
        generatedAt: new Date().toISOString(),
        files: [...REQUIRED_WASM_FILES]
    };
    try {
        fs.writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
        console.log(`WASM asset version metadata written: ${metadataPath}`);
    } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EACCES') {
            console.warn(`Warning: Could not write WASM metadata to ${metadataPath} (${e.code})`);
        } else {
            throw e;
        }
    }
    console.log(`WASM asset version: ${wasmAssetVersion}`);
    return metadata;
}

/**
 * Find WASM output files in build directory
 */
function findWasmFiles() {
    const results = {};

    // Search for .js and .wasm files
    function search(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    search(fullPath);
                } else if (entry.isFile()) {
                    if (entry.name === 'ultrahdr_wasm.js') {
                        results.js = fullPath;
                    } else if (entry.name === 'ultrahdr_wasm.wasm') {
                        results.wasm = fullPath;
                    }
                }
            }
        } catch (e) {
            // Ignore errors
        }
    }

    search(buildDir);
    return results;
}

/**
 * Copy WASM output files to public assets
 */
function copyAssets() {
    console.log('\n=== Copying WASM assets ===');

    const wasmFiles = findWasmFiles();

    if (!wasmFiles.js && !wasmFiles.wasm) {
        console.error('ERROR: No WASM files found in build directory');
        console.error('Searching in:', buildDir);
        process.exit(1);
    }

    let copied = 0;

    if (wasmFiles.js) {
        const jsDest = path.join(outputDir, 'ultrahdr_wasm.js');
        fs.copyFileSync(wasmFiles.js, jsDest);
        console.log(`Copied: ultrahdr_wasm.js`);
        copied++;
    }

    if (wasmFiles.wasm) {
        const wasmDest = path.join(outputDir, 'ultrahdr_wasm.wasm');
        fs.copyFileSync(wasmFiles.wasm, wasmDest);
        console.log(`Copied: ultrahdr_wasm.wasm`);
        copied++;
    }

    if (copied === 0) {
        console.error('ERROR: No WASM files were copied');
        process.exit(1);
    }

    console.log(`Copied ${copied} file(s) to ${outputDir}`);
}

/**
 * Verify the output files
 */
function verifyOutput() {
    console.log('\n=== Verifying output ===');

    for (const file of REQUIRED_WASM_FILES) {
        const filePath = path.join(outputDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`${file}: ${stats.size} bytes`);
        } else {
            console.error(`ERROR: Required file not found: ${filePath}`);
            process.exit(1);
        }
    }

    console.log('Verification complete');
}

/**
 * Main execution
 */
function main() {
    try {
        const strictBuildMode = isStrictBuildMode();
        console.log(`Strict WASM build mode: ${strictBuildMode ? 'enabled' : 'disabled'}`);

        checkEmsdk();
        try {
            buildWasm();
            copyAssets();
        } catch (buildError) {
            const failureStrategy = resolveBuildFailureStrategy({
                strictMode: strictBuildMode,
                hasAssets: hasExistingAssets()
            });
            if (failureStrategy === 'throw') {
                throw buildError;
            }
            // Development-only fallback: this path exists primarily because AI/LLM sandbox
            // environments can block Emscripten/CMake rebuilds during local agent-driven development.
            // Do not rely on this path for CI or production releases; CI/production must fail
            // on rebuild errors.
            console.warn('\n=== WASM rebuild failed; using existing public/assets artifacts ===');
            console.warn(buildError.message);
        }

        verifyOutput();
        writeWasmVersionMetadata();

        console.log('\n=== Build complete ===');
        console.log(`WASM files available at: ${outputDir}`);
        console.log(`WASM version metadata available at: ${wasmVersionMetadataPath}`);
        console.log('\nTo use the WASM module, ensure your dev server serves files from public/assets');
        console.log('Run: npm run dev');
    } catch (e) {
        console.error('\nERROR:', e.message);
        process.exit(1);
    }
}

const isDirectExecution = process.argv[1]
    && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
    main();
}
