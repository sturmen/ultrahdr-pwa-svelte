/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const encodedBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xee, 0x00, 0x01, 0xff, 0xd9]);

const sdrImageData = new ImageData(
    new Uint8ClampedArray([
        100, 110, 120, 255,
        130, 140, 150, 255,
        120, 130, 140, 255,
        140, 150, 160, 255
    ]),
    2,
    2
);
const gainMapImageData = new ImageData(
    new Uint8ClampedArray([
        10, 10, 10, 255,
        20, 20, 20, 255,
        30, 30, 30, 255,
        40, 40, 40, 255
    ]),
    2,
    2
);

const inputUhdrBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x02, 0xff, 0xd9]);
const baseUhdrBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x02, 0xff, 0xd9]);
const gainMapUhdrBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xc4, 0x00, 0x02, 0xff, 0xd9]);
const gainMapMetadata = {
    gainMapMin: [1.0, 1.0, 1.0],
    gainMapMax: [4.0, 4.0, 4.0],
    gamma: [1.0, 1.0, 1.0],
    offsetSdr: [0, 0, 0],
    offsetHdr: [0, 0, 0],
    hdrCapacityMin: 1.0,
    hdrCapacityMax: 4.0
};

const decoderInstance = {
    init: vi.fn(async () => { }),
    setImage: vi.fn(),
    probe: vi.fn(),
    getBaseImage: vi.fn(() => baseUhdrBytes),
    getGainMapImage: vi.fn(() => gainMapUhdrBytes),
    getGainMapMetadata: vi.fn(() => gainMapMetadata),
    destroy: vi.fn()
};

const encoderInstance = {
    init: vi.fn(async () => { }),
    setSDRImage: vi.fn(),
    setCompressedBaseImage: vi.fn(),
    setCompressedGainMapImage: vi.fn(),
    setGainMapImage: vi.fn(),
    addEffectRotate: vi.fn(),
    encode: vi.fn(),
    getEncodedData: vi.fn(() => encodedBytes),
    destroy: vi.fn()
};

vi.mock('../heic-processing.js', () => ({
    processHeic: vi.fn(async () => ({
        sdr: sdrImageData,
        gainMap: gainMapImageData,
        name: 'input.heic'
    }))
}));

vi.mock('../tiff-processing.js', () => ({
    processTiff: vi.fn(async (file) => file)
}));

vi.mock('../ultrahdr-wasm.js', () => ({
    isWasmLoaded: vi.fn(() => true),
    isAvailable: vi.fn(async () => true),
    getStatus: vi.fn(() => ({ loaded: true })),
    isUhdrImage: vi.fn(async () => false),
    UHDRDecoder: vi.fn().mockImplementation(function () { return decoderInstance; }),
    UHDREncoder: vi.fn().mockImplementation(function () { return encoderInstance; })
}));

vi.mock('piexifjs', () => ({
    default: {
        load: vi.fn(),
        dump: vi.fn(),
        insert: vi.fn(),
        ImageIFD: { Orientation: 0x0112 },
    },
}));

describe('processImage UltraHDR preservation path', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('avoids intermediate re-encoding when preserving HEIC gain maps', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);
        const canvasSpy = vi.spyOn(document, 'createElement');

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        const result = await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.setSDRImage).toHaveBeenCalledWith(sdrImageData, 2, 2);
        expect(encoderInstance.setGainMapImage).toHaveBeenCalledWith(
            gainMapImageData,
            expect.objectContaining({
                gainMapMin: [1.0, 1.0, 1.0],
                gainMapMax: [4.0, 4.0, 4.0]
            }),
            2,
            2
        );
        expect(encoderInstance.encode).toHaveBeenCalledWith(95);
        expect(encoderInstance.setCompressedBaseImage).not.toHaveBeenCalled();
        expect(encoderInstance.setCompressedGainMapImage).not.toHaveBeenCalled();
        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('image/jpeg');
        expect(canvasSpy.mock.calls.filter(([tag]) => tag === 'canvas').length).toBe(0);
    });

    it('uses libultrahdr rotation effect for preserved HEIC gain-map flow', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            rotation: 270,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.addEffectRotate).toHaveBeenCalledWith(270);
    });

    it('avoids intermediate decode/re-encode when rotating an existing UltraHDR JPEG', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);
        const canvasSpy = vi.spyOn(document, 'createElement');

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        const result = await processImage(file, {
            rotation: 90,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(decoderInstance.setImage).toHaveBeenCalledWith(inputUhdrBytes);
        expect(decoderInstance.getBaseImage).toHaveBeenCalledTimes(1);
        expect(decoderInstance.getGainMapImage).toHaveBeenCalledTimes(1);
        expect(decoderInstance.getGainMapMetadata).toHaveBeenCalledTimes(1);
        expect(decoderInstance.destroy).toHaveBeenCalledTimes(1);

        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalledWith(baseUhdrBytes);
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(gainMapUhdrBytes, gainMapMetadata);
        expect(encoderInstance.addEffectRotate).toHaveBeenCalledWith(90);
        expect(encoderInstance.encode).toHaveBeenCalledWith(95);
        expect(encoderInstance.setSDRImage).not.toHaveBeenCalled();
        expect(encoderInstance.setGainMapImage).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('image/jpeg');
        expect(canvasSpy.mock.calls.filter(([tag]) => tag === 'canvas').length).toBe(0);
    });
});
