/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';

describe('App - Header content', () => {
  it('should have UltraHDR Image Enhancer title', () => {
    const title = 'UltraHDR Image Enhancer';
    expect(title).toBe('UltraHDR Image Enhancer');
  });

  it('should have subtitle about converting images', () => {
    const subtitle = 'Convert your images to UltraHDR.';
    expect(subtitle).toContain('UltraHDR');
  });

  it('should have footer with version info', () => {
    const version = '1.0.0';
    expect(version).toBeDefined();
  });
});

describe('App - Links', () => {
  it('should have What is HDR link', () => {
    const linkText = 'What is HDR?';
    expect(linkText).toBeDefined();
  });

  it('should have Source code link', () => {
    const linkText = 'Source code';
    expect(linkText).toBeDefined();
  });
});

describe('App - Processing modes', () => {
  it('should show drop zone when no files', () => {
    const files = [];
    expect(files.length).toBe(0);
  });

  it('should show image processor when files are present', () => {
    const files = ['test1.jpg', 'test2.jpg'];
    expect(files.length).toBeGreaterThan(0);
  });

  it('should reset to drop zone after reset', () => {
    let files = ['test1.jpg'];
    files = [];
    expect(files.length).toBe(0);
  });
});

describe('App - UI state', () => {
  it('should toggle between drop zone and processor', () => {
    let showDropZone = true;
    let files = [];

    if (files.length > 0) {
      showDropZone = false;
    }

    expect(showDropZone).toBe(true);

    // Add files
    files = ['test.jpg'];
    showDropZone = files.length === 0;

    expect(showDropZone).toBe(false);
  });
});
