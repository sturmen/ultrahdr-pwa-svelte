export async function setQueueBadge(count: number): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.setAppBadge !== 'function'
  ) {
    return false;
  }

  const numericCount = Number(count);
  const normalized = Number.isFinite(numericCount)
    ? Math.max(0, Math.floor(numericCount))
    : 0;

  try {
    await navigator.setAppBadge(normalized);
    return true;
  } catch {
    return false;
  }
}

export async function clearQueueBadge(): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.clearAppBadge !== 'function'
  ) {
    return false;
  }

  try {
    await navigator.clearAppBadge();
    return true;
  } catch {
    return false;
  }
}
