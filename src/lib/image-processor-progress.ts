const PROGRESS_STAGE_ORDER = [
  'wasm-load',
  'extract-source-exif',
  'preprocess-file',
  'read-source-buffer',
  'detect-ultrahdr',
  'extract-preserved-components',
  'compress-hdr-intent',
  'read-input-data-url',
  'extract-exif',
  'decode-image-data',
  'constrain-sdr-image',
  'apply-rotation',
  'prepare-gmnet-input',
  'generate-gain-map',
  'compress-components',
  'encode-init',
  'encode-set-hdr-intent-image',
  'rotate-sdr-image',
  'rotate-gain-map-image',
  'encode-sdr-to-jpeg',
  'encode-gain-map-to-jpeg',
  'encode-set-base-image',
  'encode-set-gain-map-image',
  'encode-set-exif',
  'encode-ultrahdr',
  'finalize-preserved',
  'rotate-preserved-ultrahdr',
  'finalize-output',
] as const;

const PROGRESS_STAGE_LABELS: Record<string, string> = {
  'wasm-load': 'Loading encoder',
  'extract-source-exif': 'Extracting source metadata',
  'preprocess-file': 'Preparing input',
  'read-source-buffer': 'Reading source data',
  'detect-ultrahdr': 'Checking for existing gain map',
  'extract-preserved-components': 'Extracting preserved components',
  'compress-hdr-intent': 'Preparing HDR input',
  'read-input-data-url': 'Reading image',
  'extract-exif': 'Extracting metadata',
  'decode-image-data': 'Decoding pixels',
  'constrain-sdr-image': 'Constraining output dimensions',
  'apply-rotation': 'Applying rotation',
  'prepare-gmnet-input': 'Preparing GMNet input',
  'generate-gain-map': 'Generating gain map',
  'compress-components': 'Compressing components',
  'encode-init': 'Initializing encoder',
  'encode-set-hdr-intent-image': 'Preparing HDR intent image',
  'rotate-sdr-image': 'Rotating SDR image',
  'rotate-gain-map-image': 'Rotating gain map image',
  'encode-sdr-to-jpeg': 'Encoding SDR JPEG',
  'encode-gain-map-to-jpeg': 'Encoding gain map JPEG',
  'encode-set-base-image': 'Preparing base image',
  'encode-set-gain-map-image': 'Preparing gain map image',
  'encode-set-exif': 'Applying metadata',
  'encode-ultrahdr': 'Encoding UltraHDR output',
  'finalize-preserved': 'Finalizing preserved output',
  'rotate-preserved-ultrahdr': 'Rotating preserved UltraHDR',
  'finalize-output': 'Finalizing output',
};

function clampPercent(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, numeric));
}

function normalizeExecutionProvider(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export function formatMs(ms: number): string {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  if (safeMs < 1000) {
    return `${Math.round(safeMs)} ms`;
  }
  return `${(safeMs / 1000).toFixed(2)} s`;
}

export function getSlowestStage(
  stageDurationsMs: Record<string, number> | null | undefined,
): string | null {
  if (!stageDurationsMs) {
    return null;
  }
  const entries = Object.entries(stageDurationsMs).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return null;
  }
  const [name, duration] = entries[0];
  return `${name} (${formatMs(duration)})`;
}

export function formatExecutionProviderLabel(provider: unknown): string {
  const normalized = normalizeExecutionProvider(provider);
  if (!normalized) {
    return '';
  }
  if (normalized === 'webgpu') {
    return 'WebGPU';
  }
  if (normalized === 'webgl') {
    return 'WebGL';
  }
  if (normalized === 'wasm') {
    return 'WASM';
  }
  return normalized;
}

export function getStageLabel(stage: unknown, phase: unknown): string {
  if (phase === 'pipeline-complete') return 'Complete';
  if (phase === 'pipeline-error') return 'Processing failed';
  if (phase === 'pipeline-start') return 'Starting pipeline';
  if (!stage || typeof stage !== 'string') return 'Processing';
  return PROGRESS_STAGE_LABELS[stage] || stage;
}

export function estimatePipelineProgress(
  event: Record<string, unknown> | null | undefined,
  previousProgress = 0,
): number {
  if (!event) return previousProgress;
  if (event.phase === 'pipeline-start') return 0;
  if (event.phase === 'pipeline-complete') return 100;

  const stage = typeof event.stage === 'string' ? event.stage : '';
  const stageIndex = PROGRESS_STAGE_ORDER.indexOf(stage as (typeof PROGRESS_STAGE_ORDER)[number]);
  if (stageIndex < 0) return previousProgress;

  const segmentSize = 100 / PROGRESS_STAGE_ORDER.length;
  const segmentStart = stageIndex * segmentSize;
  const segmentEnd = segmentStart + segmentSize;

  let stageProgress = previousProgress;
  if (event.phase === 'stage-progress') {
    stageProgress =
      segmentStart +
      ((segmentEnd - segmentStart) * clampPercent(event.stageProgress)) / 100;
  } else if (event.phase === 'stage-complete') {
    stageProgress = segmentEnd;
  } else if (event.phase === 'stage-start') {
    stageProgress = segmentStart + segmentSize * 0.08;
  } else if (event.phase === 'stage-error' || event.phase === 'pipeline-error') {
    stageProgress = Math.max(previousProgress, segmentStart);
  }

  return Math.max(previousProgress, Math.min(100, stageProgress));
}

export function toBatchProgress(
  perFileProgress: number,
  fileIndex: unknown,
  totalFiles: unknown,
): number {
  const safeProgress = clampPercent(perFileProgress);
  const safeIndex = Number(fileIndex);
  const safeTotal = Number(totalFiles);
  if (
    !Number.isFinite(safeIndex) ||
    !Number.isFinite(safeTotal) ||
    safeTotal <= 0
  ) {
    return safeProgress;
  }

  const clampedIndex = Math.max(0, Math.min(safeTotal - 1, safeIndex));
  return ((clampedIndex + safeProgress / 100) / safeTotal) * 100;
}
