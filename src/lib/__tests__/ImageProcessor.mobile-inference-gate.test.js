/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import ImageProcessor from '../ImageProcessor.svelte';

const runtimeProcessMock = vi.fn(async (_file, options = {}) => {
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
});

const classifyInputProcessingPathMock = vi.hoisted(() => vi.fn(async () => 'generated'));
const capabilitiesState = vi.hoisted(() => ({
  isAndroid: false,
  isIOS: false,
}));

vi.mock('../processing-path.js', async () => {
  const actual = await vi.importActual('../processing-path.js');
  return {
    ...actual,
    classifyInputProcessingPath: classifyInputProcessingPathMock,
  };
});

vi.mock('../capabilities.js', () => ({
  getCapabilities: vi.fn(() => ({
    userAgent: 'test-agent',
    deviceMemory: 8,
    isIOS: capabilitiesState.isIOS,
    isAndroid: capabilitiesState.isAndroid,
    isSafari: false,
    isStandalone: false,
    supportsShare: false,
    supportsFileShare: false,
    supportsShareTarget: true,
    supportsWakeLock: true,
    supportsOffscreenWorker: true,
  })),
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

function createRuntime() {
  return {
    process: runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

function makeFile(name = 'photo.jpg', type = 'image/jpeg') {
  return new File(['file'], name, { type });
}

function renderProcessor(props = {}) {
  return render(ImageProcessor, { props: { files: [], runtime: createRuntime(), ...props } });
}

async function addFiles(files, root = document) {
  const input = root.querySelector('#add-files');
  await fireEvent.change(input, {
    target: { files },
  });
}

describe('ImageProcessor smartphone inference warning gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeProcessMock.mockClear();
    classifyInputProcessingPathMock.mockImplementation(async () => 'generated');
    capabilitiesState.isAndroid = false;
    capabilitiesState.isIOS = false;
    window.matchMedia = createMatchMedia(false);
    window.localStorage?.clear?.();
    delete window.__ULTRAHDR_PROCESSING_PREFERENCES;
    delete window.__ULTRAHDR_BACKEND_PREFERENCE;
  });

  it('does not show the warning on desktop for generated-path files', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('does not show the warning on smartphones for preserved-path files', async () => {
    capabilitiesState.isAndroid = true;
    classifyInputProcessingPathMock.mockResolvedValue('preserved');
    renderProcessor();

    await addFiles([makeFile('safe.jpg')]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('does not show the warning on smartphones for hdr-intent files', async () => {
    capabilitiesState.isAndroid = true;
    classifyInputProcessingPathMock.mockResolvedValue('hdr-intent');
    renderProcessor();

    await addFiles([makeFile('safe.HIF', 'image/heif')]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('blocks generated-path files on smartphones until the acknowledgement challenge is completed', async () => {
    capabilitiesState.isAndroid = true;
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });
    expect(runtimeProcessMock).not.toHaveBeenCalled();

    const input = screen.getByTestId('mobile-inference-warning-input');
    const proceed = screen.getByTestId('mobile-inference-warning-proceed');

    expect(proceed).toBeDisabled();
    await fireEvent.input(input, { target: { value: 'i acknowledge' } });
    expect(proceed).toBeEnabled();

    await fireEvent.click(proceed);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('queues safe files immediately and holds only generated-path files for acknowledgement on smartphones', async () => {
    capabilitiesState.isAndroid = true;
    classifyInputProcessingPathMock
      .mockResolvedValueOnce('preserved')
      .mockResolvedValueOnce('generated');
    renderProcessor();

    await addFiles([
      makeFile('safe.heic', 'image/heic'),
      makeFile('unsafe.jpg', 'image/jpeg'),
    ]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(runtimeProcessMock.mock.calls[0][0].name).toBe('safe.heic');
    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });

    await fireEvent.input(screen.getByTestId('mobile-inference-warning-input'), {
      target: { value: 'I acknowledge' },
    });
    await fireEvent.click(screen.getByTestId('mobile-inference-warning-proceed'));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(runtimeProcessMock.mock.calls[1][0].name).toBe('unsafe.jpg');
  });

  it('requires exact spacing for the acknowledgement challenge but ignores case', async () => {
    capabilitiesState.isAndroid = true;
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-input')).toBeInTheDocument();
    });
    const input = screen.getByTestId('mobile-inference-warning-input');
    const proceed = screen.getByTestId('mobile-inference-warning-proceed');

    await fireEvent.input(input, { target: { value: 'I ACKNOWLEDGE' } });
    expect(proceed).toBeEnabled();

    await fireEvent.input(input, { target: { value: ' I acknowledge ' } });
    expect(proceed).toBeDisabled();
  });

  it('cancels only the held generated-path files', async () => {
    capabilitiesState.isAndroid = true;
    classifyInputProcessingPathMock
      .mockResolvedValueOnce('preserved')
      .mockResolvedValueOnce('generated');
    renderProcessor();

    await addFiles([
      makeFile('safe.heic', 'image/heic'),
      makeFile('unsafe.jpg', 'image/jpeg'),
    ]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-cancel')).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByTestId('mobile-inference-warning-cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
    });
    expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    expect(runtimeProcessMock.mock.calls[0][0].name).toBe('safe.heic');
  });

  it('remembers acknowledgement for the rest of the tab session only', async () => {
    capabilitiesState.isAndroid = true;
    const firstRender = renderProcessor();

    await addFiles([makeFile('unsafe-a.jpg')]);
    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-input')).toBeInTheDocument();
    });
    await fireEvent.input(screen.getByTestId('mobile-inference-warning-input'), {
      target: { value: 'I acknowledge' },
    });
    await fireEvent.click(screen.getByTestId('mobile-inference-warning-proceed'));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });

    await fireEvent.click(screen.getByTestId('tab-convert'));
    await addFiles([makeFile('unsafe-b.jpg')]);
    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();

    firstRender.unmount();
    runtimeProcessMock.mockClear();

    const secondRender = renderProcessor();
    await waitFor(() => {
      expect(secondRender.container.querySelector('#add-files')).toBeTruthy();
    });
    await addFiles([makeFile('unsafe-c.jpg')], secondRender.container);
    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });
    expect(runtimeProcessMock).not.toHaveBeenCalled();
  });
});
