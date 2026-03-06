/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';

const runtimeProcessMock = vi.fn(async (_file, options = {}) => {
  options.onProgress?.({
    phase: 'pipeline-complete',
    stage: 'encode',
    elapsedMs: 5,
    stageDurationsMs: { encode: 5 },
    timestamp: Date.now(),
  });
  return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
});

function createMatchMedia(matchesDesktop) {
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

function makeFiles(count = 1) {
  return Array.from({ length: count }, (_, index) =>
    new File([`file-${index}`], `photo-${index}.jpg`, { type: 'image/jpeg' }),
  );
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setUserAgent(userAgent) {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: userAgent,
  });
}

function createRuntime() {
  return {
    process: runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

function renderProcessor(props = {}) {
  return render(ImageProcessor, { props: { runtime: createRuntime(), ...props } });
}

describe('ImageProcessor mobile-native UI behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeProcessMock.mockClear();
    window.matchMedia = createMatchMedia(false);
    window.localStorage?.clear?.();
    delete window.__ULTRAHDR_PROCESSING_PREFERENCES;
    delete window.__ULTRAHDR_BACKEND_PREFERENCE;
    Object.defineProperty(window.navigator, 'setAppBadge', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
    Object.defineProperty(window.navigator, 'clearAppBadge', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
  });

  it('honors launch intent tab=results on initial render', async () => {
    renderProcessor({ files: makeFiles(1), launchIntent: { tab: 'results' } });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('auto-switches to results tab after regular mobile queue completion', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
      expect(screen.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('shows empty-gallery drop zone in desktop two-pane layout when queue is empty', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: [] });

    expect(screen.getByTestId('desktop-two-pane')).toBeInTheDocument();
    expect(screen.getByTestId('upload-drop-zone')).toBeInTheDocument();
  });

  it('keeps Add Images in convert tab and shows drop zone in empty mobile results gallery', async () => {
    renderProcessor({ files: [] });

    expect(screen.getByRole('button', { name: /add images/i })).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId('tab-results'));
    expect(screen.getByTestId('upload-drop-zone')).toBeInTheDocument();
  });

  it('processes files selected from empty-gallery drop zone', async () => {
    renderProcessor({ files: [] });

    await fireEvent.click(screen.getByTestId('tab-results'));
    const input = document.getElementById('file-upload');
    const file = new File(['new-file'], 'new-photo.jpg', { type: 'image/jpeg' });

    await fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });
  });

  it('shows only Convert/Results mobile tabs and opens settings directly from floating gear', async () => {
    renderProcessor({ files: makeFiles(1) });

    const convertTab = screen.getByTestId('tab-convert');
    expect(convertTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('quick-controls')).toBeInTheDocument();
    expect(screen.queryByText('Keep camera metadata')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tab-settings')).not.toBeInTheDocument();
    expect(screen.queryByText(/existing input gain maps are preserved as-is/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/completed,\s*\d+\s*pending/i)).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('floating-gear'));
    expect(screen.getByTestId('advanced-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('floating-gear')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/minimum brightness threshold for enhancement/i)).not.toBeInTheDocument();
  });

  it('shows mobile results action bar with export and discard controls', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
      expect(screen.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    });

    expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-action-bar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^discard all$/i })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /^export/i }));
    const exportSheet = screen.getByTestId('export-sheet');
    expect(exportSheet).toBeInTheDocument();
    expect(screen.getByText(/1 item\(s\) selected/i)).toBeInTheDocument();
    expect(within(exportSheet).queryByRole('button', { name: /select all/i })).not.toBeInTheDocument();
    expect(within(exportSheet).queryByRole('button', { name: /clear selection/i })).not.toBeInTheDocument();
  });

  it('opens a full-screen photo viewer from a result thumbnail and closes it with X', async () => {
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('2');
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    expect(screen.getByTestId('photo-viewer-modal')).toBeInTheDocument();
    expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-0.jpg');
    expect(screen.getByTestId('photo-viewer-close')).toHaveAttribute('data-visible', 'true');

    await fireEvent.click(screen.getByTestId('photo-viewer-close'));
    expect(screen.queryByTestId('photo-viewer-modal')).not.toBeInTheDocument();
  });

  it('uses explicit selection control while thumbnail clicks open viewer', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    expect(screen.getByRole('button', { name: /^export \(1\)$/i })).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    expect(screen.getByTestId('photo-viewer-modal')).toBeInTheDocument();
    await fireEvent.click(screen.getByTestId('photo-viewer-close'));

    await fireEvent.click(screen.getByTestId('result-select-0'));
    expect(screen.getByRole('button', { name: /^export \(0\)$/i })).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('result-select-0'));
    expect(screen.getByRole('button', { name: /^export \(1\)$/i })).toBeInTheDocument();
  });

  it('supports swipe navigation in viewer and bounces at edges without wrap-around', async () => {
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('2');
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const modal = screen.getByTestId('photo-viewer-modal');

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 220, clientY: 120 }],
    });
    await fireEvent.touchMove(modal, {
      touches: [{ clientX: 70, clientY: 126 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 70, clientY: 126 }],
    });
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-1.jpg');
    });

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 220, clientY: 120 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 80, clientY: 122 }],
    });
    expect(modal).toHaveAttribute('data-bounce', 'right');

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 80, clientY: 120 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 220, clientY: 122 }],
    });
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-0.jpg');
    });

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 80, clientY: 120 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 220, clientY: 122 }],
    });
    expect(modal).toHaveAttribute('data-bounce', 'left');
  });

  it('supports keyboard navigation and escape close while viewer is open', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    await fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-1.jpg');
    });

    await fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-0.jpg');
    });

    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('photo-viewer-modal')).not.toBeInTheDocument();
  });

  it('shows close control only when hovering top-right corner on desktop', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const closeButton = screen.getByTestId('photo-viewer-close');
    const hotspot = screen.getByTestId('photo-viewer-corner-hotspot');

    expect(closeButton).toHaveAttribute('data-visible', 'false');
    await fireEvent.mouseEnter(hotspot);
    expect(closeButton).toHaveAttribute('data-visible', 'true');
    await fireEvent.mouseLeave(hotspot);
    expect(closeButton).toHaveAttribute('data-visible', 'false');
  });

  it('keeps close control always visible on mobile viewer', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const closeButton = screen.getByTestId('photo-viewer-close');
    const hotspot = screen.getByTestId('photo-viewer-corner-hotspot');

    expect(closeButton).toHaveAttribute('data-visible', 'true');
    await fireEvent.mouseLeave(hotspot);
    expect(closeButton).toHaveAttribute('data-visible', 'true');
  });

  it('anchors the close control to the top-right corner of the viewer', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const closeButton = screen.getByTestId('photo-viewer-close');
    const computed = window.getComputedStyle(closeButton);

    expect(computed.position).toBe('absolute');
    expect(computed.top).not.toBe('auto');
    expect(computed.right).not.toBe('auto');
  });

  it('keeps rotation controls on mobile results and hides them in mobile settings sheet', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    const mobileResultsTools = screen.getByTestId('mobile-results-tools');
    expect(mobileResultsTools).toBeInTheDocument();
    expect(within(mobileResultsTools).getByTestId('results-rotate-left')).toBeInTheDocument();
    expect(within(mobileResultsTools).getByTestId('results-rotate-right')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('floating-gear'));
    const settingsSheet = screen.getByTestId('settings-sheet');
    expect(within(settingsSheet).queryByText(/^rotation$/i)).not.toBeInTheDocument();
    expect(within(settingsSheet).queryByRole('button', { name: /^left$/i })).not.toBeInTheDocument();
    expect(within(settingsSheet).queryByRole('button', { name: /^right$/i })).not.toBeInTheDocument();
  });

  it('renders two-pane desktop layout and hides mobile tab bar', async () => {
    window.matchMedia = createMatchMedia(true);

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('desktop-two-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-tab-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('quick-controls')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/minimum brightness threshold for enhancement/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('results-discard-all')).toBeInTheDocument();

    expect(screen.queryByTestId('floating-gear')).not.toBeInTheDocument();
  });

  it('shows clear multi-download choices with tooltip info in export sheet', async () => {
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('2');
    });

    await fireEvent.click(screen.getByTestId('tab-results'));
    await fireEvent.click(screen.getByRole('button', { name: /^export/i }));

    const exportSheet = screen.getByTestId('export-sheet');
    const separateButton = within(exportSheet).getByRole('button', {
      name: /download as separate files/i,
    });
    const zipButton = within(exportSheet).getByRole('button', {
      name: /download as single zip file/i,
    });

    expect(separateButton).toBeInTheDocument();
    expect(zipButton).toHaveClass('primary');
    expect(
      within(exportSheet).getByRole('button', { name: /about separate file downloads/i }),
    ).toBeInTheDocument();
    expect(
      within(exportSheet).getByText(
        /not all browsers allow downloading multiple separate files simultaneously/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders granular progress details from stage-progress telemetry updates', async () => {
    const progressGate = createDeferred();

    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      const baseEvent = {
        elapsedMs: 12,
        stageDurationsMs: {},
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        timestamp: Date.now(),
      };

      options.onProgress?.({
        ...baseEvent,
        phase: 'pipeline-start',
        stage: 'pipeline',
      });
      options.onProgress?.({
        ...baseEvent,
        phase: 'stage-start',
        stage: 'generate-gain-map',
      });
      options.onProgress?.({
        ...baseEvent,
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 42,
        note: 'Encoding gain map',
        gmnetExecutionProvider: 'webgl',
      });
      await progressGate.promise;

      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-progress')).toBeInTheDocument();
    });

    expect(screen.getByText(/Encoding gain map/i)).toBeInTheDocument();
    expect(screen.getByText(/photo-0.jpg/i)).toBeInTheDocument();
    expect(screen.getByText(/File 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 42%/i)).toBeInTheDocument();
    expect(screen.getByTestId('pipeline-execution-provider')).toHaveTextContent(
      /gmnet runtime:\s*webgl/i,
    );
    progressGate.resolve();
  });

  it('shows AI model updates inside pipeline-status with inline progress UI', async () => {
    const progressGate = createDeferred();

    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      const baseEvent = {
        elapsedMs: 12,
        stageDurationsMs: {},
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        timestamp: Date.now(),
      };

      options.onProgress?.({
        ...baseEvent,
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 50,
        note: 'Downloading AI Model...',
        gmnetExecutionProvider: 'wasm',
      });
      await progressGate.promise;

      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-status')).toBeInTheDocument();
    });

    const pipelineStatus = screen.getByTestId('pipeline-status');
    expect(within(pipelineStatus).getByText(/Downloading AI Model/i)).toBeInTheDocument();
    expect(within(pipelineStatus).getByText('50%')).toBeInTheDocument();
    expect(within(pipelineStatus).getByTestId('pipeline-ai-progress')).toBeInTheDocument();
    expect(within(pipelineStatus).getByTestId('pipeline-execution-provider')).toHaveTextContent(
      /gmnet runtime:\s*wasm/i,
    );
    progressGate.resolve();
  });

  it('renders checkpoint memory mode telemetry when checkpointed progress metadata is emitted', async () => {
    const progressGate = createDeferred();

    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      options.onProgress?.({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 60,
        note: 'Running tile 3/10',
        gmnetExecutionProvider: 'webgpu',
        gmnetMemoryMode: 'checkpointed',
        gmnetCheckpointTilesCompleted: 3,
        gmnetCheckpointTilesTotal: 10,
        gmnetCheckpointResumed: true,
        elapsedMs: 100,
        stageDurationsMs: {},
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        timestamp: Date.now(),
      });
      await progressGate.promise;
      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-status')).toBeInTheDocument();
    });

    expect(screen.getByTestId('pipeline-memory-mode')).toHaveTextContent(
      /memory mode:\s*checkpointed/i,
    );
    expect(screen.getByTestId('pipeline-checkpoint-progress')).toHaveTextContent(
      /checkpoint progress:\s*3\/10/i,
    );
    expect(screen.getByTestId('pipeline-checkpoint-resumed')).toHaveTextContent(
      /resumed from checkpoint/i,
    );
    progressGate.resolve();
  });

  it('shows only "Processing complete" in progress box after queue completion', async () => {
    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      const baseEvent = {
        elapsedMs: 12,
        stageDurationsMs: { encode: 9 },
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        timestamp: Date.now(),
      };

      options.onProgress?.({
        ...baseEvent,
        phase: 'stage-progress',
        stage: 'encode-ultrahdr',
        stageProgress: 60,
        note: 'Encoding output',
      });
      options.onProgress?.({
        ...baseEvent,
        phase: 'pipeline-complete',
        stage: 'encode-ultrahdr',
      });

      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('tab-convert'));
    expect(screen.getByText(/^Processing complete$/i)).toBeInTheDocument();
    expect(screen.queryByTestId('pipeline-file-name')).not.toBeInTheDocument();
    expect(screen.queryByText(/slowest stage:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/stage \d+%/i)).not.toBeInTheDocument();
  });

  it('does not render capability restriction UI when legacy capability payloads are emitted', async () => {
    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      const now = Date.now();
      options.onProgress?.({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 100,
        note: 'Running tile 1/4',
        timestamp: now,
        gmnetExecutionProvider: 'webgl',
        gmnetCapabilitySource: 'fixed-model',
        gmnetCapability: {
          provider: 'webgl',
          gainMapMaxLongEdge: 128,
          outputMaxLongEdge: 256,
          source: 'fixed-model',
          attempts: [{ candidateLongEdge: 128, status: 'passed' }],
        },
      });
      options.onProgress?.({
        phase: 'pipeline-complete',
        stage: 'pipeline',
        elapsedMs: 5,
        stageDurationsMs: { pipeline: 5 },
        fileIndex: 0,
        totalFiles: 1,
        timestamp: now + 1,
      });
      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    await fireEvent.click(screen.getByTestId('tab-convert'));
    expect(screen.queryByTestId('capability-restriction-banner')).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('tab-results'));
    await fireEvent.click(screen.getByRole('button', { name: /^export/i }));
    expect(screen.queryByTestId('export-capability-restriction')).not.toBeInTheDocument();
  });

  it('does not show wasm recommendation modal from legacy constrainedByCapability events', async () => {
    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      const now = Date.now();
      options.onProgress?.({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 100,
        note: 'Running tile 1/4',
        timestamp: now,
        gmnetExecutionProvider: 'webgpu',
      });
      options.onProgress?.({
        phase: 'stage-complete',
        stage: 'constrain-sdr-image',
        timestamp: now + 1,
        constrainedByCapability: true, // legacy field should be ignored by UI
      });
      options.onProgress?.({
        phase: 'pipeline-complete',
        stage: 'pipeline',
        elapsedMs: 5,
        stageDurationsMs: { pipeline: 5 },
        fileIndex: 0,
        totalFiles: 1,
        timestamp: now + 2,
      });
      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('capability-restriction-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('wasm-recommendation-modal')).not.toBeInTheDocument();
  });

  it('renders backend preference dropdown with all backend options in mobile settings', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('floating-gear'));
    const backendSelect = screen.getByTestId('backend-preference-select-mobile');
    expect(backendSelect).toHaveValue('auto');

    const optionLabels = within(backendSelect)
      .getAllByRole('option')
      .map((option) => option.textContent?.trim());
    expect(optionLabels).toEqual(
      expect.arrayContaining([
        'Auto (Recommended)',
        'WebGPU',
        'WebGL',
        'WASM',
      ]),
    );
  });

  it('persists backend preference and applies forced provider to subsequent processing runs', async () => {
    const { unmount } = renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('floating-gear'));
    const backendSelect = screen.getByTestId('backend-preference-select-mobile');
    await fireEvent.change(backendSelect, { target: { value: 'webgl' } });
    unmount();

    vi.mocked(runtimeProcessMock).mockClear();
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).toEqual(
      expect.objectContaining({
        forceExecutionProviders: ['webgl'],
      }),
    );
  });

  it('uses persisted homepage backend + checkpoint settings on the first processing job', async () => {
    const { saveProcessingPreferences } = await import('../processing-preferences.js');
    saveProcessingPreferences(
      {
        backendPreference: 'webgl',
        gmnetCheckpointingPreference: 'force',
      },
      window,
    );

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).toEqual(
      expect.objectContaining({
        forceExecutionProviders: ['webgl'],
        gmnetCheckpointing: 'force',
      }),
    );
  });

  it('resolves gmnet checkpoint auto mode to force on Safari/WebKit for first run', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    );
    const { saveProcessingPreferences } = await import('../processing-preferences.js');
    saveProcessingPreferences(
      {
        backendPreference: 'auto',
        gmnetCheckpointingPreference: 'auto',
      },
      window,
    );

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).toEqual(
      expect.objectContaining({
        gmnetCheckpointing: 'force',
      }),
    );
  });

  it('resolves gmnet checkpoint auto mode to off on non-Safari browsers for first run', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    );
    const { saveProcessingPreferences } = await import('../processing-preferences.js');
    saveProcessingPreferences(
      {
        backendPreference: 'auto',
        gmnetCheckpointingPreference: 'auto',
      },
      window,
    );

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).toEqual(
      expect.objectContaining({
        gmnetCheckpointing: 'off',
      }),
    );
  });

  it('pauses after the current file and resumes queued work only when resumed', async () => {
    const firstFileGate = createDeferred();

    vi.mocked(runtimeProcessMock)
      .mockImplementationOnce(async (_file, options = {}) => {
        options.onProgress?.({
          phase: 'pipeline-start',
          stage: 'pipeline',
          elapsedMs: 1,
          stageDurationsMs: {},
          fileIndex: 0,
          totalFiles: 2,
          timestamp: Date.now(),
        });
        await firstFileGate.promise;
        options.onProgress?.({
          phase: 'pipeline-complete',
          stage: 'pipeline',
          elapsedMs: 5,
          stageDurationsMs: { pipeline: 5 },
          fileIndex: 0,
          totalFiles: 2,
          timestamp: Date.now(),
        });
        return new Blob(['first'], { type: 'image/jpeg' });
      })
      .mockImplementationOnce(async (_file, options = {}) => {
        options.onProgress?.({
          phase: 'pipeline-complete',
          stage: 'pipeline',
          elapsedMs: 5,
          stageDurationsMs: { pipeline: 5 },
          fileIndex: 1,
          totalFiles: 2,
          timestamp: Date.now(),
        });
        return new Blob(['second'], { type: 'image/jpeg' });
      });

    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('queue-smart-control')).toHaveTextContent(/pause queue/i);
    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start over/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('cancel-current-control')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('queue-smart-control'));
    firstFileGate.resolve();

    await waitFor(() => {
      expect(screen.getByTestId('queue-smart-control')).toHaveTextContent(/resume queue/i);
    });
    expect(runtimeProcessMock).toHaveBeenCalledTimes(1);

    await fireEvent.click(screen.getByTestId('queue-smart-control'));
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
  });

  it('shows one stale reprocess CTA that opens reprocess sheet options', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('tab-convert'));
    await fireEvent.input(screen.getByLabelText(/max content boost/i), {
      target: { value: '4.0' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('stale-reprocess-prompt')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByRole('button', { name: /^reprocess$/i }));
    expect(screen.getByTestId('reprocess-sheet')).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /reprocess all stale/i }));
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
  });

  it('does not expose reverse tone map version controls and keeps processing fixed to v2 behavior', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).not.toHaveProperty('reverseToneMapVersion');

    await fireEvent.click(screen.getByTestId('floating-gear'));
    expect(screen.queryByText(/advanced algorithm controls/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/reverse tone map version/i)).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /done/i }));
    await fireEvent.click(screen.getByTestId('tab-convert'));
    await fireEvent.input(screen.getByLabelText(/hdr strength/i), {
      target: { value: '4.0' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('stale-reprocess-prompt')).toBeInTheDocument();
    });
    await fireEvent.click(screen.getByRole('button', { name: /^reprocess$/i }));
    await fireEvent.click(screen.getByRole('button', { name: /reprocess all stale/i }));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(vi.mocked(runtimeProcessMock).mock.calls[1][1]).not.toHaveProperty('reverseToneMapVersion');
  });

  it('removes performance mode controls and legacy resolution options from process requests', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByLabelText(/performance mode/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /performance mode/i })).not.toBeInTheDocument();

    const firstOptions = vi.mocked(runtimeProcessMock).mock.calls[0][1];
    expect(firstOptions).not.toHaveProperty('safeMode');
    expect(firstOptions).not.toHaveProperty('maxOutputMegapixels');
    expect(firstOptions).not.toHaveProperty('gainMapScale');
  });

  it('treats HDR strength slider values as stops and converts them to linear maxContentBoost', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    const firstOptions = vi.mocked(runtimeProcessMock).mock.calls[0][1];
    expect(firstOptions.maxContentBoost).toBeCloseTo(2 ** 2.3, 6);

    await fireEvent.click(screen.getByTestId('tab-convert'));
    await fireEvent.input(screen.getByLabelText(/max content boost/i), {
      target: { value: '4.0' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('stale-reprocess-prompt')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByRole('button', { name: /^reprocess$/i }));
    await fireEvent.click(screen.getByRole('button', { name: /reprocess all stale/i }));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });

    const secondOptions = vi.mocked(runtimeProcessMock).mock.calls[1][1];
    expect(secondOptions.maxContentBoost).toBeCloseTo(2 ** 4, 6);
  });

  it('shows results reprocess button only after rotation makes results stale', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    expect(screen.queryByTestId('results-reprocess-btn')).not.toBeInTheDocument();
    await fireEvent.click(screen.getByTestId('results-rotate-right'));
    await waitFor(() => {
      expect(screen.getByTestId('results-reprocess-btn')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('results-reprocess-btn'));
    expect(screen.getByTestId('reprocess-sheet')).toBeInTheDocument();
  });

  it('moves to results and emphasizes share-out action after share-target completion', async () => {
    renderProcessor({ files: makeFiles(1), launchSource: 'share-target' });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('share-out-cta')).toBeInTheDocument();
  });

  it('renders floating gear as icon-only control instead of text label', async () => {
    renderProcessor({ files: makeFiles(1) });

    const gearButton = screen.getByTestId('floating-gear');
    expect(gearButton.querySelector('svg')).toBeTruthy();
    expect(gearButton).not.toHaveTextContent(/^Gear$/);
  });

  it('updates app badge during queue work and clears badge when queue completes', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(window.navigator.setAppBadge).toHaveBeenCalled();
      expect(window.navigator.clearAppBadge).toHaveBeenCalled();
    });
  });
});
