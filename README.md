# ultrahdr-pwa-svelte

A vibe coded PWA for creating HDR Gain Map JPEG images.

## Instructions

Access the live version here to process your photos: [MakeBetterJPEGs.com](https://makebetterjpegs.com/)

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

## Processing Pipelines

```mermaid
flowchart TB
    subgraph S["Startup and runtime readiness"]
        direction TB
        S0["App boot"] --> S1["processingRuntime.initialize"]
        S1 --> S2["ensureBundleReady: validate, prepare, or repair versioned runtime bundle"]
        S2 --> S3{"Bundle ready?"}
        S3 -->|"no / blocked"| S4["Block startup with diagnostics"]
        S3 -->|"yes"| S5{"Initialization path"}
        S5 -->|"worker"| S6["Spawn processing-worker: ONNX + WASM assets"]
        S5 -->|"main-thread (offline iPhone compat or worker unavailable)"| S7["Main-thread WASM compatibility runtime"]
        S6 --> S8{"Worker init OK?"}
        S8 -->|"no, offline + fallback allowed"| S7
        S8 -->|"no, hard failure"| S4
        S8 -->|"yes"| S9["GMNet provider chain: WebGPU → WebGL → WASM"]
        S7 --> S10["GMNet provider chain: WASM only"]
        S9 --> S11["Provider verify + smoke-run inference"]
        S10 --> S11
        S11 --> S12["JPEGli bootstrap"]
        S12 --> S13{"Startup success?"}
        S13 -->|"no"| S4
        S13 -->|"yes"| S14["Post-update warmup: JPEGli + libultrahdr"]
        S14 --> S15["Lazy-load ImageProcessor UI"]
    end

    subgraph Q["Queue, storage, and duplicate guards"]
        direction TB
        Q0["Files from picker, drop, share target, or under-test automation"] --> Q1["Intake classification and mobile memory gate"]
        Q1 --> Q2["Persist input artifacts, previews, and queue snapshot"]
        Q2 --> Q3["workflow-state claims next queued item"]
        Q3 --> Q4{"Tab lock and queue launch lease acquired?"}
        Q4 -->|"no"| Q5["Suppress or requeue duplicate launch"]
        Q4 -->|"yes"| Q6["runtime.process with queue-scoped request key"]
        Q6 --> Q7{"Same queue request already active?"}
        Q7 -->|"yes"| Q8["Join existing process promise"]
        Q7 -->|"no"| Q9{"Runtime execution path"}
        Q9 -->|"worker"| Q10["processing-worker runs processing-core"]
        Q10 -->|"compat error before pipeline-start"| Q11["Main-thread fallback runs processing-core"]
        Q10 -->|"pipeline-start reached, then error"| Q12["Surface worker error without second full attempt"]
        Q9 -->|"main thread"| Q11
        Q8 --> Q13["Persist output, preview, and queue state"]
        Q12 --> Q13
    end

    subgraph P["processing-core routes"]
        direction TB
        P0["processImage: telemetry, libultrahdr load, source EXIF, orientation"] --> P1{"Preprocess by input type"}
        P1 -->|"HIF (.hif)"| P2["Decode PQ/HLG HDR-intent via processHeifHdr"]
        P1 -->|"HEIC/HEIF with native gain map (discardGainMap=false)"| P3["Decode SDR + preserved gain map + source metadata"]
        P1 -->|"HEIC/HEIF without gain map or discardGainMap=true"| P4["Decode SDR raster"]
        P1 -->|"HEIC/HEIF with HDR nclx (primaries=9, transfer=16/18)"| P2
        P1 -->|"TIFF"| P5["Decode TIFF to raster via processTiff"]
        P1 -->|"JPEG"| P6{"JPEG classification"}
        P1 -->|"PNG, WebP, or other browser raster"| P7["Use source file or browser-safe SDR decode"]
        P6 -->|"UltraHDR gain map, preserve"| P8{"No rotation, no auto-orientation, within max edge?"}
        P6 -->|"UltraHDR gain map, discard"| P9["Extract base JPEG bytes for generated path"]
        P6 -->|"CICP primaries=9 + transfer=16/18 (Rec.2020 PQ/HLG)"| P10["JPEG HDR-intent: jpegli decode → resize cap → rgba1010102 pack"]
        P6 -->|"standard SDR JPEG"| P11["Retain original bytes for lossless SDR preservation"]
        P8 -->|"yes"| P12["Extract compressed base + gain map, rebuild ISO UltraHDR"]
        P8 -->|"no"| P13["Rotate/resize preserved components; try lossless bitstream first"]
        P4 --> P14["Decode, constrain, and rotate SDR pixels"]
        P5 --> P14
        P7 --> P14
        P9 --> P14
        P11 --> P14
        P3 --> P15["Encode SDR + preserved gain map with preserved metadata"]
        P2 --> P16["HDR-intent peak normalization (slider-driven targetPeakLinear)"]
        P10 --> P16
        P16 --> P17["libultrahdr API-0 HDR-intent encode"]
        P14 --> P18["GMNet tiled gain-map inference with checkpointing"]
        P18 --> P19{"Gain map valid?"}
        P19 -->|"WebGPU/WebGL error, parity failure, or near-flat"| P20["Retry fallback providers: WebGL → WASM"]
        P20 --> P19
        P19 -->|"yes"| P21{"Generated SDR base strategy"}
        P21 -->|"eligible source JPEG"| P22["Bypass SDR re-encode"]
        P21 -->|"eligible 90/180/270 rotation"| P23["Lossless-rotate SDR JPEG"]
        P21 -->|"otherwise"| P24["JPEGli re-encode SDR"]
        P22 --> P25["JPEGli encode gain map → setCompressedBaseImage → setCompressedGainMapImage → encode"]
        P23 --> P25
        P24 --> P25
        P25 --> P26["Peak-memory release: SDR pixels, GMNet gain map, compressed payloads"]
        P12 --> P27["Final UltraHDR JPEG Blob"]
        P13 --> P27
        P15 --> P27
        P17 --> P27
        P26 --> P27
    end

    subgraph X["Cross-cutting contracts"]
        direction TB
        X1["Runtime assets load through shared descriptors and cache/fetch helpers"]
        X2["Typed diagnostics breadcrumbs cover startup, queue, worker, pipeline, assets, memory release, and failures"]
        X3["Peak-memory release zeros/detaches JS-side buffers after wasm heap copy (hdr-intent, SDR, gain-map, compressed payloads)"]
    end

    S15 --> Q0
    Q10 --> P0
    Q11 --> P0
    P27 --> Q13
    Q13 --> Q3
    S2 -.-> X1
    S6 -.-> X1
    P0 -.-> X2
    Q3 -.-> X2
    P17 -.-> X2
    P25 -.-> X2
    P26 -.-> X3
```

The runtime path is part of processing: startup validates or repairs the offline runtime bundle before the converter UI loads, then chooses worker or main-thread execution. Worker init runs a GMNet provider chain (WebGPU → WebGL → WASM) with provider verification and a smoke-run inference test; main-thread compatibility mode uses WASM only. Queue execution is single-claim per item, guarded by a tab lock, queue launch lease, and queue-scoped process-request dedupe.

`discardGainMap` is the main option that changes the top-level route: preserved gain maps stay on the preserved path when possible, while discarded or missing gain maps route through GMNet generation. `quality`, `stripExif`, and `maxContentBoost` primarily affect encoding and metadata, not whether the item is `generated`, `preserved`, or `hdr-intent`. HDR-intent inputs (`.hif` files, HEIC with Rec.2020 PQ/HLG metadata, JPEG with CICP primaries=9 + transfer=16/18) bypass GMNet entirely and encode directly via libultrahdr's API-0 path. Peak-memory release hooks zero or detach JS-side buffers after each wasm heap copy to reduce MobileSafari OOM pressure. Every successful branch ends in an UltraHDR JPEG output and emits structured diagnostics breadcrumbs for offline debugging.

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
- Convert HDR PQ input (.HIF format from Canon cameras) to UltraHDR JPEG with tone mapping to SDR.

## Special thanks

- Google for [libultrahdr](https://github.com/google/libultrahdr)
- GMNet authors: Yinuo Liao and Yuanshen Guan and Ruikang Xu and Jiacheng Li and Shida Sun and Zhiwei Xiong!
- @gregbenz for all his work [evangelizing HDR photography](https://gregbenzphotography.com/hdr/)
- OpenAI, Anthropic, and Google for the AI models that actually wrote this entire repo.
