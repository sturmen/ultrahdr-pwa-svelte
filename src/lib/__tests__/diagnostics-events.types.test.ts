import { expect, it } from 'vitest';
import type {
  QueueDiagnosticsEvent,
  RuntimeAssetDiagnosticsEvent,
  RuntimeInitDiagnosticsEvent,
} from '../diagnostics-events.ts';

const validQueueEvent: QueueDiagnosticsEvent = {
  type: 'start-requested',
  queueLength: 1,
  runnerState: 'idle',
  currentQueueId: null,
  reason: 'start-queue',
};

const validRuntimeInitEvent: RuntimeInitDiagnosticsEvent = {
  type: 'jpegli-startup-bootstrap-started',
  attempt: 1,
  online: true,
  trigger: 'startup-init',
};

const validRuntimeAssetEvent: RuntimeAssetDiagnosticsEvent = {
  type: 'jpegli-loader-ready',
  trigger: 'module-load',
  assetId: 'jpegli-wasm-bin',
  versionKind: 'wasm',
  cacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheSource: null,
  byteLength: null,
  errorCategory: null,
};

void validQueueEvent;
void validRuntimeInitEvent;
void validRuntimeAssetEvent;

// @ts-expect-error queue start events require queueLength
const invalidQueueEvent: QueueDiagnosticsEvent = {
  type: 'start-requested',
  runnerState: 'idle',
  currentQueueId: null,
  reason: 'start-queue',
};

// @ts-expect-error runtime asset failure events require a message
const invalidRuntimeAssetEvent: RuntimeAssetDiagnosticsEvent = {
  type: 'jpegli-loader-failed',
  trigger: 'module-load',
  assetId: 'jpegli-wasm-bin',
  versionKind: 'wasm',
  cacheName: 'uhdr-wasm-assets-runtime-bundle',
  cacheSource: 'network',
  byteLength: 1024,
  errorCategory: 'asset-fetch-failed',
};

void invalidQueueEvent;
void invalidRuntimeAssetEvent;

it('typechecks diagnostics event unions', () => {
  expect(true).toBe(true);
});
