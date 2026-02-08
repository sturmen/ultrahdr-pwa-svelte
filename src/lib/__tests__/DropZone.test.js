/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DropZone - isEligibleFile', () => {
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

  it('should return true for eligible extensions', () => {
    expect(isEligibleFile('test.jpg')).toBe(true);
    expect(isEligibleFile('test.jpeg')).toBe(true);
    expect(isEligibleFile('test.png')).toBe(true);
    expect(isEligibleFile('test.webp')).toBe(true);
    expect(isEligibleFile('test.heic')).toBe(true);
    expect(isEligibleFile('test.heif')).toBe(true);
    expect(isEligibleFile('test.tif')).toBe(true);
    expect(isEligibleFile('test.tiff')).toBe(true);
  });

  it('should return true for uppercase extensions', () => {
    expect(isEligibleFile('test.JPG')).toBe(true);
    expect(isEligibleFile('test.PNG')).toBe(true);
    expect(isEligibleFile('test.JPEG')).toBe(true);
  });

  it('should return false for ineligible extensions', () => {
    expect(isEligibleFile('test.gif')).toBe(false);
    expect(isEligibleFile('test.bmp')).toBe(false);
    expect(isEligibleFile('test.pdf')).toBe(false);
    expect(isEligibleFile('test.txt')).toBe(false);
  });

  it('should return false for files without extensions', () => {
    expect(isEligibleFile('test')).toBe(false);
  });
});

describe('DropZone - getMimeType', () => {
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

  it('should return correct MIME types', () => {
    expect(getMimeType('test.jpg')).toBe('image/jpeg');
    expect(getMimeType('test.jpeg')).toBe('image/jpeg');
    expect(getMimeType('test.png')).toBe('image/png');
    expect(getMimeType('test.webp')).toBe('image/webp');
    expect(getMimeType('test.heic')).toBe('image/heic');
    expect(getMimeType('test.heif')).toBe('image/heif');
    expect(getMimeType('test.tif')).toBe('image/tiff');
    expect(getMimeType('test.tiff')).toBe('image/tiff');
  });

  it('should return application/octet-stream for unknown extensions', () => {
    expect(getMimeType('test.gif')).toBe('application/octet-stream');
    expect(getMimeType('test.pdf')).toBe('application/octet-stream');
  });
});

describe('DropZone - File stabilization', () => {
  it('should convert File to stable File with arrayBuffer', async () => {
    const originalFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    // Add arrayBuffer method if not present
    if (!originalFile.arrayBuffer) {
      Object.defineProperty(originalFile, 'arrayBuffer', {
        value: () => Promise.resolve(new ArrayBuffer(12)),
        writable: false,
      });
    }

    async function stabilizeFile(file) {
      const arrayBuffer = await file.arrayBuffer();
      return new File([arrayBuffer], file.name, {
        type: file.type || 'application/octet-stream',
      });
    }

    const stableFile = await stabilizeFile(originalFile);

    expect(stableFile).toBeInstanceOf(File);
    expect(stableFile.name).toBe('test.jpg');
    expect(stableFile.type).toBe('image/jpeg');
  });
});

describe('DropZone - extractFilesFromDataTransfer', () => {
  function isEligibleFile(fileName) {
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
    const lowerName = fileName.toLowerCase();
    return ELIGIBLE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  }

  it('should filter eligible files from DataTransfer', async () => {
    const dataTransfer = {
      items: null, // Fallback mode
      files: [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' }),
        new File(['test3'], 'test3.gif', { type: 'image/gif' }), // Ineligible
      ],
    };

    const files = Array.from(dataTransfer.files).filter((f) =>
      isEligibleFile(f.name)
    );

    expect(files).toHaveLength(2);
    expect(files[0].name).toBe('test1.jpg');
    expect(files[1].name).toBe('test2.png');
  });
});
