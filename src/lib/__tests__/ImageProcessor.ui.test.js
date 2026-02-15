/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';

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
});
