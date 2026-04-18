/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';
import { DIAGNOSTICS_REPORTS_KEY } from '../diagnostics.ts';

const runtimeProcessMock = vi.fn(
  async (_file: File, options: { onProgress?: (event: Record<string, unknown>) => void } = {}) => {
    options.onProgress?.({
      phase: 'pipeline-complete',
      stage: 'encode',
      elapsedMs: 5,
      stageDurationsMs: { encode: 5 },
      timestamp: Date.now(),
      fileIndex: 0,
      totalFiles: 1,
    });
    return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
  },
);

const probeInputProcessingPathFromHeadersMock = vi.hoisted(() => vi.fn(async () => 'unknown'));
const classifyInputProcessingPathMock = vi.hoisted(() => vi.fn(async () => 'generated'));
const capabilitiesState = vi.hoisted(() => ({
  isAndroid: false,
  isIOS: false,
  isSafari: false,
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
}));

vi.mock('../processing-path.js', async () => {
  const actual = await vi.importActual('../processing-path.js');
  return {
    ...actual,
    probeInputProcessingPathFromHeaders: probeInputProcessingPathFromHeadersMock,
    classifyInputProcessingPath: classifyInputProcessingPathMock,
  };
});

vi.mock('../capabilities.js', () => ({
  getCapabilities: vi.fn(() => ({
    userAgent: capabilitiesState.userAgent,
    deviceMemory: capabilitiesState.isIOS ? null : 8,
    isIOS: capabilitiesState.isIOS,
    isAndroid: capabilitiesState.isAndroid,
    isSafari: capabilitiesState.isSafari,
    isStandalone: false,
    supportsShare: false,
    supportsFileShare: false,
    supportsShareTarget: true,
    supportsWakeLock: false,
    supportsOffscreenWorker: true,
  })),
  getProcessingProfile: vi.fn((capabilities) => ({
    memoryTier: capabilities?.isIOS ? 'low' : 'mid',
  })),
}));

type AutomationApi = {
  enqueueFiles: (
    files: File[] | FileList,
    options?: {
      acknowledgeMobileInferenceWarning?: boolean;
    },
  ) => Promise<{
    acceptedFileCount: number;
      queued: boolean;
      warningShown: boolean;
    }>;
  resetState: () => Promise<{
    queueLength: number;
    resultCount: number;
  }>;
};

function createRuntime() {
  return {
    process: runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

function readPersistedDiagnosticsEvents(): Array<{ name?: string; context?: Record<string, unknown> }> {
  const persisted = JSON.parse(
    window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
  ) as { events?: Array<{ name?: string; context?: Record<string, unknown> }> };
  return Array.isArray(persisted.events) ? persisted.events : [];
}

function createMatchMedia(matchesDesktop: boolean) {
  return vi.fn().mockImplementation((query) => ({
    matches: query.includes('min-width: 1024px') ? matchesDesktop : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function makeFile(name = 'photo.jpg', type = 'image/jpeg') {
  return new File(['file'], name, { type });
}

describe('ImageProcessor automation API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeProcessMock.mockClear();
    probeInputProcessingPathFromHeadersMock.mockResolvedValue('unknown');
    classifyInputProcessingPathMock.mockResolvedValue('generated');
    capabilitiesState.isAndroid = false;
    capabilitiesState.isIOS = false;
    capabilitiesState.isSafari = false;
    capabilitiesState.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
    window.localStorage.clear();
    window.matchMedia = createMatchMedia(false);
    Object.defineProperty(window, '__ULTRAHDR_UNDER_TEST__', {
      configurable: true,
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    delete (window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__;
    delete (window as typeof window & { __ULTRAHDR_UNDER_TEST__?: boolean }).__ULTRAHDR_UNDER_TEST__;
  });

  it('registers an under-test automation API that can enqueue files without the picker', async () => {
    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect((window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__)
        .toBeDefined();
    });

    const automationApi =
      (window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__;
    const result = await automationApi?.enqueueFiles([makeFile('automation.jpg')]);

    expect(result).toEqual({
      acceptedFileCount: 1,
      queued: true,
      warningShown: false,
    });
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(runtimeProcessMock.mock.calls[0][0].name).toBe('automation.jpg');

    const events = readPersistedDiagnosticsEvents();
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'automation-api-ready' }),
        expect.objectContaining({
          name: 'automation-files-enqueued',
          context: expect.objectContaining({
            acceptedFileCount: 1,
            acknowledgeMobileInferenceWarning: false,
          }),
        }),
      ]),
    );
  });

  it('can acknowledge the mobile inference warning through the automation API', async () => {
    capabilitiesState.isIOS = true;
    capabilitiesState.isSafari = true;
    capabilitiesState.userAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1';

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect((window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__)
        .toBeDefined();
    });

    const automationApi =
      (window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__;

    const gatedResult = await automationApi?.enqueueFiles([makeFile('gated.jpg')]);
    expect(gatedResult).toEqual({
      acceptedFileCount: 1,
      queued: true,
      warningShown: true,
    });
    expect(runtimeProcessMock).not.toHaveBeenCalled();
    expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();

    const acknowledgedResult = await automationApi?.enqueueFiles([], {
      acknowledgeMobileInferenceWarning: true,
    });
    expect(acknowledgedResult).toEqual({
      acceptedFileCount: 1,
      queued: true,
      warningShown: false,
    });
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(runtimeProcessMock.mock.calls[0][0].name).toBe('gated.jpg');
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();

    const events = readPersistedDiagnosticsEvents();
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'automation-files-enqueued',
          context: expect.objectContaining({
            acceptedFileCount: 1,
            acknowledgeMobileInferenceWarning: true,
          }),
        }),
      ]),
    );
  });

  it('can reset queue and persisted automation state between under-test runs', async () => {
    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect((window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__)
        .toBeDefined();
    });

    const automationApi =
      (window as typeof window & { __ULTRAHDR_AUTOMATION__?: AutomationApi }).__ULTRAHDR_AUTOMATION__;

    await automationApi?.enqueueFiles([makeFile('reset-me.jpg')]);
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByTestId('pipeline-file-name')).toHaveTextContent('reset-me.jpg');

    const resetResult = await automationApi?.resetState();

    expect(resetResult).toEqual({
      queueLength: 0,
      resultCount: 0,
    });
    await waitFor(() => {
      expect(screen.queryByTestId('pipeline-file-name')).not.toBeInTheDocument();
    });

    const events = readPersistedDiagnosticsEvents();
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'automation-state-reset',
          context: expect.objectContaining({
            queueLength: 0,
            resultCount: 0,
          }),
        }),
      ]),
    );
  });
});
