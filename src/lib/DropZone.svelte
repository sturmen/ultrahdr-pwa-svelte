<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let isDragOver = false;

  // Eligible image extensions (lowercase)
  const ELIGIBLE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
    ".tif",
    ".tiff",
  ];

  function isEligibleFile(fileName) {
    const lowerName = fileName.toLowerCase();
    return ELIGIBLE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  }

  // Convert an ephemeral File to a stable File by reading its contents into memory
  async function stabilizeFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    return new File([arrayBuffer], file.name, {
      type: file.type || getMimeType(file.name),
    });
  }

  // Get MIME type from file extension
  function getMimeType(fileName) {
    const ext = fileName.toLowerCase().split(".").pop();
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
      tif: "image/tiff",
      tiff: "image/tiff",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  // Recursively read all files from a FileSystemDirectoryEntry
  async function readDirectoryRecursively(directoryEntry) {
    const files = [];
    const reader = directoryEntry.createReader();

    // readEntries may not return all entries in one call, so we loop
    const readAllEntries = () => {
      return new Promise((resolve, reject) => {
        const allEntries = [];
        const readBatch = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve(allEntries);
            } else {
              allEntries.push(...entries);
              readBatch();
            }
          }, reject);
        };
        readBatch();
      });
    };

    const entries = await readAllEntries();

    for (const entry of entries) {
      if (entry.isFile) {
        try {
          const file = await new Promise((resolve, reject) => {
            entry.file(resolve, reject);
          });
          if (isEligibleFile(file.name)) {
            // Immediately read and stabilize the file to prevent stale references
            const stableFile = await stabilizeFile(file);
            files.push(stableFile);
          }
        } catch (err) {
          console.warn("Failed to read file:", entry.name, err);
        }
      } else if (entry.isDirectory) {
        const subFiles = await readDirectoryRecursively(entry);
        files.push(...subFiles);
      }
    }

    return files;
  }

  // Extract files from DataTransferItemList, handling both files and directories
  async function extractFilesFromDataTransfer(dataTransfer) {
    const files = [];
    const items = dataTransfer.items;

    if (!items) {
      // Fallback: no items API, just use files directly
      return Array.from(dataTransfer.files).filter((f) =>
        isEligibleFile(f.name),
      );
    }

    const promises = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry?.();
        if (entry) {
          if (entry.isDirectory) {
            promises.push(readDirectoryRecursively(entry));
          } else if (entry.isFile) {
            promises.push(
              (async () => {
                try {
                  const file = await new Promise((resolve, reject) => {
                    entry.file(resolve, reject);
                  });
                  if (isEligibleFile(file.name)) {
                    return [await stabilizeFile(file)];
                  }
                  return [];
                } catch (err) {
                  console.warn("Failed to read file:", entry.name, err);
                  return [];
                }
              })(),
            );
          }
        } else {
          // Fallback if webkitGetAsEntry is not available
          const file = item.getAsFile();
          if (file && isEligibleFile(file.name)) {
            files.push(file);
          }
        }
      }
    }

    const results = await Promise.all(promises);
    for (const result of results) {
      files.push(...result);
    }

    return files;
  }

  function handleDragOver(e) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  async function handleDrop(e) {
    e.preventDefault();
    isDragOver = false;

    const files = await extractFilesFromDataTransfer(e.dataTransfer);
    if (files.length > 0) {
      dispatch("files", files);
    }
  }

  function handleFiles(e) {
    if (e.target.files && e.target.files.length > 0) {
      dispatch("files", e.target.files);
    }
  }
</script>

<div
  class="drop-zone"
  class:active={isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="button"
  tabindex="0"
  aria-label="Upload images"
  data-testid="upload-drop-zone"
>
  <input
    type="file"
    id="file-upload"
    multiple
    accept="image/jpeg,image/jpg,image/png,image/webp,.heic,.heif,.tif,.tiff"
    on:change={handleFiles}
    hidden
  />
  <label for="file-upload" class="drop-label" aria-label="Pick Images">
    <div class="drop-head">
      <div class="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      </div>
      <span class="cta">Pick Images</span>
    </div>
    <p class="headline">Convert one photo or batch process many at once.</p>
    <p class="support">Drag and drop is also supported.</p>
    <p class="sub-text">Supports JPG, PNG, WebP, HEIC, HEIF, and TIFF</p>
  </label>
</div>

<style>
  .drop-zone {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xl);
    padding: 1rem;
    text-align: left;
    transition: all 0.25s ease;
    background: var(--surface-raised);
    cursor: pointer;
    min-height: 44px;
  }

  .drop-zone.active {
    border-color: var(--primary-color);
    background: var(--surface-interactive);
    transform: translateY(-1px);
  }

  .drop-label {
    cursor: pointer;
    display: grid;
    gap: 0.75rem;
  }

  .drop-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    background: var(--primary-color);
    color: var(--text-on-primary);
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .icon {
    width: 40px;
    height: 40px;
    color: var(--primary-color);
    padding: 0.4rem;
    border-radius: 0.75rem;
    background: var(--surface-muted);
  }

  .icon svg {
    width: 100%;
    height: 100%;
  }

  p {
    margin: 0;
    color: var(--text-color);
  }

  .headline {
    font-weight: 600;
    font-size: 1rem;
  }

  .support {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .sub-text {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  @media (min-width: 768px) {
    .drop-zone {
      padding: 1.4rem;
    }

    .headline {
      font-size: 1.06rem;
    }
  }
</style>
