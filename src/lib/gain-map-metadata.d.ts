export interface GainMapMetadata {
    gainMapMin: number[];
    gainMapMax: number[];
    gamma: number[];
    offsetSdr: number[];
    offsetHdr: number[];
    hdrCapacityMin: number;
    hdrCapacityMax: number;
}

export function buildGainMapMetadata(maxContentBoost?: number): GainMapMetadata;
export function extractHdrGainMapHeadroomFromBuffer(buffer: Uint8Array): number | null;
export function parseHdrGainMapMetadataFromBuffer(buffer: Uint8Array): GainMapMetadata | null;
