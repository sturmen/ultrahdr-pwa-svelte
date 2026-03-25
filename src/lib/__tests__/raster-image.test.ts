/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const {
  JimpMock,
  jimpReadMock,
  resizeMock,
  rotateMock,
  bitmapState,
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

  function JimpMock() {
    return {
      bitmap: bitmapState,
      resize: resizeMock,
      rotate: rotateMock,
    };
  }

  return {
    JimpMock,
    jimpReadMock,
    resizeMock,
    rotateMock,
    bitmapState,
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

  it('does not import the node buffer module in the browser raster pipeline', () => {
    const sourcePath = path.resolve(process.cwd(), 'src/lib/raster-image.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from 'buffer'|from "buffer"/);
  });
});
