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

  it('recovers a prior incomplete processing session as a shareable diagnostics report', () => {
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
        stage: 'generate-gain-map',
        queueId: 4,
        cleanExit: false,
      }),
    );

    const report = consumeRecoveredDiagnosticsReport(window);

    expect(report).toEqual(
      expect.objectContaining({
        trigger: 'recovered-after-relaunch',
        incident: expect.objectContaining({
          memoryIssueKind: 'background-kill-recovered',
        }),
        processing: expect.objectContaining({
          currentStage: 'generate-gain-map',
          currentQueueId: 4,
        }),
      }),
    );
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
        title: expect.stringContaining('UltraHDR'),
        text: expect.stringContaining('"trigger": "manual"'),
      }),
    );
  });
});
