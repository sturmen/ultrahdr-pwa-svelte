export interface PipelineTelemetryEvent extends Record<string, unknown> {
    pipelineId: string;
    phase: string;
}

export interface PipelineTelemetry {
    pipelineId: string;
    emit(phase: string, payload?: Record<string, unknown>): PipelineTelemetryEvent;
    emitStageProgress(stage: string, stageProgress: number, payload?: Record<string, unknown>): PipelineTelemetryEvent;
    runStage<T>(stage: string, fn: () => Promise<T> | T, payload?: Record<string, unknown>): Promise<T>;
    complete(payload?: Record<string, unknown>): void;
    fail(error: unknown, payload?: Record<string, unknown>): void;
}

export interface PipelineTelemetryContext {
    pipelineId?: string;
    fileName?: string;
    fileSize?: number;
    fileIndex?: number;
    totalFiles?: number;
    onProgress?: (event: PipelineTelemetryEvent) => void;
}

export function createPipelineTelemetry(context?: PipelineTelemetryContext): PipelineTelemetry;
