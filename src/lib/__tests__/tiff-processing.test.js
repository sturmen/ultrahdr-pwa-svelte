/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Use vi.hoisted to allow dynamic mock configuration
const utifMock = vi.hoisted(() => {
  return {
    decode: vi.fn(),
    decodeImage: vi.fn(),
    toRGBA8: vi.fn(),
  };
});

// Mock UTIF adapter before importing
vi.mock('../utif-adapter.js', () => ({
  default: utifMock,
}));

describe('tiff-processing.js', () => {
  describe('processTiff', () => {
    beforeEach(() => {
      // Reset mocks before each test
      utifMock.decode.mockReset();
      utifMock.decodeImage.mockReset();
      utifMock.toRGBA8.mockReset();
    });

    it('should throw error when no IFDs found', async () => {
      // Mock UTIF to return empty array
      utifMock.decode.mockReturnValue([]);

      const mockFile = new File(['test'], 'test.tiff', { type: 'image/tiff' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processTiff } = await import('../tiff-processing.js');

      await expect(processTiff(mockFile)).rejects.toThrow('No IFDs found in TIFF file');
    });

    it('should process TIFF file and return PNG', async () => {
      utifMock.decode.mockReturnValue([
        {
          width: 100,
          height: 100,
          t4: [0x01000000],
        },
      ]);
      utifMock.toRGBA8.mockReturnValue(new Array(100 * 100 * 4).fill(255));

      const mockFile = new File(['test'], 'test.tiff', { type: 'image/tiff' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processTiff } = await import('../tiff-processing.js');

      const result = await processTiff(mockFile);

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.png');
      expect(result.type).toBe('image/png');
    });

    it('should handle .tif extension', async () => {
      utifMock.decode.mockReturnValue([
        {
          width: 100,
          height: 100,
          t4: [0x01000000],
        },
      ]);
      utifMock.toRGBA8.mockReturnValue(new Array(100 * 100 * 4).fill(255));

      const mockFile = new File(['test'], 'test.tif', { type: 'image/tiff' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processTiff } = await import('../tiff-processing.js');

      const result = await processTiff(mockFile);

      expect(result.name).toBe('test.png');
    });

    it('should handle TIFF with different dimensions', async () => {
      utifMock.decode.mockReturnValue([
        {
          width: 256,
          height: 128,
        },
      ]);
      utifMock.toRGBA8.mockReturnValue(new Array(256 * 128 * 4).fill(0));

      const mockFile = new File(['test'], 'test.tiff', { type: 'image/tiff' });
      mockFile.arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));

      const { processTiff } = await import('../tiff-processing.js');

      const result = await processTiff(mockFile);

      expect(result).toBeInstanceOf(File);
    });
  });
});
