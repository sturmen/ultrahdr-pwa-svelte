import { createPipelineTelemetry } from './pipeline-telemetry.js';
import { UHDREncoder, UHDRDecoder, isWasmLoaded, isAvailable, isUhdrImage } from './ultrahdr-wasm.js';
import {
    insertExifSegment,
    stripExifSegments,
    normalizeExifOrientationTo1,
    extractExifOrientation,
    extractExifPayloadFromJpeg
} from './exif-utils.js';
import { extractExifApp1PayloadFromInput } from './input-exif.js';
import { isGmnetRuntimeSupported, GmnetGainMapGenerator } from './gain-map-generator.js';
import {
    resizeImageData,
    transformImageData,
    loadImageData,
    jpegBytesToImageData,
    blobToUint8Array,
    isMonochromeGainMapImageData,
    toMonochromeGainMapImageData,
    isSingleChannelGainMapMetadata,
    toSingleChannelGainMapMetadata
} from './image-utils.js';
import { rotateJpeg } from './jpegtran-rotate.js';
import { IMAGE_MAX_LONG_EDGE } from './constants.js';
import { DEFAULT_MAX_CONTENT_BOOST } from './max-content-boost.js';
import {
    decideGeneratedSdrEncodingStrategy,
    decidePreservedUltraHdrRoute,
} from './processing-route-plan.ts';
import {
    buildGainMapMetadata,
    parseHdrGainMapMetadataFromBuffer,
} from './gain-map-metadata.js';
import type { JpegTransform } from './exif-utils.js';
import type { GainMapMetadata } from './gain-map-metadata.js';
import type { PipelineTelemetry } from './pipeline-telemetry.js';
import type { JpegliEncodeOptions } from './jpegli-decoder.js';
import type {
    DecodedRasterImage,
    HdrIntentHeifResult,
    HdrIntentPayload,
    PreservedHeifResult,
    ProcessingPathClassification,
} from './processing-types.ts';

type GMNetModelVariant = 'realworld' | 'synthetic';
type GmnetCheckpointingMode = 'off' | 'auto' | 'force';

interface ProcessOptions {
    maxContentBoost?: number;
    rotation?: number;
    quality?: number;
    discardGainMap?: boolean;
    stripExif?: boolean;
    abortSignal?: AbortSignal | null;
    gmnetModelVariant?: GMNetModelVariant;
    gmnetCapabilityHint?: string | null;
    useGmnet?: boolean;
    gmnetCheckpointing?: GmnetCheckpointingMode;
    onProgress?: (event: Record<string, unknown>) => void;
    onStageProgress?: (progress: number, note?: string, metadata?: Record<string, unknown> | null) => void;
    fileIndex?: number;
    totalFiles?: number;
    jpegliChunkRows?: number;
    originalSdrJpegBytes?: Uint8Array | null;
    sourceAutoRotation?: number;
    __hasExplicitMaxContentBoost?: boolean;
}

type ResolvedProcessOptions = ProcessOptions & {
    __hasExplicitMaxContentBoost: boolean;
};

type PreprocessedInput = File | HdrIntentHeifResult | PreservedHeifResult | DecodedRasterImage;
type EncodedUltraHdrPayload = { sdr: Uint8Array; gainMap: Uint8Array };
type OrientationDecision = {
    orientation: number;
    transform: JpegTransform | null;
    autoRotation: number;
};
type JpegDimensions = { width: number; height: number };
type EmbeddedJpegStream = {
    offset: number;
    endOffset: number;
    bytes: Uint8Array;
    dimensions: JpegDimensions | null;
};
type ExtractedPreservedComponents = {
    baseJpegBytes: Uint8Array;
    gainMapJpegBytes: Uint8Array;
    gainMapMetadata: GainMapMetadata;
    baseDimensions?: JpegDimensions | null;
};
type GainMapGenerationResult = {
    gainMapImageData: ImageData;
    metadata: GainMapMetadata;
};

function isHdrIntentHeifInput(input: unknown): input is HdrIntentHeifResult {
    return !!input
        && typeof input === 'object'
        && 'kind' in input
        && input.kind === 'hdr-intent-heif'
        && 'hdrIntent' in input;
}

function isPreservedHeifInput(input: unknown): input is PreservedHeifResult {
    return !!input && typeof input === 'object' && 'sdr' in input;
}

function isDecodedRasterInput(input: unknown): input is DecodedRasterImage {
    return !!input
        && typeof input === 'object'
        && 'data' in input
        && 'width' in input
        && 'height' in input
        && 'strideBytes' in input
        && 'pixelFormat' in input
        && input.pixelFormat === 'rgba8';
}

function decodedRasterToImageData(input: DecodedRasterImage): ImageData {
    const data = input.data instanceof Uint8ClampedArray
        ? input.data
        : new Uint8ClampedArray(input.data);
    return new ImageData(data, input.width, input.height);
}

function buildDecodedRasterWrapPayload(
    substage: string,
    input: DecodedRasterImage,
    processingPath: ProcessingPathClassification,
): Record<string, unknown> {
    return {
        stage: 'decode-image-data',
        substage,
        processingPath,
        width: input.width,
        height: input.height,
        pixelBytes: input.data.byteLength,
        wrappedWithoutCopy: input.data instanceof Uint8ClampedArray,
    };
}


/**
 * Converts EXIF Orientation (1-8) to rotation degrees (0, 90, 180, 270).
 */
function orientationToRotation(orientation: number): number {
    switch (orientation) {
        case 3: return 180;
        case 6: return 90;
        case 8: return 270;
        default: return 0;
    }
}

function orientationToJpegTransform(orientation: number): JpegTransform | null {
    switch (orientation) {
        case 2:
            return 'flipH';
        case 3:
            return '180';
        case 4:
            return 'flipV';
        case 5:
            return 'transpose';
        case 6:
            return '90';
        case 7:
            return 'transverse';
        case 8:
            return '270';
        default:
            return null;
    }
}

function exifPayloadToOrientationDecision(exifPayload: Uint8Array | null): OrientationDecision {
    if (!(exifPayload instanceof Uint8Array)) {
        return {
            orientation: 1,
            transform: null,
            autoRotation: 0,
        };
    }

    const orientation = extractExifOrientation(exifPayload);
    const transform = orientationToJpegTransform(orientation);
    if (transform === null) {
        return {
            orientation,
            transform: null,
            autoRotation: 0,
        };
    }

    const autoRotation = orientationToRotation(orientation);
    return {
        orientation,
        transform,
        autoRotation: autoRotation !== 0 ? autoRotation : Number.NaN,
    };
}

function formatAutoRotationForLog(autoRotation: number): string {
    if (autoRotation === 0) {
        return '0';
    }
    if (Number.isFinite(autoRotation)) {
        return String(autoRotation);
    }
    return 'non-rotational';
}

function rotationToJpegTransform(rotation: number): JpegTransform | null {
    switch (((rotation || 0) % 360 + 360) % 360) {
        case 90:
            return '90';
        case 180:
            return '180';
        case 270:
            return '270';
        default:
            return null;
    }
}

const DEFAULT_PROCESS_OPTIONS: ProcessOptions = {
    maxContentBoost: DEFAULT_MAX_CONTENT_BOOST,
    rotation: 0,
    quality: 0.95,
    discardGainMap: false,
    stripExif: false,
    abortSignal: null,
    gmnetModelVariant: 'realworld',
    gmnetCapabilityHint: null,
};
let gainMapGenerator: GmnetGainMapGenerator | null = null;
let processHeicProcessor: ((file: File, options?: { quality?: number; discardGainMap?: boolean }) => Promise<DecodedRasterImage | HdrIntentHeifResult | PreservedHeifResult>) | null = null;
let processHeifHdrProcessor: ((file: File) => Promise<HdrIntentHeifResult>) | null = null;
let processTiffProcessor: ((file: Blob) => Promise<DecodedRasterImage>) | null = null;

async function getProcessHeic(): Promise<(file: File, options?: { quality?: number; discardGainMap?: boolean }) => Promise<DecodedRasterImage | HdrIntentHeifResult | PreservedHeifResult>> {
    if (!processHeicProcessor) {
        const module = await import('./heic-processing.js');
        processHeicProcessor = module.processHeic;
    }
    return processHeicProcessor;
}

async function getProcessHeifHdr(): Promise<(file: File) => Promise<HdrIntentHeifResult>> {
    if (!processHeifHdrProcessor) {
        const module = await import('./heif-hdr-processing.js');
        processHeifHdrProcessor = module.processHeifHdr;
    }
    return processHeifHdrProcessor;
}

async function getProcessTiff(): Promise<(file: Blob) => Promise<DecodedRasterImage>> {
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

export function throwIfAborted(signal: AbortSignal | null | undefined): void {
    if (signal?.aborted) {
        throw createAbortError();
    }
}

export function getConstrainedDimensions(width: number, height: number, maxDimension = IMAGE_MAX_LONG_EDGE): { width: number; height: number; changed: boolean } {
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

function containsAsciiSequence(haystack: Uint8Array, needle: string): boolean {
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

export function hasHdrGainMapXmpMarkers(fileBuffer: Uint8Array): boolean {
    const hasHdrGainMapNamespace = containsAsciiSequence(
        fileBuffer,
        'http://ns.adobe.com/hdr-gain-map/1.0/'
    );
    const hasHdrGainMapVersion = containsAsciiSequence(fileBuffer, 'hdrgm:Version');
    return hasHdrGainMapNamespace && hasHdrGainMapVersion;
}

function parseJpegEndOffset(bytes: Uint8Array, startOffset: number): number | null {
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

function parseJpegDimensions(jpegBytes: Uint8Array): JpegDimensions | null {
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

function extractEmbeddedJpegStreams(fileBuffer: Uint8Array): EmbeddedJpegStream[] {
    const streams: EmbeddedJpegStream[] = [];
    if (!(fileBuffer instanceof Uint8Array)) {
        return streams;
    }

    for (let index = 0; index + 1 < fileBuffer.length; index++) {
        if (fileBuffer[index] !== 0xff || fileBuffer[index + 1] !== 0xd8) {
            continue;
        }
        const endOffset = parseJpegEndOffset(fileBuffer, index);
        if (endOffset == null || endOffset <= index + 2) {
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

export function parseHdrGainMapMetadataFromXmp(fileBuffer: Uint8Array): GainMapMetadata | null {
    return parseHdrGainMapMetadataFromBuffer(fileBuffer);
}

export function extractPreservedJpegComponentsFromMarkers(fileBuffer: Uint8Array): ExtractedPreservedComponents {
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
        const leftDimensions = left.dimensions ?? { width: 0, height: 0 };
        const rightDimensions = right.dimensions ?? { width: 0, height: 0 };
        const leftArea = leftDimensions.width * leftDimensions.height;
        const rightArea = rightDimensions.width * rightDimensions.height;
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

export async function isUhdrImageWithDecoderFallback(fileBuffer: Uint8Array): Promise<boolean> {
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

export {
    classifyInputProcessingPath,
    probeInputProcessingPathFromHeaders,
} from './processing-path.js';

function createGainMapGenerator(): GmnetGainMapGenerator {
    return new GmnetGainMapGenerator({
        buildMetadata: buildGainMapMetadata
    } as unknown as ConstructorParameters<typeof GmnetGainMapGenerator>[0]);
}

function getGainMapGenerator(): GmnetGainMapGenerator {
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
 * @param {"off" | "auto" | "force"} [options.gmnetCheckpointing]
 *   - GMNet tiled inference memory mode; "auto" resolves per-browser policy.
 * @param {(event: Object) => void} [options.onProgress] - Optional telemetry callback.
 * @param {number} [options.fileIndex] - Optional file index in current batch.
 * @param {number} [options.totalFiles] - Optional total files in current batch.
 * @returns {Promise<Blob>} - The processed UltraHDR JPEG blob.
 */
export async function processImage(file: File, options: ProcessOptions = {}): Promise<Blob> {
    const optionOverrides: ProcessOptions = options && typeof options === 'object' ? options : {};
    const mergedOptions: ResolvedProcessOptions = {
        ...DEFAULT_PROCESS_OPTIONS,
        ...optionOverrides,
        __hasExplicitMaxContentBoost: Object.prototype.hasOwnProperty.call(
            optionOverrides,
            'maxContentBoost'
        ),
    };
    console.log('[Process] Starting processing for:', file.name);
    throwIfAborted(mergedOptions.abortSignal);
    const sourceInputFile = file;
    let sourceInputBytes: Uint8Array | null = null;
    let originalSdrJpegBytes: Uint8Array | null = null;
    let originalSdrJpegSource: 'uhdr-base' | 'standard-jpeg' | null = null;
    let sourceAutoRotation = 0;
    let sourceOrientation = 1;
    let sourceOrientationTransform: JpegTransform | null = null;
    let processingPath: ProcessingPathClassification = 'unknown';

    const setProcessingPath = (nextPath: ProcessingPathClassification): void => {
        if (nextPath === 'generated' || nextPath === 'preserved') {
            processingPath = nextPath;
        }
    };
    const withProcessingPath = (payload: Record<string, unknown> = {}): Record<string, unknown> => (
        processingPath === 'generated' || processingPath === 'preserved'
            ? { ...payload, processingPath }
            : payload
    );

    const telemetry: PipelineTelemetry = createPipelineTelemetry({
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

        let sourceExifBytes = await telemetry.runStage('extract-source-exif', async () => {
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
        console.log(
            `[Orientation] Initial EXIF extraction ${sourceExifBytes instanceof Uint8Array ? 'succeeded' : 'not available'} (stripExif=${mergedOptions.stripExif})`
        );

        let workingFile: PreprocessedInput = await telemetry.runStage('preprocess-file', async () => {
            throwIfAborted(mergedOptions.abortSignal);
            return preprocessFile(file, mergedOptions);
        });

        // Check if JPEG already has a gain map (UltraHDR) or is a standard JPEG suitable for lossless SDR preservation
        if (workingFile instanceof File) {
            let preserveDecisionMade = false;
            try {
                const fileBuffer = await telemetry.runStage('read-source-buffer', async () =>
                    sourceInputBytes && workingFile === sourceInputFile
                        ? sourceInputBytes
                        : new Uint8Array(await workingFile.arrayBuffer())
                );
                throwIfAborted(mergedOptions.abortSignal);

                const isJpeg =
                    workingFile.type === 'image/jpeg'
                    || workingFile.name.toLowerCase().endsWith('.jpg')
                    || workingFile.name.toLowerCase().endsWith('.jpeg');

                if (isJpeg) {
                    let orientationDecisionExif = sourceExifBytes;
                    if (!(orientationDecisionExif instanceof Uint8Array)) {
                        orientationDecisionExif = extractExifPayloadFromJpeg(fileBuffer);
                        if (orientationDecisionExif instanceof Uint8Array) {
                            console.log('[Orientation] Extracted EXIF from JPEG bytes for orientation decisioning');
                        }
                    }
                    if (
                        !mergedOptions.stripExif
                        && !(sourceExifBytes instanceof Uint8Array)
                        && orientationDecisionExif instanceof Uint8Array
                    ) {
                        sourceExifBytes = orientationDecisionExif;
                        console.log('[Orientation] Reusing JPEG-derived EXIF payload for output metadata');
                    }
                    const orientationDecision = exifPayloadToOrientationDecision(orientationDecisionExif);
                    sourceOrientation = orientationDecision.orientation;
                    sourceOrientationTransform = orientationDecision.transform;
                    sourceAutoRotation = orientationDecision.autoRotation;
                    console.log(
                        `[Orientation] Source orientation decision: orientation=${sourceOrientation}, transform=${sourceOrientationTransform || 'none'}, autoRotation=${formatAutoRotationForLog(sourceAutoRotation)}`
                    );
                } else {
                    sourceOrientation = 1;
                    sourceOrientationTransform = null;
                    sourceAutoRotation = 0;
                }

                const isUhdr = await telemetry.runStage(
                    'detect-ultrahdr',
                    async () => isUhdrImageWithDecoderFallback(fileBuffer)
                );
                if (isUhdr) {
                    if (!mergedOptions.discardGainMap) {
                        setProcessingPath('preserved');
                        preserveDecisionMade = true;
                        console.log('[Process] Gain map decision: preserving existing gain map from source input');
                        if (((mergedOptions.rotation || 0) % 360 + 360) % 360 === 0) {
                            const components = await telemetry.runStage('extract-preserved-components', async () => extractComponentsWithDecoderFallback(fileBuffer, telemetry));
                            const preservedRoute = decidePreservedUltraHdrRoute({
                                rotation: mergedOptions.rotation || 0,
                                baseDimensions: components.baseDimensions || null,
                                sourceOrientationTransform,
                                maxLongEdge: IMAGE_MAX_LONG_EDGE,
                            });
                            const dims = components.baseDimensions;
                            const isTooLarge = dims && (dims.width > IMAGE_MAX_LONG_EDGE || dims.height > IMAGE_MAX_LONG_EDGE);
                            const needsAutoRotation = sourceOrientationTransform !== null;
                            console.log(
                                `[Orientation] Preserved-path auto-rotation requirement: ${needsAutoRotation} (sourceOrientation=${sourceOrientation}, transform=${sourceOrientationTransform || 'none'})`
                            );

                            if (preservedRoute === 'finalize-preserved') {
                                console.log('[Process] Input is already UltraHDR JPEG — rebuilding to ensure standard compliance');
                                const blob = await telemetry.runStage(
                                    'finalize-preserved',
                                    async () => {
                                        const rebuilt = await rebuildUhdrFromCompressed(
                                            components.baseJpegBytes,
                                            components.gainMapJpegBytes,
                                            components.gainMapMetadata,
                                            mergedOptions,
                                            telemetry,
                                            sourceExifBytes
                                        );
                                        return finalizeUltraHDR(rebuilt, Boolean(mergedOptions.stripExif));
                                    },
                                    withProcessingPath(),
                                );
                                telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'preserve' }));
                                return blob;
                            }

                            console.log(`[Process] Input requires alignment (auto:${needsAutoRotation}) or exceeds ${IMAGE_MAX_LONG_EDGE}px (${isTooLarge}) — forcing re-encode path`);
                        }

                        console.log('[Process] UltraHDR JPEG requires rotation/resizing — extracting components');
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
                            originalSdrJpegSource = 'uhdr-base';
                        } catch (e) {
                            console.warn('[Process] Failed to extract base image for lossless preservation', e);
                        } finally {
                            decoder.destroy();
                        }
                    }
                } else {
                    if (isJpeg) {
                        console.log('[Process] Standard JPEG input. Retaining original bytes for lossless SDR preservation.');
                        originalSdrJpegBytes = fileBuffer;
                        originalSdrJpegSource = 'standard-jpeg';
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
                    warning: e instanceof Error ? e.message : String(e)
                });
            }
        }

        if (!(workingFile instanceof File) && !(workingFile instanceof Blob) && isHdrIntentHeifInput(workingFile)) {
            setProcessingPath('generated');
            const exifForEncode = workingFile.sourceExifBytes instanceof Uint8Array ? workingFile.sourceExifBytes : sourceExifBytes;
            const { sdr } = await telemetry.runStage(
                'compress-hdr-intent',
                async () => compressHdrIntentOnly(workingFile.hdrIntent, mergedOptions, telemetry, exifForEncode),
                withProcessingPath(),
            );
            const blob = await telemetry.runStage(
                'finalize-output',
                async () => finalizeUltraHDR(sdr, Boolean(mergedOptions.stripExif)),
                withProcessingPath(),
            );
            telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'hdr-intent-only' }));
            return blob;
        }

        // If file is an object with raw data from HEIC preservation, handle it.
        if (!(workingFile instanceof File) && !(workingFile instanceof Blob) && isPreservedHeifInput(workingFile)) {
            setProcessingPath('preserved');
            console.log('[Process] Gain map decision: preserving existing gain map from source input');
            console.log('[Process] Using pre-decoded components (likely HEIC with native gain map)');
            let imageData = decodedRasterToImageData(workingFile.sdr);
            telemetry.emit(
                'decoded-raster-wrapped',
                buildDecodedRasterWrapPayload('preserved-heic-sdr', workingFile.sdr, processingPath),
            );
            let gainMapImageData = decodedRasterToImageData(workingFile.gainMap);
            telemetry.emit(
                'decoded-raster-wrapped',
                buildDecodedRasterWrapPayload('preserved-heic-gain-map', workingFile.gainMap, processingPath),
            );
            // Preserve source gain-map metadata when provided by the preprocessor.
            // This avoids re-scaling preserved gain maps based on UI maxContentBoost.
            const gainMapHeadroom = workingFile.gainMapHeadroom ?? 0;
            const metadata = workingFile.gainMapMetadata
                || (Number.isFinite(gainMapHeadroom) && gainMapHeadroom > 0
                    ? buildGainMapMetadata(gainMapHeadroom)
                    : buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST));

            const { sdr } = await telemetry.runStage(
                'compress-components',
                async () => compressImages(
                    imageData,
                    gainMapImageData,
                    { ...mergedOptions, originalSdrJpegBytes: null, sourceAutoRotation: 0 },
                    metadata,
                    telemetry,
                    sourceExifBytes
                ),
                withProcessingPath(),
            );
            const blob = await telemetry.runStage(
                'finalize-output',
                async () => finalizeUltraHDR(sdr, Boolean(mergedOptions.stripExif)),
                withProcessingPath(),
            );

            telemetry.complete(withProcessingPath({ outputBytes: blob.size, mode: 'pre-decoded-components' }));
            return blob;
        }

        setProcessingPath('generated');

        let workingImageData: ImageData;
        if (isDecodedRasterInput(workingFile)) {
            workingImageData = await telemetry.runStage(
                'decode-image-data',
                async () => decodedRasterToImageData(workingFile),
            );
        } else {
            const decodeSource = await telemetry.runStage('read-input-data-url', async () =>
                workingFile instanceof Blob ? workingFile : file
            );
            console.log('[Process] File loaded and EXIF extraction complete');
            throwIfAborted(mergedOptions.abortSignal);

            const preloadedDecodeBytes =
                decodeSource === sourceInputFile && sourceInputBytes !== null
                    ? sourceInputBytes
                    : null;
            const { imageData } = await telemetry.runStage('decode-image-data', async () =>
                loadImageData(decodeSource, {}, preloadedDecodeBytes)
            );
            workingImageData = imageData;
        }
        console.log('[Process] Image data retrieved');

        const constrainedDimensions = getConstrainedDimensions(
            workingImageData.width,
            workingImageData.height,
            IMAGE_MAX_LONG_EDGE,
        );
        if (constrainedDimensions.changed) {
            const constrainPayload = {
                defaultMaxDimension: IMAGE_MAX_LONG_EDGE,
                appliedMaxDimension: IMAGE_MAX_LONG_EDGE,
                originalWidth: workingImageData.width,
                originalHeight: workingImageData.height,
            };
            console.log('[Orientation] Clearing lossless SDR bytes because constraint resize is required');
            originalSdrJpegBytes = null; // Cannot use lossless original bytes if resized
            originalSdrJpegSource = null;
            workingImageData = await telemetry.runStage('constrain-sdr-image', async () =>
                transformImageData(workingImageData, {
                    width: constrainedDimensions.width,
                    height: constrainedDimensions.height,
                }),
                withProcessingPath(constrainPayload),
            );
        }

        const normalizedRotation = ((mergedOptions.rotation || 0) % 360 + 360) % 360;
        if (
            normalizedRotation === 0
            && originalSdrJpegSource === 'standard-jpeg'
            && originalSdrJpegBytes instanceof Uint8Array
            && sourceOrientationTransform !== null
        ) {
            const normalizedSourceOrientationTransform = sourceOrientationTransform;
            console.log(
                `[Orientation] Attempting lossless EXIF normalization on source JPEG (transform=${normalizedSourceOrientationTransform}, perfect=true)`
            );
            try {
                originalSdrJpegBytes = await telemetry.runStage(
                    'lossless-normalize-source-orientation',
                    async () => rotateJpeg(originalSdrJpegBytes!, normalizedSourceOrientationTransform, { trim: false, perfect: true }),
                    withProcessingPath({
                        sourceOrientation,
                        sourceOrientationTransform: normalizedSourceOrientationTransform,
                    }),
                );
                sourceAutoRotation = 0;
                sourceOrientation = 1;
                sourceOrientationTransform = null;
                console.log('[Orientation] Lossless EXIF normalization succeeded; sourceAutoRotation reset to 0');
            } catch (error) {
                console.warn(
                    '[Orientation] Lossless EXIF normalization failed; falling back to decode/rotate/re-encode path',
                    error
                );
                originalSdrJpegBytes = null;
                originalSdrJpegSource = null;
            }
        }

        if (normalizedRotation !== 0) {
            const losslessTransform = rotationToJpegTransform(normalizedRotation);
            const generatedStrategy = decideGeneratedSdrEncodingStrategy({
                originalSdrJpegBytes,
                rotation: normalizedRotation,
                sourceAutoRotation,
                sourceOrientationTransform,
            });
            const canUseLosslessRotation = generatedStrategy === 'lossless-rotate-sdr';
            console.log(
                `[Orientation] User rotation request=${normalizedRotation}, sourceAutoRotation=${formatAutoRotationForLog(sourceAutoRotation)}, sourceOrientationTransform=${sourceOrientationTransform || 'none'}, canUseLosslessRotation=${canUseLosslessRotation}`
            );

            if (canUseLosslessRotation) {
                try {
                    const losslessSourceBytes = originalSdrJpegBytes!;
                    const losslessRotationTransform = losslessTransform!;
                    originalSdrJpegBytes = await telemetry.runStage(
                        'lossless-rotate-sdr-jpeg',
                        async () => rotateJpeg(losslessSourceBytes, losslessRotationTransform, { trim: false, perfect: false }),
                        withProcessingPath(),
                    );
                } catch (error) {
                    console.warn('[Process] Lossless JPEG rotation failed; falling back to re-encode path', error);
                    originalSdrJpegBytes = null;
                    originalSdrJpegSource = null;
                }
            } else {
                originalSdrJpegBytes = null; // Cannot use lossless original bytes if rotated
                originalSdrJpegSource = null;
            }

            workingImageData = await telemetry.runStage(
                'apply-rotation',
                async () => transformImageData(workingImageData, { degrees: normalizedRotation }),
                withProcessingPath(),
            );
        }

        const gmnetWidth = workingImageData.width;
        const gmnetHeight = workingImageData.height;
        const gainMapSourceImageData = await telemetry.runStage(
            'prepare-gmnet-input',
            async () => {
                if (gmnetWidth === workingImageData.width && gmnetHeight === workingImageData.height) {
                    return workingImageData;
                }
                return resizeImageData(
                    workingImageData,
                    gmnetWidth,
                    gmnetHeight
                );
            },
            withProcessingPath(),
        );

        throwIfAborted(mergedOptions.abortSignal);

        // Generate gain map data
        console.log('[Process] Gain map decision: generating new gain map with GMNet');
        const { gainMapImageData, metadata: generatedGainMapMetadata } = await telemetry.runStage(
            'generate-gain-map',
            async () => generateGainMapData(gainMapSourceImageData, {
                ...mergedOptions,
                onStageProgress: (stageProgress: number, note?: string, metadata: Record<string, unknown> | null = null) => {
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
                { ...mergedOptions, rotation: 0, originalSdrJpegBytes, sourceAutoRotation },
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
            async () => finalizeUltraHDR(sdr, Boolean(mergedOptions.stripExif)),
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
/**
 * Rebuilds an UltraHDR JPEG from its compressed components using UHDREncoder.
 * This ensures the output adheres to the latest standards (ISO 21496-1:2025).
 */
async function rebuildUhdrFromCompressed(
    baseJpegBytes: Uint8Array,
    gainMapJpegBytes: Uint8Array,
    gainMapMetadata: GainMapMetadata | null | undefined,
    options: ProcessOptions,
    telemetry: PipelineTelemetry | null = null,
    exifPayload: Uint8Array | null = null,
) {
    const encoder = new UHDREncoder();
    if (telemetry) {
        await telemetry.runStage('rebuild-init-encoder', async () => encoder.init());
    } else {
        await encoder.init();
    }

    try {
        const quality = options.quality !== undefined ? options.quality : 0.95;
        const wasmQuality = Math.round(quality * 100);

        const activeMetadata: GainMapMetadata = gainMapMetadata && typeof gainMapMetadata === 'object'
            ? { ...gainMapMetadata } as GainMapMetadata
            : buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST);
        const shouldOverrideHeadroom =
            options?.__hasExplicitMaxContentBoost === true
            && Number.isFinite(Number(options?.maxContentBoost));
        if (shouldOverrideHeadroom) {
            const overrideHeadroom = Number(options.maxContentBoost);
            console.log(`[Rebuild] Adjusting headroom metadata to: ${overrideHeadroom}`);
            activeMetadata.hdrCapacityMax = overrideHeadroom;
            // Also update gainMapMax if it was tied to headroom (standard linear gain map)
            activeMetadata.gainMapMax = [overrideHeadroom, overrideHeadroom, overrideHeadroom];
        }
        const encoderGainMapMetadata: GainMapMetadata = isSingleChannelGainMapMetadata(activeMetadata)
            ? activeMetadata
            : toSingleChannelGainMapMetadata(activeMetadata) ?? activeMetadata;
        if (!isSingleChannelGainMapMetadata(activeMetadata)) {
            console.warn(
                '[Process] Normalizing gain-map payload to single-channel metadata for XMP-compatible encoding'
            );
        }

        // Strip EXIF from base JPEG if we are going to set it explicitly
        let strippedBase = baseJpegBytes;
        if (exifPayload) {
            strippedBase = stripExifSegments(baseJpegBytes);
        }

        if (telemetry) {
            await telemetry.runStage('rebuild-set-base', async () => encoder.setCompressedBaseImage(strippedBase));
            await telemetry.runStage('rebuild-set-gain-map', async () => encoder.setCompressedGainMapImage(gainMapJpegBytes, encoderGainMapMetadata));
            if (exifPayload) {
                await telemetry.runStage('rebuild-set-exif', async () => encoder.setExifData(exifPayload));
            }
            await telemetry.runStage('rebuild-encode', async () => encoder.encode(wasmQuality));
        } else {
            encoder.setCompressedBaseImage(strippedBase);
            encoder.setCompressedGainMapImage(gainMapJpegBytes, encoderGainMapMetadata);
            if (exifPayload) {
                encoder.setExifData(exifPayload);
            }
            encoder.encode(wasmQuality);
        }

        const jpegData = encoder.getEncodedData();
        if (!jpegData) {
            throw new Error('Encoding failed during rebuild: no output data');
        }
        return jpegData;
    } finally {
        encoder.destroy();
    }
}

/**
 * Extracts compressed base/gain-map components from an UltraHDR JPEG using UHDRDecoder with marker fallback.
 */
export async function extractComponentsWithDecoderFallback(
    fileBuffer: Uint8Array,
    telemetry: PipelineTelemetry | null = null,
) {
    let baseJpegBytes: Uint8Array;
    let gainMapJpegBytes: Uint8Array;
    let gainMapMetadata: GainMapMetadata;
    const decoder = new UHDRDecoder();
    try {
        try {
            if (telemetry) {
                await telemetry.runStage('extract-init-decoder', async () => decoder.init());
                await telemetry.runStage('extract-probe-source', async () => {
                    decoder.setImage(fileBuffer);
                    decoder.probe();
                });
                baseJpegBytes = await telemetry.runStage('extract-base-image', async () => decoder.getBaseImage());
                gainMapJpegBytes = await telemetry.runStage('extract-gain-map-image', async () => decoder.getGainMapImage());
                gainMapMetadata = await telemetry.runStage('extract-metadata', async () => decoder.getGainMapMetadata());
            } else {
                await decoder.init();
                decoder.setImage(fileBuffer);
                decoder.probe();
                baseJpegBytes = decoder.getBaseImage();
                gainMapJpegBytes = decoder.getGainMapImage();
                gainMapMetadata = decoder.getGainMapMetadata();
            }
        } catch (decoderExtractionError) {
            console.warn(
                '[Process] Decoder-based extraction failed; trying marker-based component extraction.',
                decoderExtractionError
            );
            if (telemetry) {
                const markerFallbackResult = await telemetry.runStage(
                    'extract-fallback-components',
                    async () => extractPreservedJpegComponentsFromMarkers(fileBuffer)
                );
                baseJpegBytes = markerFallbackResult.baseJpegBytes;
                gainMapJpegBytes = markerFallbackResult.gainMapJpegBytes;
                gainMapMetadata = markerFallbackResult.gainMapMetadata;
            } else {
                const markerFallbackResult = extractPreservedJpegComponentsFromMarkers(fileBuffer);
                baseJpegBytes = markerFallbackResult.baseJpegBytes;
                gainMapJpegBytes = markerFallbackResult.gainMapJpegBytes;
                gainMapMetadata = markerFallbackResult.gainMapMetadata;
            }
        }
        const baseDimensions = parseJpegDimensions(baseJpegBytes);
        return { baseJpegBytes, gainMapJpegBytes, gainMapMetadata, baseDimensions };
    } finally {
        decoder.destroy();
    }
}

export async function processUhdrWithRotation(
    fileBuffer: Uint8Array,
    options: ProcessOptions,
    telemetry: PipelineTelemetry | null = null,
    sourceExifBytes: Uint8Array | null = null,
) {
    const { baseJpegBytes, gainMapJpegBytes, gainMapMetadata } = await extractComponentsWithDecoderFallback(fileBuffer, telemetry);

    console.log('[Process] Extracted compressed components. Base:', baseJpegBytes.length, 'GainMap:', gainMapJpegBytes.length);

    const quality = options.quality !== undefined ? options.quality : 0.95;
    const userRotation = ((options.rotation || 0) % 360 + 360) % 360;
    const exifBytes = Boolean(options.stripExif) ? null : sourceExifBytes;
    const baseExif = extractExifPayloadFromJpeg(baseJpegBytes);
    const inputOrientation = baseExif ? extractExifOrientation(baseExif) : 1;
    const autoRotation = orientationToRotation(inputOrientation);
    const totalRotation = (autoRotation + userRotation) % 360;
    const inputOrientationTransform = orientationToJpegTransform(inputOrientation);
    const parsedBaseDimensions = parseJpegDimensions(baseJpegBytes);
    const initialConstraints = parsedBaseDimensions
        ? getConstrainedDimensions(parsedBaseDimensions.width, parsedBaseDimensions.height, IMAGE_MAX_LONG_EDGE)
        : { changed: false };
    const losslessTransform = rotationToJpegTransform(totalRotation);
    const canUseLosslessBitstreamRotation =
        !initialConstraints.changed &&
        losslessTransform !== null &&
        totalRotation !== 0;

    console.log(
        `[Orientation] Preserved JPEG orientation analysis: orientation=${inputOrientation}, transform=${inputOrientationTransform || 'none'}, autoRotation=${formatAutoRotationForLog(autoRotation)}, userRotation=${userRotation}, totalRotation=${totalRotation}`
    );
    console.log(
        `[Orientation] Preserved lossless-rotation decision: constrained=${initialConstraints.changed}, losslessTransform=${losslessTransform || 'none'}, totalRotation=${totalRotation}, canUseLossless=${canUseLosslessBitstreamRotation}`
    );

    if (canUseLosslessBitstreamRotation) {
        try {
            const baseForRotation = stripExifSegments(baseJpegBytes);
            const gainMapForRotation = stripExifSegments(gainMapJpegBytes);
            const rotatedBaseJpegBytes = telemetry
                ? await telemetry.runStage(
                    'lossless-rotate-preserved-base-jpeg',
                    async () => rotateJpeg(baseForRotation, losslessTransform, { trim: false, perfect: false })
                )
                : await rotateJpeg(baseForRotation, losslessTransform, { trim: false, perfect: false });
            const rotatedGainMapJpegBytes = telemetry
                ? await telemetry.runStage(
                    'lossless-rotate-preserved-gain-map-jpeg',
                    async () => rotateJpeg(gainMapForRotation, losslessTransform, { trim: false, perfect: false })
                )
                : await rotateJpeg(gainMapForRotation, losslessTransform, { trim: false, perfect: false });

            const rebuilt = telemetry
                ? await telemetry.runStage(
                    'lossless-rebuild-preserved-ultrahdr',
                    async () => rebuildUhdrFromCompressed(
                        rotatedBaseJpegBytes,
                        rotatedGainMapJpegBytes,
                        gainMapMetadata,
                        options,
                        telemetry,
                        exifBytes
                    )
                )
                : await rebuildUhdrFromCompressed(
                    rotatedBaseJpegBytes,
                    rotatedGainMapJpegBytes,
                    gainMapMetadata,
                    options,
                    null,
                    exifBytes
                );
            return await finalizeUltraHDR(rebuilt, Boolean(options.stripExif));
        } catch (error) {
            console.warn(
                '[Process] Lossless preserved-component JPEG rotation failed; falling back to decode/encode path',
                error
            );
        }
    }

    // 1. Decode both. We explicitly disable browser auto-rotation to ensure
    // base and gain-map images remain aligned during pixel-level manipulation.
    // Some browsers ignore imageOrientation: 'none' and auto-rotate the base JPEG 
    // but not the gain map. Stripping EXIF beforehand prevents this completely.
    const decodeConfig = { imageOrientation: 'none' } as const;
    const nakedBaseBytes = stripExifSegments(baseJpegBytes);
    const nakedGainMapBytes = stripExifSegments(gainMapJpegBytes);

    let finalBaseImageData = telemetry
        ? await telemetry.runStage('rotation-decode-base-image', async () => jpegBytesToImageData(nakedBaseBytes, decodeConfig))
        : await jpegBytesToImageData(nakedBaseBytes, decodeConfig);
    let finalGainMapImageData = telemetry
        ? await telemetry.runStage('rotation-decode-gain-map-image', async () => jpegBytesToImageData(nakedGainMapBytes, decodeConfig))
        : await jpegBytesToImageData(nakedGainMapBytes, decodeConfig);

    console.log(`[Process] Decoded dimensions (orientation:none): Base=${finalBaseImageData.width}x${finalBaseImageData.height}, GainMap=${finalGainMapImageData.width}x${finalGainMapImageData.height}`);

    // Determine auto-rotation needed from EXIF
    const decodedConstraintDimensions = getConstrainedDimensions(finalBaseImageData.width, finalBaseImageData.height, IMAGE_MAX_LONG_EDGE);

    // 2. Resolve dimension constraints (libultrahdr limit)
    const constrained = decodedConstraintDimensions;
    if (constrained.changed) {
        console.log(`[Process] Resizing preserved components from ${finalBaseImageData.width}x${finalBaseImageData.height} to ${constrained.width}x${constrained.height}`);
        const oldBaseWidth = finalBaseImageData.width;

        finalBaseImageData = telemetry
            ? await telemetry.runStage('constrain-preserved-base', async () =>
                resizeImageData(finalBaseImageData, constrained.width, constrained.height)
            )
            : await resizeImageData(finalBaseImageData, constrained.width, constrained.height);

        const gmScale = constrained.width / oldBaseWidth;
        const gmWidth = Math.max(1, Math.floor(finalGainMapImageData.width * gmScale));
        const gmHeight = Math.max(1, Math.floor(finalGainMapImageData.height * gmScale));

        finalGainMapImageData = telemetry
            ? await telemetry.runStage('constrain-preserved-gain-map', async () =>
                resizeImageData(finalGainMapImageData, gmWidth, gmHeight)
            )
            : await resizeImageData(finalGainMapImageData, gmWidth, gmHeight);

        console.log(`[Process] Dimensions after constraints: Base=${finalBaseImageData.width}x${finalBaseImageData.height}, GainMap=${finalGainMapImageData.width}x${finalGainMapImageData.height}`);
    }
    console.log(`[Process] Re-encoding with integrated rotation: ${totalRotation}deg (auto:${autoRotation} + user:${userRotation})`);
    const {
        sdr
    } = telemetry ?
            await telemetry.runStage('rotation-reencode-components', async () =>
                compressImages(
                    finalBaseImageData,
                    finalGainMapImageData, {
                    ...options,
                    quality,
                    rotation: totalRotation // Integrated rotation handled here
                },
                    gainMapMetadata,
                    telemetry,
                    exifBytes
                )
            ) :
            await compressImages(
                finalBaseImageData,
                finalGainMapImageData, {
                ...options,
                quality,
                rotation: totalRotation
            },
                gainMapMetadata,
                null,
                exifBytes
            );

    // 3. Finalize (handle EXIF)
    return await finalizeUltraHDR(sdr, Boolean(options.stripExif));
}

/**
 * Preprocesses the file, converting HEIC/TIFF to a format we can read if necessary.
 * @param {File} file 
 * @param {Object} options 
 * @returns {Promise<File>}
 */
async function preprocessFile(
    file: File,
    options: ProcessOptions,
): Promise<File | HdrIntentHeifResult | DecodedRasterImage | PreservedHeifResult> {
    const name = file.name.toLowerCase();
    if (name.endsWith('.hif')) {
        console.log('[Process] Detected HIF, decoding HDR intent...');
        try {
            const processHeifHdr = await getProcessHeifHdr();
            return await processHeifHdr(file);
        } catch (e) {
            console.error('[Process] HIF HDR-intent decode failed:', e);
            throw e;
        }
    } else if (name.endsWith('.heic') || name.endsWith('.heif')) {
        console.log('[Process] Detected HEIC/HEIF, converting...');
        try {
            const processHeic = await getProcessHeic();
            const converted = await processHeic(file, options);
            if (converted) {
                console.log('[Process] Converted HEIC to:', converted instanceof File ? converted.type : 'non-file result');
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
                console.log('[Process] Converted TIFF to:', converted instanceof File ? converted.type : 'decoded-raster');
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
 * Loads image data from a Data URL or Blob using worker-safe APIs.
 * @param {string|Blob} source 
 * @returns {Promise<{imageData: ImageData, width: number, height: number}>}
 */
async function loadImageDataAndExif(
    source: string | Blob,
    config: { imageOrientation?: string } & Record<string, unknown> = {},
): Promise<{
    imageData: ImageData;
    width: number;
    height: number;
    originalSdrJpegBytes: Uint8Array | null;
    sourceExifBytes: Uint8Array | null;
}> {
    let blob: Blob;
    if (source instanceof Blob) {
        blob = source;
    } else {
        // Assume data URL
        const response = await fetch(source);
        if (typeof response.blob === 'function') {
            blob = await response.blob();
        } else if (typeof response.arrayBuffer === 'function') {
            blob = new Blob([await response.arrayBuffer()]);
        } else {
            throw new Error('Image decode response does not provide blob() or arrayBuffer()');
        }
    }

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let originalSdrJpegBytes: Uint8Array | null = null;
    let sourceExifBytes: Uint8Array | null = null;

    // Check if the source is a JPEG to potentially preserve original bytes and EXIF
    if (blob.type === 'image/jpeg') {
        originalSdrJpegBytes = uint8Array;
        sourceExifBytes = extractExifPayloadFromJpeg(uint8Array);
    }

    const {
        imageData,
        width,
        height
    } = await loadImageData(blob, config);

    return {
        imageData,
        width,
        height,
        originalSdrJpegBytes,
        sourceExifBytes
    };
}

/**
 * Generates gain-map data using GMNet ONNX inference.
 * @param {ImageData} imageData - The SDR image data.
 * @param {Object} [options]
 * @param {number} [options.maxContentBoost=8] - Maximum HDR boost factor for metadata.
 * @param {"realworld" | "synthetic"} [options.gmnetModelVariant="realworld"] - Selects model variant.
 * @param {boolean} [options.useGmnet=true] - Must remain enabled; false throws hard error.
 * @param {"off" | "auto" | "force"} [options.gmnetCheckpointing]
 *   - GMNet tiled inference memory mode.
 * @param {(progress: number, note?: string, metadata?: Object) => void} [options.onStageProgress]
 *   - Optional granular progress callback.
 * @returns {Promise<{gainMapImageData: ImageData, metadata: Object}>}
 */
export async function generateGainMapData(imageData: ImageData, options: Record<string, unknown> = {}) {
    return getGainMapGenerator().generate(imageData, options);
}

/**
 * Compresses images using libultrahdr WASM encoder.
 * @param {ImageData} sdrImageData
 * @param {ImageData} gainMapImageData
 * @param {Object} options
 * @param {Uint8Array|null} [options.originalSdrJpegBytes]
 * @param {number} [options.sourceAutoRotation]
 * @param {Object} metadata
 * @param {Object|null} telemetry
 * @param {Uint8Array|null} exifPayload
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
export async function compressImages(
    sdrImageData: ImageData,
    gainMapImageData: ImageData,
    options: ProcessOptions & { originalSdrJpegBytes?: Uint8Array | null; sourceAutoRotation?: number },
    metadata: GainMapMetadata | null = null,
    telemetry: PipelineTelemetry | null = null,
    exifPayload: Uint8Array | null = null,
) {
    // Convert quality 0-1 to 0-100
    const originalSdrJpegBytes = options.originalSdrJpegBytes || null;
    const sourceAutoRotation = options.sourceAutoRotation ?? 0;
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
        const rotatedSdrImageData = rotation !== 0 ?
            (telemetry ?
                await telemetry.runStage('rotate-sdr-image', async () => transformImageData(sdrImageData, { degrees: rotation })) :
                await transformImageData(sdrImageData, { degrees: rotation })) :
            sdrImageData;
        const rotatedGainMapImageData = rotation !== 0 ?
            (telemetry ?
                await telemetry.runStage('rotate-gain-map-image', async () => transformImageData(gainMapImageData, { degrees: rotation })) :
                await transformImageData(gainMapImageData, { degrees: rotation })) :
            gainMapImageData;

        const gainMapIsMonochrome = isMonochromeGainMapImageData(rotatedGainMapImageData);
        const gainMapMetadataIsSingleChannel = isSingleChannelGainMapMetadata(compressedMetadata);
        const needsSingleChannelNormalization = !gainMapIsMonochrome || !gainMapMetadataIsSingleChannel;
        const encoderGainMapImageData = needsSingleChannelNormalization && !gainMapIsMonochrome ?
            toMonochromeGainMapImageData(rotatedGainMapImageData) :
            rotatedGainMapImageData;
        const encoderGainMapMetadata: GainMapMetadata = needsSingleChannelNormalization ?
            toSingleChannelGainMapMetadata(compressedMetadata) ?? compressedMetadata :
            compressedMetadata;

        if (needsSingleChannelNormalization) {
            console.warn(
                '[Process] Normalizing gain-map payload to single-channel metadata for XMP-compatible encoding'
            );
        }

        const createJpegliProgressOptions = (stage: string, label: string) => {
            if (!telemetry) {
                return {};
            }
            return {
                onProgress: (stageProgress: number, metadata: Record<string, unknown> = {}) => {
                    const numericProgress = Number(stageProgress);
                    const clampedProgress = Number.isFinite(numericProgress)
                        ? Math.max(0, Math.min(100, numericProgress))
                        : 0;
                    telemetry.emitStageProgress(stage, clampedProgress, {
                        note: `${label} ${Math.round(clampedProgress)}%`,
                        ...(metadata && typeof metadata === 'object' ? metadata : {}),
                    });
                },
                chunkRows: options.jpegliChunkRows,
            };
        };

        const encoderFn = async (data: ImageData, q: number, encodeOptions: JpegliEncodeOptions = {}) =>
            await imageDataToJpegBytes(data, q, encodeOptions);

        console.log("[start] encode-sdr-to-jpeg")
        let sdrJpegBytes;
        if (telemetry) {
            telemetry.emitStageProgress('encode-sdr-to-jpeg', 0, {
                note: 'Encoding SDR JPEG 0%',
            });
        }
        const canBypassSdrEncoding = decideGeneratedSdrEncodingStrategy({
            originalSdrJpegBytes,
            rotation,
            sourceAutoRotation,
            sourceOrientationTransform: null,
        }) === 'bypass-sdr-encode';
        console.log(
            `[Orientation] SDR bypass decision: hasOriginal=${originalSdrJpegBytes instanceof Uint8Array}, rotation=${rotation}, sourceAutoRotation=${formatAutoRotationForLog(sourceAutoRotation)}, canBypass=${canBypassSdrEncoding}`
        );
        if (canBypassSdrEncoding) {
            console.log("[Process] Bypassing SDR encoding: Utilizing lossless original SDR JPEG bytes");
            const originalBytes = originalSdrJpegBytes!;
            if (telemetry) {
                sdrJpegBytes = await telemetry.runStage('encode-sdr-to-jpeg', async () => stripExifSegments(originalBytes));
            } else {
                sdrJpegBytes = stripExifSegments(originalBytes);
            }
        } else {
            if (originalSdrJpegBytes instanceof Uint8Array && rotation === 0 && sourceAutoRotation !== 0) {
                console.log(
                    `[Orientation] Skipping SDR bypass because source orientation is not normalized (sourceAutoRotation=${formatAutoRotationForLog(sourceAutoRotation)})`
                );
            }
            sdrJpegBytes = telemetry ?
                await telemetry.runStage(
                    'encode-sdr-to-jpeg',
                    async () => encoderFn(
                        rotatedSdrImageData,
                        quality,
                        createJpegliProgressOptions('encode-sdr-to-jpeg', 'Encoding SDR JPEG'),
                    )
                ) :
                await encoderFn(
                    rotatedSdrImageData,
                    quality,
                    createJpegliProgressOptions('encode-sdr-to-jpeg', 'Encoding SDR JPEG'),
                );
            if (telemetry) {
                telemetry.emitStageProgress('encode-sdr-to-jpeg', 100, {
                    note: 'Encoding SDR JPEG 100%',
                });
            }
        }
        console.log("[end] encode-sdr-to-jpeg success")
        console.log("[start] encode-gain-map-to-jpeg")
        if (telemetry) {
            telemetry.emitStageProgress('encode-gain-map-to-jpeg', 0, {
                note: 'Encoding gain map JPEG 0%',
            });
        }
        const gainMapJpegBytes = telemetry ?
            await telemetry.runStage(
                'encode-gain-map-to-jpeg',
                async () => encoderFn(
                    encoderGainMapImageData,
                    quality,
                    createJpegliProgressOptions('encode-gain-map-to-jpeg', 'Encoding gain map JPEG'),
                )
            ) :
                await encoderFn(
                    encoderGainMapImageData,
                    quality,
                    createJpegliProgressOptions('encode-gain-map-to-jpeg', 'Encoding gain map JPEG'),
                );
        if (telemetry) {
            telemetry.emitStageProgress('encode-gain-map-to-jpeg', 100, {
                note: 'Encoding gain map JPEG 100%',
            });
        }
        console.log("[end] encode-gain-map-to-jpeg success")
        let finalExifPayload: Uint8Array | null = exifPayload;
        if (finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0) {
            const inputOrientation = extractExifOrientation(finalExifPayload);
            console.log(
                `[Orientation] Normalizing outgoing EXIF orientation from ${inputOrientation} to 1 before encode`
            );
            finalExifPayload = normalizeExifOrientationTo1(finalExifPayload);
            if (finalExifPayload.length + 2 > 0xffff) {
                console.warn('Skipping EXIF insertion: payload exceeds JPEG APP1 segment size limit');
                finalExifPayload = null;
            }
        }

        const baseJpegForEncoder =
            !options.stripExif && finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0 ?
                insertExifSegment(sdrJpegBytes, finalExifPayload) :
                sdrJpegBytes;
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

        return {
            sdr: jpegData,
            gainMap: new Uint8Array(0)
        };
    } finally {
        encoder.destroy();
    }
}

/**
 * Encodes a HDR-intent-only image using libultrahdr API-0 path.
 * @param {Object} hdrIntent
 * @param {Object} options
 * @param {Object|null} telemetry
 * @param {Uint8Array|null} exifPayload
 * @returns {Promise<{sdr: Uint8Array, gainMap: Uint8Array}>}
 */
export async function compressHdrIntentOnly(
    hdrIntent: HdrIntentPayload,
    options: ProcessOptions,
    telemetry: PipelineTelemetry | null = null,
    exifPayload: Uint8Array | null = null,
) {
    const quality = options.quality !== undefined ? options.quality : 0.95;
    const wasmQuality = Math.round(quality * 100);
    const encoder = new UHDREncoder();
    const hdrIntentPayloadBytes = hdrIntent?.data?.byteLength ?? 0;
    const estimatedPeakBytes = hdrIntentPayloadBytes * 2;
    const hdrIntentMemoryPayload = {
        hdrIntentPayloadBytes,
        estimatedPeakBytes,
    };

    if (telemetry) {
        await telemetry.runStage('encode-init', async () => encoder.init());
    } else {
        await encoder.init();
    }

    try {
        if (telemetry) {
            await telemetry.runStage('encode-set-hdr-intent-image', async () => {
                encoder.setHDRIntentImage(hdrIntent.data, hdrIntent.width, hdrIntent.height, {
                    strideBytes: hdrIntent.strideBytes,
                    format: hdrIntent.format,
                    cg: hdrIntent.cg,
                    ct: hdrIntent.ct,
                    range: hdrIntent.range,
                });
            }, hdrIntentMemoryPayload);
        } else {
            encoder.setHDRIntentImage(hdrIntent.data, hdrIntent.width, hdrIntent.height, {
                strideBytes: hdrIntent.strideBytes,
                format: hdrIntent.format,
                cg: hdrIntent.cg,
                ct: hdrIntent.ct,
                range: hdrIntent.range,
            });
        }

        if (!options.stripExif && exifPayload instanceof Uint8Array && exifPayload.length > 0) {
            let finalExifPayload: Uint8Array | null = normalizeExifOrientationTo1(exifPayload);
            if (finalExifPayload.length + 2 > 0xffff) {
                finalExifPayload = null;
            }
            if (finalExifPayload instanceof Uint8Array && finalExifPayload.length > 0) {
                if (telemetry) {
                    await telemetry.runStage('encode-set-exif', async () => {
                        encoder.setExifData(finalExifPayload);
                    });
                } else {
                    encoder.setExifData(finalExifPayload);
                }
            }
        }

        if (telemetry) {
            await telemetry.runStage('encode-ultrahdr', async () => encoder.encode(wasmQuality), hdrIntentMemoryPayload);
        } else {
            encoder.encode(wasmQuality);
        }

        const jpegData = encoder.getEncodedData();
        if (!jpegData) {
            throw new Error('Encoding failed: no output data');
        }

        return {
            sdr: jpegData,
            gainMap: new Uint8Array(0),
            ...hdrIntentMemoryPayload,
        };
    } finally {
        encoder.destroy();
    }
}

// Gain-map and metadata utility functions moved to image-utils.js


import {
    encodeJpegli
} from './jpegli-decoder.js';

async function imageDataToJpegBytes(
    imageData: ImageData,
    quality = 0.95,
    options: JpegliEncodeOptions = {},
) {
    // Quality for jpegli is 0-100, normalize from 0-1
    const wasmQuality = Math.max(1, Math.min(100, Math.round(quality * 100)));
    console.log("encoding using jpegli")
    return await encodeJpegli(imageData, wasmQuality, options);
}

/**
 * Embeds metadata and finalizes the UltraHDR JPEG.
 * With WASM encoder, the metadata is already embedded in the JPEG.
 * This function now handles EXIF preservation only.
 * @param {Uint8Array} sdr - The UltraHDR JPEG from WASM encoder
 * @param {boolean} stripExif
 * @returns {Promise<Blob>}
 */
async function finalizeUltraHDR(sdr: Uint8Array, stripExif: boolean): Promise<Blob> {
    // The WASM encoder embeds metadata directly in the JPEG
    // We only strip metadata when requested.
    let finalJpeg = sdr;

    if (stripExif) {
        finalJpeg = stripExifSegments(finalJpeg);
    }

    const finalJpegBuffer = finalJpeg.buffer.slice(finalJpeg.byteOffset, finalJpeg.byteOffset + finalJpeg.byteLength) as ArrayBuffer;
    return new Blob([finalJpegBuffer], { type: 'image/jpeg' });
}

/**
 * Reads a File as a Data URL.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }
            reject(new Error('FileReader did not return a data URL'));
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
