import type { GainMapMetadata } from './gain-map-metadata.js';
import type { HdrIntentPayload } from './processing-types.ts';

export function isWasmLoaded(): boolean;
export function isAvailable(): Promise<boolean>;
export function isUhdrImage(fileBuffer: Uint8Array): Promise<boolean>;

export class UHDRDecoder {
    init(): Promise<void>;
    destroy(): void;
    setImage(fileBuffer: Uint8Array): void;
    probe(): void;
    getBaseImage(): Uint8Array;
    getGainMapImage(): Uint8Array;
    getGainMapMetadata(): GainMapMetadata;
}

export class UHDREncoder {
    init(): Promise<void>;
    destroy(): void;
    setCompressedBaseImage(baseJpegBytes: Uint8Array): void;
    setCompressedGainMapImage(gainMapJpegBytes: Uint8Array, metadata: GainMapMetadata): void;
    setHDRIntentImage(
        data: Uint8Array,
        width: number,
        height: number,
        options: {
            strideBytes: number;
            format: HdrIntentPayload['format'];
            cg: HdrIntentPayload['cg'];
            ct: HdrIntentPayload['ct'];
            range: HdrIntentPayload['range'];
        },
    ): void;
    setExifData(exifPayload: Uint8Array): void;
    encode(quality: number): void;
    getEncodedData(): Uint8Array | null;
}
