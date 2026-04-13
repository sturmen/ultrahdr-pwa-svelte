export interface ResultRecord {
  originalName: string;
  size: number;
  index: number;
  queueId: number;
  settingsVersion?: number;
  rotation?: number;
  processingPath?: string;
  url?: string | null;
  blob?: Blob | null;
}

export type StoredResultRecord = ResultRecord;

export interface LoadedResultBlobRecord {
  result: StoredResultRecord;
  blob: Blob;
}

interface ResultBlobLoader {
  loadResultBlob: (queueId: number) => Promise<Blob | null>;
}

function normalizeJpegName(originalName: string) {
  const baseName = String(originalName || 'image').replace(/\.[^/.]+$/, '');
  return `${baseName}.jpg`;
}

export function releaseResultUrls(
  results: Array<(ResultRecord & { url?: string | null }) | null | undefined>,
  revokeObjectURL: (url: string) => void = URL.revokeObjectURL,
) {
  for (const result of results) {
    if (typeof result?.url === 'string' && result.url) {
      revokeObjectURL(result.url);
    }
  }
}

function resolveSelectedQueueIds(results: ResultRecord[], selectedIds: Set<number>) {
  if (!selectedIds || selectedIds.size === 0) {
    return new Set<number>();
  }

  const queueIds = new Set<number>();
  selectedIds.forEach((selectedId) => {
    const byQueueId = results.find((result) => result.queueId === selectedId);
    if (byQueueId) {
      queueIds.add(byQueueId.queueId);
      return;
    }

    const byIndex = results[selectedId];
    if (byIndex) {
      queueIds.add(byIndex.queueId ?? selectedId);
    }
  });
  return queueIds;
}

export function getSelectedResults(results: ResultRecord[], selectedIds: Set<number>) {
  const selectedQueueIds = resolveSelectedQueueIds(results || [], selectedIds);
  return (results || []).filter((result, index) =>
    selectedQueueIds.has(result.queueId ?? index),
  );
}

export async function loadSelectedResultBlobs(
  results: StoredResultRecord[],
  selectedIds: Set<number>,
  { loadResultBlob }: ResultBlobLoader,
): Promise<LoadedResultBlobRecord[]> {
  const selectedResults = getSelectedResults(results, selectedIds);
  const loaded = await Promise.all(
    selectedResults.map(async (result) => {
      const blob = await loadResultBlob(result.queueId);
      if (!blob) {
        return null;
      }
      return {
        result,
        blob,
      };
    }),
  );

  return loaded.filter((entry): entry is LoadedResultBlobRecord => entry !== null);
}

export async function buildShareFilesFromStorage(
  results: StoredResultRecord[],
  selectedIds: Set<number>,
  loader: ResultBlobLoader,
) {
  const loadedResults = await loadSelectedResultBlobs(results, selectedIds, loader);
  return loadedResults.map(({ result, blob }) =>
    new File([blob], normalizeJpegName(result.originalName), {
      type: 'image/jpeg',
    }),
  );
}

export async function buildShareFiles(
  results: Array<ResultRecord & { blob?: Blob | null }>,
  selectedIds: Set<number>,
  loader?: ResultBlobLoader,
) {
  if (loader) {
    return buildShareFilesFromStorage(results, selectedIds, loader);
  }

  return getSelectedResults(results, selectedIds)
    .filter((result): result is ResultRecord & { blob: Blob } => result.blob instanceof Blob)
    .map((result) =>
      new File([result.blob], normalizeJpegName(result.originalName), {
        type: 'image/jpeg',
      }),
    );
}
