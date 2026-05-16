# Agent Context

## Purpose

`ultrahdr-pwa-svelte` is an offline-first Svelte PWA that converts SDR, UltraHDR JPEG, HEIC/HEIF, TIFF, and HDR-intent inputs into UltraHDR JPEG output. The app runs locally in the browser, uses GMNet through ONNX Runtime for generated gain maps, and prefers preserved source gain maps when available.

## Constraints

- Follow strict TDD: write a failing test first, confirm the failure reason, then add the smallest implementation needed.
- Preserve offline-first behavior. Online-only behavior is degraded or optional.
- Runtime assets must use the shared descriptor and fetch/cache pipeline in `src/lib/runtime-asset-definitions.ts` and `src/lib/runtime-assets.ts`; do not add direct runtime `fetch(...)` asset loaders.
- Do not introduce canvas-based rendering unless the user explicitly asks for an exception.
- Prefer strictly typed TypeScript for app code, tooling, tests, and config.
- Treat diagnostics breadcrumbs as part of the observable contract for user-visible flows and processing-significant state transitions.
- If a task changes architecture, commands, or file ownership, update these agent docs in the same change.

## Top-Level Modules

- `src/App.svelte`: app shell, view routing, share-target launch handling, PWA update state, runtime initialization UI.
- `src/lib/PwaUpdateSnackbar.svelte`: extracted app-shell PWA update snackbar UI and action layout contract.
- `src/lib/ImageProcessor.svelte`: main conversion UI and user-facing processing flow.
- `src/lib/FloatingSettingsButton.svelte`: extracted mobile floating settings action with update-aware vertical offset.
- `src/lib/workflow-state.ts`: reducer-backed queue/domain state, including the single queue-runner claim/launch/settle authority consumed by `ImageProcessor.svelte`.
- `src/lib/queue-processing-lease.ts`: shared queue launch and per-item processing task registries that deduplicate same-token launches and block conflicting queue invocations.
- `src/lib/processing.ts`: runtime initialization pipeline, worker/main-thread fallback, inference heartbeat tracking, runtime failure persistence, and queue-scoped process request deduplication.
- `src/lib/runtime-orchestrator.ts`: compact runtime state-machine orchestrator used for adapter-based initialization and processing.
- `src/lib/runtime-*.ts`: initialization policy, cache policy, planner, reducer, state machine, capability detection, and runtime contract types.
- `src/lib/runtime-post-update-warmup.ts`: first-launch-after-asset-version-change runtime warmup for JPEGli/libultrahdr to reduce cold-start processing pressure on iPhone/Safari.
- `src/lib/runtime-assets.ts`, `src/lib/runtime-asset-definitions.ts`: shared offline-first runtime asset descriptors, versioned URL resolution, fetch/cache fallback, and loader diagnostics context for WASM/module assets, including libheif HEIC decoding assets.
- `src/lib/jpeg-hdr-processing.ts`: APP2 ICC `cicp` tag parsing (`parseJpegCicpFromApp2`, `isJpegHdrInputCicp`) and pure-HDR JPEG decoding (`processJpegHdr`) that decodes via `decodeJpegli`, packs 8-bit RGB into `rgba1010102` HDR-intent payload (`ct: 'pq'|'hlg'`, `cg: 'bt2100'`), and emits `hdr-intent-jpeg-classified` breadcrumb. Routed from `src/lib/processing-core.ts` before standard-JPEG handling.
- `src/lib/diagnostics-events.ts`: typed diagnostics breadcrumb helpers and domain event-name source of truth used by UI, runtime init, pipeline telemetry, and runtime asset loaders.
- `src/lib/processing-*.ts`: route planning, progress, queueing, preferences, runtime reducer, worker protocol, and processing route types.
- `src/lib/gain-map-metadata.ts`: strictly typed gain-map metadata construction and imported XMP parsing; legacy camera XMP (`hdrgm:Version="1"` or `"1.0"`) is accepted only when required interpretive gain/capacity fields are present, while strict UltraHDR v1 parsing requires `Version="1.0"`.
- `src/lib/diagnostics.ts`, `src/lib/pipeline-telemetry.ts`, `src/lib/storage-diagnostics.ts`: structured breadcrumb and diagnostics surface.
- `src/sw.ts`: Workbox service worker, offline runtime bundle validation, repair, and cache management.
- `fixtures/`: repo-owned test fixtures for unit, integration, and e2e coverage.
- `media/`: README/demo assets only; do not add test fixtures here.
- `tests/e2e/*.spec.ts`: browser and offline regression coverage.
- `scripts/*.ts`: build metadata and runtime bundle manifest generation.

## Key Runtime Flows

- Startup flow: `src/App.svelte` creates the processing runtime, runs the initialization gate, loads `ImageProcessor.svelte` lazily, and records diagnostics for failures and degraded modes.
- Processing flow: `src/lib/processing.ts` decides worker or main-thread execution, ensures the runtime bundle is ready, tracks initialization/inference progress, and persists failure traces for offline debugging.
- Worker fallback guard flow: `src/lib/processing.ts` will only use compatibility fallback before a worker job has entered pipeline telemetry; once a worker emits `pipeline-start`, later compatibility-style worker errors are surfaced instead of starting a second full processing attempt, and a typed runtime breadcrumb records the skipped fallback.
- MobileSafari worker duplicate-delivery investigation: findings are recorded in [investigations/mobile-safari-worker-module-reevaluation.md](./investigations/mobile-safari-worker-module-reevaluation.md); temporary verbose tracing used during that investigation has been removed, but the shared worker-state duplicate-job guard remains in `src/lib/processing-worker.ts`.
- Adapter orchestration flow: `src/lib/runtime-orchestrator.ts` coordinates initialization and processing through worker and main-thread adapters with explicit fallback behavior.
- Offline bundle flow: `src/sw.ts` precaches app assets, validates the runtime bundle manifest, repairs corrupted caches, and answers bundle-management messages from the app.
- Runtime asset loading flow: `src/lib/runtime-assets.ts` and `src/lib/runtime-asset-definitions.ts` provide the canonical runtime asset inventory used by wasm/module loaders, the manifest builder, cache-name resolution, and service-worker bundle classification. New runtime assets must be declared there first, loaded through the shared helpers, included in bundle validation/repair, and covered by offline cache-fallback plus breadcrumb tests.
- Asset-version runtime warmup flow: `src/lib/runtime-post-update-warmup.ts` detects the first launch of a new app asset version, warms JPEGli and libultrahdr before the editor becomes interactive, persists the warmed asset version marker, and records typed startup breadcrumbs for warmup start/success/failure.
- Diagnostics emission flow: `src/lib/diagnostics-events.ts` is the canonical breadcrumb factory layer; feature modules should use its typed domain helpers instead of calling `DiagnosticsRecorder.record(...)` directly.
- Under-test automation flow: `src/lib/ImageProcessor.svelte` exposes `window.__ULTRAHDR_AUTOMATION__.enqueueFiles(...)` only when under-test mode is enabled so real Safari/Appium sessions can inject `File` objects directly into the normal queue and optionally acknowledge the mobile memory warning without using the native picker.
- Recovered diagnostics flow: `src/lib/ImageProcessor.svelte` still hydrates recovered diagnostics reports on relaunch, but it no longer auto-opens the diagnostics dialog; the manual settings action is the only supported path to open that dialog.
- Share target flow: `src/lib/share-target-launch.js` and `src/lib/share-store.ts` recover files launched through the installed PWA.
- Low-memory iPhone retention flow: `src/lib/share-store.ts` treats persisted queue artifacts as the source of truth on low-memory iOS, avoids duplicate in-memory blob mirrors only after successful persistence, keeps the RAM fallback when an IndexedDB write fails, and serializes queued inputs into blob-backed records so iPhone relaunch recovery can reconstruct `File` objects reliably; `src/lib/ImageProcessor.svelte` rehydrates outputs on demand.
- JPEG HDR-intent flow: `src/lib/processing-core.ts` (around the "Standard JPEG input" branch) calls `parseJpegCicpFromApp2(fileBuffer)` on every non-UltraHDR JPEG. When CICP advertises primaries=9 + transfer=16/18 (Rec.2020 PQ/HLG), `processJpegHdr` decodes the 8-bit RGB via `decodeJpegli`, downscales to `HDR_INTENT_MAX_LONG_EDGE` (constants.ts, == `GMNET_MAX_LONG_EDGE` = 8192) via `resizeRasterImageSync` when needed (bilinear in 8-bit RGB), repacks into `rgba1010102` (`(v<<2)|(v>>6)` 8→10-bit expansion), and the result flows into the existing `compressHdrIntentOnly` route. HEIF HDR-intent (`decodePrimaryToHdrIntent`) applies the same cap via `downscale16BitInterleavedRgba` (bilinear in 16-bit source channel space) before packing rgba1010102 / rgbaf16. Both emit `hdr-intent-downscaled` (`{ source: 'heif'|'jpeg', sourceWidth, sourceHeight, targetWidth, targetHeight, longEdgeCap }`). Cap exists because libultrahdr's `JpegR::encodeJPEGR` API-0 path allocates simultaneous full-res buffers (HDR intent + SDR RGBA tonemap + gainmap + YCbCr) that exhaust the wasm32 contiguous-allocation budget on >~50MP inputs. libultrahdr WASM also built `-fexceptions` so any residual `std::bad_alloc` returns `UHDR_CODEC_MEM_ERROR` instead of aborting the WASM instance. Failure path: HEIF `decodePrimaryToHdrIntent` emits a typed `hdr-intent-decode-failed` breadcrumb plus a `console.error([HEIF HDR] primary image decode failed, { code, bitsPerPixel, primaries, transfer, width, height, filename })` line and throws a verbose `Error('HEIF HDR primary image decode failed (code=…, bpp=…, primaries=…, transfer=…, WxH)')` — no fallback.
- HDR-intent peak normalization flow: `src/lib/heif-hdr-processing.ts` `processHeifHdr(file, { targetPeakLinear })` accepts a normalized peak (linear units, `1.0 = 100 nits`) plumbed from `ProcessOptions.maxContentBoost` via `src/lib/processing-core.ts`. When supplied, `decodePrimaryToHdrIntent` runs a peak-find pass over the decoded 16-bit RGB channels, computes `scale = targetPeakLinear / observedPeak`, and applies the scale during the second pass: the `rgbaf16` (Float16 linear) branch multiplies linear values and clamps to `LIBULTRAHDR_MAX_LINEAR`; the `rgba1010102` (low-memory packed) branch decodes via `decodeHdrChannelToLinear`, scales in linear space, then re-encodes via `encodeLinearToHdrChannel` (`linearToPq` / `linearToHlg`). Outcomes emit typed breadcrumbs `hdr-intent-peak-normalized` (applied) or `hdr-intent-peak-normalize-skipped` (zero-signal) via `recordProcessingMemoryDiagnostics`. Slider stops in `ImageProcessor.svelte` continue to drive `maxContentBoost = 2^stops` for both gain-map ceiling AND HDR-intent input peak — one knob, coherent meaning.
- Peak-memory release flow (MobileSafari): `src/lib/processing-core.ts` calls `releaseHdrIntentSource` from `src/lib/hdr-intent-source-release.ts` immediately after `encoder.setHDRIntentImage(...)` copies the HDR intent plane into the libultrahdr wasm heap, zeroing the JS-side `Uint8Array`; `src/lib/heif-hdr-processing.ts` `resolveHdrIntentFormat` forces `rgba1010102` on `memoryTier === 'low'` and emits `hdr-intent-format-downgraded`; `src/lib/gmnet-session.ts` plus `src/lib/gmnet-tile-memory.ts` release `sourceImageData` on the last tile step (emit `gmnet-source-image-released`), fold weight accumulation into `runTileStep` so `finalizeTiledInference` reuses a single pre-allocated `weightAccumIngm`, and clamp `tileInputSize` to 384 on `memoryTier === 'low'`. Round 2: `compressImages` (in `src/lib/processing-core.ts`) calls `releaseSdrPixelSource` on the locally-owned rotated SDR ImageData after `encode-sdr-to-jpeg` (when `rotation !== 0`), `releaseGmnetGainMapSource` on the GMNet gain-map ImageData after `encode-gain-map-to-jpeg`, and `releaseCompressedPayloadBag` on `{ baseJpeg, gainMapJpeg, exif, sdrJpeg? }` after `setExifData` consumes them (emits `sdr-pixel-source-released`, `gmnet-gain-map-source-released`, `compressed-payload-released`); `processUltraHDRFile` releases the caller-owned `workingImageData` after `compressImages` returns; `rebuildUhdrFromCompressed` issues the same payload-bag release before `encoder.encode(...)`.
- Gain-map preservation flow: `src/lib/processing-core.ts` prefers decoder extraction, then GContainer `GainMap` item metadata, then a bounded legacy two-JPEG fallback when metadata is interpretable. Invalid gain-map metadata/container failures fall back to generated GMNet output with `preservation-fallback` telemetry instead of preserving with guessed defaults. Preserved compressed gain maps keep imported metadata even when `maxContentBoost` is explicitly set.
- Queue runner flow: `src/lib/workflow-state.ts` owns queue start, claim, launch, settle, and restart intent; `ImageProcessor.svelte` is the thin imperative shell that dispatches those transitions and invokes `runtime.process(...)`.
- Queue lease flow: `src/lib/queue-processing-lease.ts` backs `ImageProcessor.svelte` with exclusive queue launch tokens and joined per-item processing tasks so one claimed queue item cannot start multiple processing executions for the same launch token.
- Queue-scoped runtime request dedupe flow: `src/lib/ImageProcessor.svelte` passes `processingRequestKey: queue:<id>` into `runtime.process(...)`, and `src/lib/processing.ts` joins concurrent calls for the same key while emitting the `process-request-deduplicated` breadcrumb.

## Commands

- Unit and component tests: `npm test`
- Coverage: `npm run test:coverage`
- Typecheck: `npm run typecheck`
- Desktop e2e: `npm run test:e2e`
- Chromium-only e2e: `npm run test:e2e:chromium`
- Mobile emulation e2e: `npm run test:e2e:mobile`
- Real Android WebGPU e2e: `npm run test:e2e:android-webgpu`
- HEIC real integration: `npm run test:integration:heic-real`
- JPEGLI determinism integration: `npm run test:integration:jpegli-determinism`
- Build app: `npm run build`
- Build WASM artifacts: `npm run build:wasm`

## Diagnostics Breadcrumbs

- New user-visible flows and processing-significant transitions must emit stable typed breadcrumbs.
- Runtime initialization, worker lifecycle, fallback decisions, storage pressure, lifecycle recovery, and failures are not optional breadcrumb points.
- Tests for behavior changes should assert breadcrumb emission when the flow is part of the public debugging contract.
- Breadcrumb payloads must remain bounded, privacy-conscious, and shareable offline.

## Boundaries

- Do not scan vendor or generated trees first unless the task is explicitly about native/build internals: `jpegli/`, `libultrahdr/`, `emsdk/`, `third_party/`, `build/`, `dist/`, `coverage/`.
- Prefer repo-owned source before wrappers: start in `src/` and `tests/`, then inspect `scripts/` for build/versioning work.
- Some repo-owned modules are still JavaScript wrappers (`share-target-launch.js`, `pwa-updater.js`, `exif-utils.js`, related `.js` files). If you touch them, prefer migrating to strictly typed TypeScript rather than extending JavaScript further.
