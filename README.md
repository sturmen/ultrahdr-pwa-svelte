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
        S1 --> S2{"Runtime bundle ready?"}
        S2 -->|"online"| S3["Validate, prepare, or repair versioned runtime bundle"]
        S2 -->|"offline with ready record"| S4["Service-worker validation or cached-ready fallback"]
        S2 -->|"offline without ready record"| S5["Block startup with diagnostics"]
        S3 --> S6{"Worker runtime available?"}
        S4 --> S6
        S6 -->|"yes"| S7["Worker runtime with ONNX + WASM assets"]
        S6 -->|"offline iPhone, unsupported worker, or allowed fallback"| S8["Main-thread WASM compatibility runtime"]
        S7 --> S9["Post-update warmup: JPEGli + libultrahdr"]
        S8 --> S9
        S9 --> S10["Lazy-load ImageProcessor UI"]
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
        P1 -->|"HIF or raw HDR HEIF"| P2["Decode PQ/HLG HDR-intent payload"]
        P1 -->|"HEIC/HEIF native gain map and discardGainMap=false"| P3["Decode SDR + preserved gain map + source metadata"]
        P1 -->|"HEIC/HEIF without native gain map, or discardGainMap=true"| P4["Decode SDR raster"]
        P1 -->|"TIFF"| P4
        P1 -->|"JPEG, PNG, WebP, or other browser raster"| P5["Use source file or browser-safe SDR decode"]
        P5 --> P6{"JPEG with embedded UltraHDR gain map?"}
        P6 -->|"yes, preserve"| P7{"No rotation, no auto-orientation, within max edge?"}
        P7 -->|"yes"| P8["Extract compressed base + gain map, rebuild ISO UltraHDR"]
        P7 -->|"no"| P9["Rotate or resize preserved components; try lossless bitstream first"]
        P6 -->|"yes, discard"| P10["Extract base JPEG bytes for generated path"]
        P6 -->|"no or non-JPEG"| P11["Decode, constrain, and rotate SDR pixels"]
        P4 --> P11
        P10 --> P11
        P3 --> P12["Encode SDR + preserved gain map with preserved metadata"]
        P2 --> P13["libultrahdr API-0 HDR-intent encode"]
        P11 --> P14["GMNet tiled gain-map inference with checkpointing"]
        P14 --> P15{"Gain map valid?"}
        P15 -->|"WebGPU/WebGL error, parity failure, or near-flat output"| P16["Retry fallback providers: WebGL, then WASM"]
        P16 --> P15
        P15 -->|"yes"| P17{"Generated SDR base strategy"}
        P17 -->|"eligible source JPEG"| P18["Bypass SDR re-encode"]
        P17 -->|"eligible 90/180/270 rotation"| P19["Lossless-rotate SDR JPEG"]
        P17 -->|"otherwise"| P20["JPEGli re-encode SDR"]
        P18 --> P21["JPEGli encode gain map, set compressed payloads, libultrahdr compose"]
        P19 --> P21
        P20 --> P21
        P8 --> P22["Final UltraHDR JPEG Blob"]
        P9 --> P22
        P12 --> P22
        P13 --> P22
        P21 --> P22
    end

    subgraph X["Cross-cutting contracts"]
        direction TB
        X1["Runtime assets load through shared descriptors and cache/fetch helpers"]
        X2["Typed diagnostics breadcrumbs cover startup, queue, worker, pipeline, assets, memory release, and failures"]
    end

    S10 --> Q0
    Q10 --> P0
    Q11 --> P0
    P22 --> Q13
    Q13 --> Q3
    S3 -.-> X1
    S7 -.-> X1
    P0 -.-> X2
    Q3 -.-> X2
    P13 -.-> X2
    P21 -.-> X2
```

The runtime path is part of processing: startup validates or repairs the offline runtime bundle before the converter UI loads, then chooses worker execution or main-thread WASM compatibility mode. Queue execution is single-claim per item, guarded by a tab lock, queue launch lease, and queue-scoped process-request dedupe.

`discardGainMap` is the main option that changes the top-level route: preserved gain maps stay on the preserved path when possible, while discarded or missing gain maps route through GMNet generation. `quality`, `stripExif`, and `maxContentBoost` primarily affect encoding and metadata, not whether the item is `generated`, `preserved`, or `hdr-intent`. Every successful branch ends in an UltraHDR JPEG output and emits structured diagnostics breadcrumbs for offline debugging.

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
