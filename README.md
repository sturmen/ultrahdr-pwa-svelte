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

## Processing Pipelines

```mermaid
flowchart LR
    O_ROT{"rotation != 0?"}
    O_EXIF{"EXIF auto-rotation present?"}
    O_DISCARD{"discardGainMap=false?"}
    O_PRESERVE_ZERO{"rotation=0 and no auto-rotation/resize?"}
    O_PRESERVE_LOSSLESS{"Lossless preserved-component rotation eligible?"}
    O_HEIC_ZERO{"rotation=0?"}
    O_RESIZE{"Resize/constrain needed?"}

    subgraph C1["Input Classification Stage"]
        direction TB
        A["Input file"] --> B{"Effective input class"}
        B --> J1["Standard JPEG without gain map"]
        B --> J2["UltraHDR JPEG with embedded gain map"]
        B --> H1["HEIC/HEIF with native gain map"]
        B --> H2["HEIC/HEIF raw HDR intent without native gain map"]
        B --> H3["HEIC/HEIF without gain map"]
        B --> H4["HIF HDR-intent input"]
        B --> T1["TIFF"]
        B --> O1["Other raster inputs (PNG/WebP/etc.)"]
    end

    subgraph C2["Image Decode Stage"]
        direction TB
        D1["Decode SDR pixels"]
        D2["Convert TIFF to PNG-like SDR decode"]
        D3["Convert HEIC/HEIF SDR image to PNG-like SDR decode"]
        D4["preserved: use decoded SDR + native gain map components"]
        D5["hdr-intent: decode raw HDR intent to linear RGBAF16"]
        D6["hdr-intent: decode HIF HDR intent"]
        D7["Decode preserved components, align/resize, rotate, re-encode"]
        D8["Extract base JPEG and force generated path"]
    end

    subgraph C3["Rotation Normalization Stage"]
        direction TB
        R3["Attempt lossless JPEG rotation"]
        R4["Lossless EXIF normalization"]
        R5["Lossless JPEG SDR bypass"]
        R6["Decode, rotate, re-encode SDR"]
        R9["preserve-with-rotation"]
        R11["Rotate preserved base + gain map JPEGs losslessly, then rebuild"]
        R13["Rotate preserved components before re-encoding"]
    end

    subgraph C4["Gain Map Decision Stage"]
        direction TB
        G1["GMNet generation path"]
        G2["generated path"]
        G4["Constrain SDR image before encoding"]
        G5["Keep decoded dimensions"]
        G6["HDR-intent HEIF API-0 encode path"]
    end

    subgraph C5["Final Encode Stage"]
        direction TB
        F1["Encode SDR base + generated gain map"]
        F2["preserved: rebuild UltraHDR from compressed base + gain map"]
        F3["Rebuild UltraHDR with preserved source metadata"]
        Z["Final UltraHDR JPEG output"]
    end

    J1 --> O_ROT
    O_ROT -->|"no"| O_EXIF
    O_ROT -->|"yes"| R3
    R3 -->|"eligible"| R5
    R3 -->|"fallback"| R6
    O_EXIF -->|"yes"| R4
    O_EXIF -->|"no"| R5
    R4 -->|"success"| R5
    R4 -->|"fallback"| R6
    R5 --> G1
    R6 --> G1

    J2 --> O_DISCARD
    O_DISCARD -->|"no"| D8
    O_DISCARD -->|"yes"| O_PRESERVE_ZERO
    O_PRESERVE_ZERO -->|"yes"| F2
    O_PRESERVE_ZERO -->|"no"| R9
    R9 --> O_PRESERVE_LOSSLESS
    O_PRESERVE_LOSSLESS -->|"yes"| R11
    O_PRESERVE_LOSSLESS -->|"no"| D7

    H1 --> O_DISCARD
    O_DISCARD -->|"yes"| D4
    D4 --> O_HEIC_ZERO
    O_HEIC_ZERO -->|"yes"| F3
    O_HEIC_ZERO -->|"no"| R13

    H2 --> D5
    D5 --> G6

    H3 --> D3
    D3 --> G1

    H4 --> D6
    D6 --> G6

    T1 --> D2
    D2 --> G1

    O1 --> D1
    D1 --> G1

    D8 --> G2
    G1 --> G2
    G2 --> O_RESIZE
    O_RESIZE -->|"yes"| G4
    O_RESIZE -->|"no"| G5
    G4 --> F1
    G5 --> F1
    R5 --> F1

    F1 --> Z
    F2 --> Z
    R11 --> Z
    D7 --> Z
    F3 --> Z
    R13 --> Z
    G6 --> Z
```

`quality`, `stripExif`, and `maxContentBoost` primarily affect encoding quality and metadata, not the top-level route through `generated`, `preserved`, or `hdr-intent`. Preserved gain maps keep their source metadata unless `discardGainMap=true` forces regeneration. The `preserve-with-rotation` branch covers preserved inputs that still need auto-rotation, explicit rotation, or preserved-component resize/alignment work before the final rebuild. Every branch ends in an UltraHDR JPEG output.

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
