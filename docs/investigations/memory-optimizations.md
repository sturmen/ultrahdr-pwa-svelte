# Memory Optimization Investigation

Target: MobileSafari ~1 GB per-tab JS heap crash threshold on 12 MP HDR inputs.

## Profiling harness

- `tests/e2e/memory-profile.spec.ts` — Chromium-only Playwright spec.
- Flags: `--enable-precise-memory-info --js-flags=--expose-gc`.
- Samples `performance.memory.usedJSHeapSize` every 20 ms (was 50 ms).
- Listens on `ultrahdr:processing-progress` CustomEvent; tags each sample with most-recent pipeline stage.
- Worker-side probes route via `telemetry.emitStageProgress` → worker `postMessage` → main `publishWorkerTelemetry` → `window.dispatchEvent`, so substage events cross the worker boundary.
- Artifacts: `test-results/memory-profile/<fixture>.{samples,stage-events,summary}.json`.

### Substage probe plumbing (`heif-hdr-processing.ts`)

- Module-level `heifProbeSink` + `setHeifProbeSink()` setter.
- `processing-core.ts` preprocess-file stage installs sink that forwards substage → `telemetry.emitStageProgress('preprocess-file', 0, { substage })`.
- Fallback to `globalThis.dispatchEvent` when no sink installed (main thread).
- Previous direct `window.dispatchEvent` silently no-op'd inside processing worker.

## Fixture peaks (Chromium, `performance.memory`)

| Fixture | Size | Peak MB | Dominant stage |
|---|---|---|---|
| `test_hdr_no_gain_map.HIF` | 8.6 MB | 1213 | `preprocess-file` (libheif init+decode) |
| `test_sdr.jpg` | 5.9 MB | 590 | `generate-gain-map` |
| `test_hdr_heif_spatial_gainmap.HEIC` | 4.9 MB | 464 | `encode-sdr-to-jpeg` |
| `test_hdr_heif_gainmap.HEIC` | 1.7 MB | 460 | `encode-sdr-to-jpeg` |
| `test_hdr_jpeg_gainmap.jpg` | 2.3 MB | 215 | end-to-end |

## HIF substage attribution (4032×3024 HDR-intent)

| Substage transition | Δ heap | Cumulative |
|---|---|---|
| `heif-start` → `heif-module-ready` | **+1007 MB** | 40 → 1047 MB |
| `heif-pre-decode-image2` → `heif-post-decode-image2` | **+166 MB** | 1048 → 1213 MB |
| pack 1010102 loop | +0.1 MB | flat |
| `heif_image_release` | 0 | flat |
| `encode-set-hdr-intent-image` | 0 | flat |
| `encode-ultrahdr` (10.2 s) | +0.8 MB | flat |

Samples during libheif instantiation window (2459 ms → 4506 ms): **no samples recorded**. Main thread blocked ~2 s while `libheifFactory({ wasmBinary, locateFile })` compiled + instantiated WASM. Single 986 MB jump is 2 s of missing observations, not one allocation.

### libheif WASM config

Inspected `node_modules/libheif-js/libheif-wasm/libheif.wasm`:

- Memory section: `initial=259 pages (16.2 MB)`, `max=32768 pages (2 GB)`.
- No explicit INITIAL_MEMORY / TOTAL_MEMORY overrides in `libheif.js` or `libheif-bundle.mjs`.
- Module does not pre-reserve 1 GB; growth happens during/after instantiation.

## Interpretation

1. **Round 3 Candidate 1 premise invalidated.** Plan targeted `encode-ultrahdr` (1213 MB) as libultrahdr encoder internals. Substage data shows `encode-ultrahdr` is flat — the encoder allocates nothing JS-observable during its 10 s window. Peak is set before encode even starts.

2. **1007 MB `heif-module-ready` jump is libheif WASM heap, not JS.** Disambiguation probe confirmed: allocated 500 MB JS `Uint8Array` after `heif-module-ready`, freed it. Reported `usedJSHeapSize` delta = **+0.8 MB alloc, −0.7 MB free**. JS allocations under the current WASM ceiling are invisible to `performance.memory` once WASM heap dominates. Therefore the full 1213 MB number is dominated by libheif's WASM memory:
   - After module instantiation + global initialization: ~1007 MB of WASM heap committed.
   - +166 MB during `heif_js_decode_image2` for 4032×3024 decode working buffers + interleaved RRGGBBAA_LE output.
   - JS-side overhead: < 10 MB across full pipeline.
   - WASM binary `Memory` section declares `initial=259 pages (16 MB)`; the 1 GB is actual heap growth triggered during `libheifFactory({ wasmBinary })` — global C++ static init, plugin registries, thread pools, codec tables. Not a V8 accounting artifact.
   - **MobileSafari implication:** this memory is real on every engine. JavaScriptCore WASM enforces per-tab caps that are tighter than V8 on iOS; 1 GB libheif init alone likely exceeds the crash budget before any decode runs.

3. **166 MB `heif_js_decode_image2` jump** is observable. 4032×3024 × 8 bytes interleaved RRGGBBAA_LE = 97 MB; libheif working buffers account for the rest. This is real memory and lives until the JS-side packed 1010102 buffer + `heif_image_release` downstream.

4. **`encode-ultrahdr` sustained 1213 MB is a plateau, not growth.** Nothing to shave inside libultrahdr; peak is already locked in by preprocess.

## Invalidated Round 3 plan items

- **Candidate 1 (HDR-intent reusable buffer release)** — target was wrong stage. Will not move peak on HIF.
- Candidate 2 (GMNet accumulators) — still valid; targets `sdr-large` fixture, independent.
- Candidate 3 (preserved-HEIC raster release) — still valid; targets HEIC fixtures, independent.

## libheif teardown gap (current source state)

`src/lib/heif-hdr-processing.ts` at time of investigation:

- Module cached globally: `let libheif: LibHeifModule | null = null`. First HIF triggers 1 GB commit; it persists for the lifetime of the worker.
- `decodePrimaryToHdrIntent` calls `heif.heif_image_release(decoded.image)` only.
- `primary.handle` (`heif_image_handle`) — never released via `heif_image_handle_release`.
- `HeifDecoder` instance — `decoder.decode(...)` output (`images` array of handles) never freed.
- `heif_context_free` — never called.
- `heif_deinit` — never called.
- On second HIF: no re-init, but also no cleanup of handles from prior job → monotonic WASM growth.

libheif JS API surface includes all of: `heif_context_free`, `heif_image_handle_release`, `heif_image_release`, `heif_deinit`, `heif_decoding_options_free`, `heif_encoding_options_free`, `heif_nclx_color_profile_free`. We use only `heif_image_release`.

## Next-step status

| # | Item | Status |
|---|---|---|
| 1 | Plug libheif handle leak | **Landed** (Round 4 below) |
| 2 | Measure MobileSafari directly | Open — blocking follow-up |
| 3 | Shrink libheif decode working set (region decode) | Open |
| 4 | Post-job module teardown (`libheif = null` between jobs) | Open |
| 5 | Emscripten rebuild (trim plugin registries) | Open (high effort) |
| 6 | Round 3 plan revise — Candidate 1 replaced | Done — plan superseded by this doc |
| 7 | Attribute +407 MB `extract-source-exif` run-2 delta | **Probes landed** (Round 5 below) — leak located; not inside extract-source-exif code |
| 8 | Investigate main-thread state retention during post-upload await window | Open — next up (Round 6 candidate) |

## Round 4 landed: libheif handle release

### Files touched

| File | Change |
|---|---|
| `src/lib/heif-hdr-processing.ts` | Added `heif_image_handle_release` + `heif_context_free` + `HeifImage.free()` to `LibHeifModule` / `HeifPrimaryImage` / `HeifDecoderInstance` types. Wrapped `decodePrimaryToHdrIntent` call in try/finally. New `releaseHeifHandles(heif, decoder, images)` helper. Diagnostic emit wrapped in try/catch so test-runtime localStorage gaps don't crash teardown. Disambiguation 500 MB probe removed. |
| `src/lib/diagnostics-events.ts` | Registered `processingMemory.heifHandlesReleased: 'heif-handles-released'`. Added discriminated union variant `{ type: 'heif-handles-released'; trigger; releasedHandles; contextFreed }`. Added builder case. |
| `src/lib/processing-core.ts` | Preprocess-file stage installs `setHeifProbeSink(...)` → `telemetry.emitStageProgress` and clears sink in finally. Lets substage probes cross worker→main boundary. |
| `tests/e2e/memory-profile.spec.ts` | Sample interval 50 → 20 ms. New `hif-hdr-intent-repeat-2x` test. |
| `src/lib/__tests__/processing-hdr-intent-heif.test.js` | Mock now exports `setHeifProbeSink: vi.fn()` so `processing-core.ts`'s dynamic import succeeds. |

### Behavior

`processHeifHdr` wraps decode in try/finally that calls `releaseHeifHandles(heif, decoder, images)`:

- Iterates every `HeifImage` returned by `decoder.decode(...)`; prefers `img.free()` (hits `heif_image_handle_release` + nulls handle), falls back to direct `heif.heif_image_handle_release(handle)`.
- Frees decoder context via `heif.heif_context_free(decoder.decoder)` when present.
- All calls guarded; teardown must not throw.
- Emits `heif-handles-released` diagnostics breadcrumb with `releasedHandles` + `contextFreed` (wrapped in try/catch).

### Verification: `hif-hdr-intent-repeat-2x` (new repeat-run spec)

New test `memory profile: hif-hdr-intent-repeat-2x` in `tests/e2e/memory-profile.spec.ts`:

- Runs the HIF fixture through the pipeline twice in the same page.
- Inserts a synthetic `repeat-boundary` stage event between runs.
- Calls `window.__ULTRAHDR_AUTOMATION__.resetState()` between runs to dismiss UI results; worker + cached libheif module stay alive.
- Summary artifact: `test-results/memory-profile/hif-hdr-intent-repeat-2x.summary.json`.

Per-stage heap at stage-complete (run 1 vs run 2):

| Stage | Run 1 | Run 2 | Run 2 Δ |
|---|---|---|---|
| `preprocess-file` | 40.2 → 1212.2 MB (+1172) | 1616.3 → 1616.5 MB | **+0.2** ✓ |
| `extract-source-exif` | 40.1 → 40.2 MB | 1209.2 → 1616.3 MB | +407 (new) |
| `encode-ultrahdr` | 1212.5 → 1213.3 MB | 1617.0 → 1616.7 MB | −0.3 |
| pipeline overall peak | 1213.6 MB | 1616.8 MB | +403 |

Key result: **run 2 `preprocess-file` delta dropped from +1172 MB to +0.2 MB.** libheif's ~1 GB WASM heap from run 1 is reused in place for run 2's decode rather than re-committed. Handles + context freed before run 2 decode runs → libheif allocates into reclaimed WASM slots instead of growing `WebAssembly.Memory`. `heif-handles-released` probe fires at expected point in both runs with `releasedHandles ≥ 1`, `contextFreed === true`.

Without the patch, extrapolation suggests run 2 would peak near 2213 MB (another ~1 GB libheif commit on top of run 1's retained state). Patch prevents monotonic cross-job growth inside libheif's WASM heap.

### Vitest

`npx vitest run src/lib/__tests__/heif-hdr-processing.test.js` — 10/10 pass.

`src/lib/__tests__/processing-hdr-intent-heif.test.js` — 3/4 fail with `runtime.localStorage?.getItem is not a function` from `releaseHdrIntentSource` (Round 1 code path). **Pre-existing on main**, not introduced by Round 4. Verified by stashing Round 4 changes and re-running. Root cause: test runtime lacks localStorage shim; `recordProcessingMemoryDiagnostics` calls in Round 1 helpers are not guarded. Out of scope for this round but flagged for test-infra follow-up.

### Residual leak (not libheif)

Run 2 still peaks +403 MB above run 1. Attribution:

- `extract-source-exif` stage-complete heap grows from 1209 MB → 1616 MB inside that one stage.
- That stage does only `blobToUint8Array(sourceInputFile)` + `extractExifApp1PayloadFromInput(bytes, name, type)`.
- Source file is 8.6 MB; this delta is 50× the file size.
- Same stage was flat (+0.1 MB) on first run. Run-2-specific.

Hypotheses to follow up:

1. V8 deferred heap accounting — memory committed during run 1 (libultrahdr reusable buffers, ORT session, jpegli encoder) only shows up in `usedJSHeapSize` once a later allocation forces recount.
2. `blobToUint8Array` / structured-clone retention — File object transferred to worker at queue time holds a main-thread reference alive until job completion.
3. Worker keeps run 1's EXIF parse intermediate bytes alive for run 2 (closure capture).

Next probe target: instrument `extract-source-exif` inner steps the same way `preprocess-file` was instrumented — `pre-blob-read`, `post-blob-read`, `pre-exif-parse`, `post-exif-parse`. Small helper in `processing-core.ts` around lines 677–687.

## Round 5 landed: extract-source-exif substage probes + V8 disambiguation

### Files touched

| File | Change |
|---|---|
| `src/lib/image-utils.ts` | Added `ImageUtilsProbeSink` type + `setImageUtilsProbeSink()` setter + `emitImageUtilsProbe()`. Instrumented `blobToUint8Array` with `pre-blob-array-buffer` / `post-blob-array-buffer` / `post-uint8array-wrap` probes (and sibling probes on the `Response`-fallback branch). Falls back to `globalThis.dispatchEvent` when no sink installed. |
| `src/lib/input-exif.ts` | Added `InputExifProbeSink` type + `setInputExifProbeSink()` setter + `emitInputExifProbe()`. Probes at `extractExifApp1PayloadFromInput` entry, format-dispatch branches (`dispatch-heif`, `dispatch-jpeg`, etc.), and HEIF-specific `heif-pre-exif-extent-slice` / `heif-post-exif-extent-slice` / `heif-post-exif-concat` / `heif-post-exif-decode` steps. |
| `src/lib/processing-core.ts` | `extract-source-exif` stage body now installs both sinks → `telemetry.emitStageProgress('extract-source-exif', 0, { substage })`; clears sinks in finally; emits `stage-exit` probe before stage promise resolves. Static-imports the two setters. |
| `tests/e2e/memory-profile.spec.ts` | New `MEMORY_PROFILE_DISAMBIGUATE=1` env-gated V8-accounting calibration between run 1 and run 2: allocates 100 MB across 10 × 10 MB chunks, holds 100 ms, releases, samples pre/peak/post. Exported as `disambiguation` field in `summary.json`. |
| `src/lib/__tests__/processing-*.test.ts` (5 files) | Mocks for `'../input-exif.js'` now export `setInputExifProbeSink: vi.fn()`: `processing-orientation-generated-path`, `processing-gainmap-decision`, `processing-lazy-imports`, `processing-metadata-forwarding`, `processing-resolution-pipeline`, `processing-preservation`. |

All 125 test files / 722 tests pass; typecheck clean. The `processing-hdr-intent-heif` pre-existing failures from Round 4 are now also resolved (unrelated — caused by the mock-compatibility flush above).

### Verification run — `hif-hdr-intent-repeat-2x` with `MEMORY_PROFILE_DISAMBIGUATE=1`

Summary:

```
overallPeakMB: 1627.5
firstRunPeakMB: 1213.4
secondRunPeakMB: 1627.5
peakDeltaMB: 414.1
disambiguation: { preMB: 1208.3, peakMB: 1307.8, postMB: 1307.8 }
```

V8 disambiguation: allocated 100 MB of JS synchronously → reported +99.5 MB. Release (200 ms later): reported 0 MB freed (GC hadn't run, expected). **`performance.memory` reports JS allocations honestly** at this heap size; the +414 MB repeat-run delta is **real retained memory**, not an accounting artifact.

### Per-substage attribution (run 2, HIF)

Run 1 `extract-source-exif` reference (2408 ms — 2412 ms, +0.6 MB over whole stage):

| Sub | Elapsed | Heap Δ |
|---|---|---|
| stage-start | — | 40.1 MB |
| pre-blob-array-buffer | +0.1 ms | 40.2 MB |
| **post-blob-array-buffer** | +1.9 ms | **40.2 MB (+0.0)** |
| post-uint8array-wrap | +0.3 ms | 40.6 MB |
| heif-post-exif-decode | +2.3 ms | 40.6 MB |
| stage-complete | +3.4 ms | 40.7 MB |

Run 2 `extract-source-exif` (15742 ms — 17604 ms, +649 MB over whole stage):

| Sub | Elapsed since prev | Heap |
|---|---|---|
| stage-start | — | 967.0 MB |
| pre-blob-array-buffer | +0.2 ms | 967.1 MB |
| **post-blob-array-buffer** | **+1860 ms** | **1616.5 MB (+649)** |
| post-uint8array-wrap | +0.2 ms | 1616.6 MB |
| pre-exif-parse | +0.2 ms | 1616.6 MB |
| dispatch-heif | +0.1 ms | 1616.7 MB |
| heif-pre-exif-extent-slice | +0.1 ms | 1616.8 MB |
| heif-post-exif-extent-slice | +0.2 ms | 1616.8 MB |
| heif-post-exif-concat | +0.1 ms | 1616.9 MB |
| heif-post-exif-decode | +0.2 ms | 1616.0 MB |
| post-exif-parse-heif | +0.1 ms | 1616.1 MB |
| stage-exit | +0.2 ms | 1616.1 MB |
| stage-complete | +0.1 ms | 1616.2 MB |

### Finding

**All +649 MB of run 2's `extract-source-exif` growth occurs inside a single 1860 ms `await blob.arrayBuffer()` call.** Every downstream substage (uint8array-wrap, exif parse, HEIF extent slice, concat, decode) is ≤+0.1 MB and completes in ≤0.3 ms.

Run 1's identical `await blob.arrayBuffer()` on the same 8.6 MB fixture takes **1.9 ms** and grows heap by **0.0 MB**.

The `blobToUint8Array` code itself is not the leak — it reads an 8.6 MB file. The 1860 ms gap between `pre-blob-array-buffer` and `post-blob-array-buffer` on run 2 is the symptom: during that await, the main-thread event loop is doing ~1.86 s of work whose **side effect is +649 MB of retained allocations**. The `.arrayBuffer()` promise only resolves once that backlog drains (or CDP delivery completes).

### Candidate root causes (Round 6 investigation targets)

1. **Post-upload main-thread pipelines** — Svelte file-input handler runs preview-decode / thumbnail / input-preview pipelines as a side effect of accepting the second File. `ImageProcessor.input-preview.test.ts` exists → there is a preview pipeline distinct from the processing pipeline. Evidence: both runs show **two** `extract-source-exif` invocations per run (main pipeline + a post-complete invocation, confirmed in stage events). Run 1 post-process invocation starts at 1224 MB; run 2's starts at 1627 MB. The second invocation may be feeding a preview/output-display path that retains full-resolution data.
2. **Worker → main result-blob retention** — the UltraHDR JPEG produced by run 1 is posted back to the main thread for download / display. If the main-thread store holds that Blob past `resetState()`, run 2's processing allocates on top.
3. **Playwright CDP file-transfer cost** — the 1860 ms gap in run 2 vs 2 ms in run 1 suggests the second `uploadFile` is slower on the wire. This accounts for the latency but not the 649 MB allocation.
4. **automation.resetState() incompleteness** — between runs resetState releases 241 MB (1208 → 967), but not enough. Whatever it misses is what grows back the moment a new File arrives.

### Next probe targets (Round 6 plan)

- Instrument the **post-complete second `extract-source-exif` invocation** (preview pipeline): is this a call to `processImage` with the just-produced output blob as input, or with the original input file?
- Instrument `automation.resetState()`: what does it clear, what does it miss? Check for retained references in Svelte stores (`processingOutputStore`, `inputPreviewStore`).
- Instrument the main-thread file-input handler (`ImageProcessor.svelte` upload handler) with pre-blob-read / post-blob-read / post-preview-generate probes so we can see what runs during the 1860 ms gap.
- Add a sample-time-grouped delta report: slice run 2 heap samples into 100 ms buckets between `pre-blob-array-buffer` and `post-blob-array-buffer` to narrow which sub-window holds the 649 MB jump.

### Decisions

- No fix in Round 5 — probes are instrumentation only. Per plan non-goals.
- No `diagnostics-events.ts` registry entries for the new probes — they are debug-only. Registry additions wait for a real fix.
- V8 disambiguation helper is env-gated (`MEMORY_PROFILE_DISAMBIGUATE=1`) so normal CI runs stay artifact-free and deterministic.
- Two separate sinks (`setImageUtilsProbeSink`, `setInputExifProbeSink`) rather than one shared — matches Round 4 one-module-per-sink pattern; keeps module boundaries clean.

## Round 6 — Main-thread libheif handle leak in `heic-processing.ts`

### Root cause

Round 4 fixed handle/context release only in the **worker-side** `heif-hdr-processing.ts`. The **main-thread** `heic-processing.ts` module is used by the Svelte input-preview pipeline (`createInputPreviewTask` → `createHeifPreview` → `decodeHeifPreviewImage`) and by the sync decode path `processHeic`. Neither released:

- Primary image handles from `decoder.decode(buffer)`
- `heif_image_release` on the raster returned by `heif_js_decode_image2` (inside `_decodeHandleToImageData`)
- `heif_context_free` on `decoder.decoder`

Run 2's 1860 ms main-thread block during worker's `extract-source-exif` stage was the input-preview pipeline running a synchronous libheif decode on the main thread — blocking Playwright's file upload await and leaking the full libheif working set into a new WASM heap arena on each run.

### Fix

`src/lib/heic-processing.ts`:

- `HeifDecodeResult.image?: unknown`, `LibHeifModule.heif_image_release?`, `heif_context_free?`, `HeifImageLike.free?`.
- `_decodeHandleToImageData` — try/finally that calls `heif.heif_image_release(decoded.image)` after pixel copy. Mirror of `heif-hdr-processing.ts:463,515`.
- `_releaseHeifImages(heif, images)` + `_freeHeifContext(heif, decoder)` helpers — port of Round 4 `releaseHeifHandles`.
- `decodeHeifPreviewImage` — try/finally wraps `decoder.decode` + `_decodeHandleToImageData`; always releases images + context.
- `processHeic` — outer try/finally around entire decode body (all early-return branches: SDR+gainmap, raw-HDR, ITM fallback). Images + context released on every exit path.

No behavior change — returned `DecodedRasterImage` already deep-copies pixels into `new Uint8Array(interleavedChannel.data)`, so releasing the underlying libheif raster after return is safe.

### Verification

`npx playwright test --project=chromium tests/e2e/memory-profile.spec.ts -g hif-hdr-intent-repeat-2x`:

| Metric | Before Round 6 | After Round 6 | Δ |
|---|---|---|---|
| `overallPeakMB` | 1627 | **1380** | **−247 MB** |
| `firstRunPeakMB` | 1213 | 1222 | +9 MB (noise) |
| `secondRunPeakMB` | 1627 | **1380** | **−247 MB** |
| `firstRunEndMB` | ~1210 | 1209 | flat |
| `secondRunEndMB` | ~1616 | **1219** | **−397 MB** |
| `peakDeltaMB` | +414 | **+157** | **−257 MB** |
| `endDeltaMB` | ~+400 | **+10.5** | **−390 MB** |

Run-2 steady-state heap (`endDeltaMB`) is now converging — the main-thread libheif heap is being released between runs rather than accumulating. Residual +157 MB peak delta is likely one of: still-retained pixel buffer from preview pipeline, or a second preview-task invocation (see Round 5 finding #1). Follow-up target.

### Unit test + typecheck

- `npm run typecheck` → 0 errors.
- `npm test` → 722 passed, 1 skipped. No regressions.

### Decisions

- Ported Round 4 helper pattern (`_releaseHeifImages` + `_freeHeifContext`) rather than sharing helpers between modules — keeps `heic-processing.ts` self-contained and matches Round 4's single-module-owns-its-cleanup pattern.
- `processHeifHdr` branch in `processHeic` intentionally lets outer finally free its own decoder's handles/context before spawning the second decode; `processHeifHdr` owns an independent decoder with its own Round 4 cleanup.
- Did not null out module-level `libheif` cache between jobs. WASM heap stays (Round 4 already verified this is ~0 MB per-run cost).
- Did not move preview decode off main thread — bigger refactor, deferred.

## Round 7 — Kill main-thread libheif decode for HDR-intent + thumbnail-first preview

### Root cause

Round 6 cleanup released handles/context but did not change the fact that **every HIF upload ran a full libheif decode on the main thread** via the preview pipeline. Residual +157 MB peak delta on run 2 came from:

1. HDR-intent HIF inputs still hit `decodeHeifPreviewImage` → full 4032×3024 decode on main thread, blocking UI ~1.8 s and producing a large working set.
2. Non-HDR HEIC inputs also decoded the full-resolution primary image just to resize down to 256 px — wasteful.

### Fix

**Option A — `src/lib/input-preview.ts`:**

- `createInputPreviewTask` return type → `Promise<InputPreviewTask | null>`.
- HDR-intent HIF branch (`probeInputProcessingPathFromHeaders(file) === 'hdr-intent'`) returns `null` — no preview generated, placeholder SVG shown instead.
- `ImageProcessor.svelte:assignInitialPreviewForQueueItem` already handled `null` via `INPUT_PREVIEW_PLACEHOLDER_URL`.

**Option B — `src/lib/heic-processing.ts`:**

- New `_getThumbnailHandle(heif, decoder, primaryHandle)` — calls `heif_image_handle_get_number_of_thumbnails` + `_get_list_of_thumbnail_IDs`, retrieves first valid thumbnail handle via `heif_js_context_get_image_handle`. Frees its `_malloc`'d ID buffer.
- `decodeHeifPreviewImage` tries thumbnail first; falls back to primary decode only if no thumbnails (iPhone HEIC files embed 320×240 thumbnails).
- Thumbnail handle released in outer finally alongside primary images + context.

**Telemetry — `src/lib/diagnostics-events.ts` + `ImageProcessor.svelte`:**

- New `initial-input-preview-failed` event (warning severity). Replaces the `deferred-input-preview-failed` coverage lost when Option A removed the deferred path. Recorded from `resolvePreviewTaskForFile` catch.

### Verification

`npx playwright test --project=chromium tests/e2e/memory-profile.spec.ts -g hif-hdr-intent-repeat-2x`:

| Metric | Before Round 7 | After Round 7 | Δ |
|---|---|---|---|
| `overallPeakMB` | 1389 | **551.2** | **−838 MB (−60%)** |
| `firstRunPeakMB` | 1222 | 549.1 | −673 MB |
| `secondRunPeakMB` | 1389 | **551.2** | **−838 MB** |
| `firstRunEndMB` | 1209 | 549.1 | −660 MB |
| `secondRunEndMB` | 1219 | **549.5** | −670 MB |
| `peakDeltaMB` | +157 | **+2.1** | **−155 MB** |
| `endDeltaMB` | +10.5 | **+0.4** | **−10 MB** |

Peak now **well below** the MobileSafari ~1 GB crash threshold on the worst-case 2x-HIF repeat profile.

- `npm run typecheck` → 0 errors.
- `npm test` → 722 passed, 1 skipped. 4 input-preview tests rewritten for Option A behavior.

### Decisions

- Option A + Option B bundled — B costs little, benefits every HEIC/HIF non-HDR preview; A is the big win for HDR-intent. Landing together simplifies the risk story.
- Did not implement Option C (worker-side preview pipeline) — peak already 551 MB, deep below the crash budget. Bigger refactor deferred.
- Kept `InputPreviewTask` union's `pending` variant as legacy unreachable code — avoids breaking Svelte caller's type narrowing (`previewTask.status === 'ready'` vs `pending`).
- Added `initial-input-preview-failed` to diagnostics registry rather than silently dropping the telemetry.

## Round 8 — GMNet baseline attribution (landed — instrumentation only)

Post-Round-7 `sdr-large` profile showed `<pre-pipeline>` 540.8 MB dominating
overall peak. Hypothesis: ORT WebGPU shader compile + device buffer residency.

### Landed

**Phase A** — 6 lifecycle diagnostics events + probe-sink in `gmnet-session.ts`:

- `gmnet-session-pre-create`
- `gmnet-session-post-create-global` (with `probeElapsedMs`)
- `gmnet-session-post-create-local` (with `probeElapsedMs`)
- `gmnet-session-pre-first-run` (with `tileIndex`)
- `gmnet-session-post-first-run` (with `probeElapsedMs`)
- `gmnet-session-post-warm-idle` (gated by `__ultrahdrGmnetWarmIdleProbe` flag)

Plus two `processing-core.ts` substage probes:

- `gmnet-session-pre-module-import`
- `gmnet-session-post-module-import`

Probe sink bridges worker-side dispatches to main via
`telemetry.emitStageProgress` inside the `generate-gain-map` stage. Diagnostics
registry updated (`diagnostics-events.ts` — 6 new event names, types, builder
cases). `elapsedMs` field on dispatched probes renamed to `probeElapsedMs` to
avoid collision with `pipeline-telemetry.ts`'s pipeline-wide `elapsedMs`.

**Phase B** — `gmnet-baseline-attribution` test in `memory-profile.spec.ts`.
Uses `sdr-large` fixture. Produces `gmnet-baseline-attribution.summary.json`
with per-probe heap samples + step-delta table. Profiler event schema extended
to capture `provider`, `variant`, `probeElapsedMs`, `tileIndex`, `idleMs`.

### Finding

Per-probe heap (Chromium `--enable-precise-memory-info`, `sdr-large`):

| Probe | Heap MB | Delta |
|---|---|---|
| pre-module-import | 542.1 | (entry) |
| post-module-import | 542.2 | +0.1 |
| pre-create | 540.9 | −1.3 (GC during session setup) |
| post-create-global | 541.0 | +0.1 |
| post-create-local | 541.1 | +0.1 |
| pre-first-run | 541.2 | +0.1 |
| post-first-run | 541.3 | +0.1 |

**Total heap growth across full GMNet session-create + first-run path:
~0 MB.** The 542 MB is already resident at `pre-module-import` — before
`gmnet-session.ts` loads. Session construction is free. Shader compile is
free. Model weight upload is free (JS heap accounting).

### Implications

Original hypothesis — "ORT WebGPU shader compile + device buffer residency
dominates baseline" — **disproven**. The planned ORT knob sweep
(`freeDimensionOverrides`, `preferredOutputLocation`,
`graphOptimizationLevel`, `enableGraphCapture`, drop `powerPreference`,
dispose-global-early) cannot reduce a baseline not owned by the session.

The 542 MB is consumed **before** the `generate-gain-map` stage by some mix
of:

1. App shell + Svelte runtime + component state
2. Worker boot + worker-side module graph
3. ORT WebGPU module preload (`preloadGmnetRuntimeDependencies` →
   `loadOrtWasmModule` + `loadOrtWebGpu`)
4. Jpegli WASM compile + factory warmup
5. libheif WASM compile
6. Main-thread retained refs to the source JPEG blob
7. WebGPU adapter state (`powerPreference: 'high-performance'` device heap)

### Verification

- `npm run typecheck` → 0 errors.
- `npm test` → 725 passed, 1 skipped (no regressions).
- `npx playwright test --project=chromium tests/e2e/memory-profile.spec.ts -g gmnet-baseline-attribution`
  → 1 passed; summary at
  `test-results/memory-profile/gmnet-baseline-attribution.summary.json`.

### Next step — Round 9

Attribute one layer up: `pre-pipeline` substages for app startup, worker boot,
and ORT module preload. Likely candidates for landing:

- Move ORT WebGPU module import from eager `preloadGmnetRuntimeDependencies`
  to lazy `getSession`-time (possibly saves 50–100 MB by deferring webgpu
  runtime WASM instantiation until first generation)
- Measure jpegli WASM resident cost; consider lazy-warmup
- Drop `powerPreference: 'high-performance'` — test integrated-GPU adapter
  memory footprint
- Audit main-thread retained refs to the source input blob after worker
  structured-clone

The Phase C ORT knob sweep from the original plan is **shelved** — baseline is
not session-owned. Revisit only if transient tile allocations (not baseline)
become the next bottleneck.

## Round 8.5 — main-thread preview is the 500 MB culprit

Added 9 boot milestones + 11 main-thread preview / image-utils probes
(`preview-task-entry`, `preview-pre-load-image-data`,
`load-image-data-pre/post-jpegli-decode`, `load-image-data-post-orient`,
`transform-image-data-pre/post-resize`, `image-data-to-jpeg-pre/post-encode`,
`preview-post-jpeg-blob`) inside `src/lib/input-preview.ts` and
`src/lib/image-utils.ts`. Artifact
`test-results/memory-profile/gmnet-baseline-attribution.summary.json`.

Boot phase is **not** the culprit:

| Transition | Heap | Δ |
|---|---|---|
| boot-entry → boot-post-mount | 2 → 37.9 | +35.9 (Svelte hydrate) |
| mount → runtime-gate → idle-3s | 37.9 → 38.2 | +0.3 (flat) |
| idle-3s → upload-inflight | 38.2 → 38.4 | +0.2 |

**Main-thread preview decode is the culprit.** Fixture `test_sdr.jpg` =
4472×7952 JPEG (35.5 MP, 6.2 MB on disk). Two preview passes run on main
thread — the input preview (before worker dispatch) and the output preview
(after worker returns the SDR rasterized result):

| Transition (pass 1, input preview) | Heap | Δ |
|---|---|---|
| boot-post-upload-inflight → load-image-data-pre-jpegli-decode | 38.4 → 44.3 | +5.9 |
| **pre-jpegli-decode → post-jpegli-decode** | 44.3 → 408.0 | **+363.7** |
| post-orient → pre-resize | 408 → 408.8 | +0.8 |
| **pre-resize → post-resize** | 408.8 → 540.6 | **+131.8** |
| post-resize → post-encode → post-jpeg-blob | 540.6 → 540.6 | 0 |

| Transition (pass 2, output preview) | Heap | Δ |
|---|---|---|
| gmnet-post-first-run → pre-load-image-data (GC drop) | 541.3 → 277.4 | −263.9 |
| **pre-jpegli-decode → post-jpegli-decode** | 277.4 → 462.1 | **+184.6** |
| **pre-resize → post-resize** | 462.1 → 598.6 | **+136.5** |

Overall peak: 598.8 MB. Both passes share the same two heavy operators:

1. **`decodeJpegli(bytes)`** on a 35.5 MP JPEG = 184–364 MB. Jpegli WASM
   decodes the full resolution JPEG into a linear RGBA buffer (4472×7952×4 =
   142 MB in theory) but allocates additional jpegli internal state. First
   pass is heavier because WASM heap is still cold; second pass inherits a
   smaller working set after GC.
2. **`resizeImageData` → `resizeRasterImage`** = 132–137 MB. Canvas path
   allocates a full-res backing buffer before downsampling.

The entire preview blob is 256 px (downsampled by `PREVIEW_MAX_DIMENSION`).
Paying 500 MB of peak heap to produce a 256 px thumbnail of a 35 MP source is
the actual baseline driver.

### Implications

- GMNet session, ORT WebGPU, jpegli/libheif runtime cost: ~0 MB baseline
  contribution (confirmed Round 8 + Round 8.5).
- The 540 MB that was mis-attributed to "GMNet baseline" in Rounds 7–8 is
  actually preview-pass peak heap that happens to persist because V8 hasn't
  GC'd the intermediate ImageData + canvas bitmap before the next stage
  starts.
- Repeat-run scenario (Round 6) already masked this because libheif dominated
  run 1. On JPEG inputs there is no libheif mask, and preview is the peak.

### Round 9 candidates (ranked by expected MB saved per line changed)

1. **Browser-decoded bitmap for preview** (highest ROI). Swap
   `loadImageData(blob) → resizeImageData(256)` in
   `createPreviewBlobFromImageBlob` for
   `createImageBitmap(blob, { resizeWidth, resizeHeight, resizeQuality: 'medium' })`.
   Browser native path downsamples during decode; never materializes the
   35 MP intermediate. Expected savings: 400–500 MB peak on JPEG previews.
   Fallback to jpegli decode only if `createImageBitmap` rejects.
2. **Skip input preview for large inputs** (fast ship). Gate
   `createStandardRasterPreview` on file size or declared EXIF dimensions;
   use `INPUT_PREVIEW_PLACEHOLDER_URL` for images ≥ 20 MP until the worker
   output preview arrives.
3. **Pipeline-side preview reuse**. The worker already decodes the input to
   `ImageData`. Ship a 256 px thumbnail back from the worker alongside the
   final output and skip the main-thread preview pass entirely.
4. **Free `decoded.data` before orient**. `orientDecodedJpegImageData`
   currently wraps the jpegli buffer in `ImageData`, then rotates if needed.
   Ensure we detach the intermediate after rotation.

### Plan for Round 9 landing

Pick (1): `createImageBitmap` fast-path with jpegli fallback. Small surface
area (one function), large savings, no pipeline-output contract change.
Land with regression test: re-run `gmnet-baseline-attribution` and assert
post-resize delta < 20 MB.

## Chronological summary

1. Round 3 plan targeted `encode-ultrahdr` peak on HIF. Assumed libultrahdr encoder internals.
2. Substage instrumentation revealed `encode-ultrahdr` is flat; peak set before encode by libheif.
3. Disambiguation 500 MB-alloc probe confirmed the Chromium `performance.memory` number reflects WASM heap, not just JS. Reverse: JS allocs invisible once WASM dominates.
4. Inspected libheif JS: handles, context, decoder never released. Only `heif_image_release` called on the decoded image.
5. Round 4 landed: handle + context release in try/finally (worker-side `heif-hdr-processing.ts` only).
6. Repeat-run profile: run 2 `preprocess-file` Δ +0.2 MB (vs +1172 MB run 1). libheif WASM heap reused.
7. Round 5 landed: substage probes in `extract-source-exif` + V8 disambiguation.
8. Attribution: all +649 MB of run 2's stage delta is inside a single `await blob.arrayBuffer()` (1860 ms). V8 reports JS allocations honestly (100 MB calibration → +99.5 MB reported).
9. Round 6 root cause: main-thread `heic-processing.ts` never released libheif handles/context. Preview pipeline re-leaked full working set each run.
10. Round 6 landed: ported Round 4 cleanup pattern to `heic-processing.ts`. Run-2 peak 1627 → 1380 MB; end-delta +400 → +10 MB.
11. Round 7 landed: skip preview for HDR-intent HIF (Option A) + thumbnail-first HEIC decode (Option B). Run-2 peak 1389 → 551 MB; peak-delta +157 → +2.1 MB. Below MobileSafari crash budget.
12. Round 8 landed (instrumentation only): 6 GMNet lifecycle probes + `gmnet-baseline-attribution` test. Attribution disproves "WebGPU session owns the baseline" hypothesis — session create + first run add ~0 MB. 542 MB baseline is pre-stage (startup + ORT module + WASM). ORT knob sweep shelved; Round 9 targets startup attribution.
13. Round 8.5 landed (instrumentation only): 9 boot milestones + 11 main-thread preview/image-utils probes. Boot is ~38 MB; mount is the only non-trivial pre-upload alloc (+36 MB Svelte hydrate). The 500 MB "baseline" is **main-thread preview decode** on a 35.5 MP JPEG — jpegli decode (+364 MB) + canvas resize (+132 MB). Second pass (output preview) adds another 185 + 137 MB on top, peaking at 598 MB. Round 9 landing target: replace `loadImageData + resizeImageData` preview path with `createImageBitmap(..., { resizeWidth, resizeHeight })`.

## Prior rounds (landed)

- Round 1: `hdr-intent-source-release.ts`, ORT session warm-keep decision.
- Round 2: `sdr-pixel-source-release.ts`, `gmnet-gain-map-source-release.ts`, `compressed-payload-release.ts`, `detach-array-buffer.ts`.

All Round 1+2 breadcrumbs emit under `processingMemory` diagnostics domain.
