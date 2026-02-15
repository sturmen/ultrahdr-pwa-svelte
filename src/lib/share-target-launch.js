import { consumeSharedFiles as consumeFromStore } from "./share-store.js";

function defaultReplaceState(state, title, url) {
  if (typeof window !== "undefined" && window.history?.replaceState) {
    window.history.replaceState(state, title, url);
  }
}

export async function consumeSharedFilesFromLaunch(options = {}) {
  const search =
    options.search ??
    (typeof window !== "undefined" ? window.location.search : "");
  const pathname =
    options.pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const consumeSharedFiles = options.consumeSharedFiles || consumeFromStore;
  const replaceState = options.replaceState || defaultReplaceState;

  const urlParams = new URLSearchParams(search || "");
  if (urlParams.get("share-target") !== "true") {
    return [];
  }

  try {
    const files = await consumeSharedFiles();
    if (typeof replaceState === "function") {
      replaceState({}, "", pathname);
    }

    return Array.isArray(files)
      ? files.filter((file) => file instanceof Blob)
      : [];
  } catch (error) {
    console.error("[Share Target] Launch consume failed:", error);
    return [];
  }
}
