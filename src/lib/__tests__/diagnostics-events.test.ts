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

  it('records runtime request dedupe breadcrumbs with a stable name', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordRuntimeDiagnostics(runtime, {
      type: 'process-request-deduplicated',
      processingRequestKey: 'queue:0',
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'runtime',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.runtime.processRequestDeduplicated,
      severity: 'info',
      context: {
        processingRequestKey: 'queue:0',
      },
    });
  });

  it('records skipped worker fallback breadcrumbs with a stable name', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordRuntimeDiagnostics(runtime, {
      type: 'worker-fallback-skipped-after-pipeline-start',
      errorName: 'ProcessingWorkerInitError',
      fallbackReason: 'worker-progress-already-started',
      pipelineStarted: true,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'runtime',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.runtime.workerFallbackSkippedAfterPipelineStart,
      severity: 'warning',
      context: {
        errorName: 'ProcessingWorkerInitError',
        fallbackReason: 'worker-progress-already-started',
        pipelineStarted: true,
      },
    });
  });

  it('records app-opened breadcrumbs with mount-count and prior-mount-count for reload inference', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordUserDiagnostics(runtime, {
      type: 'app-opened',
      launchSource: 'regular',
      mountCount: 2,
      priorMountCount: 1,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'user',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.user.appOpened,
      severity: 'info',
      context: {
        launchSource: 'regular',
        mountCount: 2,
        priorMountCount: 1,
      },
    });
  });

  it('records automation reset breadcrumbs with a stable name', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordUserDiagnostics(runtime, {
      type: 'automation-state-reset',
      queueLength: 0,
      resultCount: 0,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'user',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.user.automationStateReset,
      severity: 'info',
      context: {
        queueLength: 0,
        resultCount: 0,
      },
    });
  });

  it('records HDR-intent source-release breadcrumbs with bounded payload', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordProcessingMemoryDiagnostics(runtime, {
      type: 'hdr-intent-source-released',
      trigger: 'post-set-hdr-intent-image',
      sourceBytes: 48771072,
      format: 'rgba1010102',
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'memory',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.hdrIntentSourceReleased,
      severity: 'info',
      context: {
        trigger: 'post-set-hdr-intent-image',
        sourceBytes: 48771072,
        format: 'rgba1010102',
      },
    });
  });

  it('records HDR-intent format-downgrade breadcrumbs on low-memory tiers', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordProcessingMemoryDiagnostics(runtime, {
      type: 'hdr-intent-format-downgraded',
      fromFormat: 'rgbaf16',
      toFormat: 'rgba1010102',
      reason: 'low-memory-tier',
      memoryTier: 'low',
      bitsPerPixel: 12,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'memory',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.hdrIntentFormatDowngraded,
      severity: 'info',
      context: {
        fromFormat: 'rgbaf16',
        toFormat: 'rgba1010102',
        reason: 'low-memory-tier',
        memoryTier: 'low',
        bitsPerPixel: 12,
      },
    });
  });

  it('records GMNet source-image-released breadcrumbs after last tile step', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordProcessingMemoryDiagnostics(runtime, {
      type: 'gmnet-source-image-released',
      trigger: 'last-tile-completed',
      sourceBytes: 48771072,
      tileTotal: 24,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'memory',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.gmnetSourceImageReleased,
      severity: 'info',
      context: {
        trigger: 'last-tile-completed',
        sourceBytes: 48771072,
        tileTotal: 24,
      },
    });
  });

  it('records SDR-pixel source-release breadcrumbs with bounded payload', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordProcessingMemoryDiagnostics(runtime, {
      type: 'sdr-pixel-source-released',
      trigger: 'post-encode-sdr-to-jpeg',
      sourceBytes: 48771072,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'memory',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.sdrPixelSourceReleased,
      severity: 'info',
      context: {
        trigger: 'post-encode-sdr-to-jpeg',
        sourceBytes: 48771072,
      },
    });
  });

  it('records compressed-payload release breadcrumbs with kind and size', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordProcessingMemoryDiagnostics(runtime, {
      type: 'compressed-payload-released',
      trigger: 'post-set-compressed-payloads',
      kind: 'base-jpeg',
      sourceBytes: 12345678,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'memory',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.compressedPayloadReleased,
      severity: 'info',
      context: {
        trigger: 'post-set-compressed-payloads',
        kind: 'base-jpeg',
        sourceBytes: 12345678,
      },
    });
  });

  it('records GMNet gain-map source-release breadcrumbs after jpegli encode', async () => {
    const runtime = createRuntime();
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    diagnosticsEvents.recordProcessingMemoryDiagnostics(runtime, {
      type: 'gmnet-gain-map-source-released',
      trigger: 'post-encode-gain-map',
      sourceBytes: 48771072,
    });

    const event = diagnosticsEvents.getRecordedDiagnosticsEvents(runtime)[0];
    expect(event).toMatchObject({
      category: 'memory',
      name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.processingMemory.gmnetGainMapSourceReleased,
      severity: 'info',
      context: {
        trigger: 'post-encode-gain-map',
        sourceBytes: 48771072,
      },
    });
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
