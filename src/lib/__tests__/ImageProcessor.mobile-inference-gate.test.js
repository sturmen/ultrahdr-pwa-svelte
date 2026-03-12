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

const probeInputProcessingPathFromHeadersMock = vi.hoisted(() => vi.fn(async () => 'unknown'));
const classifyInputProcessingPathMock = vi.hoisted(() => vi.fn(async () => 'generated'));
const capabilitiesState = vi.hoisted(() => ({
  isAndroid: false,
  isIOS: false,
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
    userAgent: 'test-agent',
    userAgent: capabilitiesState.userAgent,
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
    probeInputProcessingPathFromHeadersMock.mockImplementation(async () => 'unknown');
    classifyInputProcessingPathMock.mockImplementation(async () => 'generated');
    capabilitiesState.isAndroid = false;
    capabilitiesState.isIOS = false;
    capabilitiesState.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';
    window.matchMedia = createMatchMedia(false);
    window.localStorage?.clear?.();
    delete window.__ULTRAHDR_PROCESSING_PREFERENCES;
    delete window.__ULTRAHDR_BACKEND_PREFERENCE;
  });

  it('does not show the warning on desktop Chrome for generated-path files', async () => {
    window.matchMedia = createMatchMedia(true);
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('does not show the warning on unsupported browsers for preserved-path files', async () => {
    capabilitiesState.isAndroid = true;
    classifyInputProcessingPathMock.mockResolvedValue('preserved');
    renderProcessor();

    await addFiles([makeFile('safe.jpg')]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('shows the warning on unsupported browsers for hdr-intent files without a gain map', async () => {
    capabilitiesState.isAndroid = true;
    probeInputProcessingPathFromHeadersMock.mockResolvedValue('hdr-intent');
    classifyInputProcessingPathMock.mockResolvedValue('hdr-intent');
    renderProcessor();

    await addFiles([makeFile('safe.HIF', 'image/heif')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });
    expect(runtimeProcessMock).not.toHaveBeenCalled();
    expect(classifyInputProcessingPathMock).not.toHaveBeenCalled();
  });

  it('does not show the warning for HEIC files with decisive preserved headers and skips decode fallback', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
    probeInputProcessingPathFromHeadersMock.mockResolvedValue('preserved');
    renderProcessor();

    await addFiles([makeFile('safe.heic', 'image/heic')]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
    expect(classifyInputProcessingPathMock).not.toHaveBeenCalled();
  });

  it('falls back to decode-based classification when HEIC headers are ambiguous', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
    probeInputProcessingPathFromHeadersMock.mockResolvedValue('unknown');
    classifyInputProcessingPathMock.mockResolvedValue('generated');
    renderProcessor();

    await addFiles([makeFile('ambiguous.heic', 'image/heic')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });
    expect(classifyInputProcessingPathMock).toHaveBeenCalledTimes(1);
    expect(runtimeProcessMock).not.toHaveBeenCalled();
  });

  it('blocks generated-path files on desktop Firefox until the acknowledgement challenge is completed', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0; rv:123.0) Gecko/20100101 Firefox/123.0';
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });
    expect(runtimeProcessMock).not.toHaveBeenCalled();
    expect(
      screen.getByText('This browser has severe memory limitations'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'This webapp may require more memory than your browser permits. Please try Chrome on Windows or macOS.',
      ),
    ).toBeInTheDocument();

    const input = screen.getByTestId('mobile-inference-warning-input');
    const proceed = screen.getByTestId('mobile-inference-warning-proceed');

    expect(proceed).toBeDisabled();
    await fireEvent.input(input, {
      target: { value: 'I WILL ALSO TRY CHROME ON WINDOWS OR MACOS' },
    });
    expect(proceed).toBeEnabled();

    await fireEvent.click(proceed);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('mobile-inference-warning-dialog')).not.toBeInTheDocument();
  });

  it('queues safe files immediately and holds only generated-path files for acknowledgement on unsupported browsers', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
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
      target: { value: 'I will also try Chrome on Windows or macOS' },
    });
    await fireEvent.click(screen.getByTestId('mobile-inference-warning-proceed'));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(runtimeProcessMock.mock.calls[1][0].name).toBe('unsafe.jpg');
  });

  it('queues preserved files immediately and holds hdr-intent files for acknowledgement on unsupported browsers', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
    classifyInputProcessingPathMock
      .mockResolvedValueOnce('preserved')
      .mockResolvedValueOnce('hdr-intent');
    renderProcessor();

    await addFiles([
      makeFile('safe.heic', 'image/heic'),
      makeFile('unsafe.HIF', 'image/heif'),
    ]);

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(1);
    });
    expect(runtimeProcessMock.mock.calls[0][0].name).toBe('safe.heic');
    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });

    await fireEvent.input(screen.getByTestId('mobile-inference-warning-input'), {
      target: { value: 'I will also try Chrome on Windows or macOS' },
    });
    await fireEvent.click(screen.getByTestId('mobile-inference-warning-proceed'));

    await waitFor(() => {
      expect(runtimeProcessMock).toHaveBeenCalledTimes(2);
    });
    expect(runtimeProcessMock.mock.calls[1][0].name).toBe('unsafe.HIF');
  });

  it('requires the trimmed acknowledgement challenge and ignores case', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-input')).toBeInTheDocument();
    });
    const input = screen.getByTestId('mobile-inference-warning-input');
    const proceed = screen.getByTestId('mobile-inference-warning-proceed');

    await fireEvent.input(input, {
      target: { value: 'I WILL ALSO TRY CHROME ON WINDOWS OR MACOS' },
    });
    expect(proceed).toBeEnabled();

    await fireEvent.input(input, {
      target: { value: '  I will also try Chrome on Windows or macOS  ' },
    });
    expect(proceed).toBeEnabled();

    await fireEvent.input(input, {
      target: { value: 'I will also try Chrome on Windows or macOS please' },
    });
    expect(proceed).toBeDisabled();
  });

  it('cancels only the held generated-path files on unsupported browsers', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
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

  it('remembers acknowledgement for the rest of the tab session only on unsupported browsers', async () => {
    capabilitiesState.userAgent =
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';
    const firstRender = renderProcessor();

    await addFiles([makeFile('unsafe-a.jpg')]);
    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-input')).toBeInTheDocument();
    });
    await fireEvent.input(screen.getByTestId('mobile-inference-warning-input'), {
      target: { value: 'I will also try Chrome on Windows or macOS' },
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

  it('shows the warning on mobile Chrome because it is not desktop Chrome/Chromium', async () => {
    capabilitiesState.isAndroid = true;
    capabilitiesState.userAgent =
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36';
    renderProcessor();

    await addFiles([makeFile('unsafe.jpg')]);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-inference-warning-dialog')).toBeInTheDocument();
    });
    expect(runtimeProcessMock).not.toHaveBeenCalled();
  });
});
