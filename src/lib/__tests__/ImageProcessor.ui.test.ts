/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';

async function defaultRuntimeProcessImplementation(_file, options = {}) {
  options.onProgress?.({
    phase: 'pipeline-complete',
    stage: 'encode',
    elapsedMs: 5,
    stageDurationsMs: { encode: 5 },
    timestamp: Date.now(),
  });
  return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
}

const runtimeProcessMock = vi.fn(defaultRuntimeProcessImplementation);

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
    subscribe: vi.fn(() => () => { }),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => { }),
  };
}

function renderProcessor(props = {}) {
  return render(ImageProcessor, { props: { runtime: createRuntime(), ...props } });
}

async function waitForSingleResultCompletion() {
  await waitFor(() => {
    expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
  });
}

describe('ImageProcessor mobile-native UI behavior', () => {
  let originalScrollIntoView;

  beforeEach(() => {
    vi.clearAllMocks();
    runtimeProcessMock.mockReset();
    runtimeProcessMock.mockImplementation(defaultRuntimeProcessImplementation);
    window.matchMedia = createMatchMedia(false);
    window.localStorage?.clear?.();
    delete window.__ULTRAHDR_PROCESSING_PREFERENCES;
    delete window.__ULTRAHDR_BACKEND_PREFERENCE;
    Object.defineProperty(window.navigator, 'setAppBadge', {
      configurable: true,
      value: vi.fn(async () => { }),
    });
    Object.defineProperty(window.navigator, 'clearAppBadge', {
      configurable: true,
      value: vi.fn(async () => { }),
    });
    originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
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
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    );
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
    expect(screen.queryByRole('heading', { name: /^convert$/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Keep camera metadata')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tab-settings')).not.toBeInTheDocument();
    expect(screen.queryByText(/existing input gain maps are preserved as-is/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/completed,\s*\d+\s*pending/i)).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('floating-gear'));
    expect(screen.getByTestId('advanced-settings')).toBeInTheDocument();
    expect(screen.queryByTestId('floating-gear')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^settings$/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/minimum brightness threshold for enhancement/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/high-efficiency jpeg encoding/i)).not.toBeInTheDocument();
  });

  it('raises the floating settings button when the update snackbar is visible', async () => {
    renderProcessor({
      files: makeFiles(1),
      pwaUpdateState: {
        notificationVisible: true,
      },
    });

    const fabLayer = screen.getByTestId('floating-gear').parentElement;
    expect(fabLayer).not.toBeNull();
    const fabBottom = window.getComputedStyle(fabLayer as HTMLElement).bottom;
    expect(fabBottom).toContain('9.6rem');
    expect(fabBottom).toContain('safe-area-inset-bottom');
  });

  it('shows mobile results action bar with export and clear controls', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
      expect(screen.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    });

    expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^results$/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('mobile-action-bar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument();

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
    const viewerImage = screen.getByTestId('photo-viewer-image');
    expect(viewerImage).toHaveAttribute('alt', 'photo-0.jpg');
    const computedImageStyle = window.getComputedStyle(viewerImage);
    expect(computedImageStyle.maxWidth).toBe('calc(100vw - 1.5rem)');
    expect(computedImageStyle.maxHeight).toBe('calc(100vh - 1.5rem)');
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

  it('shows visible previous and next controls for desktop batch review', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));

    expect(screen.getByTestId('photo-viewer-prev')).toBeInTheDocument();
    expect(screen.getByTestId('photo-viewer-next')).toBeInTheDocument();
    expect(screen.getByTestId('photo-viewer-prev')).toBeDisabled();
    expect(screen.getByTestId('photo-viewer-next')).not.toBeDisabled();
  });

  it('navigates with visible previous and next controls and disables them at edges', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));

    await fireEvent.click(screen.getByTestId('photo-viewer-next'));
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-1.jpg');
    });

    expect(screen.getByTestId('photo-viewer-prev')).not.toBeDisabled();
    expect(screen.getByTestId('photo-viewer-next')).toBeDisabled();

    await fireEvent.click(screen.getByTestId('photo-viewer-prev'));
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-0.jpg');
    });

    expect(screen.getByTestId('photo-viewer-prev')).toBeDisabled();
    expect(screen.getByTestId('photo-viewer-next')).not.toBeDisabled();
  });

  it('shows a desktop filmstrip with all viewer thumbnails and marks the active image', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-1'));

    expect(screen.getByTestId('photo-viewer-filmstrip')).toBeInTheDocument();
    expect(screen.getByTestId('photo-viewer-filmstrip-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('photo-viewer-filmstrip-item-1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('photo-viewer-filmstrip-item-2')).toHaveAttribute('data-active', 'false');
  });

  it('jumps to a selected image from the desktop filmstrip and updates the active state', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    await fireEvent.click(screen.getByTestId('photo-viewer-filmstrip-item-2'));

    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-2.jpg');
    });

    expect(screen.getByTestId('photo-viewer-filmstrip-item-2')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('photo-viewer-filmstrip-item-0')).toHaveAttribute('data-active', 'false');
  });

  it('scrolls the active desktop filmstrip thumbnail into view when navigation changes the current image', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    vi.mocked(Element.prototype.scrollIntoView).mockClear();

    await fireEvent.click(screen.getByTestId('photo-viewer-next'));

    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-filmstrip-item-1')).toHaveAttribute('data-active', 'true');
    });

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('shows current position text for desktop batch review and updates it during navigation', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-1'));
    expect(screen.getByTestId('photo-viewer-position')).toHaveTextContent('2 / 3');

    await fireEvent.click(screen.getByTestId('photo-viewer-next'));
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-position')).toHaveTextContent('3 / 3');
    });

    await fireEvent.click(screen.getByTestId('photo-viewer-prev'));
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-position')).toHaveTextContent('2 / 3');
    });
  });

  it('fades desktop viewer chrome until hover and reveals it on interaction', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-1'));
    const modal = screen.getByTestId('photo-viewer-modal');

    expect(modal).toHaveAttribute('data-desktop-chrome-visible', 'false');
    expect(screen.getByTestId('photo-viewer-prev')).toHaveAttribute('data-visible', 'false');
    expect(screen.getByTestId('photo-viewer-filmstrip')).toHaveAttribute('data-visible', 'false');
    expect(screen.getByTestId('photo-viewer-position')).toHaveAttribute('data-visible', 'false');
    expect(screen.getByTestId('photo-viewer-close')).toHaveAttribute('data-visible', 'false');

    await fireEvent.mouseMove(modal, { clientX: 200, clientY: 160 });

    expect(modal).toHaveAttribute('data-desktop-chrome-visible', 'true');
    expect(screen.getByTestId('photo-viewer-prev')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('photo-viewer-filmstrip')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('photo-viewer-position')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('photo-viewer-close')).toHaveAttribute('data-visible', 'true');
  });

  it('fades desktop viewer chrome back out after a short idle period', async () => {
    vi.useFakeTimers();
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-1'));
    const modal = screen.getByTestId('photo-viewer-modal');

    await fireEvent.mouseMove(modal, { clientX: 220, clientY: 160 });
    expect(modal).toHaveAttribute('data-desktop-chrome-visible', 'true');

    await vi.advanceTimersByTimeAsync(1800);

    expect(modal).toHaveAttribute('data-desktop-chrome-visible', 'false');
    expect(screen.getByTestId('photo-viewer-prev')).toHaveAttribute('data-visible', 'false');
    expect(screen.getByTestId('photo-viewer-filmstrip')).toHaveAttribute('data-visible', 'false');
    expect(screen.getByTestId('photo-viewer-position')).toHaveAttribute('data-visible', 'false');
    expect(screen.getByTestId('photo-viewer-close')).toHaveAttribute('data-visible', 'false');

    vi.useRealTimers();
  });

  it('reveals desktop viewer chrome when loupe controls receive keyboard focus', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(3) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-1'));
    const modal = screen.getByTestId('photo-viewer-modal');
    const nextButton = screen.getByTestId('photo-viewer-next');

    expect(modal).toHaveAttribute('data-desktop-chrome-visible', 'false');

    await fireEvent.focus(nextButton);

    expect(modal).toHaveAttribute('data-desktop-chrome-visible', 'true');
    expect(nextButton).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('photo-viewer-filmstrip')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('photo-viewer-position')).toHaveAttribute('data-visible', 'true');
    expect(screen.getByTestId('photo-viewer-close')).toHaveAttribute('data-visible', 'true');
  });

  it('supports compare press-and-hold for completed results', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitForSingleResultCompletion();
    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));

    const viewerImage = screen.getByTestId('photo-viewer-image');
    const compareControl = screen.getByTestId('photo-viewer-compare');

    expect(compareControl).toHaveAttribute('aria-pressed', 'false');
    expect(viewerImage).toHaveAttribute('data-preview-kind', 'compare');

    await fireEvent.mouseDown(compareControl);
    expect(compareControl).toHaveAttribute('aria-pressed', 'true');
    expect(viewerImage).toHaveAttribute('data-preview-kind', 'source');

    await fireEvent.mouseUp(compareControl);
    expect(compareControl).toHaveAttribute('aria-pressed', 'false');
    expect(viewerImage).toHaveAttribute('data-preview-kind', 'compare');
  });

  it('hides compare control when the viewer only has an input preview available', async () => {
    const gate = createDeferred();
    runtimeProcessMock.mockImplementationOnce(async (_file, options = {}) => {
      options.onProgress?.({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 12,
        note: 'Generating gain map',
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        elapsedMs: 5,
        stageDurationsMs: {},
        timestamp: Date.now(),
      });
      await gate.promise;
      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });
    await fireEvent.click(screen.getByTestId('tab-results'));

    await waitFor(() => {
      expect(screen.getByTestId('result-thumbnail-0')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    expect(screen.queryByTestId('photo-viewer-compare')).not.toBeInTheDocument();

    gate.resolve();
  });

  it('toggles zoom on double-click and exposes a reset control while zoomed', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitForSingleResultCompletion();
    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));

    const viewerImage = screen.getByTestId('photo-viewer-image');
    expect(screen.getByTestId('photo-viewer-modal')).toHaveAttribute('data-zoomed', 'false');
    expect(screen.queryByTestId('photo-viewer-reset-zoom')).not.toBeInTheDocument();

    await fireEvent.dblClick(viewerImage);
    expect(screen.getByTestId('photo-viewer-modal')).toHaveAttribute('data-zoomed', 'true');
    expect(screen.getByTestId('photo-viewer-reset-zoom')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('photo-viewer-reset-zoom'));
    expect(screen.getByTestId('photo-viewer-modal')).toHaveAttribute('data-zoomed', 'false');
    expect(screen.queryByTestId('photo-viewer-reset-zoom')).not.toBeInTheDocument();
  });

  it('pans while zoomed and blocks swipe navigation until zoom is reset', async () => {
    renderProcessor({ files: makeFiles(2) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('2');
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const modal = screen.getByTestId('photo-viewer-modal');
    const viewerImage = screen.getByTestId('photo-viewer-image');

    await fireEvent.dblClick(viewerImage);
    expect(modal).toHaveAttribute('data-zoomed', 'true');

    await fireEvent.mouseDown(viewerImage, { clientX: 220, clientY: 180 });
    await fireEvent.mouseMove(modal, { clientX: 140, clientY: 130 });
    await fireEvent.mouseUp(modal, { clientX: 140, clientY: 130 });
    expect(viewerImage.style.transform).not.toBe('');

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 220, clientY: 120 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 70, clientY: 126 }],
    });
    expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-0.jpg');

    await fireEvent.click(screen.getByTestId('photo-viewer-reset-zoom'));
    expect(modal).toHaveAttribute('data-zoomed', 'false');

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 220, clientY: 120 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 70, clientY: 126 }],
    });
    await waitFor(() => {
      expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-1.jpg');
    });
  });

  it('zooms on mobile double-tap', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitForSingleResultCompletion();
    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));

    const modal = screen.getByTestId('photo-viewer-modal');

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 180, clientY: 140 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 180, clientY: 140 }],
    });

    await fireEvent.touchStart(modal, {
      touches: [{ clientX: 180, clientY: 140 }],
    });
    await fireEvent.touchEnd(modal, {
      changedTouches: [{ clientX: 180, clientY: 140 }],
    });

    expect(modal).toHaveAttribute('data-zoomed', 'true');
    expect(screen.getByTestId('photo-viewer-reset-zoom')).toBeInTheDocument();
  });

  it('supports pinch zoom on touch devices', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitForSingleResultCompletion();
    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));

    const modal = screen.getByTestId('photo-viewer-modal');

    await fireEvent.touchStart(modal, {
      touches: [
        { clientX: 120, clientY: 140 },
        { clientX: 220, clientY: 140 },
      ],
    });
    await fireEvent.touchMove(modal, {
      touches: [
        { clientX: 90, clientY: 140 },
        { clientX: 250, clientY: 140 },
      ],
    });

    expect(modal).toHaveAttribute('data-zoomed', 'true');
    expect(screen.getByTestId('photo-viewer-image').style.transform).toContain('scale(');
  });

  it('keeps desktop close control aligned with shared loupe chrome visibility', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const modal = screen.getByTestId('photo-viewer-modal');
    const closeButton = screen.getByTestId('photo-viewer-close');

    expect(closeButton).toHaveAttribute('data-visible', 'false');
    await fireEvent.mouseMove(modal, { clientX: 220, clientY: 80 });
    expect(closeButton).toHaveAttribute('data-visible', 'true');
    await fireEvent.mouseLeave(modal);
    expect(closeButton).toHaveAttribute('data-visible', 'false');
  });

  it('keeps close control always visible on mobile viewer', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    const closeButton = screen.getByTestId('photo-viewer-close');

    expect(closeButton).toHaveAttribute('data-visible', 'true');
    await fireEvent.mouseLeave(screen.getByTestId('photo-viewer-modal'));
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
    expect(screen.queryByRole('heading', { name: /^convert$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^settings$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^results$/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/minimum brightness threshold for enhancement/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/high-efficiency jpeg encoding/i)).not.toBeInTheDocument();
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
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Encoding gain map/i)).toBeInTheDocument();
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

  it('does not render GMNet runtime when stage is not ONNX inference', async () => {
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
        stage: 'encode-ultrahdr',
        stageProgress: 50,
        note: 'Encoding output with runtime: webgl',
        gmnetExecutionProvider: 'webgl',
      });
      await progressGate.promise;

      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-status')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('pipeline-execution-provider')).not.toBeInTheDocument();
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
      const pipelineStatus = screen.getByTestId('pipeline-status');
      expect(within(pipelineStatus).getByText(/Downloading AI Model/i)).toBeInTheDocument();
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

  it('shows GMNet runtime: WebGPU during ONNX inference events', async () => {
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
        stageProgress: 55,
        note: 'Running ONNX inference',
        gmnetExecutionProvider: 'webgpu',
      });
      await progressGate.promise;

      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-execution-provider')).toHaveTextContent(
        /gmnet runtime:\s*webgpu/i,
      );
    });
    progressGate.resolve();
  });

  it('only displays GMNet runtime during inference stage even when provided as a prop', async () => {
    const progressGate = createDeferred();

    vi.mocked(runtimeProcessMock).mockImplementationOnce(async (_file, options = {}) => {
      const baseEvent = {
        elapsedMs: 10,
        stageDurationsMs: {},
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'test.jpg',
        timestamp: Date.now(),
      };

      // 1. Early stage - should NOT show runtime
      options.onProgress?.({
        ...baseEvent,
        phase: 'stage-progress',
        stage: 'preprocess-file',
        stageProgress: 10,
        note: 'Preprocessing',
      });

      // Allow the UI to update and for us to check it
      await new Promise(r => setTimeout(r, 0));

      // 2. Inference stage - should show runtime
      options.onProgress?.({
        ...baseEvent,
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 10,
        note: 'Running inference',
        gmnetExecutionProvider: 'webgpu',
      });

      await progressGate.promise;
      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    renderProcessor({
      files: makeFiles(1),
      runtimeExecutionProvider: 'webgpu'
    });

    // Wait for processing to start and reach the first stage
    await waitFor(() => {
      expect(screen.getByText(/Preprocessing/i)).toBeInTheDocument();
    });

    // VERIFY: Runtime label should NOT be visible during preprocessing
    expect(screen.queryByTestId('pipeline-execution-provider')).not.toBeInTheDocument();

    // Now let it proceed to inference
    // (In this mock implementation, it will proceed automatically after the first await above,
    // but we need to wait for the UI to catch up)
    await waitFor(() => {
      expect(screen.getByText(/Running inference/i)).toBeInTheDocument();
    });

    // VERIFY: Runtime label should BE visible during inference
    expect(screen.getByTestId('pipeline-execution-provider')).toHaveTextContent(
      /gmnet runtime:\s*webgpu/i,
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
      expect(screen.getByTestId('pipeline-memory-mode')).toHaveTextContent(
        /memory mode:\s*checkpointed/i,
      );
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

    await waitForSingleResultCompletion();

    await fireEvent.click(screen.getByTestId('tab-convert'));
    await waitFor(() => {
      expect(screen.getByText(/^Processing complete$/i)).toBeInTheDocument();
    });
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

  it('hides the WebGL backend option in Chromium mobile settings', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    );
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
        'WASM',
      ]),
    );
    expect(optionLabels).not.toContain('WebGL');
  });

  it('sanitizes a persisted Chromium webgl backend preference back to auto', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    );
    const { unmount } = renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('floating-gear'));
    const backendSelect = screen.getByTestId('backend-preference-select-mobile');
    await fireEvent.change(backendSelect, { target: { value: 'auto' } });
    unmount();

    vi.mocked(runtimeProcessMock).mockClear();
    const { saveProcessingPreferences } = await import('../processing-preferences.ts');
    saveProcessingPreferences(
      {
        backendPreference: 'webgl',
      },
      window,
    );
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).not.toHaveProperty(
      'forceExecutionProviders',
    );
  });

  it('uses persisted homepage backend + checkpoint settings on the first processing job', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    );
    const { saveProcessingPreferences } = await import('../processing-preferences.ts');
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
        gmnetCheckpointing: 'force',
      }),
    );
    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).not.toHaveProperty(
      'forceExecutionProviders',
    );
    expect(vi.mocked(runtimeProcessMock).mock.calls[0][1]).not.toHaveProperty(
      'useJpegli',
    );
  });

  it('resolves gmnet checkpoint auto mode to force on Safari/WebKit for first run', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    );
    const { saveProcessingPreferences } = await import('../processing-preferences.ts');
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
    const { saveProcessingPreferences } = await import('../processing-preferences.ts');
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

    expect(screen.getByTestId('queue-smart-control')).toHaveTextContent(/^pause$/i);
    expect(screen.getByTestId('queue-overflow-trigger')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start over/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('cancel-current-control')).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('queue-overflow-trigger'));
    expect(screen.getByRole('button', { name: /^stop$/i })).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('queue-smart-control'));
    firstFileGate.resolve();

    await waitFor(() => {
      expect(screen.getByTestId('queue-smart-control')).toHaveTextContent(/^resume$/i);
    });
    expect(runtimeProcessMock).toHaveBeenCalledTimes(1);

    await fireEvent.click(screen.getByTestId('queue-smart-control'));
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
  });

  it('reprocesses selected stale results directly from the stale prompt', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitForSingleResultCompletion();

    await fireEvent.click(screen.getByTestId('tab-convert'));
    await fireEvent.input(screen.getByLabelText(/max content boost/i), {
      target: { value: '4.0' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('stale-reprocess-prompt')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByRole('button', { name: /^reprocess$/i }));
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByTestId('reprocess-sheet')).not.toBeInTheDocument();
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

    await waitForSingleResultCompletion();

    await fireEvent.click(screen.getByTestId('tab-convert'));
    const slider = screen.getByLabelText(/max content boost/i);
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '5');
    expect(slider).toHaveValue('3');

    const firstOptions = vi.mocked(runtimeProcessMock).mock.calls[0][1];
    expect(firstOptions.maxContentBoost).toBeCloseTo(2 ** 3.0, 6);

    await fireEvent.input(screen.getByLabelText(/max content boost/i), {
      target: { value: '5.0' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('stale-reprocess-prompt')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByRole('button', { name: /^reprocess$/i }));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });

    const secondOptions = vi.mocked(runtimeProcessMock).mock.calls[1][1];
    expect(secondOptions.maxContentBoost).toBeCloseTo(2 ** 5, 6);
  });

  it('resets HDR strength back to the shared default on clear', async () => {
    window.confirm = vi.fn(() => true);
    renderProcessor({ files: makeFiles(1) });

    await waitForSingleResultCompletion();

    await fireEvent.click(screen.getByTestId('tab-convert'));
    await fireEvent.input(screen.getByLabelText(/max content boost/i), {
      target: { value: '5.0' },
    });
    expect(screen.getByLabelText(/max content boost/i)).toHaveValue('5.0');

    await fireEvent.click(screen.getByTestId('tab-results'));
    await fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));

    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/max content boost/i)).toHaveValue('3');
    });
  });

  it('shows that preserved gain maps ignore HDR strength until discarded', async () => {
    const runtime = createRuntime();
    runtime.process = vi.fn(async (_file, options = {}) => {
      options.onProgress?.({
        phase: 'pipeline-complete',
        stage: 'finalize-preserved',
        processingPath: 'preserved',
        elapsedMs: 5,
        stageDurationsMs: { 'finalize-preserved': 5 },
        timestamp: Date.now(),
      });
      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    render(ImageProcessor, { props: { runtime, files: makeFiles(1) } });

    await waitFor(() => {
      expect(runtime.process).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('tab-convert'));
    expect(screen.getByText(/preserved gain maps keep their source metadata/i)).toBeInTheDocument();
    expect(screen.getByText(/hdr strength only applies when generating a new gain map or after discarding/i)).toBeInTheDocument();
  });

  it('passes a stable queue-scoped processing request key to runtime.process', async () => {
    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    expect(runtimeProcessMock).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({
        processingRequestKey: 'queue:0',
      }),
    );
  });

  it('reprocesses selected stale results directly from the results toolbar', async () => {
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
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByTestId('reprocess-sheet')).not.toBeInTheDocument();
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

  it('does not relaunch the active queue item when another file is added mid-run', async () => {
    const firstRun = createDeferred();
    runtimeProcessMock
      .mockImplementationOnce(async (_file, options = {}) => {
        options.onProgress?.({
          phase: 'stage-start',
          stage: 'preprocess-file',
          elapsedMs: 0,
          timestamp: Date.now(),
        });
        return firstRun.promise;
      })
      .mockImplementationOnce(async (_file, options = {}) => {
        options.onProgress?.({
          phase: 'pipeline-complete',
          stage: 'encode',
          elapsedMs: 5,
          stageDurationsMs: { encode: 5 },
          timestamp: Date.now(),
        });
        return new Blob(['mock-jpeg-2'], { type: 'image/jpeg' });
      });

    renderProcessor({ files: makeFiles(1) });

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    const addFilesInput = document.getElementById('add-files') as HTMLInputElement | null;
    expect(addFilesInput).not.toBeNull();

    await fireEvent.change(addFilesInput, {
      target: { files: [new File(['second'], 'queued-second.jpg', { type: 'image/jpeg' })] },
    });

    expect(runtimeProcessMock).toHaveBeenCalledTimes(1);

    firstRun.resolve(new Blob(['mock-jpeg-1'], { type: 'image/jpeg' }));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
  });
});
