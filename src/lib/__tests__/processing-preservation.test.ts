/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DEFAULT_MAX_CONTENT_BOOST } from '../max-content-boost.js';

const { losslessRotateCalls } = vi.hoisted(() => ({
    losslessRotateCalls: [],
}));

vi.mock('../image-utils.js', async () => {
    const actual = await vi.importActual('../image-utils.js');
    return {
        ...actual,
        rotateImageData: vi.fn(actual.rotateImageData),
        jpegBytesToImageData: vi.fn(actual.jpegBytesToImageData),
        transformImageData: vi.fn(actual.transformImageData),
        toMonochromeGainMapImageData: vi.fn(actual.toMonochromeGainMapImageData),
    };
});

vi.mock('../jpegtran-rotate.js', () => ({
    rotateJpeg: vi.fn(async (inputBytes, transform, options = {}) => {
        const normalizedInput = inputBytes instanceof Uint8Array
            ? new Uint8Array(inputBytes)
            : new Uint8Array(inputBytes);
        losslessRotateCalls.push({
            transform,
            options: { ...options },
            size: normalizedInput.length,
        });
        return normalizedInput;
    })
}));

vi.mock('../jpegli-decoder.js', () => ({
    encodeJpegli: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xd9])),
    decodeJpegli: vi.fn(async () => ({
        width: 10,
        height: 10,
        data: new Uint8ClampedArray(10 * 10 * 4).fill(127),
    })),
}));

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
const tinyJpegBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBAVFhUVFRUVFRUVFRUVFRUVFRUWFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0mICYtLS8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAgMBIgACEQEDEQH/xAAXAAEAAwAAAAAAAAAAAAAAAAAAAQID/8QAFhABAQEAAAAAAAAAAAAAAAAAABES/9oACAEBAAEFAtNv/8QAFhEAAwAAAAAAAAAAAAAAAAAAARAR/9oACAEDAQE/AYf/xAAVEQEBAAAAAAAAAAAAAAAAAAABEP/aAAgBAgEBPwGH/8QAGhABAAMAAwAAAAAAAAAAAAAAAAERITFBUf/aAAgBAQAGPwKjNf/EABsQAQEAAwEBAQAAAAAAAAAAAAERACExQVGh/9oACAEBAAE/IdXQjFzWq9KQ2rgo8sfr/9oADAMBAAIAAwAAABAf/wD/xAAXEQEBAQEAAAAAAAAAAAAAAAABABEh/9oACAEDAQE/EFjP/8QAFxEBAQEBAAAAAAAAAAAAAAAAAREhQf/aAAgBAgEBPxBfM//EAB0QAQACAgIDAAAAAAAAAAAAAAEAESExQVFhcZH/2gAIAQEAAT8QObXbJ0UuE1ULhBrxwC4j5V0F3l0JgS3f/2Q==';
const baseUhdrBytes = new Uint8Array(Buffer.from(tinyJpegBase64, 'base64'));
const gainMapUhdrBytes = new Uint8Array(Buffer.from(tinyJpegBase64, 'base64'));
const defaultMaxContentBoost = DEFAULT_MAX_CONTENT_BOOST;
const gainMapMetadata = {
    gainMapMin: [1.0, 1.0, 1.0],
    gainMapMax: [defaultMaxContentBoost, defaultMaxContentBoost, defaultMaxContentBoost],
    gamma: [1.0, 1.0, 1.0],
    offsetSdr: [0, 0, 0],
    offsetHdr: [0, 0, 0],
    hdrCapacityMin: 1.0,
    hdrCapacityMax: defaultMaxContentBoost
};
const extractedExifPayload = new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
]);
const extractedExifPayloadOrientation6 = new Uint8Array([
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00,
    0x06, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
]);

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
    setExifData: vi.fn(),
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

vi.mock('../input-exif.js', () => ({
    extractExifApp1PayloadFromInput: vi.fn(() => extractedExifPayload)
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
        losslessRotateCalls.length = 0;
    });

    it('encodes SDR and gain-map components into compressed inputs before final encode', async () => {
        const { processImage } = await import('../processing-core.js');
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
        expect(encoderInstance.setExifData).not.toHaveBeenCalled();
        expect(encoderInstance.setSDRImage).not.toHaveBeenCalled();
        expect(encoderInstance.setGainMapImage).not.toHaveBeenCalled();
        expect(encoderInstance.addEffectRotate).not.toHaveBeenCalled();

        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('image/jpeg');
    });

    it('preserves HEIC gain-map metadata even when maxContentBoost is changed', async () => {
        const { processImage } = await import('../processing-core.js');
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
        const { processImage } = await import('../processing-core.js');
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
        const { processImage } = await import('../processing-core.js');
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
        const { processImage } = await import('../processing-core.js');
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
        const { processImage } = await import('../processing-core.js');
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
        const { processImage } = await import('../processing-core.js');
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
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);

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
    });

    it('uses lossless bitstream rotation for preserved UltraHDR components when dimensions are MCU-compatible', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        await processImage(file, {
            rotation: 90,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(losslessRotateCalls).toHaveLength(2);
        expect(losslessRotateCalls[0]).toMatchObject({
            transform: '90',
            options: { trim: false, perfect: false },
        });
        expect(losslessRotateCalls[1]).toMatchObject({
            transform: '90',
            options: { trim: false, perfect: false },
        });
    });

    it('avoids decoding preserved UltraHDR JPEG components when lossless component rotation remains valid', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        const imageUtils = await import('../image-utils.js');
        isUhdrImage.mockResolvedValue(true);

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        await processImage(file, {
            rotation: 90,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(losslessRotateCalls).toHaveLength(2);
        expect(imageUtils.jpegBytesToImageData).not.toHaveBeenCalled();
    });

    it('normalizes multichannel gain-map metadata for rotated preserved UltraHDR output', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);

        decoderInstance.getGainMapMetadata.mockReturnValueOnce({
            gainMapMin: [0.8, 0.9, 1.0],
            gainMapMax: [2.2, 2.4, 2.6],
            gamma: [1.0, 1.1, 1.2],
            offsetSdr: [0.0, 0.1, 0.2],
            offsetHdr: [0.0, 0.2, 0.4],
            hdrCapacityMin: 1.0,
            hdrCapacityMax: 2.6
        });

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        await processImage(file, {
            rotation: 90,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining({
                gainMapMin: [0.8, 0.8, 0.8],
                gainMapMax: [2.2, 2.2, 2.2],
                gamma: [1.0, 1.0, 1.0],
                offsetSdr: [0.0, 0.0, 0.0],
                offsetHdr: [0.0, 0.0, 0.0]
            })
        );
    });

    it('passes extracted HEIC EXIF payload to encoder when stripExif=false', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: false
        });

        expect(encoderInstance.setExifData).toHaveBeenCalledTimes(1);
        expect(encoderInstance.setExifData).toHaveBeenCalledWith(extractedExifPayload);
    });

    it('normalizes JPEG EXIF orientation flag to 1 before encoder insertion', async () => {
        const { processImage } = await import('../processing-core.js');
        const { extractExifApp1PayloadFromInput } = await import('../input-exif.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        const imageUtils = await import('../image-utils.js');
        isUhdrImage.mockResolvedValue(true);
        extractExifApp1PayloadFromInput.mockReturnValueOnce(extractedExifPayloadOrientation6);
        vi.spyOn(imageUtils, 'jpegBytesToImageData').mockResolvedValue(
            new ImageData(new Uint8ClampedArray(4 * 4 * 4).fill(120), 4, 4)
        );

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: false
        });

        expect(encoderInstance.setExifData).toHaveBeenCalledTimes(1);
        const [normalizedExif] = encoderInstance.setExifData.mock.calls[0];
        expect(normalizedExif).toBeInstanceOf(Uint8Array);
        expect(normalizedExif[24]).toBe(1);
        expect(normalizedExif[25]).toBe(0);
    });

    it('bypasses generated-path clamp and GMNet stages for preserved HEIC components', async () => {
        const { processImage } = await import('../processing-core.js');
        const { processHeic } = await import('../heic-processing.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const onProgress = vi.fn();

        const preservedSdr = new ImageData(
            new Uint8ClampedArray(16 * 16 * 4).fill(128),
            16,
            16
        );
        const preservedGainMap = new ImageData(
            new Uint8ClampedArray(8 * 8 * 4).fill(64),
            8,
            8
        );

        processHeic.mockResolvedValueOnce({
            sdr: preservedSdr,
            gainMap: preservedGainMap,
            gainMapMetadata,
            name: 'input.heic'
        });

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true,
            safeMode: true,
            maxOutputMegapixels: 0.000009,
            gainMapScale: 0.5,
            onProgress
        });

        const stages = onProgress.mock.calls
            .map(([event]) => event?.stage)
            .filter(Boolean);
        expect(stages).not.toContain('probe-gmnet-capability');
        expect(stages).not.toContain('constrain-sdr-image');
        expect(stages).not.toContain('prepare-gmnet-input');
        expect(stages).not.toContain('generate-gain-map');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            '[Process] Gain map decision: preserving existing gain map from source input'
        );
    });

    it('emits processingPath=preserved for preservation pipeline events', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);
        const onProgress = vi.fn();
        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true,
            onProgress,
        });

        const preservedEvents = onProgress.mock.calls
            .map(([event]) => event)
            .filter((event) => event?.processingPath === 'preserved');
        expect(preservedEvents.length).toBeGreaterThan(0);
        expect(
            onProgress.mock.calls.some(([event]) => event?.processingPath === 'generated')
        ).toBe(false);
    });

    it('wraps owned HEIC preserved RGBA buffers without cloning before JPEG encoding', async () => {
        const { processImage } = await import('../processing-core.js');
        const { processHeic } = await import('../heic-processing.js');
        const { encodeJpegli } = await import('../jpegli-decoder.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const sdrData = new Uint8ClampedArray([
            100, 110, 120, 255,
            130, 140, 150, 255,
            120, 130, 140, 255,
            140, 150, 160, 255,
        ]);
        const gainMapData = new Uint8ClampedArray([
            10, 10, 10, 255,
            20, 20, 20, 255,
            30, 30, 30, 255,
            40, 40, 40, 255,
        ]);
        processHeic.mockResolvedValueOnce({
            sdr: {
                data: sdrData,
                width: 2,
                height: 2,
                strideBytes: 8,
                pixelFormat: 'rgba8',
                bitDepth: 8,
            },
            gainMap: {
                data: gainMapData,
                width: 2,
                height: 2,
                strideBytes: 8,
                pixelFormat: 'rgba8',
                bitDepth: 8,
            },
            gainMapMetadata,
            name: 'input.heic',
        });

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true,
        });

        const encodedImageData = encodeJpegli.mock.calls.map(([imageData]) => imageData);
        expect(encodedImageData.some((imageData) => imageData.data === sdrData)).toBe(true);
        expect(encodedImageData.some((imageData) => imageData.data === gainMapData)).toBe(true);
    });

    it('skips gain-map pixel normalization when preserved pixels and metadata are already single-channel', async () => {
        const { processImage } = await import('../processing-core.js');
        const imageUtils = await import('../image-utils.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true,
        });

        expect(imageUtils.toMonochromeGainMapImageData).not.toHaveBeenCalled();
    });

    it('emits bounded breadcrumbs when wrapping preserved HEIC decoded rasters', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);
        const onProgress = vi.fn();
        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await processImage(file, {
            quality: 0.95,
            discardGainMap: false,
            stripExif: true,
            onProgress,
        });

        const wrapEvents = onProgress.mock.calls
            .map(([event]) => event)
            .filter((event) => event?.phase === 'decoded-raster-wrapped');
        expect(wrapEvents).toEqual([
            expect.objectContaining({
                stage: 'decode-image-data',
                substage: 'preserved-heic-sdr',
                processingPath: 'preserved',
                pixelBytes: 16,
            }),
            expect.objectContaining({
                stage: 'decode-image-data',
                substage: 'preserved-heic-gain-map',
                processingPath: 'preserved',
                pixelBytes: 16,
            }),
        ]);
        expect(wrapEvents[0]).not.toHaveProperty('data');
        expect(wrapEvents[1]).not.toHaveProperty('data');
    });

    it('rebuilds an existing UltraHDR JPEG using the encoder even with rotation=0 to ensure ISO compliance', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        await processImage(file, {
            rotation: 0,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        // Key verification: encoder WAS used even though rotation=0
        expect(encoderInstance.setCompressedBaseImage).toHaveBeenCalled();
        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalled();
        expect(encoderInstance.encode).toHaveBeenCalled();
    });

    it('allows adjusting headroom metadata during UltraHDR JPEG preservation', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(true);

        const file = new File([inputUhdrBytes], 'input.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => inputUhdrBytes.buffer.slice(0));

        const targetBoost = 5.5;
        await processImage(file, {
            rotation: 0,
            maxContentBoost: targetBoost,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(encoderInstance.setCompressedGainMapImage).toHaveBeenCalledWith(
            expect.any(Uint8Array),
            expect.objectContaining({
                hdrCapacityMax: targetBoost,
                gainMapMax: [targetBoost, targetBoost, targetBoost]
            })
        );
    });

    it('forces re-encode and downsampling if an existing UltraHDR JPEG exceeds IMAGE_MAX_LONG_EDGE', async () => {
        const { processImage } = await import('../processing-core.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        const imageUtils = await import('../image-utils.js');
        isUhdrImage.mockResolvedValue(true);

        // SOF0 marker for 17000x17000 (exceeds 16384)
        const largeUhdrBytes = new Uint8Array([
            0xff, 0xd8, // SOI
            0xff, 0xc0, 0x00, 0x11, // SOF0
            0x08, // precision
            0x42, 0x68, // height 17000
            0x42, 0x68, // width 17000
            0x03, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
            0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, // SOS
            0xff, 0xd9 // EOI
        ]);

        const file = new File([largeUhdrBytes], 'large.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn(async () => largeUhdrBytes.buffer.slice(0));

        // Mock decoder output
        decoderInstance.getBaseImage.mockReturnValueOnce(largeUhdrBytes);
        decoderInstance.getGainMapImage.mockReturnValueOnce(largeUhdrBytes);
        vi.spyOn(imageUtils, 'jpegBytesToImageData').mockResolvedValue(
            new ImageData(new Uint8ClampedArray(4 * 16384 * 16384).fill(128), 16384, 16384)
        );

        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        await processImage(file, { rotation: 0 });

        // Verify it chose the forced re-encode path due to dimensions
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('exceeds 16384px (true) — forcing re-encode path')
        );

        // It SHOULD have decoded images (which calls UHDRDecoder)
        expect(decoderInstance.getBaseImage).toHaveBeenCalled();
    });

    it('aligns base and gain-map components using auto-rotation in processUhdrWithRotation', async () => {
        const core = await import('../processing-core.js');
        const imageUtils = await import('../image-utils.js');
        const { rotateJpeg } = await import('../jpegtran-rotate.js');
        rotateJpeg.mockRejectedValueOnce(new Error('force decode fallback'));
        rotateJpeg.mockRejectedValueOnce(new Error('force decode fallback'));

        // Mock a JPEG with Orientation 6 (90 CW)
        const uhdrBytesWithExif = new Uint8Array([
            0xff, 0xd8, // SOI
            0xff, 0xe1, // APP1
            0x00, 0x22, // Length (32 payload bytes + 2 length bytes = 34, 0x22)
            0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // Exif\0\0
            0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, // II* and IFD0 offset 8
            0x01, 0x00, // IFD0 Entry count 1
            0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, // Orientation tagging
            0x00, 0x00, 0x00, 0x00 // Next IFD offset
        ]);

        // Fix the decoder mock return value for this specific test
        decoderInstance.getBaseImage.mockReturnValue(uhdrBytesWithExif);

        // Use real ImageData to avoid type errors in drawImage/putImageData
        const mockImageData = new ImageData(new Uint8ClampedArray(400), 10, 10);
        vi.spyOn(imageUtils, 'jpegBytesToImageData').mockResolvedValue(mockImageData);

        const transformSpy = vi.spyOn(imageUtils, 'transformImageData').mockImplementation(async (img) => img);
        vi.spyOn(core, 'compressImages').mockResolvedValue({ sdr: new Uint8Array(), gainMap: new Uint8Array() });

        await core.processUhdrWithRotation(new Uint8Array([0]), { rotation: 0 });

        // Should be called for base + gain map alignment (auto-rotation 90 for orientation 6)
        expect(transformSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ degrees: 90 }));
    });

    it('uses a fused transform helper instead of separate resize and rotate passes during generated-path re-encode', async () => {
        const core = await import('../processing-core.js');
        const imageUtils = await import('../image-utils.js');
        const { isUhdrImage } = await import('../ultrahdr-wasm.js');
        isUhdrImage.mockResolvedValue(false);

        const transformSpy = vi.spyOn(imageUtils, 'transformImageData');
        const rotateSpy = vi.spyOn(imageUtils, 'rotateImageData');
        const resizeSpy = vi.spyOn(imageUtils, 'resizeImageData');

        const file = new File([new Uint8Array([0, 1, 2, 3])], 'input.heic', { type: 'image/heic' });

        await core.processImage(file, {
            rotation: 90,
            quality: 0.95,
            discardGainMap: false,
            stripExif: true
        });

        expect(transformSpy).toHaveBeenCalled();
        expect(rotateSpy).not.toHaveBeenCalled();
        expect(resizeSpy).not.toHaveBeenCalled();
    });

});
