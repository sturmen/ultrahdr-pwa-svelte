/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagnosticsRecorder } from '../diagnostics.ts';

function createMemoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key) ?? null : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(String(key), String(value));
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(String(key));
    }),
    clear: vi.fn(() => {
      data.clear();
    }),
  };
}

function createRuntime() {
  const localStorage = createMemoryStorage();
  const runtime = {
    localStorage,
    navigator: {
      userAgent: 'UnitTestAgent/1.0',
    },
  } as typeof globalThis & {
    localStorage: Storage;
    __ultrahdrDiagnosticsRecorder?: DiagnosticsRecorder;
  };
  return runtime;
}

describe('diagnostics-events', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('records queue breadcrumbs with stable names and normalized payloads', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordQueueDiagnostics(runtime, {
      type: 'start-requested',
      queueLength: 3,
      runnerState: 'idle',
      currentQueueId: null,
      reason: 'start-queue',
    });

    const events = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      category: 'pipeline',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.queue.startRequested,
      severity: 'info',
      context: {
        queueLength: 3,
        runnerState: 'idle',
        currentQueueId: null,
        reason: 'start-queue',
      },
    });
  });

  it('records lifecycle breadcrumbs with bounded payload shaping', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordLifecycleDiagnostics(runtime, {
      type: 'recovered-popup-suppressed',
      reason: 'under-test-mode',
      reportId: '',
      memoryIssueKind: undefined,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'lifecycle',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.lifecycle.recoveredPopupSuppressed,
      severity: 'info',
      context: {
        reason: 'under-test-mode',
        reportId: null,
        memoryIssueKind: null,
      },
    });
  });

  it('records runtime-init failure breadcrumbs with stable error categorization fields', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordRuntimeInitDiagnostics(runtime, {
      type: 'jpegli-startup-bootstrap-blocked',
      attempt: 2,
      online: true,
      bundleState: 'READY',
      bundleVersion: 'bundle-v1',
      errorCategory: 'wasm-init-failed',
      repairAttempted: true,
      repairReady: true,
      trigger: 'startup-init',
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'error',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupBootstrapBlocked,
      severity: 'error',
      context: {
        attempt: 2,
        online: true,
        bundleState: 'READY',
        bundleVersion: 'bundle-v1',
        errorCategory: 'wasm-init-failed',
        repairAttempted: true,
        repairReady: true,
        trigger: 'startup-init',
      },
    });
  });

  it('records runtime-asset failure breadcrumbs with truncated messages', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordRuntimeAssetDiagnostics(runtime, {
      type: 'jpegli-loader-failed',
      trigger: 'module-load',
      message: 'x'.repeat(250),
      assetId: 'jpegli-wasm-bin',
      versionKind: 'wasm',
      cacheName: 'uhdr-wasm-assets-runtime-bundle',
      cacheSource: 'network',
      byteLength: 4096,
      errorCategory: 'asset-fetch-failed',
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'error',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.runtimeAsset.jpegliLoaderFailed,
      severity: 'error',
      context: {
        trigger: 'module-load',
        assetId: 'jpegli-wasm-bin',
        versionKind: 'wasm',
        cacheName: 'uhdr-wasm-assets-runtime-bundle',
        cacheSource: 'network',
        byteLength: 4096,
        errorCategory: 'asset-fetch-failed',
      },
    });
    expect((event.context.message as string).length).toBe(200);
  });

  it('records pipeline breadcrumbs through the typed helper without changing the public phase name', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordPipelineDiagnostics(runtime, {
      type: 'pipeline-breadcrumb',
      phase: 'stage-progress',
      severity: 'info',
      pipelineId: 'pipe-1',
      stage: 'encode-sdr-to-jpeg',
      substage: 'encode-init',
      note: 'Encoding SDR JPEG 52%',
      stageProgress: 52,
      fileIndex: 0,
      totalFiles: 1,
      elapsedMs: 321,
      processingPath: 'preserved',
      gmnetExecutionProvider: null,
      gmnetMemoryMode: null,
      gmnetCheckpointTilesCompleted: null,
      gmnetCheckpointTilesTotal: null,
      gmnetCheckpointResumed: null,
      error: null,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'pipeline',
      name: 'stage-progress',
      severity: 'info',
      context: {
        pipelineId: 'pipe-1',
        stage: 'encode-sdr-to-jpeg',
        substage: 'encode-init',
        note: 'Encoding SDR JPEG 52%',
        stageProgress: 52,
      },
    });
  });
});
