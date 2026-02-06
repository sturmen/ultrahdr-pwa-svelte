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

## Features

- Free and open source (MIT license)
- Completely local processing. No cloud costs, or any costs at all
- Cross-platform support across web browsers. Tested with Chrome 144.
- Batch support
- Rotation support
- EXIF preservation
- Configurable HDR headroom
- ISO 21496-1 Metadata Encoding

## Drawbacks

- Vibe-coded with [Antigravity](https://antigravity.google), so no one knows how it works
- Naïve enhancement algorithm

## How you can help

- Improve preservation of HEIC input gain maps, especially HEIC files captured on iOS devices. In the end, one of the goals of this tool is to function as a transcoder from HEIC with gain map (Apple format) to JPEG with gain map (Google format). 
- Improve iOS Safari (and other memory-constrained browser) support
- Improve offline support
- Create and implement a better gain map algorithm, possibly using local adaptation
- Create and implement a way to up-map the color gamut from sRGB to P3
- Implement persistent local storage for processed images so you can pause and resume processing
- Implement per-image adjustments for batch processing
- Implement concurrent task scheduling for image processing
- General improvements (testing, code organization, etc)

## Special thanks

- @google for [libultrahdr](https://github.com/google/libultrahdr) and [Antigravity](https://antigravity.google)
- @gregbenz for all his work [evangelizing HDR photography](https://gregbenzphotography.com/hdr/)
