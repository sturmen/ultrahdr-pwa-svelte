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

## Testing

- Desktop regression: `npm run test:e2e`
- Mobile emulation (iOS + Android): `npm run test:e2e:mobile`

## GMNet ONNX Export

- Export both checkpoints (realworld + synthetic), validate parity, and emit manifest:
  - `python3 scripts/export_gmnet_onnx.py --all-checkpoints`
- Export one checkpoint only:
  - `python3 scripts/export_gmnet_onnx.py --checkpoint realworld`
- Skip parity validation (not recommended outside local debugging):
  - `python3 scripts/export_gmnet_onnx.py --all-checkpoints --skip-parity`
- Python requirements for export/parity:
  - `torch`
  - `onnxruntime` (required unless `--skip-parity` is used)

Generated artifacts:
- `public/models/gmnet-realworld.onnx` + `public/models/gmnet-realworld.onnx.data`
- `public/models/gmnet-synthetic.onnx` + `public/models/gmnet-synthetic.onnx.data`
- `public/models/gmnet-manifest.json`

Runtime options:
- `gmnetModelVariant: 'realworld' | 'synthetic'` selects ONNX model variant (default: `'realworld'`).

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

## Special thanks

- Google for [libultrahdr](https://github.com/google/libultrahdr)
- GMNet authors: Yinuo Liao and Yuanshen Guan and Ruikang Xu and Jiacheng Li and Shida Sun and Zhiwei Xiong!
- @gregbenz for all his work [evangelizing HDR photography](https://gregbenzphotography.com/hdr/)
- OpenAI, Anthropic, and Google for the AI models that actually wrote this entire repo.