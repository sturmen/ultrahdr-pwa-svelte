import type { GainMapMetadata } from './gain-map-metadata.js';

export type GenerateGainMapOptions = {
    maxContentBoost?: number;
    gmnetModelVariant?: 'realworld' | 'synthetic';
    useGmnet?: boolean;
    gmnetCheckpointing?: 'off' | 'auto' | 'force';
    onStageProgress?: (progress: number, note?: string, metadata?: Record<string, unknown> | null) => void;
};

export function isGmnetRuntimeSupported(): boolean;

export class GmnetGainMapGenerator {
    constructor(options?: {
        buildMetadata?: (maxContentBoost?: number) => GainMapMetadata;
    });

    generate(
        imageData: ImageData,
        options?: GenerateGainMapOptions,
    ): Promise<{
        gainMapImageData: ImageData;
        metadata: GainMapMetadata;
    }>;
}
