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
const tinyJpegBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBAVFhUVFRUVFRUVFRUVFRUVFRUWFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0mICYtLS8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAgMBIgACEQEDEQH/xAAXAAEAAwAAAAAAAAAAAAAAAAAAAQID/8QAFhABAQEAAAAAAAAAAAAAAAAAABES/9oADAMBAAIQAxAAAAG0AH//xAAXEAEBAQEAAAAAAAAAAAAAAAABABEh/9oACAEBAAEFAtNv/8QAFhEAAwAAAAAAAAAAAAAAAAAAARAR/9oACAEDAQE/AYf/xAAVEQEBAAAAAAAAAAAAAAAAAAABEP/aAAgBAgEBPwGH/8QAGhABAAMAAwAAAAAAAAAAAAAAAAERITFBUf/aAAgBAQAGPwKjNf/EABsQAQEAAwEBAQAAAAAAAAAAAAERACExQVGh/9oACAEBAAE/IdXQjFzWq9KQ2rgo8sfr/9oADAMBAAIAAwAAABAf/wD/xAAXEQEBAQEAAAAAAAAAAAAAAAABABEh/9oACAEDAQE/EFjP/8QAFxEBAQEBAAAAAAAAAAAAAAAAAREhQf/aAAgBAgEBPxBfM//EAB0QAQACAgIDAAAAAAAAAAAAAAEAESExQVFhcZH/2gAIAQEAAT8QObXbJ0UuE1ULhBrxwC4j5V0F3l0JgS3f/2Q==';
const baseUhdrBytes = new Uint8Array(Buffer.from(tinyJpegBase64, 'base64'));
const gainMapUhdrBytes = new Uint8Array(Buffer.from(tinyJpegBase64, 'base64'));
const defaultMaxContentBoost = 2.3;
const gainMapMetadata = {
    gainMapMin: [1.0, 1.0, 1.0],
    gainMapMax: [defaultMaxContentBoost, defaultMaxContentBoost, defaultMaxContentBoost],
    gamma: [1.0, 1.0, 1.0],
    offsetSdr: [0, 0, 0],
    offsetHdr: [0, 0, 0],
    hdrCapacityMin: 1.0,
    hdrCapacityMax: defaultMaxContentBoost
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
        gainMapMetadata,
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

describe('processImage UltraHDR preservation path', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('encodes SDR and gain-map components into compressed inputs before final encode', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        const result = await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalledWith(
            expect.any(Uint8Array)
        );
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining({
                gainMapMin: [1.0, 1.0, 1.0],
                gainMapMax: [defaultMaxContentBoost, defaultMaxContentBoost, defaultMaxContentBoost]
            })
        );

        expect(encoderInstance.encode).toHaveBeenCalledWith(95);
        expect(encoderInstance.setSDRImage).not.toHaveBeenCalled();
        expect(encoderInstance.setGainMapImage).not.toHaveBeenCalled();
        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('image/jpeg');
    });

    it('preserves HEIC gain-map metadata even when maxContentBoost is changed', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            maxContentBoost: 4.0,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining(gainMapMetadata)
        );
    });

    it('preserves HEIC gain-map metadata when maxContentBoost is changed and rotation is applied', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            rotation: 90,
            maxContentBoost: 4.0,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();
        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalledWith(expect.any(Uint8Array));
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining(gainMapMetadata)
        );
    });

    it('uses HEIC gainMapHeadroom when explicit gain-map metadata is unavailable', async () => {
        const { processImage } = await import('../processing.js');
        const { processHeic } = await import('../heic-processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        processHeic.mockResolvedValueOnce({
            sdr: sdrImageData,
            gainMap: gainMapImageData,
            gainMapHeadroom: 2.859227,
            name: 'input.heic'
        });

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining({
                gainMapMax: [2.859227, 2.859227, 2.859227],
                hdrCapacityMax: 2.859227
            })
        );
    });

    it('uses HEIC gainMapHeadroom when explicit gain-map metadata is unavailable and rotation is applied', async () => {
        const { processImage } = await import('../processing.js');
        const { processHeic } = await import('../heic-processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        processHeic.mockResolvedValueOnce({
            sdr: sdrImageData,
            gainMap: gainMapImageData,
            gainMapHeadroom: 2.859227,
            name: 'input.heic'
        });

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            rotation: 270,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();
        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalledWith(expect.any(Uint8Array));
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining({
                gainMapMax: [2.859227, 2.859227, 2.859227],
                hdrCapacityMax: 2.859227
            })
        );
    });

    it('emits progress events through onProgress callback across the pipeline', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const onProgress = vi.fn();
        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true,
            onProgress
        });

        expect(onProgress).toHaveBeenCalled();
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                phase: 'pipeline-start',
                stage: 'pipeline'
            })
        );
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                phase: 'pipeline-complete',
                stage: 'pipeline'
            })
        );
    });

    it('rotates preserved HEIC components before re-encoding', async () => {
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

        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();
        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalledWith(expect.any(Uint8Array));
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.any(Object)
        );
    });

    it('rotates an existing UltraHDR JPEG and keeps gain-map metadata in the output', async () => {
        const { processImage } = await import('../processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);

        const originalImage = global.Image;
        global.Image = class MockImage {
            constructor() {
                this.width = 1;
                this.height = 1;
            }

            set src(_value) {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        };

        const originalCreateElement = document.createElement.bind(document);
        const canvasSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName !== 'canvas') {
                return originalCreateElement(tagName);
            }

            return {
                width: 1,
                height: 1,
                getContext: vi.fn(() => ({
                    drawImage: vi.fn(),
                    getImageData: vi.fn(() =>
                        new ImageData(new Uint8ClampedArray([128, 128, 128, 255]), 1, 1)
                    ),
                    putImageData: vi.fn(),
                    translate: vi.fn(),
                    rotate: vi.fn()
                })),
                toBlob: vi.fn((callback) => {
                    callback(new Blob([baseUhdrBytes], { type: 'image/jpeg' }));
                })
            };
        });

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        const result = await processImage(file, {
            rotation: 90,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        global.Image = originalImage;

        expect(decoderInstance.setImage).toHaveBeenCalledWith(inputUhdrBytes);
        expect(decoderInstance.getBaseImage).toHaveBeenCalledTimes(1);
        expect(decoderInstance.getGainMapImage).toHaveBeenCalledTimes(1);
        expect(decoderInstance.getGainMapMetadata).toHaveBeenCalledTimes(1);
        expect(decoderInstance.destroy).toHaveBeenCalledTimes(1);

        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalledWith(expect.any(Uint8Array));
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining(gainMapMetadata)
        );
        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();
        expect(encoderInstance.encode).toHaveBeenCalledWith(95);
        expect(encoderInstance.setSDRImage).not.toHaveBeenCalled();
        expect(encoderInstance.setGainMapImage).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('image/jpeg');
        expect(canvasSpy.mock.calls.filter(([tag]) => tag === 'canvas').length).toBeGreaterThan(0);
    });
});
