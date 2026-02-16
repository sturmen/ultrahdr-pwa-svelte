/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';
import { processImage } from '../processing';

vi.mock('../processing', () => ({
  processImage: vi.fn(async (_file, options = {}) => {
    options.onProgress?.({
      phase: 'pipeline-complete',
      stage: 'encode',
      elapsedMs: 5,
      stageDurationsMs: { encode: 5 },
      timestamp: Date.now(),
    });
    return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
  }),
}));

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

describe('ImageProcessor mobile-native UI behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = createMatchMedia(false);
  });

  it('defaults to Convert tab and keeps advanced settings collapsed until requested', async () => {
    render(ImageProcessor, { props: { files: makeFiles(1) } });

    const convertTab = screen.getByTestId('tab-convert');
    expect(convertTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('quick-controls')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('tab-settings'));
    expect(screen.queryByTestId('advanced-settings')).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /show advanced settings/i }));
    expect(screen.getByTestId('advanced-settings')).toBeInTheDocument();
  });

  it('shows results count in tab badge and only shows sticky mobile action bar on Results tab', async () => {
    render(ImageProcessor, { props: { files: makeFiles(1) } });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    expect(screen.queryByTestId('mobile-action-bar')).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('tab-results'));
    expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-action-bar')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('tab-settings'));
    expect(screen.queryByTestId('mobile-action-bar')).not.toBeInTheDocument();
  });

  it('renders two-pane desktop layout and hides mobile tab bar', async () => {
    window.matchMedia = createMatchMedia(true);

    render(ImageProcessor, { props: { files: makeFiles(1) } });

    await waitFor(() => {
      expect(screen.getByTestId('results-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('desktop-two-pane')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-tab-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('quick-controls')).toBeInTheDocument();
  });

  it('renders granular progress details from stage-progress telemetry updates', async () => {
    vi.mocked(processImage).mockImplementationOnce(async (_file, options = {}) => {
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
      });

      return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
    });

    render(ImageProcessor, { props: { files: makeFiles(1) } });
    await fireEvent.click(screen.getByTestId('tab-settings'));

    await waitFor(() => {
      expect(screen.getByTestId('pipeline-progress')).toBeInTheDocument();
    });

    expect(screen.getByText(/Encoding gain map/i)).toBeInTheDocument();
    expect(screen.getByText(/photo-0.jpg/i)).toBeInTheDocument();
    expect(screen.getByText(/File 1 of 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage 42%/i)).toBeInTheDocument();
  });

  it('pauses after the current file and resumes queued work only when resumed', async () => {
    const firstFileGate = createDeferred();

    vi.mocked(processImage)
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

    render(ImageProcessor, { props: { files: makeFiles(2) } });

    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByRole('button', { name: /pause queue/i }));
    firstFileGate.resolve();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resume queue/i })).toBeInTheDocument();
    });
    expect(processImage).toHaveBeenCalledTimes(1);

    await fireEvent.click(screen.getByRole('button', { name: /resume queue/i }));
    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(2);
    });
  });

  it('marks completed outputs stale on setting changes and waits for explicit reprocess', async () => {
    render(ImageProcessor, { props: { files: makeFiles(1) } });

    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(1);
    });

    await fireEvent.input(screen.getByLabelText(/max content boost/i), {
      target: { value: '4.0' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('stale-reprocess-prompt')).toBeInTheDocument();
    });

    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(processImage).toHaveBeenCalledTimes(1);

    await fireEvent.click(screen.getByRole('button', { name: /reprocess all stale/i }));
    await waitFor(() => {
      expect(processImage).toHaveBeenCalledTimes(2);
    });
  });

  it('moves to results and emphasizes share-out action after share-target completion', async () => {
    render(ImageProcessor, { props: { files: makeFiles(1), launchSource: 'share-target' } });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('tab-results')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('share-out-cta')).toBeInTheDocument();
  });
});
