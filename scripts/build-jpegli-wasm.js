import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const WASM_DIR = path.join(ROOT_DIR, 'jpegli-wasm');
const EMSDK_DIR = path.join(ROOT_DIR, 'emsdk');

export function buildJpegliWasm() {
    const BUILD_DIR_JPEGLI = '/tmp/jpegli-wasm-build';
    const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'assets');
    console.log('Building jpegli WASM module...');
    console.log(`Root directory: ${ROOT_DIR}`);
    console.log(`WASM wrapper directory: ${WASM_DIR}`);

    // 1. Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 2. Setup build directory
    if (fs.existsSync(BUILD_DIR_JPEGLI)) {
        try {
            fs.rmSync(BUILD_DIR_JPEGLI, { recursive: true, force: true });
        } catch (e) {
            console.warn('Could not remove build dir (locked files).');
        }
    }
    fs.mkdirSync(BUILD_DIR_JPEGLI);

    // 3. Emscripten Check
    try {
        execSync('emcc --version', { stdio: 'ignore' });
        console.log('emcc found in PATH');
    } catch (e) {
        console.warn('emcc not found in immediate PATH. The build requires emcc to be available.');
    }

    // 4. Emcmake and build
    const emCachePath = path.join(ROOT_DIR, '.emscripten-cache');
    if (!fs.existsSync(emCachePath)) {
        fs.mkdirSync(emCachePath, { recursive: true });
    }
    // Homebrew Emscripten currently emits relative system-lib source paths that
    // resolve under EM_CACHE; mirror /opt there so those paths remain valid.
    const cacheOptPath = path.join(emCachePath, 'opt');
    try {
        if (!fs.existsSync(cacheOptPath)) {
            fs.symlinkSync('/opt', cacheOptPath);
        }
    } catch (symlinkError) {
        console.warn(`Could not create cache symlink ${cacheOptPath} -> /opt:`, symlinkError);
    }

    const execOptions = {
        cwd: BUILD_DIR_JPEGLI,
        stdio: 'inherit',
        env: {
            ...process.env,
            EM_CACHE: emCachePath,
            EMCC_SKIP_SANITY_CHECK: '1'
        }
    };
    try {
        const envPrefix = `EM_CACHE="${emCachePath}" EMCC_SKIP_SANITY_CHECK=1`;
        execSync(`${envPrefix} emcmake cmake -Wno-dev "${WASM_DIR}"`, execOptions);
        execSync(`${envPrefix} emmake make -j4`, execOptions);
    } catch (e) {
        console.error('WASM build failed:', e);
        throw e;
    }

    // 5. Copy outputs
    try {
        fs.copyFileSync(
            path.join(BUILD_DIR_JPEGLI, 'jpegli_wasm.js'),
            path.join(OUTPUT_DIR, 'jpegli_wasm.js')
        );
        fs.copyFileSync(
            path.join(BUILD_DIR_JPEGLI, 'jpegli_wasm.wasm'),
            path.join(OUTPUT_DIR, 'jpegli_wasm.wasm')
        );
        console.log('Successfully copied WASM artifacts to public/assets');
    } catch (e) {
        console.error('Failed to copy build outputs:', e);
        throw e;
    }
}

// Allow direct execution
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);
if (isDirectExecution) {
    buildJpegliWasm();
}
