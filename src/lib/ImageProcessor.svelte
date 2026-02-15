<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { getCapabilities, getProcessingProfile } from "./capabilities.js";
  import { processImage } from "./processing";
  import JSZip from "jszip";
  import {
    buildShareFiles,
    getSelectedResults,
    releaseResultUrls,
  } from "./result-management.js";

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
  let notice = null;
  let noticeTimer = null;
  let debounceTimer;
  let selectedIndices = new Set();
  let latestPipelineEvent = null;
  let activeAbortController = null;
  let processingRunId = 0;
  let activeTab = "convert";
  let isAdvancedOpen = false;
  let isDesktopLayout = false;
  let pipelineOverallProgress = 0;
  let pipelineCurrentFileProgress = 0;
  let pipelineStageProgress = 0;
  let pipelineStatusLabel = "Waiting to start";
  let pipelineStatusNote = "";
  let pipelineFileLabel = "";
  let pipelineFileName = "";
  let activeProgressFileIndex = null;

  const capabilities = getCapabilities();
  const processingProfile = getProcessingProfile(capabilities);
  const safeModeEnabled = processingProfile.safeModeDefault;

  const dispatch = createEventDispatcher();
  const PROGRESS_STAGE_ORDER = [
    "wasm-load",
    "preprocess-file",
    "read-source-buffer",
    "detect-ultrahdr",
    "read-input-data-url",
    "extract-exif",
    "decode-image-data",
    "safe-mode-resize-sdr",
    "safe-mode-resize-gain-map",
    "generate-gain-map",
    "compress-components",
    "encode-init",
    "rotate-sdr-image",
    "rotate-gain-map-image",
    "encode-sdr-to-jpeg",
    "encode-gain-map-to-jpeg",
    "encode-set-base-image",
    "encode-set-gain-map-image",
    "encode-ultrahdr",
    "finalize-preserved",
    "rotate-preserved-ultrahdr",
    "finalize-output",
  ];
  const PROGRESS_STAGE_LABELS = {
    "wasm-load": "Loading encoder",
    "preprocess-file": "Preparing input",
    "read-source-buffer": "Reading source data",
    "detect-ultrahdr": "Checking for existing gain map",
    "read-input-data-url": "Reading image",
    "extract-exif": "Extracting metadata",
    "decode-image-data": "Decoding pixels",
    "safe-mode-resize-sdr": "Resizing SDR image",
    "safe-mode-resize-gain-map": "Resizing gain map source",
    "generate-gain-map": "Generating gain map",
    "compress-components": "Compressing components",
    "encode-init": "Initializing encoder",
    "rotate-sdr-image": "Rotating SDR image",
    "rotate-gain-map-image": "Rotating gain map image",
    "encode-sdr-to-jpeg": "Encoding SDR JPEG",
    "encode-gain-map-to-jpeg": "Encoding gain map JPEG",
    "encode-set-base-image": "Preparing base image",
    "encode-set-gain-map-image": "Preparing gain map image",
    "encode-ultrahdr": "Encoding UltraHDR output",
    "finalize-preserved": "Finalizing preserved output",
    "rotate-preserved-ultrahdr": "Rotating preserved UltraHDR",
    "finalize-output": "Finalizing output",
  };

  $: showConvertPanel = isDesktopLayout || activeTab === "convert";
  $: showResultsPanel = isDesktopLayout || activeTab === "results";
  $: showSettingsPanel = isDesktopLayout || activeTab === "settings";

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

  function clampPercent(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    return Math.max(0, Math.min(100, numeric));
  }

  function getStageLabel(stage, phase) {
    if (phase === "pipeline-complete") return "Complete";
    if (phase === "pipeline-error") return "Processing failed";
    if (phase === "pipeline-start") return "Starting pipeline";
    if (!stage) return "Processing";
    return PROGRESS_STAGE_LABELS[stage] || stage;
  }

  function estimatePipelineProgress(event, previousProgress = 0) {
    if (!event) {
      return previousProgress;
    }

    if (event.phase === "pipeline-start") {
      return 0;
    }

    if (event.phase === "pipeline-complete") {
      return 100;
    }

    const stage = event.stage;
    const stageIndex = PROGRESS_STAGE_ORDER.indexOf(stage);
    if (stageIndex < 0) {
      return previousProgress;
    }

    const segmentSize = 100 / PROGRESS_STAGE_ORDER.length;
    const segmentStart = stageIndex * segmentSize;
    const segmentEnd = segmentStart + segmentSize;

    let stageProgress = previousProgress;
    if (event.phase === "stage-progress") {
      stageProgress =
        segmentStart + ((segmentEnd - segmentStart) * clampPercent(event.stageProgress)) / 100;
    } else if (event.phase === "stage-complete") {
      stageProgress = segmentEnd;
    } else if (event.phase === "stage-start") {
      stageProgress = segmentStart + segmentSize * 0.08;
    } else if (event.phase === "stage-error" || event.phase === "pipeline-error") {
      stageProgress = Math.max(previousProgress, segmentStart);
    }

    return Math.max(previousProgress, Math.min(100, stageProgress));
  }

  function toBatchProgress(perFileProgress, fileIndex, totalFiles) {
    const safeProgress = clampPercent(perFileProgress);
    const safeIndex = Number(fileIndex);
    const safeTotal = Number(totalFiles);
    if (!Number.isFinite(safeIndex) || !Number.isFinite(safeTotal) || safeTotal <= 0) {
      return safeProgress;
    }
    const clampedIndex = Math.max(0, Math.min(safeTotal - 1, safeIndex));
    return ((clampedIndex + safeProgress / 100) / safeTotal) * 100;
  }

  function resetProgressUi() {
    pipelineOverallProgress = 0;
    pipelineCurrentFileProgress = 0;
    pipelineStageProgress = 0;
    pipelineStatusLabel = "Waiting to start";
    pipelineStatusNote = "";
    pipelineFileLabel = "";
    pipelineFileName = "";
    activeProgressFileIndex = null;
  }

  function updateProgressUi(event) {
    latestPipelineEvent = event;

    const fileIndex = Number(event?.fileIndex);
    const totalFiles = Number(event?.totalFiles);
    if (Number.isFinite(fileIndex) && fileIndex !== activeProgressFileIndex) {
      activeProgressFileIndex = fileIndex;
      pipelineCurrentFileProgress = 0;
    }

    pipelineCurrentFileProgress = estimatePipelineProgress(event, pipelineCurrentFileProgress);
    pipelineOverallProgress = toBatchProgress(pipelineCurrentFileProgress, fileIndex, totalFiles);

    if (event?.phase === "stage-progress") {
      pipelineStageProgress = clampPercent(event.stageProgress);
    } else if (event?.phase === "stage-complete" || event?.phase === "pipeline-complete") {
      pipelineStageProgress = 100;
    } else if (event?.phase === "stage-start") {
      pipelineStageProgress = 0;
    }

    pipelineStatusLabel = getStageLabel(event?.stage, event?.phase);
    pipelineStatusNote =
      event?.note ||
      (event?.phase === "stage-progress"
        ? `${Math.round(pipelineStageProgress)}% of this stage complete`
        : "");
    const eventFileName = String(event?.fileName || "").trim();
    if (eventFileName) {
      pipelineFileName = eventFileName;
    } else if (Number.isFinite(fileIndex) && files[fileIndex]?.name) {
      pipelineFileName = files[fileIndex].name;
    }

    pipelineFileLabel =
      Number.isFinite(fileIndex) && Number.isFinite(totalFiles) && totalFiles > 0
        ? `File ${fileIndex + 1} of ${totalFiles}`
        : "";
  }

  function setNotice(message) {
    clearTimeout(noticeTimer);
    notice = message;
    if (message) {
      noticeTimer = setTimeout(() => {
        notice = null;
      }, 4000);
    }
  }

  function abortActiveProcessing() {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
  }

  function setActiveTab(tab) {
    activeTab = tab;
  }

  // Process a specific list of files and append results
  async function processSubset(subset, startIndex) {
    if (!subset || subset.length === 0) {
      processing = false;
      latestPipelineEvent = null;
      resetProgressUi();
      return;
    }

    const runId = ++processingRunId;
    abortActiveProcessing();
    const controller = new AbortController();
    activeAbortController = controller;

    processing = true;
    error = null;
    latestPipelineEvent = null;
    resetProgressUi();

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
          safeMode: safeModeEnabled,
          maxOutputMegapixels: processingProfile.maxInputMegapixels,
          gainMapScale: processingProfile.gainMapScale,
          abortSignal: controller.signal,
          fileIndex: i,
          totalFiles: subset.length,
          onProgress: (event) => {
            updateProgressUi(event);
          },
        });

        if (controller.signal.aborted || runId !== processingRunId) {
          return;
        }

        const url = URL.createObjectURL(blob);

        results = [
          ...results,
          {
            originalName: file.name,
            blob,
            url,
            size: blob.size,
            index: globalIndex,
          },
        ];
        selectedIndices.add(globalIndex);
        selectedIndices = selectedIndices;
      }
    } catch (e) {
      if (e?.name === "AbortError") {
        return;
      }
      console.error("[UI] Error processing files:", e);
      error = e.message;
    } finally {
      if (activeAbortController === controller) {
        activeAbortController = null;
      }
      if (runId === processingRunId) {
        processing = false;
      }
    }
  }

  async function processAll() {
    abortActiveProcessing();
    releaseResultUrls(results);
    results = [];
    selectedIndices = new Set();
    await processSubset(files, 0);
  }

  onMount(() => {
    let mediaQuery = null;
    let handleMediaChange = null;

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      mediaQuery = window.matchMedia("(min-width: 1024px)");
      handleMediaChange = (event) => {
        isDesktopLayout = event.matches;
      };
      isDesktopLayout = mediaQuery.matches;

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleMediaChange);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleMediaChange);
      }
    }

    processAll();

    return () => {
      processingRunId += 1;
      abortActiveProcessing();
      clearTimeout(debounceTimer);
      clearTimeout(noticeTimer);
      releaseResultUrls(results);

      if (mediaQuery && handleMediaChange) {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", handleMediaChange);
        } else if (typeof mediaQuery.removeListener === "function") {
          mediaQuery.removeListener(handleMediaChange);
        }
      }
    };
  });

  async function handleAddFiles(event) {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length === 0) return;

    const startIndex = files.length;
    files = [...files, ...newFiles];

    await processSubset(newFiles, startIndex);

    event.target.value = "";
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
    const selectedResults = getSelectedResults(results, selectedIndices);
    if (selectedResults.length === 0) return;

    if (selectedResults.length === 1) {
      download(selectedResults[0]);
    } else {
      const zip = new JSZip();

      for (const result of selectedResults) {
        const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
        zip.file(filename, result.blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);

      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);

      a.download = `ultrahdr-batch-${timestamp}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 0);
    }
  }

  async function shareSelected() {
    const selectedResults = getSelectedResults(results, selectedIndices);
    if (selectedResults.length === 0) return;

    try {
      const filesToShare = await buildShareFiles(results, selectedIndices);

      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        await navigator.share({
          files: filesToShare,
          title: "UltraHDR Images",
          text: "Processed with UltraHDR Converter",
        });
        return;
      }

      if (navigator.canShare && selectedResults.length > 1) {
        const zip = new JSZip();
        for (const result of selectedResults) {
          const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
          zip.file(filename, result.blob);
        }

        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipFile = new File([zipBlob], `ultrahdr-batch-${timestamp}.zip`, {
          type: "application/zip",
        });

        if (navigator.canShare({ files: [zipFile] })) {
          await navigator.share({
            files: [zipFile],
            title: "UltraHDR Images",
            text: "Processed with UltraHDR Converter",
          });
          return;
        }
      }

      await downloadSelected();
      setNotice("Direct sharing is unavailable. Download started instead.");
    } catch (e) {
      console.error("Error sharing:", e);
      if (e.name === "AbortError") {
        return;
      }
      await downloadSelected();
      setNotice(`Share failed. Download started instead (${e.message}).`);
    }
  }

  function clearResultsState() {
    releaseResultUrls(results);
    results = [];
    selectedIndices = new Set();
    latestPipelineEvent = null;
    resetProgressUi();
  }

  function reset() {
    processingRunId += 1;
    abortActiveProcessing();
    clearResultsState();
    files = [];
    rotation = 0;
    maxContentBoost = 2.3;
    shadowCutoff = 0.05;
    quality = 0.95;
    discardGainMap = false;
    stripExif = false;
    notice = null;
    activeTab = "convert";
    isAdvancedOpen = false;
    dispatch("reset");
  }

  function removeImage(index) {
    const [removed] = results.filter((_, i) => i === index);
    if (removed?.url) {
      URL.revokeObjectURL(removed.url);
    }

    files = files.filter((_, i) => i !== index);
    results = results.filter((_, i) => i !== index);

    results = results.map((r, i) => ({ ...r, index: i }));

    const newSelection = new Set();
    selectedIndices.forEach((i) => {
      if (i < index) newSelection.add(i);
      else if (i > index) newSelection.add(i - 1);
    });
    selectedIndices = newSelection;

    if (files.length === 0) {
      reset();
    }
  }
</script>

<div class="processor" class:desktop={isDesktopLayout}>
  {#if !isDesktopLayout}
    <div
      class="mobile-tab-bar"
      data-testid="mobile-tab-bar"
      aria-label="Editor tabs"
      role="tablist"
    >
      <button
        type="button"
        class="tab-btn"
        data-testid="tab-convert"
        role="tab"
        aria-selected={activeTab === "convert"}
        aria-controls="panel-convert"
        on:click={() => setActiveTab("convert")}
      >
        Convert
      </button>
      <button
        type="button"
        class="tab-btn"
        data-testid="tab-results"
        role="tab"
        aria-selected={activeTab === "results"}
        aria-controls="panel-results"
        on:click={() => setActiveTab("results")}
      >
        Results <span class="tab-badge">{results.length}</span>
      </button>
      <button
        type="button"
        class="tab-btn"
        data-testid="tab-settings"
        role="tab"
        aria-selected={activeTab === "settings"}
        aria-controls="panel-settings"
        on:click={() => setActiveTab("settings")}
      >
        Settings
      </button>
    </div>
  {/if}

  <div
    class="processor-layout"
    class:desktop-two-pane={isDesktopLayout}
    data-testid={isDesktopLayout ? "desktop-two-pane" : undefined}
  >
    <section class="controls-column">
      {#if showConvertPanel}
        <div class="controls card panel convert-panel" id="panel-convert">
          <h2>Convert</h2>
          <p class="panel-intro">Quick adjustments for day-to-day processing.</p>

          <div class="control-group" data-testid="quick-controls">
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
            {#if !isDesktopLayout}
              <button
                class="secondary"
                on:click={() => setActiveTab("settings")}
                disabled={processing}
              >
                Open Settings
              </button>
            {/if}
          </div>

          <p class="help-text">
            Existing input gain maps are preserved as-is unless
            &ldquo;Discard existing gain map(s)&rdquo; is enabled.
          </p>

          {#if notice}
            <p class="help-text notice" data-testid="notice-message">{notice}</p>
          {/if}
        </div>
      {/if}

      {#if showSettingsPanel}
        <div class="controls card panel settings-panel" id="panel-settings">
          <div class="settings-header">
            <h2>Settings</h2>
            {#if !isDesktopLayout}
              <button
                class="text-btn"
                type="button"
                on:click={() => (isAdvancedOpen = !isAdvancedOpen)}
              >
                {isAdvancedOpen ? "Hide Advanced Settings" : "Show Advanced Settings"}
              </button>
            {/if}
          </div>

          {#if processing || latestPipelineEvent}
            <div
              class="pipeline-status"
              data-testid="pipeline-status"
              data-phase={latestPipelineEvent?.phase || ""}
              data-stage={latestPipelineEvent?.stage || ""}
              data-elapsed-ms={Math.round(latestPipelineEvent?.elapsedMs || 0)}
            >
              <div class="pipeline-header-row">
                <p class="pipeline-title">{pipelineStatusLabel}</p>
                <p class="pipeline-percent">{Math.round(pipelineOverallProgress)}%</p>
              </div>

              {#if pipelineFileLabel}
                <p class="help-text pipeline-file-label">{pipelineFileLabel}</p>
              {/if}

              {#if pipelineFileName}
                <p class="help-text pipeline-file-name" data-testid="pipeline-file-name">
                  Processing: {pipelineFileName}
                </p>
              {/if}

              <div
                class="progress-track"
                data-testid="pipeline-progress"
                role="progressbar"
                aria-label="Encoding progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(pipelineOverallProgress)}
              >
                <span
                  class="progress-fill"
                  style={`width: ${Math.round(pipelineOverallProgress)}%`}
                ></span>
              </div>

              <div class="pipeline-meta-row">
                <p class="help-text">
                  Stage {Math.round(pipelineStageProgress)}% • {latestPipelineEvent?.stage || "pipeline"}
                </p>
                <p class="help-text">{formatMs(latestPipelineEvent?.elapsedMs)}</p>
              </div>

              {#if pipelineStatusNote}
                <p class="help-text">{pipelineStatusNote}</p>
              {/if}

              {#if latestPipelineEvent?.phase === "pipeline-complete"}
                <p class="help-text">
                  Slowest stage: {getSlowestStage(latestPipelineEvent.stageDurationsMs) || "n/a"}
                </p>
              {/if}
            </div>
          {/if}

          {#if isDesktopLayout || isAdvancedOpen}
            <div data-testid="advanced-settings">
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

            </div>
          {:else}
            <p class="help-text collapsed-note">
              Advanced controls are hidden. Tap to reveal rotation, threshold, and metadata options.
            </p>
          {/if}
        </div>
      {/if}
    </section>

    <section class="results-column">
      {#if error}
        <div class="error card">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      {/if}

      {#if showResultsPanel}
        <div class="results-container" class:loading={processing} id="panel-results">
          {#if processing && results.length === 0}
            <div class="loading-overlay">
              <div class="spinner"></div>
              <p>
                Processing... {Math.round(pipelineOverallProgress)}%
                {#if latestPipelineEvent}
                  ({pipelineStatusLabel}, {Math.round(pipelineStageProgress)}% stage, {formatMs(latestPipelineEvent.elapsedMs)})
                {/if}
              </p>
            </div>
          {/if}

          {#if results.length > 0}
            <div class="results">
              <div class="results-header">
                <h3>Results</h3>
                <div class="selection-controls">
                  <button class="text-btn" on:click={selectAll}>Select All</button>
                  <button class="text-btn" on:click={deselectAll}>Deselect All</button>
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

              <div class="grid" data-testid="results-grid">
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
          {:else if !processing}
            <div class="results-placeholder card">
              <p>No results yet. Process an image from the Convert tab.</p>
            </div>
          {/if}
        </div>
      {:else if !isDesktopLayout}
        <div class="results-placeholder card">
          <p>Open the Results tab to review and export processed images.</p>
        </div>
      {/if}
    </section>
  </div>

  {#if !isDesktopLayout && activeTab === "results" && results.length > 0}
    <div class="mobile-action-bar" data-testid="mobile-action-bar">
      <button
        class="primary"
        on:click={downloadSelected}
        disabled={selectedIndices.size === 0}
      >
        {selectedIndices.size > 1 ? "Download Zip" : "Download"} ({selectedIndices.size})
      </button>

      {#if typeof navigator !== "undefined" && navigator.canShare}
        <button
          class="secondary share-btn"
          on:click={shareSelected}
          disabled={selectedIndices.size === 0}
          title="Share to other apps"
        >
          Share ({selectedIndices.size})
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .processor {
    width: 100%;
    margin: 0 auto;
    display: grid;
    gap: 1rem;
  }

  .mobile-tab-bar {
    position: sticky;
    top: 0.5rem;
    z-index: 15;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    padding: 0.4rem;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-raised) 92%, transparent);
    backdrop-filter: blur(14px);
    border-radius: var(--radius-lg);
  }

  .tab-btn {
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    min-height: 44px;
    border-radius: 0.8rem;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }

  .tab-btn[aria-selected="true"] {
    background: var(--surface-interactive);
    border-color: var(--primary-color);
    color: var(--text-color);
  }

  .tab-badge {
    min-width: 1.5rem;
    height: 1.5rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--primary-color) 26%, transparent);
    color: var(--text-color);
    font-size: 0.76rem;
    font-weight: 700;
    padding: 0 0.2rem;
  }

  .processor-layout {
    display: grid;
    gap: 1rem;
  }

  .controls-column,
  .results-column {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .panel {
    display: grid;
    gap: 1rem;
  }

  .panel-intro {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .controls h2,
  .results h3,
  .error h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .control-group {
    text-align: left;
    display: grid;
    gap: 0.5rem;
  }

  .control-group.horizontal {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .control-group.horizontal label {
    margin-bottom: 0;
    min-width: max-content;
  }

  .switch-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.15rem;
  }

  .switch-label {
    cursor: pointer;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
    flex-shrink: 0;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--text-muted);
    transition: 0.2s;
    border-radius: 34px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 24px;
    width: 24px;
    left: 2px;
    bottom: 2px;
    background-color: #ffffff;
    transition: 0.2s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--primary-color);
  }

  input:focus + .slider {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 45%, transparent);
  }

  input:checked + .slider:before {
    transform: translateX(22px);
  }

  label,
  .label {
    display: block;
    margin-bottom: 0.2rem;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .range-wrapper,
  .select-wrapper,
  .button-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .button-group {
    flex-wrap: wrap;
  }

  input[type="range"] {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--text-muted) 45%, transparent);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  select {
    flex: 1;
    min-height: 44px;
    padding: 0.65rem 0.8rem;
    border-radius: 10px;
    border: 1px solid var(--border-subtle);
    background-color: var(--surface-raised);
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

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: var(--primary-color);
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }

  .value {
    font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Liberation Mono", monospace;
    font-size: 0.95rem;
    min-width: 3ch;
  }

  .help-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .collapsed-note {
    margin-top: 0.2rem;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 44px;
    padding: 0.55rem 0.9rem;
    background-color: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-color);
    border-radius: 10px;
    cursor: pointer;
  }

  .icon-btn svg {
    width: 1.1rem;
    height: 1.1rem;
  }

  .icon-btn:hover {
    border-color: var(--primary-color);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-start;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .pipeline-status {
    margin-top: 0.35rem;
    padding: 0.75rem;
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: var(--surface-muted);
    display: grid;
    gap: 0.45rem;
  }

  .pipeline-status .help-text {
    margin: 0;
  }

  .pipeline-header-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.6rem;
  }

  .pipeline-title {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text-color);
  }

  .pipeline-percent {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .pipeline-file-label {
    color: var(--text-muted);
  }

  .pipeline-file-name {
    color: var(--text-color);
    font-weight: 600;
    word-break: break-word;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text-muted) 35%, transparent);
    overflow: hidden;
  }

  .progress-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, #ffffff));
    transition: width 0.2s ease;
  }

  .pipeline-meta-row {
    display: flex;
    justify-content: space-between;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  button.primary {
    background-color: var(--primary-color);
    color: var(--text-on-primary);
    border: 1px solid transparent;
    min-height: 44px;
    padding: 0.65rem 1rem;
    font-size: 0.95rem;
    font-weight: 700;
  }

  button.primary.small {
    min-height: 40px;
    padding: 0.45rem 0.85rem;
    font-size: 0.86rem;
    font-weight: 600;
  }

  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    white-space: nowrap;
  }

  button.secondary {
    background-color: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-color);
    min-height: 44px;
    padding: 0.55rem 0.9rem;
    font-size: 0.92rem;
    font-weight: 600;
  }

  button.secondary:hover {
    border-color: var(--primary-color);
  }

  button.text-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    min-height: 44px;
    padding: 0.2rem 0.35rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  button.text-btn:hover {
    text-decoration: underline;
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .results-container {
    position: relative;
    min-height: 220px;
  }

  .results-container.loading .results {
    opacity: 0.55;
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
    text-align: center;
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid color-mix(in srgb, var(--text-muted) 35%, transparent);
    border-left-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
    margin-bottom: 0.9rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .results {
    display: grid;
    gap: 0.85rem;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .selection-controls {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .result-card {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .result-card:hover {
    transform: translateY(-1px);
  }

  .result-card.selected {
    border-color: var(--primary-color);
    background-color: var(--surface-interactive);
  }

  .selection-indicator {
    position: absolute;
    top: 0.7rem;
    right: 0.7rem;
    z-index: 2;
    color: var(--primary-color);
  }

  .remove-btn {
    position: absolute;
    top: 0.7rem;
    left: 0.7rem;
    z-index: 2;
    background: rgba(0, 0, 0, 0.45);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    padding: 0;
    cursor: pointer;
    transition: background 0.2s;
    min-height: 28px;
  }

  .remove-btn:hover {
    background: rgba(255, 69, 58, 0.9);
  }

  .selection-indicator svg {
    width: 24px;
    height: 24px;
    background: color-mix(in srgb, var(--surface-raised) 80%, transparent);
    border-radius: 50%;
  }

  .circle {
    width: 20px;
    height: 20px;
    border: 2px solid var(--text-muted);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
  }

  .preview img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    display: block;
  }

  .info {
    text-align: left;
    padding: 0 0.2rem;
  }

  .filename {
    font-weight: 600;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem;
  }

  .size {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0;
  }

  .error {
    border-left: 4px solid #dc3d33;
    color: #dc3d33;
  }

  .results-placeholder {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.92rem;
  }

  .results-placeholder p {
    margin: 0;
  }

  .mobile-action-bar {
    position: sticky;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);
    z-index: 14;
    display: flex;
    gap: 0.6rem;
    padding: 0.7rem;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-raised) 94%, transparent);
    backdrop-filter: blur(12px);
    border-radius: var(--radius-lg);
  }

  .mobile-action-bar button {
    flex: 1;
  }

  :global(button:focus-visible),
  :global(input:focus-visible),
  :global(select:focus-visible),
  :global([tabindex]:focus-visible) {
    outline: 2px solid color-mix(in srgb, var(--primary-color) 55%, transparent);
    outline-offset: 2px;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .processor {
      gap: 1.2rem;
    }

    .desktop-two-pane {
      grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
      align-items: start;
      gap: 1rem;
    }

    .controls-column {
      position: sticky;
      top: 1rem;
      max-height: calc(100vh - 2rem);
      overflow: auto;
      padding-right: 0.2rem;
    }

    .mobile-action-bar {
      display: none;
    }

    .results-column {
      min-height: 50vh;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .result-card,
    .tab-btn,
    .icon-btn,
    .spinner,
    .progress-fill {
      transition: none;
      animation: none;
    }
  }
</style>
