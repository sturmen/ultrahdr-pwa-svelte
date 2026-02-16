# ultrahdr-pwa-svelte

A vibe coded PWA for creating HDR Gain Map JPEG images. Should work on most (all?) desktop web browers.

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

## Reverse Tonemapping Algorithm (V2)

The default gain-map generator is now a deterministic reverse-tonemapping pipeline designed for conservative HDR output:

1. Decode SDR pixels to linear light and compute BT.709 luminance.
2. Build two edge-aware local-adaptation maps (small + large guided filter radii) and blend them based on local contrast.
3. Invert an ACES-inspired tone curve as a *prior* to estimate scene-linear highlight expansion potential.
   - Note: the tone curve is a forward HDR→SDR model; we use its inverse only as a starting estimate, not as ground truth.
4. Apply clip-aware highlight emphasis:
   - prioritize likely clipped highlights (`max(rgb_linear) >= ~0.98`) and plateau-like regions.
5. Apply conservative APL guardrails:
   - compute scene median and 75th-percentile luminance,
   - cap median lift (default conservative mode),
   - reallocate boost budget toward upper luminance percentiles.
6. Apply continuous low-luma regularization:
   - no hard shadow cutoff in V2,
   - use smooth weighting (`smoothstep(0.03, 0.12, L)`) so deep shadows remain near-neutral without abrupt transitions.
7. Encode gain in log2 space using Adobe/UltraHDR-compatible metadata.
8. Generate gain maps at half width / half height by default (quarter pixel count) to reduce processing cost and output size.
   - This matches the resolution pattern observed in Apple HEIC gain-map fixtures in this repo (for example, `5712x4284 -> 2856x2142`).
   - Existing input gain-map preservation paths are unchanged.

### Brightness intents

- `conservative` (default): restrains midtones and keeps highlight-first pop.
- `balanced`: moderate midtone lift.
- `vibrant`: strongest midtone lift among deterministic profiles.

### Compatibility and deprecation

- Current release (`N`): `shadowCutoff` is accepted for compatibility but ignored in `v2`; a one-time warning is emitted with key `processing.shadowCutoff.deprecated`.
- Next release (`N+1`): `shadowCutoff` compatibility shim is removed.

### References and inspirations

- Android Ultra HDR / gain-map container behavior:
  - [Android: HDR image format (Ultra HDR)](https://developer.android.com/media/platform/hdr-image-format)
- Gain-map metadata math and interoperability:
  - [Adobe Gain Map Specification 1.0d15 (PDF)](https://helpx.adobe.com/content/dam/help/en/camera-raw/using/gain-map/jcr:content/root/content/flex/items/position/position-par/download_section/download-1/Gain_Map_1_0d15.pdf)
- SDR-to-HDR conversion guidance:
  - [ITU-R BT.2446-1 (PDF)](https://www.itu.int/dms_pub/itu-r/opb/rep/R-REP-BT.2446-1-2021-PDF-E.pdf)
- Local adaptation filter:
  - [Guided Image Filtering (He, Sun, Tang, ECCV 2010)](https://people.csail.mit.edu/kaiming/publications/eccv10guidedfilter.pdf)
- ACES-inspired tone curve references:
  - [Narkowicz ACES Filmic Tone Mapping Curve](https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/)
  - [Stephen Hill ACES fit (BakingLab/ACES.hlsl)](https://github.com/TheRealMJP/BakingLab/blob/master/BakingLab/ACES.hlsl)
- HDR reconstruction research inspirations (deterministic implementation, not model inference):
  - [ExpandNet: A Deep Convolutional Neural Network for High Dynamic Range Expansion from Low Dynamic Range Content](https://arxiv.org/abs/1803.02266)
  - [Deep Reverse Tone Mapping (CVPR 2020)](https://openaccess.thecvf.com/content_CVPR_2020/papers/Singh_Deep_Reverse_Tone_Mapping_CVPR_2020_paper.pdf)
  - [Revisiting the Stack-Based Inverse Tone Mapping (CVPR 2023)](https://openaccess.thecvf.com/content/CVPR2023/papers/Liu_Revisiting_the_Stack-Based_Inverse_Tone_Mapping_CVPR_2023_paper.pdf)
  - [LEDiff: Single-Image HDR Reconstruction with Latent Exposure Diffusion Prior (CVPR 2025)](https://openaccess.thecvf.com/content/CVPR2025/papers/Jiang_LEDiff_Single-Image_HDR_Reconstruction_with_Latent_Exposure_Diffusion_Prior_CVPR_2025_paper.pdf)
- HDR benchmark/evaluation caveats:
  - [SI-HDR Benchmark](https://www.cl.cam.ac.uk/research/rainbow/projects/sihdr_benchmark/)

## Testing

- Desktop regression: `npm run test:e2e`
- Mobile emulation (iOS + Android): `npm run test:e2e:mobile`

## WASM Build Safety

- Build command: `npm run build:wasm && npm run build`
- The fallback behavior in `scripts/build-wasm.js` (using existing `public/assets` artifacts when rebuild fails) is a **development-only convenience** for AI/LLM sandbox environments where Emscripten/CMake rebuilds may be blocked.
- Do **not** rely on fallback behavior for production or CI releases.
- In CI/production, WASM rebuild failures are treated as fatal and the build must fail (no silent fallback).

## App Cache Versioning

- The app uses an app-wide asset version token (`VITE_APP_ASSET_VERSION`) to namespace runtime caches and prune old cache namespaces during service worker activation.
- Update checks run proactively at app startup, when focus/visibility is regained, every 30 minutes while online, and immediately after reconnecting.
- Update application is idle-safe: a new version is never force-applied mid-queue; users can apply it once processing is idle.
- Offline-first behavior remains the default. Network checks are opportunistic and do not block local processing.

## Features

- Free and open source (MIT license)
- Completely local processing. No cloud costs, or any costs at all
- Cross-platform support across web browsers. Tested with Chrome 144.
- Batch support
- Rotation support
- EXIF preservation
- Configurable HDR headroom
- ISO 21496-1 Metadata Encoding


## How you can help

- Implement per-image adjustments for batch processing
- Implement concurrent task scheduling for image processing

## Special thanks

- @google for [libultrahdr](https://github.com/google/libultrahdr)
- @gregbenz for all his work [evangelizing HDR photography](https://gregbenzphotography.com/hdr/)
