<script>
  import { onMount } from "svelte";
  import { processImage } from "./processing";
  import JSZip from "jszip";

  export let files = [];

  let maxContentBoost = 2.3;
  let shadowCutoff = 0.05;
  let rotation = 0;
  let quality = 0.95;
  let discardGainMap = false;
  let stripExif = false;
  let processing = false;
  let results = [];
  let error = null;
  let debounceTimer;
  let selectedIndices = new Set();
  let latestPipelineEvent = null;

  function formatMs(ms) {
    const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
    if (safeMs < 1000) return `${Math.round(safeMs)} ms`;
    return `${(safeMs / 1000).toFixed(2)} s`;
  }

  function getSlowestStage(stageDurationsMs) {
    if (!stageDurationsMs) return null;
    const entries = Object.entries(stageDurationsMs).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;
    const [name, duration] = entries[0];
    return `${name} (${formatMs(duration)})`;
  }

  // Process a specific list of files and append results
  async function processSubset(subset, startIndex) {
    processing = true;
    error = null;
    latestPipelineEvent = null;

    try {
      for (let i = 0; i < subset.length; i++) {
        const file = subset[i];
        const globalIndex = startIndex + i;

        const blob = await processImage(file, {
          maxContentBoost,
          rotation,
          quality,
          discardGainMap,
          stripExif,
          shadowCutoff,
          fileIndex: i,
          totalFiles: subset.length,
          onProgress: (event) => {
            latestPipelineEvent = event;
          },
        });
        const url = URL.createObjectURL(blob);

        // Append result
        results = [
          ...results,
          {
            originalName: file.name,
            url,
            size: blob.size,
            index: globalIndex,
          },
        ];
        selectedIndices.add(globalIndex); // Auto-select new results
        selectedIndices = selectedIndices; // Trigger reactivity
      }
    } catch (e) {
      console.error("[UI] Error processing files:", e);
      error = e.message;
    } finally {
      processing = false;
    }
  }

  // Process ALL files (re-process everything)
  async function processAll() {
    results = [];
    selectedIndices = new Set();
    await processSubset(files, 0);
  }

  // Initial process
  onMount(() => {
    checkSharedFiles();
    processAll();
  });

  // Check for files shared via Web Share Target API
  async function checkSharedFiles() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("share-target") === "true") {
      console.log("[Share Target] Detected share target launch");
      try {
        // Open IndexedDB to get files
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("ultrahdr-share-store", 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction(["shared-files"], "readonly");
        const store = transaction.objectStore("shared-files");
        const getAllRequest = store.getAll();

        const sharedFiles = await new Promise((resolve, reject) => {
          getAllRequest.onsuccess = () => resolve(getAllRequest.result);
          getAllRequest.onerror = () => reject(getAllRequest.error);
        });

        if (sharedFiles && sharedFiles.length > 0) {
          console.log("[Share Target] Found", sharedFiles.length, "files");

          // Clean URL
          window.history.replaceState({}, "", window.location.pathname);

          // Add to files
          const startIndex = files.length;
          files = [...files, ...sharedFiles];
          await processSubset(sharedFiles, startIndex);
        }
      } catch (e) {
        console.error("[Share Target] Error retrieving files:", e);
      }
    }
  }

  // Handle adding new files
  async function handleAddFiles(event) {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    const startIndex = files.length;
    files = [...files, ...newFiles];

    // Process only the new files
    await processSubset(newFiles, startIndex);

    // Reset input
    event.target.value = "";
  }

  // Handle removing a file
  function removeImage(index) {
    // Revoke URL to avoid memory leak
    if (results[index] && results[index].url) {
      URL.revokeObjectURL(results[index].url);
    }

    // Remove from files and results
    files = files.filter((_, i) => i !== index);
    results = results.filter((_, i) => i !== index);

    // Re-calculate indices in results
    results = results.map((r, i) => ({ ...r, index: i }));

    // Update selection
    const newSelection = new Set();
    selectedIndices.forEach((i) => {
      if (i < index) newSelection.add(i);
      else if (i > index) newSelection.add(i - 1);
    });
    selectedIndices = newSelection;

    // If no files left, reset (which might trigger parent to show dropzone if bound, or we just show empty state)
    if (files.length === 0) {
      reset();
    }
  }

  function handleSettingChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      processAll();
    }, 500);
  }

  function rotate(degrees) {
    rotation = (rotation + degrees + 360) % 360;
    handleSettingChange();
  }

  function toggleSelection(index) {
    if (selectedIndices.has(index)) {
      selectedIndices.delete(index);
    } else {
      selectedIndices.add(index);
    }
    selectedIndices = selectedIndices;
  }

  function selectAll() {
    results.forEach((_, i) => selectedIndices.add(i));
    selectedIndices = selectedIndices;
  }

  function deselectAll() {
    selectedIndices.clear();
    selectedIndices = selectedIndices;
  }

  function download(result) {
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
    a.click();
  }

  async function downloadSelected() {
    const selectedResults = results.filter((_, i) => selectedIndices.has(i));
    if (selectedResults.length === 0) return;

    if (selectedResults.length === 1) {
      download(selectedResults[0]);
    } else {
      const zip = new JSZip();

      // Add files to zip
      for (const result of selectedResults) {
        const blob = await fetch(result.url).then((r) => r.blob());
        const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
        zip.file(filename, blob);
      }

      // Generate and save zip
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);

      // Format timestamp: YYYY-MM-DD-HH-mm-ss
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);

      a.download = `ultrahdr-batch-${timestamp}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }

  async function shareSelected() {
    const selectedResults = results.filter((_, i) => selectedIndices.has(i));
    if (selectedResults.length === 0) return;

    try {
      const filesToShare = await Promise.all(
        selectedResults.map(async (res) => {
          const blob = await fetch(res.url).then((r) => r.blob());
          // Use original name but ensure .jpg extension
          const name = res.originalName.replace(/\.[^/.]+$/, "") + ".jpg";
          return new File([blob], name, { type: "image/jpeg" });
        }),
      );

      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare,
          title: "UltraHDR Images",
          text: "Processed with UltraHDR Converter",
        });
      } else {
        alert("Your browser does not support sharing these files.");
      }
    } catch (e) {
      console.error("Error sharing:", e);
      // Ignore AbortError (user cancelled)
      if (e.name !== "AbortError") {
        alert("Share failed: " + e.message);
      }
    }
  }

  function reset() {
    files = [];
    results = [];
    rotation = 0;
    maxContentBoost = 2.3;
    shadowCutoff = 0.05;
    quality = 0.95;
    discardGainMap = false;
    stripExif = false;
    selectedIndices = new Set();
    latestPipelineEvent = null;
    dispatch("reset");
  }

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div class="processor">
  <div class="controls card">
    <h2>Settings</h2>

    <div class="control-group">
      <span class="label">Rotation</span>
      <div class="button-group">
        <button
          on:click={() => rotate(-90)}
          disabled={processing}
          class="icon-btn"
          title="Rotate Left"
        >
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
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          Left
        </button>
        <button
          on:click={() => rotate(90)}
          disabled={processing}
          class="icon-btn"
          title="Rotate Right"
        >
          Right
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
              d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
            />
          </svg>
        </button>
        <span class="value">{rotation}°</span>
      </div>
    </div>

    <div class="control-group">
      <label for="boost">Max Content Boost (HDR Intensity)</label>
      <div class="range-wrapper">
        <input
          type="range"
          id="boost"
          min="1.0"
          max="4.0"
          step="0.1"
          bind:value={maxContentBoost}
          on:input={handleSettingChange}
          disabled={processing}
        />
        <span class="value">{maxContentBoost.toFixed(1)}x</span>
      </div>
      <p class="help-text">
        Higher values create brighter highlights when generating a new gain map.
        Existing input gain maps are preserved as-is unless
        &ldquo;Discard existing gain map(s)&rdquo; is enabled.
      </p>
    </div>

    <div class="control-group">
      <label for="shadowCutoff">
        Minimum Brightness Threshold for Enhancement: {Math.round(
          shadowCutoff * 100,
        )}%
      </label>
      <div class="range-wrapper">
        <input
          type="range"
          id="shadowCutoff"
          min="0.0"
          max="1.0"
          step="0.01"
          bind:value={shadowCutoff}
          on:input={handleSettingChange}
          disabled={processing}
        />
        <span class="value">{Math.round(shadowCutoff * 100)}%</span>
      </div>
      <p class="help-text">
        Brightness values below this threshold are not enhanced.
      </p>
    </div>

    <div class="control-group horizontal">
      <label for="quality">JPEG Quality</label>
      <div class="select-wrapper">
        <select
          id="quality"
          bind:value={quality}
          on:change={handleSettingChange}
          disabled={processing}
        >
          <option value={0.95}>High</option>
          <option value={0.75}>Medium</option>
          <option value={0.5}>Low</option>
        </select>
      </div>
    </div>

    <div class="control-group switch-group">
      <label class="switch">
        <input
          type="checkbox"
          bind:checked={discardGainMap}
          on:change={handleSettingChange}
          disabled={processing}
        />
        <span class="slider"></span>
      </label>
      <span class="switch-label">Discard existing gain map(s)</span>
    </div>

    <div class="control-group switch-group">
      <label class="switch">
        <input
          type="checkbox"
          bind:checked={stripExif}
          on:change={handleSettingChange}
          disabled={processing}
        />
        <span class="slider"></span>
      </label>
      <span class="switch-label">Strip EXIF data</span>
    </div>

    <div class="actions">
      <input
        type="file"
        id="add-files"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,.heic,.heif,.tif,.tiff"
        style="display: none;"
        on:change={handleAddFiles}
        disabled={processing}
      />
      <button
        class="secondary"
        on:click={() => document.getElementById("add-files").click()}
        disabled={processing}
      >
        Add Images
      </button>
      <button on:click={reset} disabled={processing} class="secondary">
        Start Over
      </button>
    </div>

    {#if latestPipelineEvent}
      <div
        class="pipeline-status"
        data-testid="pipeline-status"
        data-phase={latestPipelineEvent.phase}
        data-stage={latestPipelineEvent.stage || ""}
        data-elapsed-ms={Math.round(latestPipelineEvent.elapsedMs || 0)}
      >
        <p class="help-text">
          {latestPipelineEvent.phase} • {latestPipelineEvent.stage || "pipeline"} • {formatMs(latestPipelineEvent.elapsedMs)}
        </p>
        {#if latestPipelineEvent.phase === "pipeline-complete"}
          <p class="help-text">
            Slowest stage: {getSlowestStage(latestPipelineEvent.stageDurationsMs) || "n/a"}
          </p>
        {/if}
      </div>
    {/if}
  </div>

  {#if error}
    <div class="error card">
      <h3>Error</h3>
      <p>{error}</p>
    </div>
  {/if}

  <div class="results-container" class:loading={processing}>
    {#if processing && results.length === 0}
      <div class="loading-overlay">
        <div class="spinner"></div>
        <p>
          Processing...
          {#if latestPipelineEvent}
            ({latestPipelineEvent.stage || "pipeline"}, {formatMs(latestPipelineEvent.elapsedMs)})
          {/if}
        </p>
      </div>
    {/if}

    {#if results.length > 0}
      <div class="results">
        <div class="results-header">
          <h3>Preview</h3>
          <div class="selection-controls">
            <button class="text-btn" on:click={selectAll}>Select All</button>
            <button class="text-btn" on:click={deselectAll}>Deselect All</button
            >
            <button
              class="primary small"
              on:click={downloadSelected}
              disabled={selectedIndices.size === 0}
            >
              {selectedIndices.size > 1 ? "Download Zip" : "Download"} ({selectedIndices.size})
            </button>
            {#if typeof navigator !== "undefined" && navigator.canShare}
              <button
                class="primary small share-btn"
                on:click={shareSelected}
                disabled={selectedIndices.size === 0}
                title="Share to other apps"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z"
                  />
                </svg>
                Share ({selectedIndices.size})
              </button>
            {/if}
          </div>
        </div>
        <div class="grid">
          {#each results as result, i}
            <div
              class="result-card card"
              class:selected={selectedIndices.has(i)}
              on:click={() => toggleSelection(i)}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === "Enter" && toggleSelection(i)}
            >
              <div class="selection-indicator">
                {#if selectedIndices.has(i)}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clip-rule="evenodd"
                    />
                  </svg>
                {:else}
                  <div class="circle"></div>
                {/if}
              </div>
              <button
                class="remove-btn"
                on:click|stopPropagation={() => removeImage(i)}
                title="Remove image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <div class="preview">
                <img src={result.url} alt="Processed result" />
              </div>
              <div class="info">
                <p class="filename">{result.originalName}</p>
                <p class="size">{(result.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .processor {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .control-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .control-group.horizontal {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .control-group.horizontal label {
    margin-bottom: 0;
    min-width: max-content;
  }

  .control-group.horizontal .select-wrapper {
    flex-grow: 0;
    width: auto;
  }

  .switch-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .switch-label {
    cursor: pointer;
  }

  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
    flex-shrink: 0;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--text-secondary);
    transition: 0.4s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 24px;
    width: 24px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--primary-color);
  }

  input:focus + .slider {
    box-shadow: 0 0 1px var(--primary-color);
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }

  label,
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .range-wrapper,
  .select-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  input[type="range"] {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--text-secondary);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  select {
    flex: 1;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--text-secondary);
    background-color: var(--surface-color);
    color: var(--text-color);
    font-size: 1rem;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
  }

  .value {
    font-family: monospace;
    font-size: 1.1rem;
    min-width: 3ch;
  }

  .help-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: transparent;
    border: 1px solid var(--text-secondary);
    color: var(--text-color);
    border-radius: 8px;
    cursor: pointer;
  }

  .icon-btn svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  .icon-btn:hover {
    border-color: var(--text-color);
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .pipeline-status {
    margin-top: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--text-secondary);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
  }

  .pipeline-status .help-text {
    margin: 0.2rem 0;
  }

  button.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
  }

  button.primary.small {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  button.primary:hover {
    background-color: #0071e3;
  }

  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  button.secondary {
    background-color: transparent;
    border: 1px solid var(--text-secondary);
    color: var(--text-color);
  }

  button.secondary:hover {
    border-color: var(--text-color);
  }

  button.text-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  button.text-btn:hover {
    text-decoration: underline;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results-container {
    position: relative;
    min-height: 200px;
    margin-top: 2rem;
  }

  .results-container.loading .results {
    opacity: 0.5;
    pointer-events: none;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .selection-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .result-card {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .result-card:hover {
    transform: translateY(-2px);
  }

  .result-card.selected {
    border-color: var(--primary-color);
    background-color: rgba(10, 132, 255, 0.1);
  }

  .selection-indicator {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 2;
    color: var(--primary-color);
  }

  .remove-btn {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 2;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 0;
    cursor: pointer;
    transition: background 0.2s;
  }

  .remove-btn:hover {
    background: rgba(255, 69, 58, 0.9);
  }

  .selection-indicator svg {
    width: 24px;
    height: 24px;
    background: var(--surface-color);
    border-radius: 50%;
  }

  .circle {
    width: 20px;
    height: 20px;
    border: 2px solid var(--text-secondary);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
  }

  .preview img {
    width: 100%;
    height: auto;
    border-radius: 6px;
    display: block;
  }

  .info {
    text-align: left;
    padding: 0 0.5rem;
  }

  .filename {
    font-weight: 500;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem;
  }

  .size {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .error {
    border-left: 4px solid #ff453a;
    color: #ff453a;
  }

  @media (max-width: 640px) {
    .button-group {
      flex-wrap: wrap;
    }

    .actions {
      flex-wrap: wrap;
    }

    .selection-controls {
      justify-content: flex-start;
    }
  }
</style>
