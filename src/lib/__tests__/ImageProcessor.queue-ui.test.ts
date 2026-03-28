/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

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

const runtimeProcessMock = vi.fn();

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

describe('ImageProcessor queue-centric workflow cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = createMatchMedia(false);
    window.localStorage?.clear?.();
    runtimeProcessMock.mockReset();
    Object.defineProperty(window.navigator, 'setAppBadge', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
    Object.defineProperty(window.navigator, 'clearAppBadge', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
  });

  it('renders imported items as cards immediately while later queue items remain queued', async () => {
    const firstGate = createDeferred();

    runtimeProcessMock
      .mockImplementationOnce(async (_file, options = {}) => {
        options.onProgress?.({
          phase: 'stage-progress',
          stage: 'generate-gain-map',
          stageProgress: 42,
          note: 'Generating gain map',
          fileIndex: 0,
          totalFiles: 2,
          fileName: 'photo-0.jpg',
          elapsedMs: 5,
          stageDurationsMs: {},
          timestamp: Date.now(),
        });
        await firstGate.promise;
        return new Blob(['first'], { type: 'image/jpeg' });
      })
      .mockImplementationOnce(async () => new Blob(['second'], { type: 'image/jpeg' }));

    renderProcessor({ files: makeFiles(2) });
    await fireEvent.click(screen.getByTestId('tab-results'));

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    const cards = [screen.getByTestId('workflow-card-0'), screen.getByTestId('workflow-card-1')];
    expect(cards).toHaveLength(2);
    await waitFor(() => {
      expect(within(screen.getByTestId('workflow-card-0')).getByText(/Generating gain map \d+%/i)).toBeInTheDocument();
      expect(within(screen.getByTestId('workflow-card-0')).getByTestId('workflow-card-progress-0')).toBeInTheDocument();
    });
    expect(within(screen.getByTestId('workflow-card-1')).getByText('Queued')).toBeInTheDocument();
    expect(within(screen.getByTestId('workflow-card-1')).queryByTestId('workflow-card-progress-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('workflow-card-0')).toHaveClass('pending');
    expect(screen.getByTestId('workflow-card-1')).toHaveClass('pending');
    expect(screen.getByTestId('results-container')).not.toHaveClass('loading');

    firstGate.resolve();
  });

  it('keeps completed cards exportable while later queued cards stay out of the selection set', async () => {
    const secondGate = createDeferred();

    runtimeProcessMock
      .mockImplementationOnce(async () => new Blob(['first'], { type: 'image/jpeg' }))
      .mockImplementationOnce(async (_file, options = {}) => {
        options.onProgress?.({
          phase: 'stage-progress',
          stage: 'generate-gain-map',
          stageProgress: 10,
          note: 'Generating gain map',
          fileIndex: 1,
          totalFiles: 2,
          fileName: 'photo-1.jpg',
          elapsedMs: 5,
          stageDurationsMs: {},
          timestamp: Date.now(),
        });
        await secondGate.promise;
        return new Blob(['second'], { type: 'image/jpeg' });
      });

    renderProcessor({ files: makeFiles(2) });
    await fireEvent.click(screen.getByTestId('tab-results'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^export \(1\)$/i })).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-select-0'));
    expect(screen.getByRole('button', { name: /^export \(0\)$/i })).toBeInTheDocument();
    expect(screen.queryByTestId('workflow-card-select-1')).not.toBeInTheDocument();

    secondGate.resolve();
  });

  it('opens queued and processing cards in the viewer using their input previews', async () => {
    const firstGate = createDeferred();

    runtimeProcessMock.mockImplementationOnce(async (_file, options = {}) => {
      options.onProgress?.({
        phase: 'stage-progress',
        stage: 'generate-gain-map',
        stageProgress: 22,
        note: 'Generating gain map',
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        elapsedMs: 5,
        stageDurationsMs: {},
        timestamp: Date.now(),
      });
      await firstGate.promise;
      return new Blob(['first'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });
    await fireEvent.click(screen.getByTestId('tab-results'));

    await waitFor(() => {
      expect(screen.getByTestId('result-thumbnail-0')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('result-thumbnail-0'));
    expect(screen.getByTestId('photo-viewer-modal')).toBeInTheDocument();
    expect(screen.getByTestId('photo-viewer-image')).toHaveAttribute('alt', 'photo-0.jpg');

    firstGate.resolve();
  });

  it('shows the circular overlay for hdr-intent processing paths that only emit stage lifecycle events', async () => {
    const firstGate = createDeferred();

    runtimeProcessMock.mockImplementationOnce(async (_file, options = {}) => {
      options.onProgress?.({
        phase: 'stage-start',
        stage: 'compress-hdr-intent',
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        elapsedMs: 5,
        stageDurationsMs: {},
        timestamp: Date.now(),
      });
      options.onProgress?.({
        phase: 'stage-complete',
        stage: 'compress-hdr-intent',
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        elapsedMs: 10,
        stageDurationsMs: { 'compress-hdr-intent': 5 },
        timestamp: Date.now(),
      });
      await firstGate.promise;
      return new Blob(['first'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });
    await fireEvent.click(screen.getByTestId('tab-results'));

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-progress-0')).toBeInTheDocument();
    });
    expect(screen.getByText(/Preparing HDR input \d+%/i)).toBeInTheDocument();

    firstGate.resolve();
  });

  it('shows the circular overlay for preserved gain-map paths that only emit stage lifecycle events', async () => {
    const firstGate = createDeferred();

    runtimeProcessMock.mockImplementationOnce(async (_file, options = {}) => {
      options.onProgress?.({
        phase: 'stage-start',
        stage: 'extract-preserved-components',
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        elapsedMs: 5,
        stageDurationsMs: {},
        timestamp: Date.now(),
      });
      options.onProgress?.({
        phase: 'stage-complete',
        stage: 'extract-preserved-components',
        fileIndex: 0,
        totalFiles: 1,
        fileName: 'photo-0.jpg',
        elapsedMs: 10,
        stageDurationsMs: { 'extract-preserved-components': 5 },
        timestamp: Date.now(),
      });
      await firstGate.promise;
      return new Blob(['first'], { type: 'image/jpeg' });
    });

    renderProcessor({ files: makeFiles(1) });
    await fireEvent.click(screen.getByTestId('tab-results'));

    await waitFor(() => {
      expect(screen.getByTestId('workflow-card-progress-0')).toBeInTheDocument();
    });

    firstGate.resolve();
  });
});
