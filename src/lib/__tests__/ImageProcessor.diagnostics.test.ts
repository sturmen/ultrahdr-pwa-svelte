/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import {
  DIAGNOSTICS_ACTIVE_SESSION_KEY,
  DIAGNOSTICS_REPORTS_KEY,
} from '../diagnostics.ts';
import {
  clearQueueState,
  clearSessionQueuePayloads,
  __resetShareStoreForTests,
} from '../share-store.ts';

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
  getProcessingProfile: vi.fn(() => ({
    memoryTier: 'mid',
  })),
}));

import ImageProcessor from '../ImageProcessor.svelte';
import { getCapabilities, getProcessingProfile } from '../capabilities.js';

function readPersistedDiagnosticsEvents(): Array<{ name?: string; context?: Record<string, unknown> }> {
  const persisted = JSON.parse(
    window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
  ) as { events?: Array<{ name?: string; context?: Record<string, unknown> }> };
  return Array.isArray(persisted.events) ? persisted.events : [];
}

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
    diagnosticsMocks.runtimeProcessMock.mockReset();
    diagnosticsMocks.runtimeProcessMock.mockResolvedValue(
      new Blob(['output'], { type: 'image/jpeg' }),
    );
    window.localStorage.clear();
    __resetShareStoreForTests();
    delete (window as typeof window & { __ultrahdrDiagnosticsRecorder?: unknown })
      .__ultrahdrDiagnosticsRecorder;
    delete (window as typeof window & { __ULTRAHDR_UNDER_TEST__?: boolean }).__ULTRAHDR_UNDER_TEST__;
    vi.mocked(getCapabilities).mockReturnValue({
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
    });
    vi.mocked(getProcessingProfile).mockReturnValue({ memoryTier: 'mid' });
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

  afterEach(async () => {
    await clearQueueState();
    await clearSessionQueuePayloads();
    delete (window as typeof window & { __ULTRAHDR_UNDER_TEST__?: boolean }).__ULTRAHDR_UNDER_TEST__;
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

  it('suppresses the diagnostics modal automatically when processing fails with a memory allocation error', async () => {
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
      const finalEvents = readPersistedDiagnosticsEvents();
      expect(finalEvents.some((event) => event.name === 'queue-item-settled')).toBe(true);
    });

    expect(screen.queryByTestId('diagnostics-report-dialog')).not.toBeInTheDocument();
  });

  it('records iPhone storage spill and memory release breadcrumbs after processing completes', async () => {
    vi.mocked(getCapabilities).mockReturnValue({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      deviceMemory: null,
      isIOS: true,
      isAndroid: false,
      isSafari: true,
      isStandalone: true,
      supportsShare: true,
      supportsFileShare: false,
      supportsShareTarget: true,
      supportsWakeLock: false,
      supportsOffscreenWorker: true,
    });
    vi.mocked(getProcessingProfile).mockReturnValue({ memoryTier: 'low' });
    diagnosticsMocks.runtimeProcessMock.mockResolvedValue(
      new Blob(['output'], { type: 'image/jpeg' }),
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['input'], 'memory-sensitive.heic', { type: 'image/heic' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      const events = readPersistedDiagnosticsEvents();
      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'queue-artifact-spilled-to-storage',
            context: expect.objectContaining({
              queueId: 0,
              retentionPolicy: 'low-memory-ios',
            }),
          }),
          expect.objectContaining({
            name: 'queue-artifact-memory-release',
            context: expect.objectContaining({
              queueId: 0,
              artifactKind: 'output',
              retentionPolicy: 'low-memory-ios',
            }),
          }),
        ]),
      );
    });
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
          queueIndex: null,
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

  it('records queue-runner breadcrumbs for a normal processing launch and settle', async () => {
    let releaseProcessing!: (value: Blob) => void;
    diagnosticsMocks.runtimeProcessMock.mockImplementationOnce(
      async (_file: File, options: Record<string, unknown> = {}) => {
        const onProgress = options.onProgress as ((event: Record<string, unknown>) => void) | undefined;
        onProgress?.({
          phase: 'stage-start',
          stage: 'preprocess-file',
          elapsedMs: 0,
          fileName: 'primary.jpg',
        });
        await new Promise<Blob>((resolve) => {
          releaseProcessing = resolve;
        });
        return new Blob(['first-output'], { type: 'image/jpeg' });
      },
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['primary'], 'primary.jpg', { type: 'image/jpeg' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(diagnosticsMocks.runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const eventsAfterSuppression = readPersistedDiagnosticsEvents();
      expect(eventsAfterSuppression.some((event) => event.name === 'queue-start-requested')).toBe(true);
      expect(eventsAfterSuppression.some((event) => event.name === 'queue-item-claimed')).toBe(true);
      expect(eventsAfterSuppression.some((event) => event.name === 'queue-launch-confirmed')).toBe(true);
    });

    releaseProcessing(new Blob(['first-output'], { type: 'image/jpeg' }));

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    const finalEvents = readPersistedDiagnosticsEvents();
    expect(finalEvents.some((event) => event.name === 'queue-item-settled')).toBe(true);
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

  it('suppresses the diagnostics popup for a recent foreground post-completion restart and records popup breadcrumbs', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(5000);
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

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('diagnostics-report-dialog')).not.toBeInTheDocument();
    });

    const persisted = JSON.parse(
      window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
    ) as { events?: Array<Record<string, unknown>> };
    expect(persisted.events || []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'lifecycle',
          name: 'recovered-popup-suppressed',
          context: expect.objectContaining({
            memoryIssueKind: 'foreground-kill-recovered',
          }),
        }),
      ]),
    );
  });
});
