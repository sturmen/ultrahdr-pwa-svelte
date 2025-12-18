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
>
  <input
    type="file"
    id="file-upload"
    multiple
    accept="image/jpeg,image/jpg,image/png,image/webp,.heic,.heif,.tif,.tiff"
    on:change={handleFiles}
    hidden
  />
  <label for="file-upload" class="drop-label">
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
    <p>
      Drag & drop images here, or click to select<br />
      <span class="sub-text">(JPG, PNG, WebP, HEIC, TIFF)</span>
    </p>
  </label>
</div>

<style>
  .drop-zone {
    border: 2px dashed var(--text-secondary);
    border-radius: var(--border-radius);
    padding: 3rem;
    text-align: center;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
  }

  .drop-zone.active {
    border-color: var(--primary-color);
    background: rgba(10, 132, 255, 0.1);
    transform: scale(1.02);
  }

  .drop-label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .icon {
    width: 48px;
    height: 48px;
    color: var(--primary-color);
  }

  .icon svg {
    width: 100%;
    height: 100%;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-color);
  }

  .sub-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
</style>
