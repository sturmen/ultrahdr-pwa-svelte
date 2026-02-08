/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Shared mocks to allow override in tests
const decodeMock = vi.fn();
const displayMock = vi.fn((imageData, callback) => callback(true));

// Mock libheif before importing
vi.mock('libheif-js/libheif-wasm/libheif', () => {
  const mockHeif = {
    HeifDecoder: vi.fn().mockImplementation(function () {
      this.decode = decodeMock;
    }),
    HeifImage: vi.fn().mockImplementation(function () {
      this.get_width = () => 100;
      this.get_height = () => 100;
      this.display = displayMock;
    }),
    _malloc: vi.fn().mockReturnValue(0),
    _free: vi.fn(),
    getValue: vi.fn(),
    UTF8ToString: vi.fn().mockReturnValue('urn:apple:gainmap'),
  };
  return {
    default: vi.fn().mockResolvedValue(mockHeif),
  };
});

describe('heic-processing.js', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      })
    );

    // Default decode behavior: return one image
    decodeMock.mockReturnValue([{
      get_width: () => 100,
      get_height: () => 100,
      handle: 'mock-handle',
      display: displayMock,
    }]);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.resetModules();
  });

  describe('processHeic', () => {
    it('should be defined', async () => {
      const module = await import('../heic-processing.js');
      expect(module.processHeic).toBeDefined();
    });

    it('should process HEIC files and return PNG', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processHeic } = await import('../heic-processing.js');

      const result = await processHeic(mockFile);

      expect(result).toBeInstanceOf(File);
    });

    it('should discard gain map when option is set', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processHeic } = await import('../heic-processing.js');

      const options = { discardGainMap: true };
      const result = await processHeic(mockFile, options);

      expect(result).toBeInstanceOf(File);
    });

    it('should handle error when no images found', async () => {
      const mockFile = new File(['test'], 'test.heic', { type: 'image/heic' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processHeic } = await import('../heic-processing.js');

      // Override shared decode mock to return empty array for this test
      decodeMock.mockReturnValue([]);

      await expect(processHeic(mockFile)).rejects.toThrow('No images found in HEIC file');
    });
  });
});
