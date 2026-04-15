# Agent Context

## Purpose

`ultrahdr-pwa-svelte` is an offline-first Svelte PWA that converts SDR, UltraHDR JPEG, HEIC/HEIF, TIFF, and HDR-intent inputs into UltraHDR JPEG output. The app runs locally in the browser, uses GMNet through ONNX Runtime for generated gain maps, and prefers preserved source gain maps when available.

## Constraints

- Follow strict TDD: write a failing test first, confirm the failure reason, then add the smallest implementation needed.
- Preserve offline-first behavior. Online-only behavior is degraded or optional.
- Do not introduce canvas-based rendering unless the user explicitly asks for an exception.
- Prefer strictly typed TypeScript for app code, tooling, tests, and config.
- Treat diagnostics breadcrumbs as part of the observable contract for user-visible flows and processing-significant state transitions.
- If a task changes architecture, commands, or file ownership, update these agent docs in the same change.

## Top-Level Modules

- `src/App.svelte`: app shell, view routing, share-target launch handling, PWA update state, runtime initialization UI.
- `src/lib/ImageProcessor.svelte`: main conversion UI and user-facing processing flow.
- `src/lib/workflow-state.ts`: reducer-backed queue/domain state, including the single queue-runner claim/launch/settle authority consumed by `ImageProcessor.svelte`.
- `src/lib/processing.ts`: runtime initialization pipeline, worker/main-thread fallback, inference heartbeat tracking, runtime failure persistence.
- `src/lib/runtime-orchestrator.ts`: compact runtime state-machine orchestrator used for adapter-based initialization and processing.
- `src/lib/runtime-*.ts`: initialization policy, cache policy, planner, reducer, state machine, capability detection, and runtime contract types.
- `src/lib/runtime-assets.ts`, `src/lib/runtime-asset-definitions.ts`: shared offline-first runtime asset descriptors, versioned URL resolution, fetch/cache fallback, and loader diagnostics context for WASM/module assets.
- `src/lib/processing-*.ts`: route planning, progress, queueing, preferences, runtime reducer, worker protocol, and processing route types.
- `src/lib/diagnostics.ts`, `src/lib/pipeline-telemetry.ts`, `src/lib/storage-diagnostics.ts`: structured breadcrumb and diagnostics surface.
- `src/sw.ts`: Workbox service worker, offline runtime bundle validation, repair, and cache management.
- `fixtures/`: repo-owned test fixtures for unit, integration, and e2e coverage.
- `media/`: README/demo assets only; do not add test fixtures here.
- `tests/e2e/*.spec.ts`: browser and offline regression coverage.
- `scripts/*.ts`: build metadata and runtime bundle manifest generation.

## Key Runtime Flows

- Startup flow: `src/App.svelte` creates the processing runtime, runs the initialization gate, loads `ImageProcessor.svelte` lazily, and records diagnostics for failures and degraded modes.
- Processing flow: `src/lib/processing.ts` decides worker or main-thread execution, ensures the runtime bundle is ready, tracks initialization/inference progress, and persists failure traces for offline debugging.
- Adapter orchestration flow: `src/lib/runtime-orchestrator.ts` coordinates initialization and processing through worker and main-thread adapters with explicit fallback behavior.
- Offline bundle flow: `src/sw.ts` precaches app assets, validates the runtime bundle manifest, repairs corrupted caches, and answers bundle-management messages from the app.
- Runtime asset loading flow: `src/lib/runtime-assets.ts` and `src/lib/runtime-asset-definitions.ts` provide the canonical runtime asset inventory used by wasm/module loaders, the manifest builder, cache-name resolution, and service-worker bundle classification.
- Share target flow: `src/lib/share-target-launch.js` and `src/lib/share-store.ts` recover files launched through the installed PWA.
- Queue runner flow: `src/lib/workflow-state.ts` owns queue start, claim, launch, settle, and restart intent; `ImageProcessor.svelte` is the thin imperative shell that dispatches those transitions and invokes `runtime.process(...)`.

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
