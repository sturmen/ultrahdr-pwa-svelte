/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DIAGNOSTICS_ACTIVE_SESSION_KEY,
  DIAGNOSTICS_REPORTS_KEY,
  createDiagnosticsRecorder,
  buildMemoryDiagnosticsReport,
  classifyMemoryIssue,
  consumeRecoveredDiagnosticsReport,
  shareDiagnosticsReport,
} from '../diagnostics.ts';

describe('diagnostics', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('records a bounded ordered diagnostics timeline and persists critical context', () => {
    const recorder = createDiagnosticsRecorder(window, {
      maxEvents: 3,
      persistKey: '__test_diagnostics__',
    });

    recorder.record({
      category: 'user',
      name: 'app-opened',
      severity: 'info',
      context: { source: 'test' },
    });
    recorder.record({
      category: 'pipeline',
      name: 'pipeline-start',
      severity: 'info',
      context: { fileIndex: 0 },
    });
    recorder.record({
      category: 'pipeline',
      name: 'stage-start',
      severity: 'info',
      context: { stage: 'generate-gain-map' },
    });
    recorder.record({
      category: 'error',
      name: 'allocation-failure',
      severity: 'error',
      context: { message: 'memory allocation failed' },
      preserve: true,
    });

    const events = recorder.getEvents();
    expect(events).toHaveLength(3);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3]);
    expect(events[2]).toEqual(
      expect.objectContaining({
        category: 'error',
        name: 'allocation-failure',
      }),
    );

    expect(JSON.parse(window.localStorage.getItem('__test_diagnostics__') || '{}')).toEqual(
      expect.objectContaining({
        events: expect.arrayContaining([
          expect.objectContaining({ name: 'allocation-failure' }),
        ]),
      }),
    );
  });

  it('builds a shareable memory diagnostics report from recorded state and classifies memory failures', () => {
    const recorder = createDiagnosticsRecorder(window, {
      persistKey: '__test_report__',
    });
    recorder.record({
      category: 'user',
      name: 'files-added',
      severity: 'info',
      context: { fileCount: 2 },
    });
    recorder.record({
      category: 'pipeline',
      name: 'gmnet-tile-progress',
      severity: 'info',
      context: {
        stage: 'generate-gain-map',
        gmnetCheckpointTilesCompleted: 24,
        gmnetCheckpointTilesTotal: 64,
      },
    });

    const issue = classifyMemoryIssue(new Error('Failed to allocate memory for JPEG input'));
    const report = buildMemoryDiagnosticsReport('auto', {
      runtime: window,
      recorder,
      incident: issue,
      context: {
        currentStage: 'generate-gain-map',
        fileCount: 2,
      },
    });

    expect(issue).toEqual(
      expect.objectContaining({
        memoryIssueKind: 'allocation-failure',
        confidence: 'high',
      }),
    );
    expect(report).toEqual(
      expect.objectContaining({
        trigger: 'auto',
        incident: expect.objectContaining({
          memoryIssueKind: 'allocation-failure',
        }),
        recentEvents: expect.arrayContaining([
          expect.objectContaining({ name: 'files-added' }),
          expect.objectContaining({ name: 'gmnet-tile-progress' }),
        ]),
      }),
    );
    expect(report.processing).toEqual(
      expect.objectContaining({
        currentStage: 'generate-gain-map',
      }),
    );
  });

  it('classifies a recovered interrupted processing session as foreground when no background evidence exists', () => {
    window.localStorage.setItem(
      DIAGNOSTICS_REPORTS_KEY,
      JSON.stringify({
        events: [
          {
            eventId: 'evt-1',
            sessionId: 'session-1',
            sequence: 0,
            timestamp: 123,
            category: 'pipeline',
            name: 'stage-start',
            severity: 'info',
            context: { stage: 'generate-gain-map' },
          },
        ],
      }),
    );
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-1',
        active: true,
        processingActiveAtLastPersist: true,
        stage: 'generate-gain-map',
        queueId: 4,
        cleanExit: false,
        processingSnapshot: {
          currentQueueId: 4,
          currentStage: 'generate-gain-map',
          documentHidden: false,
          lastPageHideAt: null,
          recentPipelineBreadcrumbs: [],
        },
      }),
    );

    const report = consumeRecoveredDiagnosticsReport(window);

    expect(report).toEqual(
      expect.objectContaining({
        trigger: 'recovered-after-relaunch',
        incident: expect.objectContaining({
          memoryIssueKind: 'foreground-kill-recovered',
        }),
        processing: expect.objectContaining({
          currentStage: 'generate-gain-map',
          currentQueueId: 4,
        }),
        recentEvents: expect.arrayContaining([
          expect.objectContaining({
            category: 'lifecycle',
            name: 'recovery-classified-foreground',
          }),
        ]),
      }),
    );
  });

  it('classifies a recovered interrupted processing session as background when hidden lifecycle evidence exists', () => {
    window.localStorage.setItem(
      DIAGNOSTICS_REPORTS_KEY,
      JSON.stringify({
        events: [],
      }),
    );
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-1',
        active: true,
        processingActiveAtLastPersist: true,
        stage: 'generate-gain-map',
        queueId: 4,
        cleanExit: false,
        updatedAt: 2000,
        processingSnapshot: {
          currentQueueId: 4,
          currentStage: 'generate-gain-map',
          documentHidden: true,
          lastPageHideAt: 1990,
          recentPipelineBreadcrumbs: [],
        },
      }),
    );

    const report = consumeRecoveredDiagnosticsReport(window);

    expect(report).toEqual(
      expect.objectContaining({
        incident: expect.objectContaining({
          memoryIssueKind: 'background-kill-recovered',
        }),
        recentEvents: expect.arrayContaining([
          expect.objectContaining({
            category: 'lifecycle',
            name: 'recovery-classified-background',
          }),
        ]),
      }),
    );
  });

  it('recovers a probable foreground post-completion restart when relaunch happens shortly after completion without pagehide evidence', () => {
    vi.spyOn(Date, 'now').mockReturnValue(5000);
    window.localStorage.setItem(
      DIAGNOSTICS_REPORTS_KEY,
      JSON.stringify({
        events: [],
      }),
    );
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-post-complete',
        active: false,
        processingActiveAtLastPersist: false,
        cleanExit: true,
        updatedAt: 4500,
        recentProcessingCompletionAt: 4500,
        processingSnapshot: {
          currentQueueId: 0,
          queueIndex: 0,
          totalFiles: 1,
          currentStage: 'complete',
          currentPhase: 'pipeline-complete',
          documentHidden: false,
          lastPageHideAt: null,
          recentPipelineBreadcrumbs: [],
        },
      }),
    );

    const report = consumeRecoveredDiagnosticsReport(window);

    expect(report).toEqual(
      expect.objectContaining({
        trigger: 'recovered-after-relaunch',
        incident: expect.objectContaining({
          memoryIssueKind: 'foreground-kill-recovered',
          message: expect.stringMatching(/after processing completed/i),
        }),
        recentEvents: expect.arrayContaining([
          expect.objectContaining({
            category: 'lifecycle',
            name: 'post-completion-relaunch-classified',
            context: expect.objectContaining({
              documentHidden: false,
              lastPageHideAt: null,
              hadPendingAppUpdate: false,
            }),
          }),
          expect.objectContaining({
            category: 'lifecycle',
            name: 'foreground-restart-without-pagehide',
          }),
          expect.objectContaining({
            category: 'lifecycle',
            name: 'post-completion-restart-suspected',
          }),
        ]),
      }),
    );
  });

  it('does not recover a stale post-completion restart marker', () => {
    vi.spyOn(Date, 'now').mockReturnValue(20000);
    window.localStorage.setItem(
      DIAGNOSTICS_REPORTS_KEY,
      JSON.stringify({
        events: [],
      }),
    );
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-post-complete',
        active: false,
        processingActiveAtLastPersist: false,
        cleanExit: true,
        updatedAt: 5000,
        recentProcessingCompletionAt: 5000,
        processingSnapshot: {
          currentQueueId: 0,
          queueIndex: 0,
          totalFiles: 1,
          currentStage: 'complete',
          currentPhase: 'pipeline-complete',
          documentHidden: false,
          lastPageHideAt: null,
          recentPipelineBreadcrumbs: [],
        },
      }),
    );

    expect(consumeRecoveredDiagnosticsReport(window)).toBeNull();
  });

  it('does not recover a diagnostics report when the persisted session was idle', () => {
    window.localStorage.setItem(
      DIAGNOSTICS_REPORTS_KEY,
      JSON.stringify({
        events: [
          {
            eventId: 'evt-1',
            sessionId: 'session-1',
            sequence: 0,
            timestamp: 123,
            category: 'lifecycle',
            name: 'pagehide',
            severity: 'warning',
            context: { workflowState: 'empty' },
          },
        ],
      }),
    );
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-1',
        active: true,
        processingActiveAtLastPersist: false,
        stage: null,
        queueId: null,
        cleanExit: false,
      }),
    );

    expect(consumeRecoveredDiagnosticsReport(window)).toBeNull();
  });

  it('sanitizes persisted processing snapshots when recovering an interrupted session', () => {
    window.localStorage.setItem(
      DIAGNOSTICS_REPORTS_KEY,
      JSON.stringify({
        events: [],
      }),
    );
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-2',
        active: true,
        processingActiveAtLastPersist: true,
        cleanExit: false,
        processingSnapshot: {
          currentQueueId: 4,
          queueIndex: 1,
          totalFiles: 5,
          currentStage: 'generate-gain-map',
          currentPhase: 'stage-progress',
          currentSubstage: 'gmnet-tile-5',
          currentNote: 'Running gain map inference',
          currentElapsedMs: 1480,
          stageProgress: 62.5,
          pipelineExecutionProvider: 'webgpu',
          gmnetCheckpointTilesCompleted: 5,
          gmnetCheckpointTilesTotal: 8,
          gmnetCheckpointResumed: false,
          inputFile: {
            mimeType: 'image/jpeg',
            fileSize: 1048576,
            pixelWidth: 4032,
            pixelHeight: 3024,
          },
          recentPipelineBreadcrumbs: [
            {
              phase: 'stage-start',
              stage: 'generate-gain-map',
              substage: null,
              note: 'Preparing gain map model',
              stageProgress: 0,
              elapsedMs: 820,
            },
            {
              phase: 'stage-progress',
              stage: 'generate-gain-map',
              substage: 'gmnet-tile-5',
              note: 'Running gain map inference',
              stageProgress: 62.5,
              elapsedMs: 1480,
            },
          ],
          originalFileName: 'private-photo.jpg',
        },
      }),
    );

    const report = consumeRecoveredDiagnosticsReport(window);

    expect(report?.processing).toEqual(
      expect.objectContaining({
        currentQueueId: 4,
        queueIndex: 1,
        totalFiles: 5,
        currentStage: 'generate-gain-map',
        currentPhase: 'stage-progress',
        currentSubstage: 'gmnet-tile-5',
        currentNote: 'Running gain map inference',
        currentElapsedMs: 1480,
        stageProgress: 62.5,
        pipelineExecutionProvider: 'webgpu',
        gmnetCheckpointTilesCompleted: 5,
        gmnetCheckpointTilesTotal: 8,
        gmnetCheckpointResumed: false,
        inputFile: expect.objectContaining({
          mimeType: 'image/jpeg',
          fileSize: 1048576,
          pixelWidth: 4032,
          pixelHeight: 3024,
        }),
        recentPipelineBreadcrumbs: [
          {
            phase: 'stage-start',
            stage: 'generate-gain-map',
            substage: null,
            note: 'Preparing gain map model',
            stageProgress: 0,
            elapsedMs: 820,
          },
          {
            phase: 'stage-progress',
            stage: 'generate-gain-map',
            substage: 'gmnet-tile-5',
            note: 'Running gain map inference',
            stageProgress: 62.5,
            elapsedMs: 1480,
          },
        ],
      }),
    );
    expect(report?.processing).not.toHaveProperty('originalFileName');
    expect(JSON.stringify(report?.processing || {})).not.toContain('private-photo.jpg');
  });

  it('shares diagnostics text through the browser share intent when available', async () => {
    const recorder = createDiagnosticsRecorder(window, {
      persistKey: '__test_share__',
    });
    const shareMock = vi.fn(async () => {});
    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: shareMock,
    });
    Object.defineProperty(window.navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    });

    const report = buildMemoryDiagnosticsReport('manual', {
      runtime: window,
      recorder,
      context: { currentStage: 'idle' },
    });

    await shareDiagnosticsReport(report, window);

    expect(shareMock).toHaveBeenCalledTimes(1);
    expect(shareMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        title: 'MakeBetterJPEGs Diagnostics Report',
        text: expect.stringContaining('"trigger": "manual"'),
      }),
    );
  });

  it('includes a bounded offline-readiness snapshot when provided in diagnostics context', () => {
    const recorder = createDiagnosticsRecorder(window, {
      persistKey: '__test_offline_readiness__',
    });

    const report = buildMemoryDiagnosticsReport('manual', {
      runtime: window,
      recorder,
      context: {
        currentStage: 'idle',
        offlineReadiness: {
          offlineReady: false,
          bundleReady: false,
          bundleState: 'FAILED',
          bundleLastValidatedAt: 1710000000000,
          offlineReadinessAction: 'validate',
          offlineBundleActionInFlight: false,
          offlineBundleActionError: 'Network unreachable',
          bundleError: 'Manifest fetch failed',
          offlineBundleAssetCount: 26,
          offlineBundleTotalBytes: 123456789,
          bundleDiagnostics: {
            missingAssetCount: 2,
            mismatchedAssetCount: 1,
            missingAssetIds: ['gmnet-weights', 'runtime-manifest'],
            mismatchedAssetIds: ['jpegli-wasm'],
            fetchAttempts: [{ id: 'should-not-survive' }],
          },
          cachedManifest: { should: 'not survive' },
        },
      },
    });

    expect(report.processing).toEqual(
      expect.objectContaining({
        currentStage: 'idle',
        offlineReadiness: {
          offlineReady: false,
          bundleReady: false,
          bundleState: 'FAILED',
          bundleLastValidatedAt: 1710000000000,
          offlineReadinessAction: 'validate',
          offlineBundleActionInFlight: false,
          offlineBundleActionError: 'Network unreachable',
          bundleError: 'Manifest fetch failed',
          offlineBundleAssetCount: 26,
          offlineBundleTotalBytes: 123456789,
          bundleDiagnostics: {
            missingAssetCount: 2,
            mismatchedAssetCount: 1,
            missingAssetIds: ['gmnet-weights', 'runtime-manifest'],
            mismatchedAssetIds: ['jpegli-wasm'],
          },
        },
      }),
    );
    expect(
      JSON.stringify((report.processing as Record<string, unknown>).offlineReadiness),
    ).not.toContain('fetchAttempts');
    expect(
      JSON.stringify((report.processing as Record<string, unknown>).offlineReadiness),
    ).not.toContain('cachedManifest');
  });

  it('omits offline-readiness details when they are absent from diagnostics context', () => {
    const recorder = createDiagnosticsRecorder(window, {
      persistKey: '__test_offline_readiness_absent__',
    });

    const report = buildMemoryDiagnosticsReport('manual', {
      runtime: window,
      recorder,
      context: { currentStage: 'idle' },
    });

    expect(report.processing).toEqual(
      expect.objectContaining({
        currentStage: 'idle',
      }),
    );
    expect(report.processing).not.toHaveProperty('offlineReadiness');
  });
});
