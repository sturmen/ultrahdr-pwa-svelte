# Backlog

## 2026-02-20: Deep Dive - Why `onnxruntime-web/all` Flattens GMNet WebGPU Output

### Status
- Deferred investigation.
- User requested this be captured for later and focus shift to Firefox compatibility work now.

### Problem Summary
- Symptom observed: generated gain maps became visually near-blank / flat in Chrome even when runtime marker reported WebGPU.
- This behavior was a regression vs commit:
  - `28aa29ea230ee091fbe8d0ccce3e07c0b469eb53`

### What We Confirmed
- A/B behavior changed materially based on ONNX runtime import path:
  - `onnxruntime-web/all` (regressed path)
  - `onnxruntime-web/webgpu` (healthy path)
- With the same GMNet models and fixtures, `all` produced much lower contrast gain maps on Chromium.
- Switching WebGPU inference back to `onnxruntime-web/webgpu` restored expected gain map contrast and resolved the user-facing regression in Chromium.

### Key Evidence
- EXIF matrix stats with regressed path (`onnxruntime-web/all`) showed compressed output distribution:
  - `exif_matrix.jpg` range `93`, std `1.696980`
  - `exif_matrix.jpeg` range `93`, std `1.696980`
  - `exif_matrix.png` range `93`, std `1.696939`
  - `exif_matrix.webp` range `91`, std `1.696118`
  - `exif_matrix.heif` range `89`, std `1.681237`
- Same test after routing WebGPU to `onnxruntime-web/webgpu`:
  - `exif_matrix.jpg` range `254`, std `11.477897`
  - `exif_matrix.jpeg` range `254`, std `11.477897`
  - `exif_matrix.png` range `254`, std `11.471774`
  - `exif_matrix.webp` range `255`, std `11.437710`
  - `exif_matrix.heif` range `255`, std `11.561409`

### Current Mitigation in Code
- Provider-specific ORT modules:
  - WebGPU provider uses `onnxruntime-web/webgpu`
  - WebGL fallback path lazily loads `onnxruntime-web/all`
- Session cache is keyed by `(modelVariant, provider)` to avoid mixed-backend session reuse.
- This mitigation is active and verified with Chromium E2E.

### Hypotheses for Root Cause (Unverified)
1. Backend kernel registration/selection differences in `all` bundle alter execution path even when `executionProviders=['webgpu']`.
2. Graph partitioning or kernel fallback behavior differs between the two bundles.
3. A subtle precision/layout issue exists in the `all` webgpu backend composition for this specific GMNet graph.

### Suggested Future Investigation Plan
1. Build a minimal ORT repro that runs the same model and input through:
   - `onnxruntime-web/webgpu`
   - `onnxruntime-web/all` with `executionProviders=['webgpu']`
2. Capture and diff:
   - per-layer outputs for selected nodes
   - final tensor stats
   - resolved execution provider and backend diagnostics
3. Verify whether kernels differ by instrumenting node assignment or tracing runtime logs.
4. File an upstream ORT issue with:
   - minimal model (or graph slice)
   - deterministic input
   - expected vs actual numeric summary
   - bundle-dependent behavior details

### Useful Commands/Entry Points
- Chromium targeted E2E:
  - `npx playwright test --project=chromium`
- Relevant files:
  - `src/lib/gmnet-session.js`
  - `src/lib/gain-map-generator.js`
  - `tests/e2e/ultrahdr.spec.js`
- Regression reference:
  - `28aa29ea230ee091fbe8d0ccce3e07c0b469eb53`

