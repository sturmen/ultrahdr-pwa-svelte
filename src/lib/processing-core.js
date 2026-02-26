import { createPipelineTelemetry } from './pipeline-telemetry.js';
import { UHDREncoder, UHDRDecoder, isWasmLoaded, isAvailable, isUhdrImage } from './ultrahdr-wasm.js';
import {
    insertExifSegment,
    stripExifSegments,
    normalizeExifOrientationTo1
} from './exif-utils.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';
import {
    GmnetGainMapGenerator
} from './gain-map-generator.js';
import {
    canvasToBlob,
    createCanvasWithContext as createRuntimeCanvasWithContext
} from './canvas-runtime.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;
const GAIN_MAP_GAMMA_LINEAR = 1.0;
const GAIN_MAP_OFFSET_SDR_LINEAR = 0.0;
const MAX_GENERATED_IMAGE_DIMENSION = 8192;
const GAIN_MAP_TO_OUTPUT_LONG_EDGE_RATIO = 2;

const DEFAULT_PROCESS_OPTIONS = {
    maxContentBoost: DEFAULT_MAX_CONTENT_BOOST,
    rotation: 0,
    quality: 0.95,
    discardGainMap: false,
    stripExif: false,
    abortSignal: null,
    gmnetModelVariant: 'realworld',
    gmnetCapabilityHint: null,
};
let gainMapGenerator = null;
let processHeicProcessor = null;
let processTiffProcessor = null;

async function getProcessHeic() {
    if (!processHeicProcessor) {
        const module = await import('./heic-processing.js');
        processHeicProcessor = module.processHeic;
    }
    return processHeicProcessor;
}

async function getProcessTiff() {
    if (!processTiffProcessor) {
        const module = await import('./tiff-processing.js');
        processTiffProcessor = module.processTiff;
    }
    return processTiffProcessor;
}


function createAbortError() {
    if (typeof DOMException !== 'undefined') {
        return new DOMException('Operation aborted', 'AbortError');
    }
    const error = new Error('Operation aborted');
    error.name = 'AbortError';
    return error;
}

export function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw createAbortError();
    }
}

export function getConstrainedDimensions(width, height, maxDimension = MAX_GENERATED_IMAGE_DIMENSION) {
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    const maxDim = Math.floor(Number(maxDimension));

    if (!Number.isFinite(maxDim) || maxDim <= 0) {
        return { width: w, height: h, changed: false };
    }

    if (w <= maxDim && h <= maxDim) {
        return { width: w, height: h, changed: false };
    }

    const scale = Math.min(maxDim / w, maxDim / h);
    const constrainedWidth = Math.max(1, Math.floor(w * scale));
    const constrainedHeight = Math.max(1, Math.floor(h * scale));

    return {
        width: constrainedWidth,
        height: constrainedHeight,
        changed: constrainedWidth !== w || constrainedHeight !== h
    };
}

function normalizeExecutionProvider(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
}

function normalizeGmnetCapability(input) {
    if (!input || typeof input !== 'object') {
        return null;
    }
    const provider = normalizeExecutionProvider(input.provider);
    const gainMapMaxLongEdge = Number(input.gainMapMaxLongEdge);
    const outputMaxLongEdge = Number(input.outputMaxLongEdge);
    if (!provider || !Number.isFinite(gainMapMaxLongEdge) || gainMapMaxLongEdge < 1) {
        return null;
    }
    const normalizedOutputMaxLongEdge = Number.isFinite(outputMaxLongEdge) && outputMaxLongEdge > 0
        ? Math.floor(outputMaxLongEdge)
        : Math.floor(gainMapMaxLongEdge * GAIN_MAP_TO_OUTPUT_LONG_EDGE_RATIO);
    return {
        provider,
        gainMapMaxLongEdge: Math.floor(gainMapMaxLongEdge),
        outputMaxLongEdge: normalizedOutputMaxLongEdge,
        source: typeof input.source === 'string' && input.source.length > 0
            ? input.source
            : 'probe',
        attempts: Array.isArray(input.attempts) ? input.attempts : [],
    };
}

function resolveCapabilityConstrainedMaxDimension(capability) {
    const normalizedCapability = normalizeGmnetCapability(capability);
    if (!normalizedCapability) {
        return {
            capability: null,
            appliedMaxDimension: MAX_GENERATED_IMAGE_DIMENSION,
            capabilityOutputMaxLongEdge: null,
        };
    }
    const capabilityOutputMaxLongEdge = Math.max(
        1,
        Math.floor(
            Number.isFinite(normalizedCapability.outputMaxLongEdge)
                ? normalizedCapability.outputMaxLongEdge
                : normalizedCapability.gainMapMaxLongEdge * GAIN_MAP_TO_OUTPUT_LONG_EDGE_RATIO
        ),
    );
    return {
        capability: normalizedCapability,
        appliedMaxDimension: capabilityOutputMaxLongEdge,
        capabilityOutputMaxLongEdge,
    };
}

function resolveTestCapabilityOverride(runtime = globalThis) {
    const override = runtime?.__ULTRAHDR_TEST_GMNET_CAPABILITY_OVERRIDE;
    const normalized = normalizeGmnetCapability(override);
    if (!normalized) {
        return null;
    }
    return {
        ...normalized,
        source: typeof normalized.source === 'string' && normalized.source.length > 0
            ? normalized.source
            : 'test-override',
    };
}

/**
 * Ensure WASM encoder is loaded
 * @returns {Promise<void>}
 */
async function ensureWasmLoaded() {
    if (!isWasmLoaded()) {
        console.log('[WASM] Loading libultrahdr WASM module...');
        await isAvailable();
    }
    if (!isWasmLoaded()) {
        throw new Error('libultrahdr WASM module failed to load');
    }
    console.log('[WASM] libultrahdr WASM module loaded');
}

function containsAsciiSequence(haystack, needle) {
    if (!(haystack instanceof Uint8Array) || typeof needle !== 'string' || needle.length === 0) {
        return false;
    }
    const haystackLength = haystack.length;
    const needleLength = needle.length;
    if (needleLength > haystackLength) {
        return false;
    }

    for (let i = 0; i <= haystackLength - needleLength; i++) {
        let matched = true;
        for (let j = 0; j < needleLength; j++) {
            if (haystack[i + j] !== needle.charCodeAt(j)) {
                matched = false;
                break;
            }
        }
        if (matched) {
            return true;
        }
    }

    return false;
}

function hasHdrGainMapXmpMarkers(fileBuffer) {
    const hasHdrGainMapNamespace = containsAsciiSequence(
        fileBuffer,
        'http://ns.adobe.com/hdr-gain-map/1.0/'
    );
    const hasHdrGainMapVersion = containsAsciiSequence(fileBuffer, 'hdrgm:Version');
    return hasHdrGainMapNamespace && hasHdrGainMapVersion;
}

function decodeLatin1(bytes) {
    if (!(bytes instanceof Uint8Array)) {
        return '';
    }
    try {
        return new TextDecoder('latin1').decode(bytes);
    } catch {
        let text = '';
        for (let i = 0; i < bytes.length; i++) {
            text += String.fromCharCode(bytes[i]);
        }
        return text;
    }
}

function parseJpegEndOffset(bytes, startOffset) {
    if (!(bytes instanceof Uint8Array) || startOffset < 0 || startOffset + 1 >= bytes.length) {
        return null;
    }
    if (bytes[startOffset] !== 0xff || bytes[startOffset + 1] !== 0xd8) {
        return null;
    }

    let index = startOffset + 2;
    while (index + 1 < bytes.length) {
        while (index + 1 < bytes.length && bytes[index] !== 0xff) {
            index += 1;
        }
        if (index + 1 >= bytes.length) {
            return null;
        }

        while (index + 1 < bytes.length && bytes[index + 1] === 0xff) {
            index += 1;
        }
        const marker = bytes[index + 1];

        if (marker === 0x00) {
            index += 2;
            continue;
        }
        if (marker === 0xd9) {
            return index + 2;
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            index += 2;
            continue;
        }
        if (index + 3 >= bytes.length) {
            return null;
        }

        const segmentLength = (bytes[index + 2] << 8) | bytes[index + 3];
        if (segmentLength < 2) {
            return null;
        }
        if (marker === 0xda) {
            index += 2 + segmentLength;
            while (index + 1 < bytes.length) {
                if (bytes[index] !== 0xff) {
                    index += 1;
                    continue;
                }
                const next = bytes[index + 1];
                if (next === 0x00) {
                    index += 2;
                    continue;
                }
                if (next >= 0xd0 && next <= 0xd7) {
                    index += 2;
                    continue;
                }
                if (next === 0xd9) {
                    return index + 2;
                }
                break;
            }
            continue;
        }

        const nextIndex = index + 2 + segmentLength;
        if (nextIndex > bytes.length) {
            return null;
        }
        index = nextIndex;
    }

    return null;
}

function parseJpegDimensions(jpegBytes) {
    if (!(jpegBytes instanceof Uint8Array) || jpegBytes.length < 4) {
        return null;
    }
    if (jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
        return null;
    }

    let index = 2;
    while (index + 8 < jpegBytes.length) {
        if (jpegBytes[index] !== 0xff) {
            index += 1;
            continue;
        }
        while (index + 1 < jpegBytes.length && jpegBytes[index + 1] === 0xff) {
            index += 1;
        }
        if (index + 1 >= jpegBytes.length) {
            break;
        }
        const marker = jpegBytes[index + 1];
        if (marker === 0xd9 || marker === 0xda) {
            break;
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            index += 2;
            continue;
        }
        if (index + 3 >= jpegBytes.length) {
            break;
        }
        const segmentLength = (jpegBytes[index + 2] << 8) | jpegBytes[index + 3];
        const dataStart = index + 4;
        if (segmentLength < 2 || dataStart + segmentLength - 2 > jpegBytes.length) {
            break;
        }

        const isSofMarker =
            (marker >= 0xc0 && marker <= 0xc3) ||
            (marker >= 0xc5 && marker <= 0xc7) ||
            (marker >= 0xc9 && marker <= 0xcb) ||
            (marker >= 0xcd && marker <= 0xcf);
        if (isSofMarker && dataStart + 4 < jpegBytes.length) {
            const height = (jpegBytes[dataStart + 1] << 8) | jpegBytes[dataStart + 2];
            const width = (jpegBytes[dataStart + 3] << 8) | jpegBytes[dataStart + 4];
            if (width > 0 && height > 0) {
                return { width, height };
            }
        }

        index = index + 2 + segmentLength;
    }

    return null;
}

function extractEmbeddedJpegStreams(fileBuffer) {
    const streams = [];
    if (!(fileBuffer instanceof Uint8Array)) {
        return streams;
    }

    for (let index = 0; index + 1 < fileBuffer.length; index++) {
        if (fileBuffer[index] !== 0xff || fileBuffer[index + 1] !== 0xd8) {
            continue;
        }
        const endOffset = parseJpegEndOffset(fileBuffer, index);
        if (!Number.isInteger(endOffset) || endOffset <= index + 2) {
            continue;
        }
        const bytes = fileBuffer.slice(index, endOffset);
        const dimensions = parseJpegDimensions(bytes);
        streams.push({
            offset: index,
            endOffset,
            bytes,
            dimensions,
        });
    }

    const deduped = new Map();
    for (const stream of streams) {
        const key = `${stream.offset}:${stream.endOffset}`;
        if (!deduped.has(key)) {
            deduped.set(key, stream);
        }
    }
    return Array.from(deduped.values());
}

function parseHdrGainMapMetadataFromXmp(fileBuffer) {
    const decoded = decodeLatin1(fileBuffer);
    if (!decoded || !decoded.includes('hdrgm:Version')) {
        return null;
    }

    const fallback = buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST);
    const readAttribute = (name) => {
        const regex = new RegExp(`hdrgm:${name}=\"([^\\\"]+)\"`, 'i');
        const match = decoded.match(regex);
        const parsed = Number(match?.[1]);
        return Number.isFinite(parsed) ? parsed : null;
    };
    const readTripleSequence = (name) => {
        const sectionRegex = new RegExp(
            `<hdrgm:${name}>[\\s\\S]*?<rdf:Seq>([\\s\\S]*?)<\\/rdf:Seq>[\\s\\S]*?<\\/hdrgm:${name}>`,
            'i'
        );
        const section = decoded.match(sectionRegex)?.[1];
        if (!section) {
            return null;
        }
        const liMatches = Array.from(
            section.matchAll(/<rdf:li>\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*<\/rdf:li>/gi)
        );
        if (liMatches.length < 3) {
            return null;
        }
        const values = liMatches.slice(0, 3).map((entry) => Number(entry[1]));
        return values.every((value) => Number.isFinite(value)) ? values : null;
    };

    const metadata = {
        ...fallback,
        gainMapMin: [...fallback.gainMapMin],
        gainMapMax: [...fallback.gainMapMax],
        gamma: [...fallback.gamma],
        offsetSdr: [...fallback.offsetSdr],
        offsetHdr: [...fallback.offsetHdr],
    };

    const parsedGainMapMin = readTripleSequence('GainMapMin');
    const parsedGainMapMax = readTripleSequence('GainMapMax');
    const parsedGamma = readTripleSequence('Gamma');
    if (parsedGainMapMin) {
        metadata.gainMapMin = parsedGainMapMin;
    }
    if (parsedGainMapMax) {
        metadata.gainMapMax = parsedGainMapMax;
    }
    if (parsedGamma) {
        metadata.gamma = parsedGamma;
    }

    const offsetSdr = readAttribute('OffsetSDR');
    const offsetHdr = readAttribute('OffsetHDR');
    if (offsetSdr !== null) {
        metadata.offsetSdr = [offsetSdr, offsetSdr, offsetSdr];
    }
    if (offsetHdr !== null) {
        metadata.offsetHdr = [offsetHdr, offsetHdr, offsetHdr];
    }

    const hdrCapacityMin = readAttribute('HDRCapacityMin');
    const hdrCapacityMax = readAttribute('HDRCapacityMax');
    if (hdrCapacityMin !== null) {
        metadata.hdrCapacityMin = hdrCapacityMin;
    }
    if (hdrCapacityMax !== null) {
        metadata.hdrCapacityMax = hdrCapacityMax;
        if (!parsedGainMapMax && hdrCapacityMax > 0) {
            metadata.gainMapMax = [hdrCapacityMax, hdrCapacityMax, hdrCapacityMax];
        }
    }

    return metadata;
}

function extractPreservedJpegComponentsFromMarkers(fileBuffer) {
    const streams = extractEmbeddedJpegStreams(fileBuffer)
        .filter((entry) =>
            entry.dimensions
            && entry.dimensions.width > 0
            && entry.dimensions.height > 0
        );
    if (streams.length < 2) {
        throw new Error('Unable to locate separate base and gain-map JPEG streams in source image');
    }

    const rankedStreams = [...streams].sort((left, right) => {
        const leftArea = left.dimensions.width * left.dimensions.height;
        const rightArea = right.dimensions.width * right.dimensions.height;
        return rightArea - leftArea;
    });

    const baseStream = rankedStreams[0];
    const gainMapStream = rankedStreams.find((entry) => entry.offset !== baseStream.offset);
    if (!gainMapStream) {
        throw new Error('Unable to identify gain-map JPEG stream from marker extraction');
    }

    const parsedMetadata = parseHdrGainMapMetadataFromXmp(fileBuffer);
    return {
        baseJpegBytes: baseStream.bytes,
        gainMapJpegBytes: gainMapStream.bytes,
        gainMapMetadata: parsedMetadata || buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST),
    };
}

async function isUhdrImageWithDecoderFallback(fileBuffer) {
    if (await isUhdrImage(fileBuffer)) {
        return true;
    }

    const decoder = new UHDRDecoder();
    let initialized = false;
    try {
        await decoder.init();
        initialized = true;
        decoder.setImage(fileBuffer);
        decoder.probe();
        const gainMapBytes = decoder.getGainMapImage();
        if (gainMapBytes instanceof Uint8Array && gainMapBytes.length > 0) {
            return true;
        }
    } catch {
        // Continue to metadata-marker fallback below.
    } finally {
        if (initialized && typeof decoder.destroy === 'function') {
            decoder.destroy();
        }
    }

    return hasHdrGainMapXmpMarkers(fileBuffer);
}

function buildGainMapMetadata(maxContentBoost) {
    const safeMaxContentBoost = Number.isFinite(maxContentBoost) && maxContentBoost > 0
        ? maxContentBoost
        : DEFAULT_MAX_CONTENT_BOOST;
    const normalizedMaxContentBoost = Math.max(1.0, safeMaxContentBoost);
    const log2MaxBoost = Math.log2(normalizedMaxContentBoost);
    const gamma = GAIN_MAP_GAMMA_LINEAR;
    const offsetSdr = GAIN_MAP_OFFSET_SDR_LINEAR;

    return {
        gainMapMin: [1.0, 1.0, 1.0],
        gainMapMax: [normalizedMaxContentBoost, normalizedMaxContentBoost, normalizedMaxContentBoost],
        gamma: [gamma, gamma, gamma],
        offsetSdr: [offsetSdr, offsetSdr, offsetSdr],
        offsetHdr: [0, 0, 0],
        hdrCapacityMin: 1.0,
        hdrCapacityMax: normalizedMaxContentBoost,
        parsedGainMapMin: [0, 0, 0],
        parsedGainMapMax: [log2MaxBoost, log2MaxBoost, log2MaxBoost],
        parsedGamma: [gamma, gamma, gamma],
        parsedOffsetSdr: [offsetSdr, offsetSdr, offsetSdr],
        parsedOffsetHdr: [0, 0, 0],
        parsedHdrCapacityMin: 0,
        parsedHdrCapacityMax: log2MaxBoost
    };
}

function createGainMapGenerator() {
    return new GmnetGainMapGenerator({
        buildMetadata: (maxBoost) => buildGainMapMetadata(maxBoost)
    });
}

function getGainMapGenerator() {
    if (!gainMapGenerator) {
        gainMapGenerator = createGainMapGenerator();
    }
    return gainMapGenerator;
}

export function __resetGainMapGeneratorForTests() {
    gainMapGenerator = null;
}

/**
 * Processes an image file to create an UltraHDR JPEG.
 * @param {File} file - The input image file.
 * @param {Object} options - Processing options.
 * @param {number} options.maxContentBoost - Max content boost for gain map.
 * @param {number} options.rotation - Rotation in degrees.
 * @param {number} options.quality - JPEG quality (0-1).
 * @param {boolean} options.discardGainMap - Whether to discard existing gain map and regenerate.
 * @param {boolean} options.stripExif - Whether to strip EXIF data.
 * @param {boolean} [options.useGmnet=true] - Must remain enabled; false throws hard error.
 * @param {"realworld" | "synthetic"} [options.gmnetModelVariant] - Selects the GMNet ONNX variant.
 * @param {(event: Object) => void} [options.onProgress] - Optional telemetry callback.
 * @param {number} [options.fileIndex] - Optional file index in current batch.
 * @param {number} [options.totalFiles] - Optional total files in current batch.
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file, options = DEFAULT_PROCESS_OPTIONS) {
    const mergedOptions = { ...DEFAULT_PROCESS_OPTIONS, ...(options || {}) };
    console.log('[Process] Starting processing for:', file.name);
    throwIfAborted(mergedOptions.abortSignal);
    const sourceInputFile = file;
    let sourceInputBytes = null;
    let originalSdrJpegBytes = null;
    let processingPath = 'unknown';

    const setProcessingPath = (nextPath) => {
        if (nextPath === 'generated' || nextPath === 'preserved') {
            processingPath = nextPath;
        }
    };
    const withProcessingPath = (payload = {}) => (
        processingPath === 'generated' || processingPath === 'preserved'
            ? { ...payload, processingPath }
            : payload
    );

    const telemetry = createPipelineTelemetry({
        fileName: file.name,
        fileSize: file.size,
        fileIndex: mergedOptions.fileIndex,
        totalFiles: mergedOptions.totalFiles,
        onProgress: mergedOptions.onProgress
    });

    try {
        await telemetry.runStage('wasm-load', async () => {
            throwIfAborted(mergedOptions.abortSignal);
            await ensureWasmLoaded();
        });

        const sourceExifBytes = await telemetry.runStage('extract-source-exif', async () => {
            if (mergedOptions.stripExif || !(sourceInputFile instanceof Blob)) {
                return null;
            }
            sourceInputBytes = await blobToUint8Array(sourceInputFile);
            return extractExifApp1PayloadFromInput(
                sourceInputBytes,
                sourceInputFile.name || '',
                sourceInputFile.type || ''
            );
        });

        file = await telemetry.runStage('preprocess-file', async () => {
            throwIfAborted(mergedOptions.abortSignal);
            return preprocessFile(file, mergedOptions);
        });

        // Check if JPEG already has a gain map (UltraHDR) or is a standard JPEG suitable for lossless SDR preservation
        if (file instanceof File) {
            let preserveDecisionMade = false;
            try {
                const fileBuffer = await telemetry.runStage('read-source-buffer', async () =>
                    sourceInputBytes && file === sourceInputFile
                        ? sourceInputBytes
                        : new Uint8Array(await file.arrayBuffer())
                );
                throwIfAborted(mergedOptions.abortSignal);

                const isUhdr = await telemetry.runStage(
                    'detect-ultrahdr',
                    async () => isUhdrImageWithDecoderFallback(fileBuffer)
                );
                if (isUhdr) {
                    if (!mergedOptions.discardGainMap) {
                        setProcessingPath('preserved');
                        preserveDecisionMade = true;
                        console.log('[Process] Gain map decision: preserving existing gain map from source input');
                        if (mergedOptions.rotation === 0) {
                            console.log('[Process] Input is already UltraHDR JPEG — preserving existing gain map');
                            const blob = await telemetry.runStage(
                                'finalize-preserved',
                                async () => finalizeUltraHDR(fileBuffer, mergedOptions.stripExif),
                                withProcessingPath(),
                            );
                            telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'preserve' }));
                            return blob;
                        }

                        console.log('[Process] UltraHDR JPEG with rotation — extracting and rotating gain map');
                        const blob = await telemetry.runStage(
                            'rotate-preserved-ultrahdr',
                            async () => processUhdrWithRotation(fileBuffer, mergedOptions, telemetry, sourceExifBytes),
                            withProcessingPath(),
                        );
                        telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'preserve-with-rotation' }));
                        return blob;
                    } else {
                        console.log('[Process] Discarding existing gain map. Extracting base image for lossless preservation.');
                        const decoder = new UHDRDecoder();
                        try {
                            await decoder.init();
                            decoder.setImage(fileBuffer);
                            decoder.probe();
                            originalSdrJpegBytes = decoder.getBaseImage();
                        } catch (e) {
                            console.warn('[Process] Failed to extract base image for lossless preservation', e);
                        } finally {
                            decoder.destroy();
                        }
                    }
                } else {
                    const isJpeg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
                    if (isJpeg) {
                        console.log('[Process] Standard JPEG input. Retaining original bytes for lossless SDR preservation.');
                        originalSdrJpegBytes = fileBuffer;
                    }
                }
            } catch (e) {
                if (preserveDecisionMade) {
                    console.error(
                        '[Process] Gain-map preservation failed after preserve decision; refusing GMNet regeneration.',
                        e
                    );
                    throw e;
                }
                console.warn('[Process] UltraHDR detection/preservation failed, proceeding with normal processing:', e);
                telemetry.emit('preservation-fallback', {
                    stage: 'detect-ultrahdr',
                    warning: String(e?.message || e)
                });
            }
        }

        // If file is an object with raw data from HEIC preservation, handle it.
        if (!(file instanceof File) && !(file instanceof Blob) && file.sdr) {
            setProcessingPath('preserved');
            console.log('[Process] Gain map decision: preserving existing gain map from source input');
            console.log('[Process] Using pre-decoded components (likely HEIC with native gain map)');
            let imageData = file.sdr;
            let gainMapImageData = file.gainMap;
            // Preserve source gain-map metadata when provided by the preprocessor.
            // This avoids re-scaling preserved gain maps based on UI maxContentBoost.
            const metadata = file.gainMapMetadata
                || (Number.isFinite(file.gainMapHeadroom) && file.gainMapHeadroom > 0
                    ? buildGainMapMetadata(file.gainMapHeadroom)
                    : buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST));

            const { sdr } = await telemetry.runStage(
                'compress-components',
                async () => compressImages(imageData, gainMapImageData, { ...mergedOptions, originalSdrJpegBytes: null }, metadata, telemetry, sourceExifBytes),
                withProcessingPath(),
            );
            const blob = await telemetry.runStage(
                'finalize-output',
                async () => finalizeUltraHDR(sdr, mergedOptions.stripExif),
                withProcessingPath(),
            );

            telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'pre-decoded-components' }));
            return blob;
        }

        setProcessingPath('generated');

        // Load Data
        // Prefer Blob/File decode sources to avoid main-thread-only FileReader reliance in workers.
        const decodeSource = await telemetry.runStage('read-input-data-url', async () =>
            file instanceof Blob ? file : readFileAsDataURL(file)
        );
        console.log('[Process] File loaded and EXIF extraction complete');
        throwIfAborted(mergedOptions.abortSignal);

        // Load image pixels
        const { imageData } = await telemetry.runStage('decode-image-data', async () => loadImageData(decodeSource));
        let workingImageData = imageData;
        console.log('[Process] Image data retrieved');

        const gmnetCapability = await telemetry.runStage('probe-gmnet-capability', async () => {
            const overrideCapability = resolveTestCapabilityOverride(globalThis);
            if (overrideCapability) {
                telemetry.emitStageProgress('probe-gmnet-capability', 100, withProcessingPath({
                    note: `Using GMNet capability override (${overrideCapability.provider}, gain-map max ${overrideCapability.gainMapMaxLongEdge}px).`,
                    gmnetCapability: overrideCapability,
                    gmnetCapabilitySource: overrideCapability.source,
                    gmnetExecutionProvider: overrideCapability.provider,
                }));
                return overrideCapability;
            }

            const generator = getGainMapGenerator();
            if (!generator || typeof generator.resolveCapability !== 'function') {
                return null;
            }
            const resolvedCapability = normalizeGmnetCapability(await generator.resolveCapability({
                gmnetModelVariant: mergedOptions.gmnetModelVariant,
                forceExecutionProviders: mergedOptions.forceExecutionProviders,
                capabilityHint: mergedOptions.gmnetCapabilityHint,
            }));
            if (resolvedCapability) {
                telemetry.emitStageProgress('probe-gmnet-capability', 100, withProcessingPath({
                    note: `GMNet capability resolved (${resolvedCapability.provider}, gain-map max ${resolvedCapability.gainMapMaxLongEdge}px).`,
                    gmnetCapability: resolvedCapability,
                    gmnetCapabilitySource: resolvedCapability.source,
                    gmnetExecutionProvider: resolvedCapability.provider,
                }));
            }
            return resolvedCapability;
        }, withProcessingPath());

        const {
            capability: normalizedGmnetCapability,
            appliedMaxDimension,
            capabilityOutputMaxLongEdge,
        } = resolveCapabilityConstrainedMaxDimension(gmnetCapability);
        const constrainedDimensions = getConstrainedDimensions(
            workingImageData.width,
            workingImageData.height,
            appliedMaxDimension,
        );
        if (constrainedDimensions.changed) {
            const constrainPayload = normalizedGmnetCapability
                ? {
                    gmnetCapability: normalizedGmnetCapability,
                    gmnetCapabilitySource: normalizedGmnetCapability.source,
                    gmnetExecutionProvider: normalizedGmnetCapability.provider,
                    defaultMaxDimension: MAX_GENERATED_IMAGE_DIMENSION,
                    capabilityOutputMaxLongEdge,
                    appliedMaxDimension,
                    constrainedByCapability: true,
                    originalWidth: workingImageData.width,
                    originalHeight: workingImageData.height,
                }
                : {};
            originalSdrJpegBytes = null; // Cannot use lossless original bytes if resized
            workingImageData = await telemetry.runStage('constrain-sdr-image', async () =>
                resizeImageData(
                    workingImageData,
                    constrainedDimensions.width,
                    constrainedDimensions.height
                ),
                withProcessingPath(constrainPayload),
            );
        }

        const normalizedRotation = ((mergedOptions.rotation || 0) % 360 + 360) % 360;
        if (normalizedRotation !== 0) {
            originalSdrJpegBytes = null; // Cannot use lossless original bytes if rotated
            workingImageData = await telemetry.runStage(
                'apply-rotation',
                async () => rotateImageData(workingImageData, normalizedRotation),
                withProcessingPath(),
            );
        }

        const gmnetWidth = Math.max(1, Math.floor(workingImageData.width / 2));
        const gmnetHeight = Math.max(1, Math.floor(workingImageData.height / 2));
        let gainMapSourceImageData = workingImageData;
        if (gmnetWidth !== workingImageData.width || gmnetHeight !== workingImageData.height) {
            gainMapSourceImageData = await telemetry.runStage(
                'prepare-gmnet-input',
                async () => resizeImageData(
                    workingImageData,
                    gmnetWidth,
                    gmnetHeight
                ),
                withProcessingPath(),
            );
        }

        throwIfAborted(mergedOptions.abortSignal);

        // Generate gain map data
        console.log('[Process] Gain map decision: generating new gain map with GMNet');
        const { gainMapImageData, metadata: generatedGainMapMetadata } = await telemetry.runStage(
            'generate-gain-map',
            async () => generateGainMapData(gainMapSourceImageData, {
                ...mergedOptions,
                gmnetCapabilityHint: normalizedGmnetCapability || mergedOptions.gmnetCapabilityHint,
                onStageProgress: (stageProgress, note, metadata = null) => {
                    telemetry.emitStageProgress('generate-gain-map', stageProgress, withProcessingPath({
                        note,
                        ...(metadata && typeof metadata === 'object' ? metadata : {}),
                    }));
                }
            }),
            withProcessingPath(),
        );
        console.log('[Process] GainMap generated by GMNet');
        throwIfAborted(mergedOptions.abortSignal);

        // Compress and encode to UltraHDR
        const { sdr } = await telemetry.runStage('compress-components', async () =>
            compressImages(
                workingImageData,
                gainMapImageData,
                { ...mergedOptions, rotation: 0, originalSdrJpegBytes },
                generatedGainMapMetadata,
                telemetry,
                sourceExifBytes
            ),
            withProcessingPath(),
        );
        console.log('[Process] Compression complete');

        // Finalize UltraHDR
        const blob = await telemetry.runStage(
            'finalize-output',
            async () => finalizeUltraHDR(sdr, mergedOptions.stripExif),
            withProcessingPath(),
        );
        console.log('[Process] Processing complete, returning Blob');

        telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'generated' }));
        return blob;
    } catch (error) {
        telemetry.fail(error);
        throw error;
    }
}

/**
 * Process an UltraHDR JPEG with rotation, preserving the original gain map.
 * Extracts compressed base/gain-map components and re-encodes once with the
 * encoder's built-in rotation effect and original gain-map metadata.
 * @param {Uint8Array} fileBuffer - The raw file bytes
 * @param {Object} options - Processing options (rotation, quality, stripExif)
 * @returns {Promise<Blob>} - The rotated UltraHDR JPEG
 */
async function processUhdrWithRotation(fileBuffer, options, telemetry = null, sourceExifBytes = null) {
    let baseJpegBytes;
    let gainMapJpegBytes;
    let gainMapMetadata;
    const decoder = new UHDRDecoder();
    try {
        try {
            if (telemetry) {
                await telemetry.runStage('rotation-init-decoder', async () => decoder.init());
            } else {
                await decoder.init();
            }

            // 1. Probe the UltraHDR JPEG and extract original compressed components.
            // This preserves source quality by avoiding decode/re-encode before final output.
            if (telemetry) {
                await telemetry.runStage('rotation-probe-source', async () => {
                    decoder.setImage(fileBuffer);
                    decoder.probe();
                });
            } else {
                decoder.setImage(fileBuffer);
                decoder.probe();
            }

            baseJpegBytes = telemetry
                ? await telemetry.runStage('rotation-extract-base', async () => decoder.getBaseImage())
                : decoder.getBaseImage();
            gainMapJpegBytes = telemetry
                ? await telemetry.runStage('rotation-extract-gain-map', async () => decoder.getGainMapImage())
                : decoder.getGainMapImage();
            gainMapMetadata = telemetry
                ? await telemetry.runStage('rotation-extract-metadata', async () => decoder.getGainMapMetadata())
                : decoder.getGainMapMetadata();
        } catch (decoderExtractionError) {
            console.warn(
                '[Process] Decoder-based rotation extraction failed; trying marker-based component extraction.',
                decoderExtractionError
            );
            const markerFallbackResult = telemetry
                ? await telemetry.runStage(
                    'rotation-extract-fallback-components',
                    async () => extractPreservedJpegComponentsFromMarkers(fileBuffer)
                )
                : extractPreservedJpegComponentsFromMarkers(fileBuffer);
            baseJpegBytes = markerFallbackResult.baseJpegBytes;
            gainMapJpegBytes = markerFallbackResult.gainMapJpegBytes;
            gainMapMetadata = markerFallbackResult.gainMapMetadata;
        }

        console.log('[Process] Extracted compressed components. Base:', baseJpegBytes.length, 'GainMap:', gainMapJpegBytes.length);

        const quality = options.quality !== undefined ? options.quality : 0.95;
        const rotation = ((options.rotation || 0) % 360 + 360) % 360;
        const exifBytes = options.stripExif ? null : sourceExifBytes;

        // Effects on compressed inputs are not supported by libultrahdr. Decode both
        // compressed components to ImageData, rotate in JS, then re-encode with the
        // original gain-map metadata.
        const baseImageData = telemetry
            ? await telemetry.runStage('rotation-decode-base-image', async () => jpegBytesToImageData(baseJpegBytes))
            : await jpegBytesToImageData(baseJpegBytes);
        const gainMapImageData = telemetry
            ? await telemetry.runStage('rotation-decode-gain-map-image', async () => jpegBytesToImageData(gainMapJpegBytes))
            : await jpegBytesToImageData(gainMapJpegBytes);

        const { sdr } = telemetry
            ? await telemetry.runStage('rotation-reencode-components', async () =>
                compressImages(
                    baseImageData,
                    gainMapImageData,
                    { ...options, quality, rotation },
                    gainMapMetadata,
                    telemetry,
                    exifBytes
                )
            )
            : await compressImages(
                baseImageData,
                gainMapImageData,
                { ...options, quality, rotation },
                gainMapMetadata,
                null,
                exifBytes
            );

        // 3. Finalize (handle EXIF)
        return await finalizeUltraHDR(sdr, options.stripExif);
    } finally {
        decoder.destroy();
    }
}

/**
 * Preprocesses the file, converting HEIC/TIFF to a format we can read if necessary.
 * @param {File} file 
 * @param {Object} options 
 * @returns {Promise<File>}
 */
async function preprocessFile(file, options) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.heic') || name.endsWith('.heif')) {
        console.log('[Process] Detected HEIC/HEIF, converting...');
        try {
            const processHeic = await getProcessHeic();
            const converted = await processHeic(file, options);
            if (converted) {
                console.log('[Process] Converted HEIC to:', converted.type);
                return converted;
            }
        } catch (e) {
            console.error('[Process] HEIC conversion failed:', e);
            throw e;
        }
    } else if (name.endsWith('.tif') || name.endsWith('.tiff')) {
        console.log('[Process] Detected TIFF, converting...');
        try {
            const processTiff = await getProcessTiff();
            const converted = await processTiff(file);
            if (converted) {
                console.log('[Process] Converted TIFF to:', converted.type);
                return converted;
            }
        } catch (e) {
            console.error('[Process] TIFF conversion failed:', e);
            throw e;
        }
    }
    return file;
}

/**
 * Loads image data from a Data URL.
 * @param {string} dataUrl 
 * @returns {Promise<{imageData: ImageData, width: number, height: number}>}
 */
/**
 * Loads image data from a Data URL or Blob using worker-safe APIs.
 * @param {string|Blob} source 
 * @returns {Promise<{imageData: ImageData, width: number, height: number}>}
 */
async function loadImageData(source) {
    let drawable;
    if (source instanceof Blob) {
        drawable = await decodeDrawableFromBlob(source);
    } else {
        // Assume data URL
        const response = await fetch(source);
        let blob;
        if (typeof response.blob === 'function') {
            blob = await response.blob();
        } else if (typeof response.arrayBuffer === 'function') {
            blob = new Blob([await response.arrayBuffer()]);
        } else {
            throw new Error('Image decode response does not provide blob() or arrayBuffer()');
        }
        drawable = await decodeDrawableFromBlob(blob);
    }

    const width = drawable.width;
    const height = drawable.height;

    let ctx;
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d');
    } else if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
    } else {
        throw new Error('Canvas not available for image decoding');
    }

    ctx.drawImage(drawable, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    if (typeof drawable.close === 'function') {
        drawable.close();
    }

    return { imageData, width, height };
}

async function decodeDrawableFromBlob(blob) {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(blob);
    }
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
        throw new Error('Image decoding requires createImageBitmap or DOM Image support');
    }

    const dataUrl = await readBlobAsDataURL(blob);
    return await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to decode image blob'));
        image.src = dataUrl;
    });
}

function createCanvasWithContext(width, height, errorMessage) {
    return createRuntimeCanvasWithContext(width, height, errorMessage);
}

async function imageDataToDrawable(imageData) {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(imageData);
    }

    const { canvas, ctx } = createCanvasWithContext(
        imageData.width,
        imageData.height,
        'Canvas not available for image conversion'
    );
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

async function resizeImageData(imageData, targetWidth, targetHeight) {
    if (!imageData || targetWidth <= 0 || targetHeight <= 0) {
        throw new Error('Invalid resize arguments');
    }

    if (imageData.width === targetWidth && imageData.height === targetHeight) {
        return imageData;
    }

    const { ctx } = createCanvasWithContext(targetWidth, targetHeight, 'Canvas not available for resize');
    const drawable = await imageDataToDrawable(imageData);
    ctx.drawImage(drawable, 0, 0, targetWidth, targetHeight);
    const resized = ctx.getImageData(0, 0, targetWidth, targetHeight);
    if (typeof drawable.close === 'function') {
        drawable.close();
    }

    return resized;
}

/**
 * Generates gain-map data using GMNet ONNX inference.
 * @param {ImageData} imageData - The SDR image data.
 * @param {Object} [options]
 * @param {number} [options.maxContentBoost=2.3] - Maximum HDR boost factor for metadata.
 * @param {"realworld" | "synthetic"} [options.gmnetModelVariant="realworld"] - Selects model variant.
 * @param {boolean} [options.useGmnet=true] - Must remain enabled; false throws hard error.
 * @param {(progress: number, note?: string, metadata?: Object) => void} [options.onStageProgress]
 *   - Optional granular progress callback.
 * @returns {Promise<{gainMapImageData: ImageData, metadata: Object}>}
 */
export async function generateGainMapData(imageData, options = {}) {
    return getGainMapGenerator().generate(imageData, options);
}

/**
 * Compresses images using libultrahdr WASM encoder.
 * @param {ImageData} sdrImageData
 * @param {ImageData} gainMapImageData
 * @param {Object} options
 * @param {Object} metadata
 * @param {Object|null} telemetry
 * @param {Uint8Array|null} exifPayload
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
async function compressImages(sdrImageData, gainMapImageData, options, metadata = null, telemetry = null, exifPayload = null) {
    // Convert quality 0-1 to 0-100
    const originalSdrJpegBytes = options.originalSdrJpegBytes || null;
    const quality = options.quality !== undefined ? options.quality : 0.95;
    const wasmQuality = Math.round(quality * 100);
    const rotation = ((options.rotation || 0) % 360 + 360) % 360;
    const maxContentBoost = options.maxContentBoost ?? DEFAULT_MAX_CONTENT_BOOST;
    const gainMapMetadata = metadata || buildGainMapMetadata(maxContentBoost);
    const compressedMetadata = {
        gainMapMin: gainMapMetadata.gainMapMin,
        gainMapMax: gainMapMetadata.gainMapMax,
        gamma: gainMapMetadata.gamma,
        offsetSdr: gainMapMetadata.offsetSdr,
        offsetHdr: gainMapMetadata.offsetHdr,
        hdrCapacityMin: gainMapMetadata.hdrCapacityMin,
        hdrCapacityMax: gainMapMetadata.hdrCapacityMax
    };

    // Initialize WASM encoder
    const encoder = new UHDREncoder();
    if (telemetry) {
        await telemetry.runStage('encode-init', async () => encoder.init());
    } else {
        await encoder.init();
    }

    try {
        const rotatedSdrImageData = rotation !== 0
            ? (telemetry
                ? await telemetry.runStage('rotate-sdr-image', async () => rotateImageData(sdrImageData, rotation))
                : await rotateImageData(sdrImageData, rotation))
            : sdrImageData;
        const rotatedGainMapImageData = rotation !== 0
            ? (telemetry
                ? await telemetry.runStage('rotate-gain-map-image', async () => rotateImageData(gainMapImageData, rotation))
                : await rotateImageData(gainMapImageData, rotation))
            : gainMapImageData;

        const gainMapIsMonochrome = isMonochromeGainMapImageData(rotatedGainMapImageData);
        const gainMapMetadataIsSingleChannel = isSingleChannelGainMapMetadata(compressedMetadata);
        const needsSingleChannelNormalization = !gainMapIsMonochrome || !gainMapMetadataIsSingleChannel;
        const encoderGainMapImageData = needsSingleChannelNormalization && !gainMapIsMonochrome
            ? toMonochromeGainMapImageData(rotatedGainMapImageData)
            : rotatedGainMapImageData;
        const encoderGainMapMetadata = needsSingleChannelNormalization
            ? toSingleChannelGainMapMetadata(compressedMetadata)
            : compressedMetadata;

        if (needsSingleChannelNormalization) {
            console.warn(
                '[Process] Normalizing gain-map payload to single-channel metadata for XMP-compatible encoding'
            );
        }

        const encoderFn = options.useJpegli
            ? async (data, q) => await imageDataToJpegBytes(data, q)
            : async (data, q) => await blobToUint8Array(await imageDataToJpegBlob(data, q));

        console.log("[start] encode-sdr-to-jpeg")
        let sdrJpegBytes;
        if (originalSdrJpegBytes instanceof Uint8Array && rotation === 0) {
            console.log("[Process] Bypassing SDR encoding: Utilizing lossless original SDR JPEG bytes");
            if (telemetry) {
                sdrJpegBytes = await telemetry.runStage('encode-sdr-to-jpeg', async () => stripExifSegments(originalSdrJpegBytes));
            } else {
                sdrJpegBytes = stripExifSegments(originalSdrJpegBytes);
            }
        } else {
            sdrJpegBytes = telemetry
                ? await telemetry.runStage('encode-sdr-to-jpeg', async () => encoderFn(rotatedSdrImageData, quality))
                : await encoderFn(rotatedSdrImageData, quality);
        }
        console.log("[end] encode-sdr-to-jpeg success")
        console.log("[start] encode-gain-map-to-jpeg")
        const gainMapJpegBytes = telemetry
            ? await telemetry.runStage('encode-gain-map-to-jpeg', async () => encoderFn(encoderGainMapImageData, quality))
            : await encoderFn(encoderGainMapImageData, quality);
        console.log("[end] encode-gain-map-to-jpeg success")
        let finalExifPayload = exifPayload;
        if (finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0) {
            finalExifPayload = normalizeExifOrientationTo1(finalExifPayload);
            if (finalExifPayload.length + 2 > 0xffff) {
                console.warn('Skipping EXIF insertion: payload exceeds JPEG APP1 segment size limit');
                finalExifPayload = null;
            }
        }

        const baseJpegForEncoder =
            !options.stripExif && finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0
                ? insertExifSegment(sdrJpegBytes, finalExifPayload)
                : sdrJpegBytes;
        console.log("exif processing of JPEG done (or skipped)")

        if (telemetry) {
            await telemetry.runStage('encode-set-base-image', async () => {
                encoder.setCompressedBaseImage(baseJpegForEncoder);
            });
            await telemetry.runStage('encode-set-gain-map-image', async () => {
                encoder.setCompressedGainMapImage(gainMapJpegBytes, encoderGainMapMetadata);
            });
        } else {
            encoder.setCompressedBaseImage(baseJpegForEncoder);
            encoder.setCompressedGainMapImage(gainMapJpegBytes, encoderGainMapMetadata);
        }

        if (!options.stripExif && finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0) {
            if (telemetry) {
                await telemetry.runStage('encode-set-exif', async () => {
                    encoder.setExifData(finalExifPayload);
                });
            } else {
                encoder.setExifData(finalExifPayload);
            }
        }

        // Encode to UltraHDR JPEG.
        if (telemetry) {
            await telemetry.runStage('encode-ultrahdr', async () => {
                encoder.encode(wasmQuality);
            });
        } else {
            encoder.encode(wasmQuality);
        }

        // Get the encoded data.
        const jpegData = encoder.getEncodedData();
        if (!jpegData) {
            throw new Error('Encoding failed: no output data');
        }

        return { sdr: jpegData, gainMap: new Uint8Array(0) };
    } finally {
        encoder.destroy();
    }
}

function isMonochromeGainMapImageData(imageData) {
    if (!imageData || !imageData.data) {
        return true;
    }
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== data[i + 1] || data[i] !== data[i + 2]) {
            return false;
        }
    }
    return true;
}

function toMonochromeGainMapImageData(imageData) {
    if (!imageData || !imageData.data) {
        return imageData;
    }
    const monochromeData = new Uint8ClampedArray(imageData.data.length);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = Math.round((imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3);
        monochromeData[i] = gray;
        monochromeData[i + 1] = gray;
        monochromeData[i + 2] = gray;
        monochromeData[i + 3] = imageData.data[i + 3];
    }
    return new ImageData(monochromeData, imageData.width, imageData.height);
}

function isSingleChannelGainMapMetadata(metadata) {
    if (!metadata) {
        return true;
    }
    const channelKeys = ['gainMapMin', 'gainMapMax', 'gamma', 'offsetSdr', 'offsetHdr'];
    return channelKeys.every((key) => {
        const values = metadata[key];
        if (!Array.isArray(values) || values.length < 3) {
            return true;
        }
        return values[0] === values[1] && values[0] === values[2];
    });
}

function toSingleChannelGainMapMetadata(metadata) {
    const normalized = {
        ...metadata
    };
    const channelKeys = ['gainMapMin', 'gainMapMax', 'gamma', 'offsetSdr', 'offsetHdr'];
    for (const key of channelKeys) {
        const values = metadata?.[key];
        if (!Array.isArray(values) || values.length === 0) {
            continue;
        }
        const channel0 = values[0];
        normalized[key] = [channel0, channel0, channel0];
    }
    return normalized;
}

import { encodeJpegli } from './jpegli-decoder.js';

async function imageDataToJpegBytes(imageData, quality = 0.95) {
    // Quality for jpegli is 0-100, normalize from 0-1
    const wasmQuality = Math.max(1, Math.min(100, Math.round(quality * 100)));
    return await encodeJpegli(imageData, wasmQuality);
}

async function imageDataToJpegBlob(imageData, quality = 0.95) {
    const { canvas, ctx } = createCanvasWithContext(imageData.width, imageData.height, 'Canvas not available for JPEG encoding');
    ctx.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    return blob;
}

async function jpegBytesToImageData(jpegBytes) {
    const blob = new Blob([jpegBytes], { type: 'image/jpeg' });
    // Use the worker-safe implementation
    const { imageData } = await loadImageData(blob);
    return imageData;
}

async function rotateImageData(imageData, degrees) {
    const normalized = ((degrees || 0) % 360 + 360) % 360;
    if (normalized === 0) {
        return imageData;
    }

    const width = imageData.width;
    const height = imageData.height;
    const isPortrait = normalized === 90 || normalized === 270;
    const newWidth = isPortrait ? height : width;
    const newHeight = isPortrait ? width : height;

    const { ctx } = createCanvasWithContext(newWidth, newHeight, 'Canvas not available for rotation');
    const drawable = await imageDataToDrawable(imageData);

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate((normalized * Math.PI) / 180);
    ctx.drawImage(drawable, -width / 2, -height / 2);
    ctx.restore();

    const rotatedData = ctx.getImageData(0, 0, newWidth, newHeight);
    if (typeof drawable.close === 'function') {
        drawable.close();
    }

    return rotatedData;
}


async function blobToUint8Array(blob) {
    if (blob && typeof blob.arrayBuffer === 'function') {
        return new Uint8Array(await blob.arrayBuffer());
    }

    if (typeof Response !== 'undefined') {
        const arrayBuffer = await new Response(blob).arrayBuffer();
        return new Uint8Array(arrayBuffer);
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result));
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

function readBlobAsDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Embeds metadata and finalizes the UltraHDR JPEG.
 * With WASM encoder, the metadata is already embedded in the JPEG.
 * This function now handles EXIF preservation only.
 * @param {Uint8Array} sdr - The UltraHDR JPEG from WASM encoder
 * @param {boolean} stripExif
 * @returns {Promise<Blob>}
 */
async function finalizeUltraHDR(sdr, stripExif) {
    // The WASM encoder embeds metadata directly in the JPEG
    // We only strip metadata when requested.
    let finalJpeg = sdr;

    if (stripExif) {
        finalJpeg = stripExifSegments(finalJpeg);
    }

    return new Blob([finalJpeg], { type: 'image/jpeg' });
}

/**
 * Reads a File as a Data URL.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
