/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import {
  DIAGNOSTICS_ACTIVE_SESSION_KEY,
  DIAGNOSTICS_REPORTS_KEY,
} from '../diagnostics.ts';

const diagnosticsMocks = vi.hoisted(() => ({
  runtimeProcessMock: vi.fn(),
}));

vi.mock('../capabilities.js', () => ({
  getCapabilities: vi.fn(() => ({
    userAgent: 'test-agent',
    deviceMemory: 8,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isStandalone: false,
    supportsShare: true,
    supportsFileShare: false,
    supportsShareTarget: true,
    supportsWakeLock: false,
    supportsOffscreenWorker: true,
  })),
}));

import ImageProcessor from '../ImageProcessor.svelte';

function createRuntime() {
  return {
    process: diagnosticsMocks.runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

describe('ImageProcessor diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
    Object.defineProperty(window.navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    });
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(async () => {}),
      },
    });
  });

  it('opens a manual debug report modal from settings and shares the report', async () => {
    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await fireEvent.click(screen.getByTestId('floating-gear'));
    await fireEvent.click(screen.getByTestId('open-debug-report'));

    const dialog = await screen.findByTestId('diagnostics-report-dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/diagnostics timeline/i)).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('diagnostics-share'));

    expect(window.navigator.share).toHaveBeenCalledTimes(1);
  });

  it('includes offline-readiness validation details in the manual diagnostics report', async () => {
    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
        pwaUpdateState: {
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
            missingAssetIds: ['gmnet-weights'],
            mismatchedAssetIds: ['jpegli-wasm'],
          },
        },
      },
    });

    await fireEvent.click(screen.getByTestId('floating-gear'));
    await fireEvent.click(screen.getByTestId('open-debug-report'));

    const textarea = await screen.findByLabelText(/diagnostics timeline/i);
    const reportText = (textarea as HTMLTextAreaElement).value;
    expect(reportText).toContain('"offlineReadiness"');
    expect(reportText).toContain('"bundleState": "FAILED"');
    expect(reportText).toContain('"offlineBundleActionError": "Network unreachable"');
    expect(reportText).toContain('"bundleError": "Manifest fetch failed"');
    expect(reportText).toContain('"missingAssetCount": 2');
    expect(reportText).toContain('"mismatchedAssetCount": 1');
  });

  it('opens the diagnostics modal automatically when processing fails with a memory allocation error', async () => {
    diagnosticsMocks.runtimeProcessMock.mockRejectedValue(
      new Error('Failed to allocate memory for JPEG input'),
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['input'], 'memory-problem.jpg', { type: 'image/jpeg' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('diagnostics-report-dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/possible memory issue/i)).toBeInTheDocument();
    expect(screen.getByText(/allocation-failure/i)).toBeInTheDocument();
  });

  it('persists a sanitized recovery snapshot while stage progress is in flight', async () => {
    let releaseProcessing!: () => void;
    diagnosticsMocks.runtimeProcessMock.mockImplementationOnce(
      async (_file: File, options: Record<string, unknown> = {}) => {
        const onProgress = options.onProgress as ((event: Record<string, unknown>) => void) | undefined;
        onProgress?.({
          phase: 'stage-progress',
          stage: 'generate-gain-map',
          stageProgress: 62.5,
          gmnetExecutionProvider: 'webgpu',
          gmnetCheckpointTilesCompleted: 5,
          gmnetCheckpointTilesTotal: 8,
          fileName: 'private-photo.jpg',
        });

        await new Promise<void>((resolve) => {
          releaseProcessing = resolve;
        });

        return new Blob(['output'], { type: 'image/jpeg' });
      },
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['input-bytes'], 'private-photo.jpg', { type: 'image/jpeg' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(diagnosticsMocks.runtimeProcessMock).toHaveBeenCalledTimes(1);
      const persisted = JSON.parse(
        window.localStorage.getItem(DIAGNOSTICS_ACTIVE_SESSION_KEY) || 'null',
      ) as Record<string, unknown> | null;
      expect(persisted?.processingSnapshot).toEqual(
        expect.objectContaining({
          currentQueueId: 0,
          queueIndex: 0,
          totalFiles: 1,
          currentStage: 'generate-gain-map',
          currentPhase: 'stage-progress',
          stageProgress: 62.5,
          pipelineExecutionProvider: 'webgpu',
          gmnetCheckpointTilesCompleted: 5,
          gmnetCheckpointTilesTotal: 8,
          inputFile: expect.objectContaining({
            mimeType: 'image/jpeg',
            fileSize: 11,
          }),
        }),
      );
      expect(persisted?.processingSnapshot).not.toHaveProperty('originalFileName');
      expect(JSON.stringify(persisted?.processingSnapshot || {})).not.toContain('private-photo.jpg');
    });

    releaseProcessing();
  });

  it('records stage breadcrumbs on the main thread and persists the latest substage into recovery state', async () => {
    let releaseProcessing!: () => void;
    diagnosticsMocks.runtimeProcessMock.mockImplementationOnce(
      async (_file: File, options: Record<string, unknown> = {}) => {
        const onProgress = options.onProgress as ((event: Record<string, unknown>) => void) | undefined;
        onProgress?.({
          phase: 'stage-start',
          stage: 'preprocess-file',
          stageProgress: 0,
          note: 'Preparing input',
          elapsedMs: 120,
          fileName: 'private-photo.heic',
        });
        onProgress?.({
          phase: 'stage-progress',
          stage: 'preprocess-file',
          stageProgress: 35,
          substage: 'heif-primary-decode-started',
          note: 'Decoding primary HEIF image',
          elapsedMs: 275,
          fileName: 'private-photo.heic',
        });

        await new Promise<void>((resolve) => {
          releaseProcessing = resolve;
        });

        return new Blob(['output'], { type: 'image/jpeg' });
      },
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['input-bytes'], 'private-photo.heic', { type: 'image/heif' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      const persisted = JSON.parse(
        window.localStorage.getItem(DIAGNOSTICS_ACTIVE_SESSION_KEY) || 'null',
      ) as { processingSnapshot?: Record<string, unknown> } | null;
      expect(persisted?.processingSnapshot).toEqual(
        expect.objectContaining({
          currentStage: 'preprocess-file',
          currentPhase: 'stage-progress',
          currentSubstage: 'heif-primary-decode-started',
          currentNote: 'Decoding primary HEIF image',
          currentElapsedMs: 275,
          recentPipelineBreadcrumbs: [
            {
              phase: 'stage-start',
              stage: 'preprocess-file',
              substage: null,
              note: 'Preparing input',
              stageProgress: 0,
              elapsedMs: 120,
            },
            {
              phase: 'stage-progress',
              stage: 'preprocess-file',
              substage: 'heif-primary-decode-started',
              note: 'Decoding primary HEIF image',
              stageProgress: 35,
              elapsedMs: 275,
            },
          ],
        }),
      );

      const persistedReports = JSON.parse(
        window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
      ) as { events: Array<Record<string, unknown>> };
      expect(persistedReports.events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: 'pipeline',
            name: 'stage-start',
            context: expect.objectContaining({
              stage: 'preprocess-file',
              note: 'Preparing input',
            }),
          }),
          expect.objectContaining({
            category: 'pipeline',
            name: 'stage-progress',
            context: expect.objectContaining({
              stage: 'preprocess-file',
              substage: 'heif-primary-decode-started',
              note: 'Decoding primary HEIF image',
            }),
          }),
        ]),
      );
    });

    releaseProcessing();
  });

  it('suppresses the recovered diagnostics popup while the explicit under-test flag is enabled', async () => {
    window.localStorage.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId: 'session-under-test',
        active: true,
        cleanExit: false,
        processingSnapshot: {
          currentQueueId: 1,
          currentStage: 'generate-gain-map',
        },
      }),
    );
    Object.defineProperty(window, '__ULTRAHDR_UNDER_TEST__', {
      configurable: true,
      value: true,
    });

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('diagnostics-report-dialog')).not.toBeInTheDocument();
    });
  });
});
