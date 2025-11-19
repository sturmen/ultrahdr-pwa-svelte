<script>
  import { onMount } from "svelte";
  import { processImage } from "./processing";

  export let files = [];

  let maxContentBoost = 4.0;
  let rotation = 0;
  let quality = 0.95;
  let processing = false;
  let results = [];
  let error = null;
  let debounceTimer;
  let selectedIndices = new Set();

  // Initial process
  onMount(() => {
    processFiles();
  });

  async function processFiles() {
    processing = true;
    results = [];
    error = null;
    selectedIndices = new Set(); // Reset selection on re-process? Or keep? Let's reset for simplicity as results are regenerated.

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await processImage(file, {
          maxContentBoost,
          rotation,
          quality,
        });
        const url = URL.createObjectURL(blob);
        results = [
          ...results,
          {
            originalName: file.name,
            url,
            size: blob.size,
            index: i,
          },
        ];
        selectedIndices.add(i); // Auto-select new results
      }
      selectedIndices = selectedIndices; // Trigger reactivity
      selectedIndices = selectedIndices; // Trigger reactivity
    } catch (e) {
      console.error("[UI] Error processing files:", e);
      error = e.message;
    } finally {
      processing = false;
    }
  }

  function handleSettingChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      processFiles();
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

  function downloadSelected() {
    results.forEach((result, i) => {
      if (selectedIndices.has(i)) {
        download(result);
      }
    });
  }

  function reset() {
    files = [];
    results = [];
    rotation = 0;
    maxContentBoost = 4.0;
    quality = 0.95;
    selectedIndices = new Set();
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
          max="10.0"
          step="0.1"
          bind:value={maxContentBoost}
          on:input={handleSettingChange}
          disabled={processing}
        />
        <span class="value">{maxContentBoost.toFixed(1)}x</span>
      </div>
      <p class="help-text">Higher values create brighter highlights.</p>
    </div>

    <div class="control-group">
      <label for="quality">JPEG Quality</label>
      <div class="range-wrapper">
        <input
          type="range"
          id="quality"
          min="0.1"
          max="1.0"
          step="0.05"
          bind:value={quality}
          on:input={handleSettingChange}
          disabled={processing}
        />
        <span class="value">{Math.round(quality * 100)}%</span>
      </div>
    </div>

    <div class="actions">
      <button on:click={reset} disabled={processing} class="secondary">
        Start Over
      </button>
    </div>
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
        <p>Processing...</p>
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
              Download Selected ({selectedIndices.size})
            </button>
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

  label,
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .range-wrapper {
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
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
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
  }

  .icon-btn svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
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
</style>
