import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const WASM_DIR = path.join(ROOT_DIR, 'jpegtran-wasm');

export function buildJpegtranWasm() {
    const BUILD_DIR_JPEGTRAN = '/tmp/jpegtran-wasm-build';
    const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'assets');
    console.log('Building jpegtran WASM module...');
    console.log(`Root directory: ${ROOT_DIR}`);
    console.log(`WASM wrapper directory: ${WASM_DIR}`);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    if (fs.existsSync(BUILD_DIR_JPEGTRAN)) {
        try {
            fs.rmSync(BUILD_DIR_JPEGTRAN, { recursive: true, force: true });
        } catch (e) {
            console.warn('Could not remove build dir (locked files).');
        }
    }
    fs.mkdirSync(BUILD_DIR_JPEGTRAN);

    try {
        execSync('emcc --version', { stdio: 'ignore' });
        console.log('emcc found in PATH');
    } catch (_error) {
        console.warn('emcc not found in immediate PATH. The build requires emcc to be available.');
    }

    const emCachePath = path.join(ROOT_DIR, '.emscripten-cache');
    if (!fs.existsSync(emCachePath)) {
        fs.mkdirSync(emCachePath, { recursive: true });
    }
    const cacheOptPath = path.join(emCachePath, 'opt');
    try {
        if (!fs.existsSync(cacheOptPath)) {
            fs.symlinkSync('/opt', cacheOptPath);
        }
    } catch (symlinkError) {
        console.warn(`Could not create cache symlink ${cacheOptPath} -> /opt:`, symlinkError);
    }

    const execOptions = {
        cwd: BUILD_DIR_JPEGTRAN,
        stdio: 'inherit',
        env: {
            ...process.env,
            EM_CACHE: emCachePath,
            EMCC_SKIP_SANITY_CHECK: '1'
        }
    };
    const retryExecOptions = {
        ...execOptions,
        env: {
            ...process.env,
            EM_CACHE: emCachePath
        }
    };
    try {
        const envPrefix = `EM_CACHE="${emCachePath}" EMCC_SKIP_SANITY_CHECK=1`;
        execSync(
            `${envPrefix} emcmake cmake "${WASM_DIR}" -DCMAKE_POLICY_VERSION_MINIMUM=3.5`,
            execOptions
        );
        execSync(`${envPrefix} emmake make -j4`, execOptions);
    } catch (e) {
        console.warn('Initial jpegtran WASM build failed; attempting one cache repair retry...');
        try {
            const clearCachePrefix = `EM_CACHE="${emCachePath}"`;
            execSync(`${clearCachePrefix} emcc --clear-cache`, retryExecOptions);
            const retryPrefix = `EM_CACHE="${emCachePath}"`;
            console.log('Retrying jpegtran WASM build after clearing emscripten cache...');
            execSync(
                `${retryPrefix} emcmake cmake "${WASM_DIR}" -DCMAKE_POLICY_VERSION_MINIMUM=3.5`,
                retryExecOptions
            );
            execSync(`${retryPrefix} emmake make -j4`, retryExecOptions);
        } catch (retryError) {
            console.error('WASM build failed:', retryError);
            throw retryError;
        }
    }

    try {
        fs.copyFileSync(
            path.join(BUILD_DIR_JPEGTRAN, 'jpegtran_wasm.js'),
            path.join(OUTPUT_DIR, 'jpegtran_wasm.js')
        );
        fs.copyFileSync(
            path.join(BUILD_DIR_JPEGTRAN, 'jpegtran_wasm.wasm'),
            path.join(OUTPUT_DIR, 'jpegtran_wasm.wasm')
        );
        console.log('Successfully copied WASM artifacts to public/assets');
    } catch (e) {
        console.error('Failed to copy build outputs:', e);
        throw e;
    }
}

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1]);
if (isDirectExecution) {
    buildJpegtranWasm();
}
