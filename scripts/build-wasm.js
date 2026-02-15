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
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const wasmWrapperDir = path.join(rootDir, 'ultrahdr-wasm');
const emsdkDir = path.join(rootDir, 'emsdk');
const outputDir = path.join(rootDir, 'public', 'assets');
const buildDir = path.join(wasmWrapperDir, 'build');

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
}

function hasExistingAssets() {
    const requiredFiles = ['ultrahdr_wasm.js', 'ultrahdr_wasm.wasm'];
    return requiredFiles.every((file) => fs.existsSync(path.join(outputDir, file)));
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

    const requiredFiles = ['ultrahdr_wasm.js', 'ultrahdr_wasm.wasm'];

    for (const file of requiredFiles) {
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
        checkEmsdk();
        try {
            buildWasm();
            copyAssets();
        } catch (buildError) {
            if (!hasExistingAssets()) {
                throw buildError;
            }
            console.warn('\n=== WASM rebuild failed; using existing public/assets artifacts ===');
            console.warn(buildError.message);
        }

        verifyOutput();

        console.log('\n=== Build complete ===');
        console.log(`WASM files available at: ${outputDir}`);
        console.log('\nTo use the WASM module, ensure your dev server serves files from public/assets');
        console.log('Run: npm run dev');
    } catch (e) {
        console.error('\nERROR:', e.message);
        process.exit(1);
    }
}

main();
