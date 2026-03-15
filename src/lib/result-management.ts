export interface ResultRecord {
  originalName: string;
  blob: Blob;
  url: string;
  size: number;
  index: number;
  queueId: number;
  settingsVersion?: number;
  rotation?: number;
  processingPath?: string;
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
