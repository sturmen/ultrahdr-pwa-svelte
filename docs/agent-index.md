# Agent Index

## Task Router

| Task | Look Here First | Tests To Run First |
| --- | --- | --- |
| processing pipeline bug | `src/lib/processing.ts`, `src/lib/processing-route-plan.ts`, `src/lib/processing-core.ts` | `npm test`, then the nearest targeted integration or e2e command |
| offline/runtime issue | `src/lib/processing.ts`, `src/lib/runtime-init-policy.ts`, `src/lib/runtime-cache-policy.ts` | `npm test`, `npm run test:e2e -- --grep offline` if the change is browser-observable |
| runtime asset loading / wasm bootstrap | `src/lib/runtime-assets.ts`, `src/lib/runtime-asset-definitions.ts`, `src/lib/runtime-bundle-asset-map.ts`, loader-specific `src/lib/*wasm*.ts` | `npm test`, targeted loader tests, `npm run build` |
| PWA/service worker | `src/sw.ts`, `src/lib/offline-runtime-bundle.ts`, `src/lib/share-store.ts` | `npm test`, `npm run test:e2e` |
| GMNet/model/runtime | `src/lib/gmnet-session.ts`, `src/lib/gain-map-generator.ts`, `src/lib/runtime-capability-policy.ts` | `npm test`, `npm run test:integration:heic-real` or `npm run test:e2e:chromium` when runtime behavior changes |
| Playwright regression | `tests/e2e/ultrahdr.spec.ts`, `tests/e2e/offline.spec.ts`, `tests/e2e/mobile.spec.ts` | the smallest matching Playwright command, then full `npm run test:e2e` |
| build/versioning | `scripts/build-app-version.ts`, `scripts/build-runtime-bundle-manifest.ts`, `vite.config.ts` | `npm run build`, `npm run typecheck`, `npm test` |

## Where To Look First

- App startup and initialization UI: `src/App.svelte`, `src/lib/InitializationGate.svelte`
- Main user flow and conversion UI: `src/lib/ImageProcessor.svelte`
- Queue runner and reducer selectors: `src/lib/workflow-state.ts`
- Runtime orchestration and fallback: `src/lib/processing.ts`, `src/lib/runtime-orchestrator.ts`
- Diagnostics and telemetry: `src/lib/diagnostics.ts`, `src/lib/pipeline-telemetry.ts`, `src/lib/storage-diagnostics.ts`
- Share target behavior: `src/lib/share-target-launch.js`, `src/lib/share-store.ts`
- Offline bundle and caching: `src/sw.ts`, `src/lib/offline-runtime-bundle.ts`, `src/lib/runtime-bundle-asset-map.ts`
- Shared runtime asset inventory and fetch plumbing: `src/lib/runtime-assets.ts`, `src/lib/runtime-asset-definitions.ts`
- Repo fixture inputs: `fixtures/` for test assets, `media/` for README/demo assets only

## Scan Discipline

- Read [AGENTS.md](../AGENTS.md), [agent-context.md](./agent-context.md), and [agent-change-checklist.md](./agent-change-checklist.md) before broad repo scans.
- Prefer targeted reads of the files listed above over recursive scans across `src/`.
- Ignore vendor/generated trees unless the task explicitly names native, wasm, or third-party build behavior.
