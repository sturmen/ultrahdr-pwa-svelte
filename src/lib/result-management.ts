export interface ResultRecord {
  originalName: string;
  blob?: Blob;
  url?: string;
  size: number;
  index: number;
  queueId: number;
  settingsVersion?: number;
  rotation?: number;
  processingPath?: string;
}

export interface StoredResultRecord extends Omit<ResultRecord, 'blob'> {
  blob?: Blob;
}

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
  results: Array<ResultRecord | null | undefined>,
  revokeObjectURL: (url: string) => void = URL.revokeObjectURL,
) {
  (results || []).forEach((result) => {
    if (result?.url) {
      revokeObjectURL(result.url);
    }
  });
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

export async function buildShareFiles(results: ResultRecord[], selectedIds: Set<number>) {
  const selectedResults = getSelectedResults(results, selectedIds);
  return selectedResults.map((result) => {
    const blob = result.blob;
    return new File([blob], normalizeJpegName(result.originalName), {
      type: 'image/jpeg',
    });
  });
}

export async function loadSelectedResultBlobs(
  results: StoredResultRecord[],
  selectedIds: Set<number>,
  { loadResultBlob }: ResultBlobLoader,
): Promise<LoadedResultBlobRecord[]> {
  const selectedResults = getSelectedResults(results, selectedIds);
  const loaded = await Promise.all(
    selectedResults.map(async (result) => {
      const blob = result.blob ?? await loadResultBlob(result.queueId);
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
