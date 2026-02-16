export async function setQueueBadge(count) {
  if (typeof navigator === "undefined" || typeof navigator.setAppBadge !== "function") {
    return false;
  }

  const normalized = Number.isFinite(Number(count)) ? Math.max(0, Math.floor(Number(count))) : 0;
  try {
    await navigator.setAppBadge(normalized);
    return true;
  } catch {
    return false;
  }
}

export async function clearQueueBadge() {
  if (typeof navigator === "undefined" || typeof navigator.clearAppBadge !== "function") {
    return false;
  }

  try {
    await navigator.clearAppBadge();
    return true;
  } catch {
    return false;
  }
}
