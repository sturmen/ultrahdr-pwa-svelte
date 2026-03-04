import {
  consumeSharedFiles as consumeFromStore,
  storeSharedFiles as storeToStore,
} from "./share-store.js";

let pendingLaunchQueueFiles = [];
let launchQueueRegisteredRuntimes = new WeakSet();

function enqueueLaunchQueueFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return;
  }
  pendingLaunchQueueFiles.push(...files.filter((file) => file instanceof Blob));
}

function consumePendingLaunchQueueFiles() {
  if (pendingLaunchQueueFiles.length === 0) {
    return [];
  }
  const files = pendingLaunchQueueFiles;
  pendingLaunchQueueFiles = [];
  return files;
}

async function resolveLaunchQueueFiles(launchParams) {
  const handles = Array.isArray(launchParams?.files) ? launchParams.files : [];
  if (handles.length === 0) {
    return [];
  }

  const files = [];
  for (const handle of handles) {
    if (handle instanceof Blob) {
      files.push(handle);
      continue;
    }
    if (handle?.kind === "file" && typeof handle.getFile === "function") {
      try {
        const file = await handle.getFile();
        if (file instanceof Blob) {
          files.push(file);
        }
      } catch (_error) {
        // Ignore individual handle failures and continue.
      }
    }
  }
  return files;
}

function defaultReplaceState(state, title, url) {
  if (typeof window !== "undefined" && window.history?.replaceState) {
    window.history.replaceState(state, title, url);
  }
}

export function registerLaunchQueueConsumer(options = {}) {
  const runtime = options.runtime || globalThis;
  const launchQueue = runtime?.launchQueue;
  if (
    !runtime ||
    (typeof runtime !== "object" && typeof runtime !== "function") ||
    !launchQueue ||
    typeof launchQueue.setConsumer !== "function"
  ) {
    return false;
  }

  if (launchQueueRegisteredRuntimes.has(runtime)) {
    return true;
  }

  const persistSharedFiles = options.persistSharedFiles || storeToStore;
  const onFiles = typeof options.onFiles === "function" ? options.onFiles : null;

  launchQueue.setConsumer(async (launchParams) => {
    const files = await resolveLaunchQueueFiles(launchParams);
    if (files.length === 0) {
      return;
    }

    enqueueLaunchQueueFiles(files);
    try {
      await persistSharedFiles(files);
    } catch (_error) {
      // Keep in-memory fallback queue even if persistence fails.
    }
    onFiles?.(files);
  });

  launchQueueRegisteredRuntimes.add(runtime);
  return true;
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
  const pendingLaunchQueueFiles = consumePendingLaunchQueueFiles();
  if (pendingLaunchQueueFiles.length > 0) {
    if (typeof replaceState === "function") {
      replaceState({}, "", pathname);
    }
    return pendingLaunchQueueFiles;
  }

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

export function __resetShareTargetLaunchForTests() {
  pendingLaunchQueueFiles = [];
  launchQueueRegisteredRuntimes = new WeakSet();
}
