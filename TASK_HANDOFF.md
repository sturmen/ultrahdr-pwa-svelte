# Task Handoff: Preserve Gain Map During Rotation

## Objective

When an input JPEG already has an UltraHDR gain map and `discardGainMap` is false, preserve the original gain map even when rotation is applied — by extracting it, rotating it alongside the SDR, and re-encoding with the original metadata.

## Project Overview

- **Project**: UltraHDR PWA (Svelte frontend, WASM-based image processing)
- **Build**: `npm run build:wasm` then `npm run build`
- **Test**: `npx playwright test --project=chromium`
- **Key tech**: libultrahdr (C++ via Emscripten WASM), Svelte, Playwright E2E tests

## Current Status: Implementation Complete, Verification Blocked

All code changes are written and committed to the working tree. The WASM module has been rebuilt. The E2E test exists but fails due to **Playwright temp directory permission issues** on the current machine — NOT due to code bugs.

### TDD Status
- **Red phase**: ✅ Failing test written and confirmed failing before implementation
- **Green phase**: ⏳ Code implemented, needs verification on a machine without permission issues

---

## What Was Changed (4 files + 1 test)

### 1. `ultrahdr-wasm/ultrahdr_wasm.cpp` — 3 new decoder functions

Added at the end of `extern "C"` block (before the closing brace):

```cpp
wasm_dec_get_gainmap_image(dec, out_size)   // Returns pointer to compressed gain map JPEG bytes
wasm_dec_get_base_image(dec, out_size)       // Returns pointer to compressed base SDR JPEG bytes  
wasm_dec_get_gainmap_dimensions(dec, w, h)   // Returns gain map width and height
```

These wrap existing libultrahdr API functions: `uhdr_dec_get_gainmap_image()`, `uhdr_dec_get_base_image()`, `uhdr_dec_get_gainmap_width/height()`.

### 2. `ultrahdr-wasm/CMakeLists.txt` — Updated EXPORTED_FUNCTIONS

Added to the `-sEXPORTED_FUNCTIONS` list:
- `_wasm_dec_get_gainmap_image`
- `_wasm_dec_get_base_image`
- `_wasm_dec_get_gainmap_dimensions`
- `_wasm_enc_set_compressed_base_image` (was missing, already used by JS)

### 3. `src/lib/ultrahdr-wasm.js` — JS wrapper methods

**UHDRDecoder class** — 3 new methods:
- `getGainMapImage()` → `Uint8Array` of compressed gain map JPEG
- `getBaseImage()` → `Uint8Array` of compressed base SDR JPEG
- `getGainMapDimensions()` → `{ width, height }`

**UHDREncoder class** — 1 new method:
- `setCompressedGainMapImage(data, metadata)` — feeds compressed JPEG gain map bytes + metadata to the encoder. This mirrors `setCompressedBaseImage()` and avoids the pixel-oriented `_allocateImageData()` which would corrupt compressed data via stride alignment.

### 4. `src/lib/processing.js` — Processing pipeline

**Import change**: Added `UHDRDecoder` to the import from `ultrahdr-wasm.js`.

**Modified `processImage()`**: The UltraHDR detection block (section 1b) now handles both cases:
- `rotation === 0`: Preserves original file as-is (existing behavior)
- `rotation !== 0`: Calls new `processUhdrWithRotation()` function

**New function `processUhdrWithRotation(file, fileBuffer, options)`**:
1. Creates `UHDRDecoder`, calls `setImage()` + `probe()`
2. Extracts gain map JPEG via `getGainMapImage()`
3. Extracts gain map metadata via `getGainMapMetadata()`
4. Loads & rotates SDR via existing `loadImageData(dataUrl, rotation)`
5. Decodes gain map JPEG to `ImageData` via `decodeJpegToImageData()`
6. Rotates gain map via `rotateImageData()`
7. Compresses both to JPEG via `compressToJpeg()`
8. Re-encodes using `setCompressedBaseImage()` + `setCompressedGainMapImage()` with original metadata
9. Finalizes with EXIF handling

**New helper `decodeJpegToImageData(jpegBytes)`**: Decodes JPEG bytes to `ImageData` via off-screen canvas + `URL.createObjectURL`.

**New helper `rotateImageData(imageData, rotation)`**: Rotates `ImageData` by 90/180/270° using canvas transforms.

### 5. `tests/e2e/ultrahdr.spec.js` — E2E test

Added test: **"should preserve existing gain map when rotation is applied"** (in the Gain Map Handling `describe` block):
1. Uploads `GAIN_MAP_JPEG` (test_hdr_jpeg_gainmap.jpg)
2. Waits for processing (preserves original, no rotation)
3. Downloads unrotated result
4. Clicks "Rotate Right" button (`button[title="Rotate Right"]`)
5. Waits for re-processing via `waitForReprocessing()`
6. Downloads rotated result
7. Asserts both are valid JPEGs (0xFF start byte)
8. Asserts rotated result has UltraHDR XMP metadata (`hasGainMapXMP`)
9. Asserts results differ byte-by-byte

Test has `test.setTimeout(120_000)` for the re-processing time.

---

## Key Architecture Details

### libultrahdr Encoding Mode Used

From `ultrahdr_api.h` lines 548-552, the encoding mode for pre-compressed base + gain map:
```
uhdr_enc_set_compressed_image(ctxt, img, UHDR_BASE_IMG)
uhdr_enc_set_gainmap_image(ctxt, img, metadata)
```
Both take `uhdr_compressed_image_t*` (compressed JPEG data, not raw pixels).

### How `setCompressedGainMapImage` Works

The C++ `wasm_enc_set_gainmap()` wraps data in `uhdr_compressed_image_t` with `capacity = stride * height`. For compressed data, we pass `width=byteCount, height=1, stride=byteCount` so `capacity = byteCount * 1 = byteCount` (exact JPEG size).

### `uhdr_mem_block_t` Struct (returned by decoder)
```cpp
typedef struct uhdr_mem_block {
    void* data;       // Pointer to data
    size_t data_sz;   // Size of data buffer
    size_t capacity;  // Max capacity
} uhdr_mem_block_t;
```

---

## Verification Steps

Once on a working machine:

```bash
# 1. Rebuild WASM (if not already)
npm run build:wasm

# 2. Build the app
npm run build

# 3. Run the specific test
npx playwright test --project=chromium --reporter=list -g "preserve existing gain map when rotation"

# 4. If it passes, run the full suite
npx playwright test --project=chromium --reporter=list
```

### Expected Test Behavior
- The test should **pass** — the rotated output should have `hasGainMapXMP` returning `true`
- Before implementation, the test **failed** at `expect(hasGainMapXMP(rotatedResult)).toBe(true)` because rotation caused the gain map to be regenerated (losing UltraHDR metadata)

### If the Test Fails

**Timeout / page crash**: Check browser console for WASM errors. The most likely issues:
1. New decoder C++ functions not compiled — verify `npm run build:wasm` succeeded
2. Memory allocation issue in WASM — check if `getGainMapImage()` returns valid data
3. Encoder crash when re-encoding — check if `setCompressedGainMapImage()` correctly passes data

**`hasGainMapXMP` returns false**: The re-encoding pipeline produces a JPEG but without proper gain map XMP. Check that `uhdr_enc_set_gainmap_image()` is being called correctly with the metadata.

```

---

## Files Reference

| File | Purpose |
|------|---------|
| `ultrahdr-wasm/ultrahdr_wasm.cpp` | C++ WASM wrapper for libultrahdr |
| `ultrahdr-wasm/CMakeLists.txt` | WASM build config & exported functions |
| `src/lib/ultrahdr-wasm.js` | JS wrapper for WASM encoder/decoder |
| `src/lib/processing.js` | Main image processing pipeline |
| `tests/e2e/ultrahdr.spec.js` | Playwright E2E tests |
| `libultrahdr/ultrahdr_api.h` | libultrahdr public API (reference only) |
| `tests/fixtures/test_hdr_jpeg_gainmap.jpg` | Test image (UltraHDR JPEG with gain map) |

---

## What NOT to Change

- The existing `setGainMapImage()` in the encoder — it handles raw pixel data and is used by the normal (non-preservation) encoding path
- The existing rotation=0 preservation path — it works correctly
- The `hasGainMapXMP()` test helper — it correctly searches for UltraHDR XMP markers
- The `waitForReprocessing()` helper — it handles the async result-clearing + re-processing flow
