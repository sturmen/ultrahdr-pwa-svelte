# ultrahdr-pwa-svelte

A vibe coded PWA for creating HDR Gain Map JPEG images.

## Instructions

Access the live version here to process your photos: [https://sturmen.github.io/ultrahdr-pwa-svelte/](https://sturmen.github.io/ultrahdr-pwa-svelte/)

## What is HDR?

| HDR | SDR |
| --- | --- |
| ![Photo of Manhattan with fireworks, with a brighter set of lights thanks to an HDR Gain Map processing.](/media/gain_map_demo_image.jpg) | ![Photo of Manhattan with fireworks, with a brighter set of lights thanks to an HDR Gain Map processing.](/media/sdr_demo_image.jpg) |

Don't think of the "old" HDR, which is [totally different.](https://gregbenzphotography.com/hdr/#oldVsNewHDR)

More information: https://gregbenzphotography.com/hdr/

## Scope

This is an attempt at a cross-platform way to enhance SDR images into the widely-compatible JPEGR (aka UltraHDR JPEG, aka JPEG with a gain map) format. The goal is that users may have an SDR image that they enjoy, and they use this progressive web app to add an enhancement layer that improves the image but does not alter the original nor introduce compatibility issues.

## GMNet Gain-Map Generation

Gain-map generation is handled by [GMNet](https://github.com/qtlark/GMNet).

## Lossless JPEG Rotation (jpegtran WASM)

JPEG preservation paths now use coefficient-domain transforms (jpegtran semantics) in-browser through a WebAssembly wrapper around `libjpeg-turbo`.

- API: `rotateJpeg(inputBytes, transform, options?)` from `src/lib/jpegtran-rotate.js`
- Supported transforms: `"90" | "180" | "270" | "flipH" | "flipV" | "transpose" | "transverse"`
- Inputs: `Uint8Array | ArrayBuffer`
- Output: `Promise<Uint8Array>`

```js
import { rotateJpeg } from './src/lib/jpegtran-rotate.js';

const rotated = await rotateJpeg(jpegBytes, '90', { perfect: false, trim: false });
```

Option behavior:

| Options | Behavior |
| --- | --- |
| default (`trim=false`, `perfect=false`) | Reversible jpegtran-compatible transform without trimming edge MCUs. |
| `trim=true` | Trims non-transformable edge blocks (jpegtran `-trim`). |
| `perfect=true` | Fails if transform is not MCU-perfect, throws `JpegTransformError` with code `JPEG_TRANSFORM_IMPERFECT`. |
| `trim=true` + `perfect=true` | Invalid combination, throws `JpegTransformError` with code `JPEG_TRANSFORM_INVALID_OPTIONS`. |

Processing scope:

- JPEG preservation paths: use lossless bitstream rotation when eligible.
- Other input formats (HEIC/TIFF/PNG/etc.): continue using the existing canvas-based path.
- If lossless eligibility fails, processing falls back to decode/rotate/re-encode.

### Reproducible WASM Build

Prerequisites:

- `emcc`, `emcmake`, `emmake` available in `PATH` (via Emscripten SDK).
- Repo submodules initialized.

Build steps:

1. `git submodule update --init --recursive`
2. `npm install`
3. `npm run build:wasm`

Generated artifacts (`public/assets/`):

- `ultrahdr_wasm.js`, `ultrahdr_wasm.wasm`
- `jpegli_wasm.js`, `jpegli_wasm.wasm`
- `jpegtran_wasm.js`, `jpegtran_wasm.wasm`

Runtime loading is local (no remote network dependency) and asset versioning is tracked in `.wasm-version.json`.

## Testing

- Desktop regression: `npm run test:e2e`
- Mobile emulation (iOS + Android): `npm run test:e2e:mobile`

## Features

- Free and open source (MIT license)
- Completely local processing. No cloud costs, or any costs at all.
- Cross-platform support across web browsers. Tested with Chrome 144.
- In-browser AI-powered state-of-the-art gain map generation using GMNet through ONNX
- Batch support
- Rotation support
- EXIF preservation
- Configurable HDR headroom
- ISO 21496-1 Metadata Encoding
- Convert HEIC/HEIF (iPhone, Samsung Galaxy) to UltraHDR JPEG using the original gain map
- Convert older UltraHDR JPEGs (Hasselblad X2D II 100C, Sigma BF) to ISO 21496-1 using the camera's gain map embedded in the image

## Special thanks

- Google for [libultrahdr](https://github.com/google/libultrahdr)
- GMNet authors: Yinuo Liao and Yuanshen Guan and Ruikang Xu and Jiacheng Li and Shida Sun and Zhiwei Xiong!
- @gregbenz for all his work [evangelizing HDR photography](https://gregbenzphotography.com/hdr/)
- OpenAI, Anthropic, and Google for the AI models that actually wrote this entire repo.
