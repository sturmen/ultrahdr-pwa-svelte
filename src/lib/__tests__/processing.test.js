/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { runMock } = vi.hoisted(() => ({
  runMock: vi.fn(),
}));

vi.mock('../gmnet-session.js', () => {
  class GMNetInferenceSession {
    constructor() {
      this.listeners = {
        progress: [],
      };
    }

    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) {
        return;
      }
      this.listeners[event] = this.listeners[event].filter((listener) => listener !== callback);
    }

    async run(imageData, options) {
      runMock(imageData, options);
      for (const listener of this.listeners.progress || []) {
        listener({ loaded: 1, total: 1 });
      }

      const pixelCount = imageData.width * imageData.height;
      const output = new Uint8ClampedArray(pixelCount * 4);
      for (let i = 0; i < pixelCount; i++) {
        const idx = i * 4;
        const value = (i * 31) % 256;
        output[idx] = value;
        output[idx + 1] = value;
        output[idx + 2] = value;
        output[idx + 3] = 255;
      }
      return output;
    }
  }

  return { GMNetInferenceSession };
});

function createImageData(width = 2, height = 2) {
  return new ImageData(
    new Uint8ClampedArray(width * height * 4).fill(180),
    width,
    height,
  );
}

describe('GMNet-only gain map generation', () => {
  let generateGainMapData;
  let __resetGainMapGeneratorForTests;

  beforeEach(async () => {
    vi.resetModules();
    runMock.mockClear();
    const module = await import('../processing-core.js');
    generateGainMapData = module.generateGainMapData;
    __resetGainMapGeneratorForTests = module.__resetGainMapGeneratorForTests;
    __resetGainMapGeneratorForTests();
  });

  it('exports only the GMNet gain-map API and removes heuristic export', async () => {
    const module = await import('../processing-core.js');
    expect(typeof module.generateGainMapData).toBe('function');
    expect(module.generateGainMapDataHeuristic).toBeUndefined();
  });

  it('returns RGBA gain-map ImageData and default metadata', async () => {
    const result = await generateGainMapData(createImageData(), {});

    expect(result.gainMapImageData).toBeInstanceOf(ImageData);
    expect(result.gainMapImageData.width).toBe(2);
    expect(result.gainMapImageData.height).toBe(2);
    expect(result.gainMapImageData.data.length).toBe(16);
    expect(result.metadata.gainMapMax).toEqual([2.3, 2.3, 2.3]);
    expect(result.metadata.hdrCapacityMax).toBe(2.3);
    expect(runMock).toHaveBeenCalledTimes(1);
  });

  it('forwards gmnetModelVariant to GMNet inference', async () => {
    await generateGainMapData(createImageData(), { gmnetModelVariant: 'synthetic' });

    expect(runMock).toHaveBeenCalledWith(expect.any(ImageData), {
      gmnetModelVariant: 'synthetic',
    });
  });

  it('hard-fails when useGmnet is disabled', async () => {
    await expect(
      generateGainMapData(createImageData(), { useGmnet: false }),
    ).rejects.toThrow(/GMNet is required/i);

    expect(runMock).not.toHaveBeenCalled();
  });

  it('emits stage progress while running inference', async () => {
    const onStageProgress = vi.fn();

    await generateGainMapData(createImageData(), { onStageProgress });

    expect(onStageProgress).toHaveBeenCalled();
    expect(onStageProgress).toHaveBeenCalledWith(
      0,
      expect.stringMatching(/starting inference/i),
      expect.objectContaining({
        gmnetExecutionProvider: null,
      }),
    );
    expect(onStageProgress).toHaveBeenCalledWith(
      100,
      'AI Inference Complete',
      expect.objectContaining({
        gmnetExecutionProvider: null,
      }),
    );
  });
});
