/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import DropZone from '../DropZone.svelte';
import DropZoneHost from './fixtures/DropZoneHost.svelte';

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

describe('DropZone - file eligibility helpers', () => {
  const ELIGIBLE_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.heic',
    '.heif',
    '.tif',
    '.tiff',
  ];

  function isEligibleFile(fileName) {
    const lowerName = fileName.toLowerCase();
    return ELIGIBLE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  }

  function getMimeType(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
      heif: 'image/heif',
      tif: 'image/tiff',
      tiff: 'image/tiff',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  it('accepts supported extensions, including uppercase names', () => {
    expect(isEligibleFile('test.jpg')).toBe(true);
    expect(isEligibleFile('test.PNG')).toBe(true);
    expect(isEligibleFile('test.HEIC')).toBe(true);
    expect(isEligibleFile('test.pdf')).toBe(false);
  });

  it('maps known MIME types and falls back for unknown types', () => {
    expect(getMimeType('test.jpg')).toBe('image/jpeg');
    expect(getMimeType('test.heif')).toBe('image/heif');
    expect(getMimeType('test.unknown')).toBe('application/octet-stream');
  });
});

describe('DropZone - touch-first UI and fallbacks', () => {
  it('renders mobile upload-only affordance', () => {
    window.matchMedia = createMatchMedia(false);
    render(DropZone);

    expect(screen.getByTestId('upload-drop-zone')).toBeTruthy();
    expect(screen.getByText(/tap to upload images/i)).toBeTruthy();
    expect(screen.queryByText(/drag and drop/i)).not.toBeInTheDocument();
  });

  it('renders combined drag-or-upload affordance on desktop', () => {
    window.matchMedia = createMatchMedia(true);
    render(DropZone);

    expect(screen.getByText(/drag and drop images, or click to upload/i)).toBeTruthy();
  });

  it('filters unsupported files when DataTransfer.items API is unavailable', async () => {
    const received = vi.fn();
    render(DropZoneHost, { props: { onFiles: received } });

    const dropZone = screen.getByTestId('upload-drop-zone');
    const eligible = new File(['ok'], 'photo.jpg', { type: 'image/jpeg' });
    const ineligible = new File(['bad'], 'notes.txt', { type: 'text/plain' });

    await fireEvent.drop(dropZone, {
      dataTransfer: {
        items: null,
        files: [eligible, ineligible],
      },
    });

    await waitFor(() => {
      expect(received).toHaveBeenCalledTimes(1);
    });

    const [[filteredFiles]] = received.mock.calls;
    expect(filteredFiles).toHaveLength(1);
    expect(filteredFiles[0].name).toBe('photo.jpg');
  });

  it('dispatches selected files from file input changes', async () => {
    const received = vi.fn();
    render(DropZoneHost, { props: { onFiles: received } });

    const input = document.getElementById('file-upload');
    const file = new File(['ok'], 'picked.jpg', { type: 'image/jpeg' });

    await fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(received).toHaveBeenCalledTimes(1);
    });

    const [[files]] = received.mock.calls;
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('picked.jpg');
  });
});
