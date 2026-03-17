/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { runMock } = vi.hoisted(() => ({
  runMock: vi.fn(),
}));

vi.mock('../gmnet-session.ts', () => {
  const REQUIRED_GMNET_EXECUTION_PROVIDER = 'webgpu';
  const GMNET_FALLBACK_EXECUTION_PROVIDER = 'webgl';
  const GMNET_WASM_EXECUTION_PROVIDER = 'wasm';

  class GMNetInferenceSession {
    constructor() {
      this.activeExecutionProvider = REQUIRED_GMNET_EXECUTION_PROVIDER;
    }

    on() {}
    off() {}

    async run(imageData) {
      runMock(imageData);
      const pixelCount = imageData.width * imageData.height;
      const output = new Uint8ClampedArray(pixelCount * 4);
      for (let i = 0; i < pixelCount; i++) {
        const idx = i * 4;
        output[idx] = 200;
        output[idx + 1] = 200;
        output[idx + 2] = 200;
        output[idx + 3] = 255;
      }
      return output;
    }
  }

  return {
    GMNetInferenceSession,
    GMNET_FALLBACK_EXECUTION_PROVIDER,
    GMNET_WASM_EXECUTION_PROVIDER,
    REQUIRED_GMNET_EXECUTION_PROVIDER,
  };
});

function createImageData() {
  return new ImageData(new Uint8ClampedArray([200, 200, 200, 255]), 1, 1);
}

describe('maxContentBoost boundary metadata (GMNet)', () => {
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

  it('produces expected metadata fields at maxContentBoost=4.0', async () => {
    const result = await generateGainMapData(createImageData(), { maxContentBoost: 4.0 });

    expect(result.metadata.gainMapMax).toEqual([4.0, 4.0, 4.0]);
    expect(result.metadata.hdrCapacityMax).toBe(4.0);
    expect(result.metadata.parsedGainMapMax).toEqual([2, 2, 2]);
    expect(result.metadata.parsedHdrCapacityMax).toBe(2);
  });

  it.each([1.0, 2.0, 4.0])('keeps metadata finite at maxContentBoost=%f', async (boost) => {
    const result = await generateGainMapData(createImageData(), { maxContentBoost: boost });

    expect(result.metadata.gainMapMax).toEqual([boost, boost, boost]);
    expect(result.metadata.hdrCapacityMax).toBe(boost);
    for (const value of result.metadata.parsedGainMapMax) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(Number.isFinite(result.metadata.parsedHdrCapacityMax)).toBe(true);
  });

  it('returns valid RGBA bytes at maxContentBoost=4.0', async () => {
    const result = await generateGainMapData(createImageData(), { maxContentBoost: 4.0 });

    expect(runMock).toHaveBeenCalledTimes(1);
    expect(result.gainMapImageData.data.length).toBe(4);
    expect(result.gainMapImageData.data[0]).toBe(200);
    expect(result.gainMapImageData.data[1]).toBe(200);
    expect(result.gainMapImageData.data[2]).toBe(200);
    expect(result.gainMapImageData.data[3]).toBe(255);
  });
});
