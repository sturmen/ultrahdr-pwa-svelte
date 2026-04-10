/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const {
  JimpMock,
  jimpReadMock,
  pngDecodeMock,
  resizeMock,
  rotateMock,
  bitmapState,
  constructedInputs,
} = vi.hoisted(() => {
  const bitmapState = {
    width: 2,
    height: 1,
    data: Buffer.from([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]),
  };

  const resizeMock = vi.fn(async ({ w, h }: { w: number; h: number }) => {
    bitmapState.width = w;
    bitmapState.height = h;
    bitmapState.data = Buffer.alloc(w * h * 4, 127);
  });

  const rotateMock = vi.fn(async (degrees: number) => {
    if (degrees === 90 || degrees === 270) {
      const nextWidth = bitmapState.height;
      const nextHeight = bitmapState.width;
      bitmapState.width = nextWidth;
      bitmapState.height = nextHeight;
      bitmapState.data = Buffer.alloc(nextWidth * nextHeight * 4, 64);
      return;
    }
    bitmapState.data = Buffer.from(bitmapState.data);
  });

  const jimpReadMock = vi.fn(async () => ({
    bitmap: bitmapState,
    resize: resizeMock,
    rotate: rotateMock,
  }));

  const pngDecodeMock = vi.fn(() => ({
    width: 2,
    height: 1,
    data: new Uint8Array([17, 34]),
  }));

  const constructedInputs: Uint8Array[] = [];

  function JimpMock(options?: { data?: Uint8Array; width?: number; height?: number }) {
    if (options?.data) {
      constructedInputs.push(options.data);
      bitmapState.width = options.width ?? bitmapState.width;
      bitmapState.height = options.height ?? bitmapState.height;
      bitmapState.data = options.data;
    }
    return {
      bitmap: bitmapState,
      resize: resizeMock,
      rotate: rotateMock,
    };
  }

  return {
    JimpMock,
    jimpReadMock,
    pngDecodeMock,
    resizeMock,
    rotateMock,
    bitmapState,
    constructedInputs,
  };
});

vi.mock('jimp', () => ({
  Jimp: Object.assign(JimpMock, {
    read: jimpReadMock,
  }),
  ResizeStrategy: {
    BILINEAR: 'bilinear',
  },
}));

vi.mock('fast-png', () => ({
  decode: pngDecodeMock,
}));

describe('raster-image', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    bitmapState.width = 2;
    bitmapState.height = 1;
    bitmapState.data = Buffer.from([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);
    constructedInputs.length = 0;
  });

  it('resizes rgba raster buffers without browser drawing primitives', async () => {
    const { resizeRasterImage } = await import('../raster-image.ts');

    const result = await resizeRasterImage({
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]),
    }, 4, 3);

    expect(result.width).toBe(4);
    expect(result.height).toBe(3);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
    expect(result.data).toHaveLength(4 * 3 * 4);
    expect(resizeMock).toHaveBeenCalledTimes(1);
  });

  it('rotates orthogonal rgba raster buffers without browser drawing primitives or jimp rotate', async () => {
    const { rotateRasterImage } = await import('../raster-image.ts');

    const result = await rotateRasterImage({
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        255, 0, 0, 255,
        0, 255, 0, 255,
      ]),
    }, 90);

    expect(result.width).toBe(1);
    expect(result.height).toBe(2);
    expect(result.data).toBeInstanceOf(Uint8ClampedArray);
    expect(result.data).toHaveLength(1 * 2 * 4);
    expect(Array.from(result.data)).toEqual([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);
    expect(rotateMock).not.toHaveBeenCalled();
  });

  it('expands grayscale png decodes to rgba image data', async () => {
    const { decodeRasterBuffer } = await import('../raster-image.ts');

    const result = await decodeRasterBuffer(new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]));

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(Array.from(result.data)).toEqual([
      17, 17, 17, 255,
      34, 34, 34, 255,
    ]);
  });

  it('isolates caller-owned pixels before passing raster data into jimp transforms', async () => {
    const { resizeRasterImage } = await import('../raster-image.ts');
    const sourcePixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);

    await resizeRasterImage({
      width: 2,
      height: 1,
      data: sourcePixels,
    }, 4, 3);

    expect(constructedInputs).toHaveLength(1);
    expect(constructedInputs[0]).not.toBe(sourcePixels);
    expect(Array.from(sourcePixels)).toEqual([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);
  });

  it('does not import the node buffer module in the browser raster pipeline', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/lib/raster-image.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from 'buffer'|from "buffer"/);
  });
});
