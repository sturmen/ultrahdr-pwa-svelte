# Agent Index

## Task Router

| Task | Look Here First | Tests To Run First |
| --- | --- | --- |
| processing pipeline bug | `src/lib/processing.ts`, `src/lib/processing-route-plan.ts`, `src/lib/processing-core.ts` | `npm test`, then the nearest targeted integration or e2e command |
| offline/runtime issue | `src/lib/processing.ts`, `src/lib/runtime-init-policy.ts`, `src/lib/runtime-cache-policy.ts` | `npm test`, `npm run test:e2e -- --grep offline` if the change is browser-observable |
| runtime asset loading / wasm bootstrap | `src/lib/runtime-assets.ts`, `src/lib/runtime-asset-definitions.ts`, `src/lib/runtime-bundle-asset-map.ts`, loader-specific `src/lib/*wasm*.ts` | `npm test`, targeted loader tests, `npm run build` |
| diagnostics breadcrumb contract | `src/lib/diagnostics-events.ts`, `src/lib/diagnostics.ts`, emitter-specific modules like `ImageProcessor.svelte` and `runtime-initialization.ts` | `npm test`, `npm run typecheck`, `npm run build` |
| PWA/service worker | `src/sw.ts`, `src/lib/offline-runtime-bundle.ts`, `src/lib/share-store.ts` | `npm test`, `npm run test:e2e` |
| GMNet/model/runtime | `src/lib/gmnet-session.ts`, `src/lib/gain-map-generator.ts`, `src/lib/runtime-capability-policy.ts` | `npm test`, `npm run test:integration:heic-real` or `npm run test:e2e:chromium` when runtime behavior changes |
| Playwright regression | `tests/e2e/ultrahdr.spec.ts`, `tests/e2e/offline.spec.ts`, `tests/e2e/mobile.spec.ts` | the smallest matching Playwright command, then full `npm run test:e2e` |
| build/versioning | `scripts/build-app-version.ts`, `scripts/build-runtime-bundle-manifest.ts`, `vite.config.ts` | `npm run build`, `npm run typecheck`, `npm test` |

## Where To Look First

- App startup and initialization UI: `src/App.svelte`, `src/lib/InitializationGate.svelte`
- PWA update snackbar UI: `src/App.svelte`, `src/lib/PwaUpdateSnackbar.svelte`
- Main user flow and conversion UI: `src/lib/ImageProcessor.svelte`
- Mobile floating settings action: `src/lib/ImageProcessor.svelte`, `src/lib/FloatingSettingsButton.svelte`
- Queue runner and reducer selectors: `src/lib/workflow-state.ts`
- Queue launch / processing dedupe: `src/lib/queue-processing-lease.ts`, `src/lib/ImageProcessor.svelte`
- Queue-scoped runtime process dedupe: `src/lib/processing.ts`, `src/lib/ImageProcessor.svelte`, `src/lib/diagnostics-events.ts`
- Worker fallback skip after pipeline start: `src/lib/processing.ts`, `src/lib/worker-job-protocol.ts`, `src/lib/diagnostics-events.ts`
- Verbose duplicate-processing trace breadcrumbs: `src/lib/processing.ts`, `src/lib/processing-core.ts`, `src/lib/diagnostics-events.ts`
- Legacy gain-map import vs strict UltraHDR metadata: `src/lib/gain-map-metadata.ts`, `src/lib/processing-core.ts`, `src/lib/__tests__/gain-map-metadata.test.ts`, `src/lib/__tests__/processing-preservation.test.ts`
- MobileSafari worker re-evaluation investigation note: `docs/investigations/mobile-safari-worker-module-reevaluation.md`
- Runtime orchestration and fallback: `src/lib/processing.ts`, `src/lib/runtime-orchestrator.ts`
- Diagnostics and telemetry: `src/lib/diagnostics.ts`, `src/lib/pipeline-telemetry.ts`, `src/lib/storage-diagnostics.ts`
- Typed diagnostics helpers and event-name contract: `src/lib/diagnostics-events.ts`
- Manual-only recovered diagnostics dialog behavior: `src/lib/ImageProcessor.svelte`, `src/lib/diagnostics-events.ts`
- Share target behavior: `src/lib/share-target-launch.js`, `src/lib/share-store.ts`
- Low-memory iPhone artifact retention: `src/lib/share-store.ts`, `src/lib/ImageProcessor.svelte`, `src/lib/diagnostics-events.ts`
- HDR intent peak-memory release (MobileSafari): `src/lib/hdr-intent-source-release.ts`, `src/lib/processing-core.ts`, `src/lib/heif-hdr-processing.ts`, `src/lib/diagnostics-events.ts` — emits `hdr-intent-source-released`, `hdr-intent-format-downgraded`
- GMNet tiled peak-memory release: `src/lib/gmnet-tile-memory.ts`, `src/lib/gmnet-session.ts`, `src/lib/diagnostics-events.ts` — emits `gmnet-source-image-released`; low-memory tier clamps tileInputSize to 384 and reuses a single weight/accum pair
- Encode-phase peak-memory release (MobileSafari Round 2): `src/lib/sdr-pixel-source-release.ts`, `src/lib/gmnet-gain-map-source-release.ts`, `src/lib/compressed-payload-release.ts`, `src/lib/processing-core.ts`, `src/lib/diagnostics-events.ts` — emits `sdr-pixel-source-released`, `gmnet-gain-map-source-released`, `compressed-payload-released`; zeros rotated SDR / GMNet gain-map RGBA and compressed base/gain-map/EXIF JPEG buffers after libultrahdr setters copy into wasm heap
- First-launch-after-update runtime warmup: `src/lib/runtime-post-update-warmup.ts`, `src/App.svelte`, `src/lib/diagnostics-events.ts`
- Real Safari/Appium file injection under test mode: `src/lib/ImageProcessor.svelte`, `src/lib/image-processor-gate.ts`, `src/lib/diagnostics-events.ts`
- Offline bundle and caching: `src/sw.ts`, `src/lib/offline-runtime-bundle.ts`, `src/lib/runtime-bundle-asset-map.ts`
- Shared runtime asset inventory and fetch plumbing: `src/lib/runtime-assets.ts`, `src/lib/runtime-asset-definitions.ts`; every current and future runtime asset should be declared there and loaded through the shared fetch/cache helpers before any feature-specific loader uses it.
- Repo fixture inputs: `fixtures/` for test assets, `media/` for README/demo assets only

## Scan Discipline

- Read [AGENTS.md](../AGENTS.md), [agent-context.md](./agent-context.md), and [agent-change-checklist.md](./agent-change-checklist.md) before broad repo scans.
- Prefer targeted reads of the files listed above over recursive scans across `src/`.
- Ignore vendor/generated trees unless the task explicitly names native, wasm, or third-party build behavior.
