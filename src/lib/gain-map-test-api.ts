import { isGmnetWebGlSupportedRuntime } from './runtime-browser.ts';

type BackendName = 'webgpu' | 'webgl' | 'wasm';

type GainMapTestRequest = {
  provider: BackendName;
  width?: number;
  height?: number;
};

type GainMapTestResult = {
  provider: BackendName;
  width: number;
  height: number;
  pixels: number[];
};

type GainMapTestApi = {
  generateGainMap(request: GainMapTestRequest): Promise<GainMapTestResult>;
  getAvailability(): Record<BackendName, boolean>;
};

const GAIN_MAP_TEST_API_KEY = '__ULTRAHDR_TEST_GAIN_MAP_API';

function createDeterministicImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const horizontal = width > 1 ? Math.round((x / (width - 1)) * 255) : 127;
      const vertical = height > 1 ? Math.round((y / (height - 1)) * 255) : 127;
      const checker = (((x >> 4) + (y >> 4)) & 1) === 0 ? 24 : -24;
      const red = Math.max(0, Math.min(255, horizontal + checker));
      const green = Math.max(0, Math.min(255, vertical - checker));
      const blue = Math.max(0, Math.min(255, Math.round((horizontal + vertical) / 2)));
      data[pixelIndex] = red;
      data[pixelIndex + 1] = green;
      data[pixelIndex + 2] = blue;
      data[pixelIndex + 3] = 255;
    }
  }
  return new ImageData(data, width, height);
}

function getAvailability(): Record<BackendName, boolean> {
  const runtime = globalThis;
  const webgpu = typeof runtime.navigator?.gpu !== 'undefined';
  const webgl = isGmnetWebGlSupportedRuntime(runtime);
  return {
    webgpu,
    webgl,
    wasm: true,
  };
}

async function generateGainMap(request: GainMapTestRequest): Promise<GainMapTestResult> {
  const provider = request.provider;
  const width = Math.max(32, Math.floor(Number(request.width) || 160));
  const height = Math.max(32, Math.floor(Number(request.height) || 120));
  const { generateGainMapData } = await import('./processing-core.js');
  const imageData = createDeterministicImageData(width, height);
  const { gainMapImageData } = await generateGainMapData(imageData, {
    forceExecutionProviders: [provider],
  });

  const pixels = new Array<number>(gainMapImageData.width * gainMapImageData.height);
  for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex += 1) {
    pixels[pixelIndex] = gainMapImageData.data[pixelIndex * 4] ?? 0;
  }

  return {
    provider,
    width: gainMapImageData.width,
    height: gainMapImageData.height,
    pixels,
  };
}

export function installGainMapTestApi(runtime: typeof globalThis = globalThis): GainMapTestApi | null {
  if (typeof runtime !== 'object' || runtime === null) {
    return null;
  }

  const api: GainMapTestApi = {
    generateGainMap,
    getAvailability,
  };
  (runtime as typeof globalThis & Record<string, unknown>)[GAIN_MAP_TEST_API_KEY] = api;
  return api;
}

export { GAIN_MAP_TEST_API_KEY };
export type { BackendName, GainMapTestApi, GainMapTestRequest, GainMapTestResult };
