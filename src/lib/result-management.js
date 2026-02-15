function normalizeJpegName(originalName) {
  const baseName = String(originalName || "image").replace(/\.[^/.]+$/, "");
  return `${baseName}.jpg`;
}

export function releaseResultUrls(results, revokeObjectURL = URL.revokeObjectURL) {
  (results || []).forEach((result) => {
    if (result?.url) {
      revokeObjectURL(result.url);
    }
  });
}

export function getSelectedResults(results, selectedIndices) {
  return (results || []).filter((_, index) => selectedIndices?.has(index));
}

export async function buildShareFiles(results, selectedIndices) {
  const selectedResults = getSelectedResults(results, selectedIndices);
  return selectedResults.map((result) => {
    const blob = result.blob;
    return new File([blob], normalizeJpegName(result.originalName), {
      type: "image/jpeg",
    });
  });
}
