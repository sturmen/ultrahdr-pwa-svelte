/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DIAGNOSTICS_REPORTS_KEY } from '../diagnostics.ts';

const lazyImportMocks = vi.hoisted(() => ({
  jszipModuleLoads: vi.fn(),
  runtimeProcessMock: vi.fn(async (_file: File, options: Record<string, unknown> = {}) => {
    const onProgress = options.onProgress as ((event: Record<string, unknown>) => void) | undefined;
    onProgress?.({
      phase: 'pipeline-complete',
      stage: 'encode',
      elapsedMs: 5,
      stageDurationsMs: { encode: 5 },
      timestamp: Date.now(),
    });
    return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
  }),
}));

vi.mock('jszip', () => {
  lazyImportMocks.jszipModuleLoads();
  throw new Error('JSZip should only load when a zip export is requested.');
});

function createRuntime() {
  return {
    process: lazyImportMocks.runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

function createMatchMedia(matchesDesktop: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
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

function makeFiles(count = 1): File[] {
  return Array.from({ length: count }, (_, index) =>
    new File([`file-${index}`], `photo-${index}.jpg`, { type: 'image/jpeg' }),
  );
}

describe('ImageProcessor lazy imports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.matchMedia = createMatchMedia(false);
  });

  it('renders the app shell without importing JSZip', async () => {
    const { default: ImageProcessor } = await import('../ImageProcessor.svelte');

    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    expect(screen.getByRole('button', { name: /add images/i })).toBeInTheDocument();
    expect(lazyImportMocks.jszipModuleLoads).not.toHaveBeenCalled();
  });

  it('records diagnostics breadcrumbs when zip export runtime loading fails', async () => {
    const { default: ImageProcessor } = await import('../ImageProcessor.svelte');

    render(ImageProcessor, {
      props: {
        files: makeFiles(2),
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('tab-results')).toHaveTextContent('2');
    });

    await fireEvent.click(screen.getByTestId('tab-results'));
    await fireEvent.click(screen.getByRole('button', { name: /^export/i }));

    const exportSheet = screen.getByTestId('export-sheet');
    const zipButton = within(exportSheet).getByRole('button', {
      name: /download as single zip file/i,
    });

    await fireEvent.click(zipButton);

    await waitFor(() => {
      expect(lazyImportMocks.jszipModuleLoads).toHaveBeenCalledTimes(1);
    });

    const persistedDiagnostics = JSON.parse(
      window.localStorage.getItem(DIAGNOSTICS_REPORTS_KEY) || '{"events":[]}',
    ) as { events?: Array<{ name?: string; context?: Record<string, unknown> }> };

    expect(persistedDiagnostics.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'runtime',
          name: 'zip-runtime-load-started',
        }),
        expect.objectContaining({
          category: 'error',
          name: 'zip-runtime-load-failed',
          context: expect.objectContaining({
            operation: 'download-selected-zip',
          }),
        }),
      ]),
    );
  });
});
