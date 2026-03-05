/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const hasNativeJpegtran = (() => {
  try {
    execFileSync('jpegtran', ['-version'], { stdio: ['ignore', 'pipe', 'pipe'] });
    return true;
  } catch {
    return false;
  }
})();

function parseJpegInfo(jpegBytes) {
  const bytes = jpegBytes instanceof Uint8Array ? jpegBytes : new Uint8Array(jpegBytes);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset + 1 < bytes.length && bytes[offset + 1] === 0xff) {
      offset += 1;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xda || marker === 0xd9) {
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (offset + 3 >= bytes.length) {
      break;
    }

    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    const segmentStart = offset + 4;
    const segmentEnd = offset + 2 + segmentLength;
    if (segmentLength < 2 || segmentEnd > bytes.length) {
      break;
    }

    const isSofMarker =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (!isSofMarker) {
      offset = segmentEnd;
      continue;
    }

    if (segmentStart + 6 >= bytes.length) {
      break;
    }
    const height = (bytes[segmentStart + 1] << 8) | bytes[segmentStart + 2];
    const width = (bytes[segmentStart + 3] << 8) | bytes[segmentStart + 4];
    const numComponents = bytes[segmentStart + 5];
    let cursor = segmentStart + 6;
    let maxHSamp = 1;
    let maxVSamp = 1;
    for (let i = 0; i < numComponents; i += 1) {
      const hv = bytes[cursor + 1];
      const hSamp = (hv >> 4) & 0x0f;
      const vSamp = hv & 0x0f;
      maxHSamp = Math.max(maxHSamp, hSamp);
      maxVSamp = Math.max(maxVSamp, vSamp);
      cursor += 3;
    }
    return {
      width,
      height,
      mcuWidth: maxHSamp * 8,
      mcuHeight: maxVSamp * 8,
    };
  }

  return null;
}

function transformToJpegtranArgs(transform) {
  switch (transform) {
    case '90':
      return ['-rotate', '90'];
    case '180':
      return ['-rotate', '180'];
    case '270':
      return ['-rotate', '270'];
    case 'flipH':
      return ['-flip', 'horizontal'];
    case 'flipV':
      return ['-flip', 'vertical'];
    case 'transpose':
      return ['-transpose'];
    case 'transverse':
      return ['-transverse'];
    default:
      throw new Error(`Unsupported transform for native jpegtran call: ${transform}`);
  }
}

function executeNativeJpegtran(inputBytes, transform, options = {}) {
  const args = ['-copy', 'all', ...transformToJpegtranArgs(transform)];
  if (options.trim) {
    args.push('-trim');
  }
  if (options.perfect) {
    args.push('-perfect');
  }

  try {
    const stdout = execFileSync('jpegtran', args, {
      input: Buffer.from(inputBytes),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      ok: true,
      output: new Uint8Array(stdout),
      stderr: '',
    };
  } catch (error) {
    return {
      ok: false,
      output: null,
      stderr: String(error?.stderr || '').trim(),
    };
  }
}

function canonicalizeWithoutMarkers(jpegBytes) {
  const stdout = execFileSync('jpegtran', ['-copy', 'none'], {
    input: Buffer.from(jpegBytes),
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return new Uint8Array(stdout);
}

function imperfectMaskForTransform(transform, info) {
  const hasPartialRight = (info.width % info.mcuWidth) !== 0;
  const hasPartialBottom = (info.height % info.mcuHeight) !== 0;
  switch (transform) {
    case 'flipH':
      return hasPartialRight ? 1 : 0;
    case 'flipV':
      return hasPartialBottom ? 2 : 0;
    case 'transpose':
      return 0;
    case 'transverse':
    case '180':
      return (hasPartialRight ? 1 : 0) | (hasPartialBottom ? 2 : 0);
    case '90':
      return hasPartialBottom ? 2 : 0;
    case '270':
      return hasPartialRight ? 1 : 0;
    default:
      return 0;
  }
}

function createNativeBackedWasmMock() {
  const memory = new ArrayBuffer(64 * 1024 * 1024);
  const HEAPU8 = new Uint8Array(memory);
  let allocPtr = 4096;
  let nextStateId = 1;
  const states = new Map();

  function malloc(size) {
    const ptr = allocPtr;
    allocPtr += size + 16;
    return ptr;
  }

  function writeCString(text) {
    const encoded = Buffer.from(text, 'utf8');
    const ptr = malloc(encoded.length + 1);
    HEAPU8.set(encoded, ptr);
    HEAPU8[ptr + encoded.length] = 0;
    return ptr;
  }

  return {
    HEAPU8,
    _malloc: vi.fn((size) => malloc(size)),
    _free: vi.fn(() => {}),
    UTF8ToString: vi.fn((ptr) => {
      let cursor = ptr;
      const chars = [];
      while (HEAPU8[cursor] !== 0) {
        chars.push(HEAPU8[cursor]);
        cursor += 1;
      }
      return Buffer.from(chars).toString('utf8');
    }),
    _jpegtran_wasm_create: vi.fn(() => {
      const stateId = nextStateId;
      nextStateId += 1;
      states.set(stateId, {
        outputPtr: 0,
        outputSize: 0,
        errorCode: 0,
        errorMessage: '',
        errorImageWidth: 0,
        errorImageHeight: 0,
        errorMcuWidth: 0,
        errorMcuHeight: 0,
        errorImperfectMask: 0,
      });
      return stateId;
    }),
    _jpegtran_wasm_destroy: vi.fn((stateId) => {
      states.delete(stateId);
    }),
    _jpegtran_wasm_transform: vi.fn((stateId, inputPtr, inputSize, transformCode, trim, perfect) => {
      const state = states.get(stateId);
      if (!state) {
        return 1;
      }

      state.errorCode = 0;
      state.errorMessage = '';
      state.errorImageWidth = 0;
      state.errorImageHeight = 0;
      state.errorMcuWidth = 0;
      state.errorMcuHeight = 0;
      state.errorImperfectMask = 0;
      state.outputPtr = 0;
      state.outputSize = 0;

      const transformByCode = {
        1: 'flipH',
        2: 'flipV',
        3: 'transpose',
        4: 'transverse',
        5: '90',
        6: '180',
        7: '270',
      };
      const transform = transformByCode[transformCode];
      if (!transform) {
        state.errorCode = 1;
        state.errorMessage = 'unsupported transform code';
        return 1;
      }

      const inputBytes = HEAPU8.slice(inputPtr, inputPtr + inputSize);
      const nativeResult = executeNativeJpegtran(inputBytes, transform, {
        trim: trim === 1,
        perfect: perfect === 1,
      });
      if (!nativeResult.ok) {
        const info = parseJpegInfo(inputBytes);
        state.errorCode = nativeResult.stderr.includes('not perfect') ? 2 : 1;
        state.errorMessage = nativeResult.stderr || 'native jpegtran failed';
        if (info) {
          state.errorImageWidth = info.width;
          state.errorImageHeight = info.height;
          state.errorMcuWidth = info.mcuWidth;
          state.errorMcuHeight = info.mcuHeight;
          state.errorImperfectMask = imperfectMaskForTransform(transform, info);
        }
        return 1;
      }

      state.outputPtr = malloc(nativeResult.output.length);
      state.outputSize = nativeResult.output.length;
      HEAPU8.set(nativeResult.output, state.outputPtr);
      return 0;
    }),
    _jpegtran_wasm_get_output_data: vi.fn((stateId) => states.get(stateId)?.outputPtr || 0),
    _jpegtran_wasm_get_output_size: vi.fn((stateId) => states.get(stateId)?.outputSize || 0),
    _jpegtran_wasm_get_last_error_code: vi.fn((stateId) => states.get(stateId)?.errorCode || 0),
    _jpegtran_wasm_get_last_error_message: vi.fn((stateId) => {
      const message = states.get(stateId)?.errorMessage || '';
      return writeCString(message);
    }),
    _jpegtran_wasm_get_error_image_width: vi.fn((stateId) => states.get(stateId)?.errorImageWidth || 0),
    _jpegtran_wasm_get_error_image_height: vi.fn((stateId) => states.get(stateId)?.errorImageHeight || 0),
    _jpegtran_wasm_get_error_mcu_width: vi.fn((stateId) => states.get(stateId)?.errorMcuWidth || 0),
    _jpegtran_wasm_get_error_mcu_height: vi.fn((stateId) => states.get(stateId)?.errorMcuHeight || 0),
    _jpegtran_wasm_get_error_imperfect_mask: vi.fn((stateId) => states.get(stateId)?.errorImperfectMask || 0),
    _jpegtran_wasm_dct_digest: vi.fn(() => 0),
  };
}

(hasNativeJpegtran ? describe : describe.skip)('jpegtran-rotate fixtures', () => {
  const fixtureSpecs = [
    {
      name: '4:4:4 odd',
      filePath: path.resolve(process.cwd(), 'jpegli/testdata/jxl/jpeg_reconstruction/sideways_bench.jpg'),
      imperfectTransform: '90',
      inverseTransform: '270',
    },
    {
      name: '4:2:2 odd',
      filePath: path.resolve(process.cwd(), 'jpegli/testdata/jxl/flower/flower.png.im_q85_422.jpg'),
      imperfectTransform: '270',
      inverseTransform: '90',
    },
    {
      name: '4:2:0 odd',
      filePath: path.resolve(process.cwd(), 'jpegli/third_party/libjpeg-turbo/testimages/testorig.jpg'),
      imperfectTransform: '90',
      inverseTransform: '270',
    },
  ];

  beforeEach(() => {
    vi.resetModules();
    global.window = global.window || {};
    global.window.createJpegtranWasm = vi.fn(async () => createNativeBackedWasmMock());
  });

  it.each(fixtureSpecs)('matches native jpegtran defaults for $name', async ({ filePath, imperfectTransform }) => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const inputBytes = new Uint8Array(fs.readFileSync(filePath));
    const expected = executeNativeJpegtran(inputBytes, imperfectTransform, { trim: false, perfect: false });

    const output = await rotateJpeg(inputBytes, imperfectTransform);

    expect(expected.ok).toBe(true);
    expect(Array.from(output)).toEqual(Array.from(expected.output));
    const outputInfo = parseJpegInfo(output);
    const expectedInfo = parseJpegInfo(expected.output);
    expect(outputInfo).toEqual(expectedInfo);
  });

  it.each(fixtureSpecs)('fails with typed imperfect error for $name when perfect=true', async ({ filePath, imperfectTransform }) => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const inputBytes = new Uint8Array(fs.readFileSync(filePath));

    await expect(
      rotateJpeg(inputBytes, imperfectTransform, { perfect: true })
    ).rejects.toMatchObject({
      name: 'JpegTransformError',
      code: 'JPEG_TRANSFORM_IMPERFECT',
    });
  });

  it.each(fixtureSpecs)('matches native trim behavior for $name', async ({ filePath, imperfectTransform }) => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const inputBytes = new Uint8Array(fs.readFileSync(filePath));
    const expected = executeNativeJpegtran(inputBytes, imperfectTransform, { trim: true, perfect: false });

    const output = await rotateJpeg(inputBytes, imperfectTransform, { trim: true });

    expect(expected.ok).toBe(true);
    expect(Array.from(output)).toEqual(Array.from(expected.output));
    expect(parseJpegInfo(output)).toEqual(parseJpegInfo(expected.output));
  });

  it.each(fixtureSpecs)('preserves lossless coefficient content across inverse transforms for $name', async ({ filePath, imperfectTransform, inverseTransform }) => {
    const { rotateJpeg } = await import('../jpegtran-rotate.js');
    const inputBytes = new Uint8Array(fs.readFileSync(filePath));

    const transformed = await rotateJpeg(inputBytes, imperfectTransform);
    const roundTripped = await rotateJpeg(transformed, inverseTransform);

    const canonicalOriginal = canonicalizeWithoutMarkers(inputBytes);
    const canonicalRoundTripped = canonicalizeWithoutMarkers(roundTripped);
    expect(Array.from(canonicalRoundTripped)).toEqual(Array.from(canonicalOriginal));
  });
});
