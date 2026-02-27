<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { getCapabilities } from "./capabilities.js";
  import { processImage } from "./processing";
  import JSZip from "jszip";
  import {
    buildShareFiles,
    getSelectedResults,
    releaseResultUrls,
  } from "./result-management.js";
  import {
    clearQueueState,
    loadQueueState,
    storeQueueState,
  } from "./share-store.js";
  import {
    QUEUE_ITEM_STATES,
    WORKFLOW_EVENTS,
    WORKFLOW_STATES,
    transitionWorkflow,
  } from "./workflow-state.js";
  import { clearQueueBadge, setQueueBadge } from "./badge.js";
  import { IMAGE_MAX_LONG_EDGE } from "./constants.js";

  export let files = [];
  export let launchSource = "regular";
  export let launchIntent = { action: null, tab: null };
  export let runtimeExecutionProvider = null;
  export let runtimeGmnetCapability = null;

  let maxContentBoostStops = 2.3;
  let rotation = 0;
  let quality = 0.95;
  let discardGainMap = false;
  let stripExif = false;
  let keepScreenAwake = true;
  let backendPreference = "auto";
  let useJpegli = false;

  let processing = false;
  let results = [];
  let queue = [];
  let nextQueueId = 0;
  let workflowState = WORKFLOW_STATES.EMPTY;
  let settingsVersion = 1;
  let staleCount = 0;
  let showStalePrompt = false;
  let queueRestoreNotice = null;
  let backgroundProcessingNotice = null;
  let emphasizeShareOut = false;

  let error = null;
  let notice = null;
  let noticeTimer = null;
  let selectedIndices = new Set();
  let latestPipelineEvent = null;
  let activeAbortController = null;
  let processingRunId = 0;
  let queueLoopActive = false;
  let pauseRequested = false;
  let resumeRequestedFromLaunch = false;
  let cancelCurrentRequested = false;
  let currentQueueId = null;
  let wakeLockSentinel = null;
  let launchIntentConsumed = false;
  let lastBadgeCount = null;
  let lastReportedProcessingBusy = null;

  let activeMobileTab = "convert";
  let activeDesktopTab = "all";
  let openSheet = "none";
  let selectionToggleState = "none";
  let queueControlVisibility = "hidden";
  let isDesktopLayout = false;
  let hasRotationStaleResults = false;
  let showPipelineStatusCard = false;
  let showPipelineCompleteSummary = false;
  let pipelineOverallProgress = 0;
  let pipelineCurrentFileProgress = 0;
  let pipelineStageProgress = 0;
  let pipelineStatusLabel = "Waiting to start";
  let pipelineStatusNote = "";
  let pipelineExecutionProvider = null;
  let pipelineFileLabel = "";
  let pipelineFileName = "";
  let activeProgressFileIndex = null;
  let aiModelStatusVisible = false;
  let aiModelStatusMessage = "";
  let aiModelStatusProgress = 0;
  let pipelineGmnetCapability = null;
  let capabilityRestrictionAppliedToCurrentFile = false;
  let currentProcessingPath = "unknown";
  let lastCompletedProcessingPath = "unknown";
  let showWasmRecommendationModal = false;
  let wasmRecommendationShownThisSession = false;
  let backendRestartPending = false;
  let backendRestartAwaitingPathDecision = false;
  let processingPathByQueueId = new Map();

  const capabilities = getCapabilities();
  const dispatch = createEventDispatcher();

  const BACKEND_PREFERENCE_STORAGE_KEY = "ultrahdr:backend-preference:v1";

  const PROGRESS_STAGE_ORDER = [
    "wasm-load",
    "preprocess-file",
    "read-source-buffer",
    "detect-ultrahdr",
    "read-input-data-url",
    "extract-exif",
    "decode-image-data",
    "probe-gmnet-capability",
    "constrain-sdr-image",
    "apply-rotation",
    "prepare-gmnet-input",
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
    "probe-gmnet-capability": "Probing GMNet capability",
    "constrain-sdr-image": "Constraining output dimensions",
    "apply-rotation": "Applying rotation",
    "prepare-gmnet-input": "Preparing GMNet input",
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

  $: showConvertPanel = isDesktopLayout || activeMobileTab === "convert";
  $: showResultsPanel = isDesktopLayout || activeMobileTab === "results";
  $: showSettingsPanel = isDesktopLayout;
  $: staleCount = queue.filter(
    (item) => item.status === QUEUE_ITEM_STATES.STALE,
  ).length;
  $: queuePendingCount = queue.filter(
    (item) =>
      item.status === QUEUE_ITEM_STATES.QUEUED ||
      item.status === QUEUE_ITEM_STATES.PROCESSING,
  ).length;
  $: queueCompletedCount = queue.filter(
    (item) =>
      item.status === QUEUE_ITEM_STATES.COMPLETED ||
      item.status === QUEUE_ITEM_STATES.STALE,
  ).length;
  $: canPauseQueue =
    workflowState === WORKFLOW_STATES.PROCESSING_ACTIVE ||
    workflowState === WORKFLOW_STATES.PROCESSING_PAUSING;
  $: canResumeQueue = workflowState === WORKFLOW_STATES.PROCESSING_PAUSED;
  $: canCancelCurrent = processing && currentQueueId !== null;
  $: queueControlVisibility = canPauseQueue
    ? "pause"
    : canResumeQueue
      ? "resume"
      : "hidden";
  $: selectionToggleState =
    results.length === 0 || selectedIndices.size === 0
      ? "none"
      : selectedIndices.size === results.length
        ? "all"
        : "partial";
  $: hasShareCapability =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function";
  $: hasRotationStaleResults = results.some((result) => {
    if (getQueueItemStatus(result.queueId) !== QUEUE_ITEM_STATES.STALE) {
      return false;
    }
    return Number(result.rotation || 0) !== Number(rotation || 0);
  });
  $: showPipelineCompleteSummary =
    workflowState === WORKFLOW_STATES.PROCESSING_DONE &&
    !processing &&
    queuePendingCount === 0 &&
    queueCompletedCount > 0;
  $: showPipelineStatusCard =
    processing || latestPipelineEvent || showPipelineCompleteSummary;
  $: capabilityOutputMaxLongEdge = Number.isFinite(
    Number(pipelineGmnetCapability?.outputMaxLongEdge),
  )
    ? Math.floor(Number(pipelineGmnetCapability.outputMaxLongEdge))
    : null;
  $: capabilityUiPath =
    processing && currentProcessingPath !== "unknown"
      ? currentProcessingPath
      : !processing
        ? lastCompletedProcessingPath
        : "unknown";
  $: capabilityIsRestrictive = (() => {
    const maxLongEdge = capabilityOutputMaxLongEdge || IMAGE_MAX_LONG_EDGE;
    return backendPreference !== "wasm" && maxLongEdge < IMAGE_MAX_LONG_EDGE;
  })();
  $: showCapabilityRestrictionUi =
    capabilityIsRestrictive && capabilityUiPath === "generated";
  $: {
    const normalizedRuntimeProvider = normalizeExecutionProvider(
      runtimeExecutionProvider,
    );
    if (!pipelineExecutionProvider && normalizedRuntimeProvider) {
      pipelineExecutionProvider = normalizedRuntimeProvider;
    }
  }
  $: {
    const normalizedRuntimeCapability = normalizeGmnetCapability(
      runtimeGmnetCapability,
    );
    if (!pipelineGmnetCapability && normalizedRuntimeCapability) {
      pipelineGmnetCapability = normalizedRuntimeCapability;
    }
  }
  $: if (showStalePrompt && staleCount === 0) {
    showStalePrompt = false;
  }
  $: if (isDesktopLayout && openSheet === "settings") {
    openSheet = "none";
  }
  $: if (!keepScreenAwake) {
    void releaseWakeLock();
  }
  $: if (resumeRequestedFromLaunch && canResumeQueue) {
    resumeRequestedFromLaunch = false;
    resumeQueue();
  }
  $: {
    const isProcessingBusy =
      workflowState === WORKFLOW_STATES.PROCESSING_ACTIVE ||
      workflowState === WORKFLOW_STATES.PROCESSING_PAUSING ||
      currentQueueId !== null;
    if (isProcessingBusy !== lastReportedProcessingBusy) {
      lastReportedProcessingBusy = isProcessingBusy;
      dispatch("processingbusychange", {
        busy: isProcessingBusy,
        workflowState,
      });
    }
  }
  $: {
    const badgeCount = queuePendingCount > 0 ? queuePendingCount : 0;
    if (badgeCount !== lastBadgeCount) {
      lastBadgeCount = badgeCount;
      if (badgeCount > 0) {
        void setQueueBadge(badgeCount);
      } else {
        void clearQueueBadge();
      }
    }
  }

  function formatMs(ms) {
    const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
    if (safeMs < 1000) return `${Math.round(safeMs)} ms`;
    return `${(safeMs / 1000).toFixed(2)} s`;
  }

  function getSlowestStage(stageDurationsMs) {
    if (!stageDurationsMs) return null;
    const entries = Object.entries(stageDurationsMs).sort(
      (a, b) => b[1] - a[1],
    );
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

  function normalizeExecutionProvider(value) {
    if (typeof value !== "string") {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
  }

  function normalizeProcessingPath(value) {
    if (typeof value !== "string") {
      return "unknown";
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "generated" || normalized === "preserved") {
      return normalized;
    }
    return "unknown";
  }

  function normalizeBackendPreference(value) {
    if (typeof value !== "string") {
      return "auto";
    }
    const normalized = value.trim().toLowerCase();
    if (
      normalized === "auto" ||
      normalized === "webgpu" ||
      normalized === "webgl" ||
      normalized === "wasm"
    ) {
      return normalized;
    }
    return "auto";
  }

  function resolveForcedProviderFromPreference(preference = backendPreference) {
    const normalized = normalizeBackendPreference(preference);
    if (normalized === "auto") {
      return null;
    }
    return normalized;
  }

  function loadBackendPreference() {
    const memoryPreference = normalizeBackendPreference(
      globalThis?.__ULTRAHDR_BACKEND_PREFERENCE || "auto",
    );
    let storageValue = null;
    if (
      typeof window === "undefined" ||
      !window.localStorage ||
      typeof window.localStorage.getItem !== "function"
    ) {
      return memoryPreference;
    }
    try {
      storageValue = window.localStorage.getItem(
        BACKEND_PREFERENCE_STORAGE_KEY,
      );
    } catch (_error) {
      storageValue = null;
    }
    if (storageValue === null || storageValue === undefined) {
      return memoryPreference;
    }
    return normalizeBackendPreference(storageValue);
  }

  function persistBackendPreference(value) {
    const normalizedPreference = normalizeBackendPreference(value);
    globalThis.__ULTRAHDR_BACKEND_PREFERENCE = normalizedPreference;
    if (
      typeof window === "undefined" ||
      !window.localStorage ||
      typeof window.localStorage.setItem !== "function"
    ) {
      return;
    }
    try {
      window.localStorage.setItem(
        BACKEND_PREFERENCE_STORAGE_KEY,
        normalizedPreference,
      );
    } catch (_error) {
      // Best-effort persistence only.
    }
  }

  function normalizeGmnetCapability(value) {
    if (!value || typeof value !== "object") {
      return null;
    }
    const provider = normalizeExecutionProvider(
      value.provider || value.gmnetExecutionProvider,
    );
    const gainMapMaxLongEdge = Number(value.gainMapMaxLongEdge);
    const outputMaxLongEdge = Number(value.outputMaxLongEdge);
    if (
      !provider ||
      !Number.isFinite(gainMapMaxLongEdge) ||
      gainMapMaxLongEdge < 1
    ) {
      return null;
    }
    const normalizedOutputMaxLongEdge =
      Number.isFinite(outputMaxLongEdge) && outputMaxLongEdge > 0
        ? Math.floor(outputMaxLongEdge)
        : Math.floor(gainMapMaxLongEdge * 2);
    return {
      provider,
      gainMapMaxLongEdge: Math.floor(gainMapMaxLongEdge),
      outputMaxLongEdge: normalizedOutputMaxLongEdge,
      source:
        typeof value.source === "string" && value.source.length > 0
          ? value.source
          : typeof value.gmnetCapabilitySource === "string"
            ? value.gmnetCapabilitySource
            : "probe",
    };
  }

  function formatLongEdge(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return "unknown";
    }
    return `${Math.floor(numeric)}px`;
  }

  function parseExecutionProviderFromNote(note) {
    if (typeof note !== "string") {
      return null;
    }
    const match = /runtime:\s*([a-z0-9_-]+)/i.exec(note);
    return normalizeExecutionProvider(match?.[1] || null);
  }

  function resolveExecutionProviderFromEvent(event) {
    const fromField = normalizeExecutionProvider(event?.gmnetExecutionProvider);
    if (fromField) {
      return fromField;
    }
    return parseExecutionProviderFromNote(event?.note);
  }

  function formatExecutionProviderLabel(provider) {
    const normalized = normalizeExecutionProvider(provider);
    if (!normalized) {
      return "";
    }
    if (normalized === "webgpu") {
      return "WebGPU";
    }
    if (normalized === "webgl") {
      return "WebGL";
    }
    if (normalized === "wasm") {
      return "WASM";
    }
    return normalized;
  }

  function getStageLabel(stage, phase) {
    if (phase === "pipeline-complete") return "Complete";
    if (phase === "pipeline-error") return "Processing failed";
    if (phase === "pipeline-start") return "Starting pipeline";
    if (!stage) return "Processing";
    return PROGRESS_STAGE_LABELS[stage] || stage;
  }

  function estimatePipelineProgress(event, previousProgress = 0) {
    if (!event) return previousProgress;
    if (event.phase === "pipeline-start") return 0;
    if (event.phase === "pipeline-complete") return 100;

    const stage = event.stage;
    const stageIndex = PROGRESS_STAGE_ORDER.indexOf(stage);
    if (stageIndex < 0) return previousProgress;

    const segmentSize = 100 / PROGRESS_STAGE_ORDER.length;
    const segmentStart = stageIndex * segmentSize;
    const segmentEnd = segmentStart + segmentSize;

    let stageProgress = previousProgress;
    if (event.phase === "stage-progress") {
      stageProgress =
        segmentStart +
        ((segmentEnd - segmentStart) * clampPercent(event.stageProgress)) / 100;
    } else if (event.phase === "stage-complete") {
      stageProgress = segmentEnd;
    } else if (event.phase === "stage-start") {
      stageProgress = segmentStart + segmentSize * 0.08;
    } else if (
      event.phase === "stage-error" ||
      event.phase === "pipeline-error"
    ) {
      stageProgress = Math.max(previousProgress, segmentStart);
    }
    return Math.max(previousProgress, Math.min(100, stageProgress));
  }

  function toBatchProgress(perFileProgress, fileIndex, totalFiles) {
    const safeProgress = clampPercent(perFileProgress);
    const safeIndex = Number(fileIndex);
    const safeTotal = Number(totalFiles);
    if (
      !Number.isFinite(safeIndex) ||
      !Number.isFinite(safeTotal) ||
      safeTotal <= 0
    ) {
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
    pipelineExecutionProvider = null;
    pipelineFileLabel = "";
    pipelineFileName = "";
    activeProgressFileIndex = null;
    capabilityRestrictionAppliedToCurrentFile = false;
    currentProcessingPath = "unknown";
    lastCompletedProcessingPath = "unknown";
    resetAiModelStatus();
  }

  function resetAiModelStatus() {
    aiModelStatusVisible = false;
    aiModelStatusMessage = "";
    aiModelStatusProgress = 0;
  }

  function isAiModelDownloadNote(note) {
    return /downloading ai/i.test(String(note || ""));
  }

  function updateProgressUi(event, queueId = null) {
    latestPipelineEvent = event;
    const phase = event?.phase;
    const note = String(event?.note || "");
    const fileIndex = Number(event?.fileIndex);
    const totalFiles = Number(event?.totalFiles);
    const stageImpliesGenerated =
      event?.stage === "probe-gmnet-capability" ||
      event?.stage === "constrain-sdr-image" ||
      event?.stage === "prepare-gmnet-input" ||
      event?.stage === "generate-gain-map";
    const processingPath = normalizeProcessingPath(event?.processingPath);
    const executionProvider = resolveExecutionProviderFromEvent(event);
    if (executionProvider) {
      pipelineExecutionProvider = executionProvider;
    }
    const gmnetCapability = normalizeGmnetCapability(event?.gmnetCapability);
    if (gmnetCapability) {
      pipelineGmnetCapability = gmnetCapability;
    }

    if (phase === "pipeline-start") {
      capabilityRestrictionAppliedToCurrentFile = false;
      currentProcessingPath = "unknown";
    }
    if (processingPath !== "unknown") {
      currentProcessingPath = processingPath;
      if (queueId !== null && queueId !== undefined) {
        processingPathByQueueId = new Map(processingPathByQueueId).set(
          queueId,
          processingPath,
        );
      }
      if (backendRestartAwaitingPathDecision) {
        backendRestartAwaitingPathDecision = false;
        if (processingPath === "generated") {
          backendRestartPending = true;
          abortActiveProcessing();
        }
      }
    } else if (stageImpliesGenerated && currentProcessingPath === "unknown") {
      currentProcessingPath = "generated";
      if (queueId !== null && queueId !== undefined) {
        processingPathByQueueId = new Map(processingPathByQueueId).set(
          queueId,
          "generated",
        );
      }
      if (backendRestartAwaitingPathDecision) {
        backendRestartAwaitingPathDecision = false;
        backendRestartPending = true;
        abortActiveProcessing();
      }
    }
    if (
      event?.stage === "constrain-sdr-image" &&
      currentProcessingPath === "generated" &&
      event?.constrainedByCapability === true
    ) {
      capabilityRestrictionAppliedToCurrentFile = true;
      if (backendPreference !== "wasm" && !wasmRecommendationShownThisSession) {
        showWasmRecommendationModal = true;
        wasmRecommendationShownThisSession = true;
      }
    }
    if (currentProcessingPath === "preserved") {
      capabilityRestrictionAppliedToCurrentFile = false;
    }

    if (phase === "pipeline-complete" || phase === "pipeline-error") {
      if (currentProcessingPath !== "unknown") {
        lastCompletedProcessingPath = currentProcessingPath;
      }
      backendRestartAwaitingPathDecision = false;
    }

    if (Number.isFinite(fileIndex) && fileIndex !== activeProgressFileIndex) {
      activeProgressFileIndex = fileIndex;
      pipelineCurrentFileProgress = 0;
    }

    if (event?.stage === "generate-gain-map") {
      if (phase === "stage-complete" || phase === "stage-error") {
        resetAiModelStatus();
      } else if (phase === "stage-progress") {
        if (note.toLowerCase().includes("fallback")) {
          resetAiModelStatus();
        } else {
          aiModelStatusVisible = true;
          aiModelStatusMessage = note || "Running AI inference...";
          aiModelStatusProgress = clampPercent(event.stageProgress);
        }
      }
    }

    if (phase === "pipeline-complete" || phase === "pipeline-error") {
      resetAiModelStatus();
    }

    pipelineCurrentFileProgress = estimatePipelineProgress(
      event,
      pipelineCurrentFileProgress,
    );
    pipelineOverallProgress = toBatchProgress(
      pipelineCurrentFileProgress,
      fileIndex,
      totalFiles,
    );

    if (phase === "stage-progress") {
      pipelineStageProgress = clampPercent(event.stageProgress);
    } else if (phase === "stage-complete" || phase === "pipeline-complete") {
      pipelineStageProgress = 100;
    } else if (phase === "stage-start") {
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
    } else if (Number.isFinite(fileIndex) && queue[fileIndex]?.name) {
      pipelineFileName = queue[fileIndex].name;
    }

    pipelineFileLabel =
      Number.isFinite(fileIndex) &&
      Number.isFinite(totalFiles) &&
      totalFiles > 0
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
    activeMobileTab = tab;
    openSheet = "none";
  }

  function consumeLaunchIntent() {
    if (launchIntentConsumed) return;
    launchIntentConsumed = true;

    const tab = String(launchIntent?.tab || "").toLowerCase();
    const action = String(launchIntent?.action || "").toLowerCase();

    if (tab === "results") {
      setActiveTab("results");
    }

    if (action === "pick") {
      const picker = document.getElementById("add-files");
      if (picker && typeof picker.click === "function") {
        picker.click();
      }
    }

    if (action === "resume") {
      if (canResumeQueue) {
        resumeQueue();
      } else {
        resumeRequestedFromLaunch = true;
      }
    }
  }

  function openSettingsSurface() {
    if (isDesktopLayout) {
      activeDesktopTab = "settings";
      return;
    }
    openSheet = "settings";
  }

  function openExportSheet() {
    openSheet = "export";
  }

  function openReprocessSheet() {
    openSheet = "reprocess";
  }

  function closeSheet() {
    openSheet = "none";
  }

  function toggleSelectionSet() {
    if (selectionToggleState === "all") {
      deselectAll();
      return;
    }
    selectAll();
  }

  function handleQueueSmartControl() {
    if (queueControlVisibility === "pause") {
      requestPauseQueue();
      return;
    }
    if (queueControlVisibility === "resume") {
      resumeQueue();
    }
  }

  function convertStopsToMaxContentBoost(stops) {
    const numericStops = Number(stops);
    if (!Number.isFinite(numericStops)) {
      return 2 ** 2.3;
    }
    const clampedStops = Math.max(0, Math.min(4, numericStops));
    return 2 ** clampedStops;
  }

  function buildProcessingOptions(abortSignal, fileIndex, totalFiles, queueId) {
    const options = {
      maxContentBoost: convertStopsToMaxContentBoost(maxContentBoostStops),
      rotation,
      quality,
      useJpegli,
      discardGainMap,
      stripExif,
      gmnetModelVariant: "realworld",
      abortSignal,
      fileIndex,
      totalFiles,
      onProgress: (event) => updateProgressUi(event, queueId),
    };
    const forcedProvider = resolveForcedProviderFromPreference();
    if (forcedProvider) {
      options.forceExecutionProviders = [forcedProvider];
    }
    return options;
  }

  function createQueueItems(fileList) {
    return fileList.map((file) => ({
      id: nextQueueId++,
      file,
      name: file.name,
      status: QUEUE_ITEM_STATES.QUEUED,
      settingsVersion: settingsVersion,
      error: null,
      processingPath: "unknown",
    }));
  }

  async function persistQueueStateSnapshot() {
    try {
      const hasPending = queue.some(
        (item) =>
          item.status === QUEUE_ITEM_STATES.QUEUED ||
          item.status === QUEUE_ITEM_STATES.PROCESSING,
      );
      if (
        queue.length === 0 ||
        (!hasPending && workflowState === WORKFLOW_STATES.PROCESSING_DONE)
      ) {
        await clearQueueState();
        return;
      }

      await storeQueueState({
        workflowState,
        settingsVersion,
        launchSource,
        hasPending,
        queue: queue.map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          settingsVersion: item.settingsVersion,
          error: item.error || null,
          processingPath: normalizeProcessingPath(item.processingPath),
        })),
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn("[UI] Failed to persist queue state:", e);
    }
  }

  function schedulePersistQueueState() {
    void persistQueueStateSnapshot();
  }

  function setWorkflow(eventType) {
    workflowState = transitionWorkflow(workflowState, { type: eventType });
    schedulePersistQueueState();
  }

  function updateQueueItem(queueId, changes) {
    queue = queue.map((item) =>
      item.id === queueId
        ? {
            ...item,
            ...(typeof changes === "function" ? changes(item) : changes),
          }
        : item,
    );
    schedulePersistQueueState();
  }

  function getQueueItemStatus(queueId) {
    return (
      queue.find((item) => item.id === queueId)?.status ||
      QUEUE_ITEM_STATES.COMPLETED
    );
  }

  function upsertResult(
    queueItem,
    blob,
    appliedSettingsVersion,
    appliedRotation,
    processingPath = "unknown",
  ) {
    const resultRecord = {
      originalName: queueItem.name,
      blob,
      url: URL.createObjectURL(blob),
      size: blob.size,
      index: queueItem.id,
      queueId: queueItem.id,
      settingsVersion: appliedSettingsVersion,
      rotation: appliedRotation,
      processingPath,
    };

    const existingIndex = results.findIndex(
      (result) => result.queueId === queueItem.id,
    );
    const nextSelection = new Set(selectedIndices);
    if (existingIndex >= 0) {
      URL.revokeObjectURL(results[existingIndex].url);
      results = results.map((result, index) =>
        index === existingIndex ? resultRecord : result,
      );
      nextSelection.add(existingIndex);
    } else {
      const newIndex = results.length;
      results = [...results, resultRecord];
      nextSelection.add(newIndex);
    }
    selectedIndices = nextSelection;
  }

  function startQueue() {
    if (queueLoopActive) return;

    const hasQueuedItems = queue.some(
      (item) => item.status === QUEUE_ITEM_STATES.QUEUED,
    );
    if (!hasQueuedItems) return;

    if (workflowState === WORKFLOW_STATES.EMPTY) {
      setWorkflow(WORKFLOW_EVENTS.FILES_ADDED);
    }

    if (
      workflowState === WORKFLOW_STATES.QUEUE_READY ||
      workflowState === WORKFLOW_STATES.PROCESSING_DONE ||
      workflowState === WORKFLOW_STATES.ERROR_RECOVERABLE
    ) {
      setWorkflow(WORKFLOW_EVENTS.AUTO_START);
    }

    if (workflowState === WORKFLOW_STATES.PROCESSING_PAUSED) return;

    processing = true;
    void runQueue();
  }

  async function acquireWakeLockIfNeeded() {
    if (!keepScreenAwake || !capabilities.supportsWakeLock || wakeLockSentinel)
      return;
    if (typeof navigator === "undefined" || !navigator.wakeLock?.request)
      return;

    try {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinel.addEventListener?.("release", () => {
        wakeLockSentinel = null;
      });
    } catch (e) {
      setNotice(
        `Screen wake lock unavailable (${e.message || "unsupported"}).`,
      );
    }
  }

  async function releaseWakeLock() {
    if (!wakeLockSentinel) return;
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore release errors
    } finally {
      wakeLockSentinel = null;
    }
  }

  async function runQueue() {
    if (queueLoopActive) return;
    queueLoopActive = true;

    await acquireWakeLockIfNeeded();

    try {
      while (true) {
        if (pauseRequested && currentQueueId === null) {
          setWorkflow(WORKFLOW_EVENTS.CURRENT_FILE_SETTLED);
          processing = false;
          await releaseWakeLock();
          break;
        }

        const nextItem = queue.find(
          (item) => item.status === QUEUE_ITEM_STATES.QUEUED,
        );
        if (!nextItem) {
          processing = false;
          pauseRequested = false;
          const completedItemCount = queue.filter(
            (item) =>
              item.status === QUEUE_ITEM_STATES.COMPLETED ||
              item.status === QUEUE_ITEM_STATES.STALE,
          ).length;

          if (completedItemCount > 0) {
            setWorkflow(WORKFLOW_EVENTS.QUEUE_DRAINED);
          } else {
            workflowState = WORKFLOW_STATES.ERROR_RECOVERABLE;
          }

          if (!isDesktopLayout && results.length > 0) {
            activeMobileTab = "results";
          }

          if (launchSource === "share-target" && results.length > 0) {
            activeMobileTab = "results";
            emphasizeShareOut = true;
            openSheet = "export";
          }

          await releaseWakeLock();
          schedulePersistQueueState();
          break;
        }

        currentQueueId = nextItem.id;
        cancelCurrentRequested = false;
        latestPipelineEvent = null;
        resetProgressUi();
        error = null;
        processing = true;
        processingPathByQueueId = new Map(processingPathByQueueId).set(
          nextItem.id,
          "unknown",
        );

        const controller = new AbortController();
        activeAbortController = controller;
        const activeSettingsVersion = settingsVersion;
        const activeRotation = rotation;
        const queueIndex = queue.findIndex((item) => item.id === nextItem.id);
        updateQueueItem(nextItem.id, {
          status: QUEUE_ITEM_STATES.PROCESSING,
          settingsVersion: activeSettingsVersion,
          error: null,
        });

        try {
          const blob = await processImage(
            nextItem.file,
            buildProcessingOptions(
              controller.signal,
              queueIndex,
              queue.length,
              nextItem.id,
            ),
          );

          if (controller.signal.aborted) {
            return;
          }

          const itemProcessingPath = normalizeProcessingPath(
            processingPathByQueueId.get(nextItem.id) || currentProcessingPath,
          );
          upsertResult(
            nextItem,
            blob,
            activeSettingsVersion,
            activeRotation,
            itemProcessingPath,
          );
          updateQueueItem(nextItem.id, {
            status: QUEUE_ITEM_STATES.COMPLETED,
            settingsVersion: activeSettingsVersion,
            error: null,
            processingPath: itemProcessingPath,
          });
        } catch (e) {
          if (e?.name === "AbortError") {
            if (cancelCurrentRequested) {
              updateQueueItem(nextItem.id, {
                status: QUEUE_ITEM_STATES.CANCELLED,
                error: "Cancelled by user",
              });
              processing = false;
              pauseRequested = false;
              setWorkflow(WORKFLOW_EVENTS.CANCEL_CURRENT);
              await releaseWakeLock();
              break;
            }
            if (backendRestartPending) {
              backendRestartPending = false;
              updateQueueItem(nextItem.id, {
                status: QUEUE_ITEM_STATES.QUEUED,
                error: null,
              });
              continue;
            }
            return;
          }

          console.error("[UI] Error processing queue item:", e);
          error = e.message || "Processing failed";
          updateQueueItem(nextItem.id, {
            status: QUEUE_ITEM_STATES.FAILED,
            error: error,
          });
          setWorkflow(WORKFLOW_EVENTS.FILE_FAILED);
        } finally {
          if (activeAbortController === controller) {
            activeAbortController = null;
          }
          currentQueueId = null;
        }

        if (pauseRequested) {
          setWorkflow(WORKFLOW_EVENTS.CURRENT_FILE_SETTLED);
          processing = false;
          await releaseWakeLock();
          break;
        }
      }
    } finally {
      queueLoopActive = false;
    }
  }

  function initializeQueueFromFiles(initialFiles) {
    const normalizedFiles = Array.from(initialFiles || []).filter(
      (file) => file instanceof File,
    );
    if (normalizedFiles.length === 0) {
      workflowState = WORKFLOW_STATES.EMPTY;
      return;
    }

    queue = createQueueItems(normalizedFiles);
    files = normalizedFiles;
    setWorkflow(WORKFLOW_EVENTS.FILES_ADDED);
    startQueue();
  }

  function markCompletedOutputsStale() {
    let changed = false;
    queue = queue.map((item) => {
      if (item.status === QUEUE_ITEM_STATES.COMPLETED) {
        changed = true;
        return { ...item, status: QUEUE_ITEM_STATES.STALE };
      }
      return item;
    });
    if (changed) {
      showStalePrompt = true;
      schedulePersistQueueState();
    }
  }

  function markGeneratedOutputsStale() {
    let changed = false;
    queue = queue.map((item) => {
      if (
        item.status === QUEUE_ITEM_STATES.COMPLETED &&
        normalizeProcessingPath(item.processingPath) === "generated"
      ) {
        changed = true;
        return { ...item, status: QUEUE_ITEM_STATES.STALE };
      }
      return item;
    });
    if (changed) {
      showStalePrompt = true;
      schedulePersistQueueState();
    }
    return changed;
  }

  function handleSettingChange() {
    settingsVersion += 1;
    markCompletedOutputsStale();
  }

  function applyBackendPreferenceChange(nextPreference) {
    const normalizedPreference = normalizeBackendPreference(nextPreference);
    if (normalizedPreference === backendPreference) {
      return;
    }
    backendPreference = normalizedPreference;
    persistBackendPreference(normalizedPreference);
    settingsVersion += 1;
    markGeneratedOutputsStale();

    if (!processing || currentQueueId === null) {
      backendRestartPending = false;
      backendRestartAwaitingPathDecision = false;
      return;
    }

    if (currentProcessingPath === "generated") {
      backendRestartPending = true;
      backendRestartAwaitingPathDecision = false;
      abortActiveProcessing();
      return;
    }
    if (currentProcessingPath === "unknown") {
      backendRestartAwaitingPathDecision = true;
      return;
    }
    backendRestartPending = false;
    backendRestartAwaitingPathDecision = false;
  }

  function handleBackendPreferenceChange(event) {
    applyBackendPreferenceChange(event?.target?.value);
  }

  function acceptWasmRecommendation() {
    showWasmRecommendationModal = false;
    applyBackendPreferenceChange("wasm");
    const generatedStaleIds = new Set(
      queue
        .filter(
          (item) =>
            item.status === QUEUE_ITEM_STATES.STALE &&
            normalizeProcessingPath(item.processingPath) === "generated",
        )
        .map((item) => item.id),
    );
    if (generatedStaleIds.size > 0 && requeueByIds(generatedStaleIds)) {
      showStalePrompt = false;
      startQueue();
    }
  }

  function dismissWasmRecommendation() {
    showWasmRecommendationModal = false;
  }

  function rotate(degrees) {
    rotation = (rotation + degrees + 360) % 360;
    handleSettingChange();
  }

  function requestPauseQueue() {
    if (!processing) return;
    pauseRequested = true;
    setWorkflow(WORKFLOW_EVENTS.PAUSE_REQUESTED);
  }

  function resumeQueue() {
    pauseRequested = false;
    cancelCurrentRequested = false;
    setWorkflow(WORKFLOW_EVENTS.RESUME_REQUESTED);
    processing = true;
    startQueue();
  }

  function cancelCurrent() {
    if (!canCancelCurrent) return;
    cancelCurrentRequested = true;
    abortActiveProcessing();
  }

  function selectedStaleQueueIds() {
    const ids = new Set();
    selectedIndices.forEach((index) => {
      const queueId = results[index]?.queueId;
      if (queueId === undefined || queueId === null) return;
      if (getQueueItemStatus(queueId) === QUEUE_ITEM_STATES.STALE) {
        ids.add(queueId);
      }
    });
    return ids;
  }

  function requeueByIds(queueIds) {
    if (!queueIds || queueIds.size === 0) return false;
    let changed = false;

    queue = queue.map((item) => {
      if (
        queueIds.has(item.id) &&
        (item.status === QUEUE_ITEM_STATES.STALE ||
          item.status === QUEUE_ITEM_STATES.CANCELLED ||
          item.status === QUEUE_ITEM_STATES.FAILED)
      ) {
        changed = true;
        return {
          ...item,
          status: QUEUE_ITEM_STATES.QUEUED,
          error: null,
          processingPath: "unknown",
        };
      }
      return item;
    });

    if (changed) {
      if (
        workflowState === WORKFLOW_STATES.PROCESSING_DONE ||
        workflowState === WORKFLOW_STATES.ERROR_RECOVERABLE
      ) {
        setWorkflow(WORKFLOW_EVENTS.FILES_ADDED);
      }
      schedulePersistQueueState();
    }
    return changed;
  }

  function reprocessSelectedStale() {
    const staleIds = selectedStaleQueueIds();
    if (requeueByIds(staleIds)) {
      showStalePrompt = staleCount > staleIds.size;
      closeSheet();
      startQueue();
    }
  }

  function reprocessAllStale() {
    const staleIds = new Set(
      queue
        .filter((item) => item.status === QUEUE_ITEM_STATES.STALE)
        .map((item) => item.id),
    );
    if (requeueByIds(staleIds)) {
      showStalePrompt = false;
      closeSheet();
      startQueue();
    }
  }

  function keepCurrentResults() {
    showStalePrompt = false;
    closeSheet();
  }

  async function handleAddFiles(event) {
    const newFiles = Array.from(event.target.files || []).filter(
      (file) => file instanceof File,
    );
    if (newFiles.length === 0) return;

    const addedItems = createQueueItems(newFiles);
    queue = [...queue, ...addedItems];
    files = [...files, ...newFiles];

    if (
      workflowState === WORKFLOW_STATES.EMPTY ||
      workflowState === WORKFLOW_STATES.PROCESSING_DONE ||
      workflowState === WORKFLOW_STATES.ERROR_RECOVERABLE
    ) {
      setWorkflow(WORKFLOW_EVENTS.FILES_ADDED);
    }

    schedulePersistQueueState();
    if (workflowState !== WORKFLOW_STATES.PROCESSING_PAUSED) {
      startQueue();
    }

    event.target.value = "";
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

  async function downloadSelected(asZip = false) {
    const selectedResults = getSelectedResults(results, selectedIndices);
    if (selectedResults.length === 0) return;

    if (selectedResults.length === 1) {
      download(selectedResults[0]);
      closeSheet();
      return;
    }

    if (!asZip) {
      selectedResults.forEach((result) => download(result));
      closeSheet();
      return;
    }

    const zip = new JSZip();
    for (const result of selectedResults) {
      const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
      zip.file(filename, result.blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    a.download = `ultrahdr-batch-${timestamp}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
    closeSheet();
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
        closeSheet();
        return;
      }

      if (navigator.canShare && selectedResults.length > 1) {
        const zip = new JSZip();
        for (const result of selectedResults) {
          const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
          zip.file(filename, result.blob);
        }

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19);
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
          closeSheet();
          return;
        }
      }

      await downloadSelected(true);
      setNotice("Direct sharing is unavailable. Download started instead.");
    } catch (e) {
      console.error("Error sharing:", e);
      if (e.name === "AbortError") return;
      await downloadSelected(true);
      setNotice(`Share failed. Download started instead (${e.message}).`);
    }
  }

  function clearResultsState() {
    releaseResultUrls(results);
    results = [];
    selectedIndices = new Set();
    latestPipelineEvent = null;
    processingPathByQueueId = new Map();
    resetProgressUi();
  }

  async function reset(requireConfirm = true) {
    if (typeof requireConfirm === "object") {
      requireConfirm = true;
    }
    if (
      requireConfirm &&
      typeof window !== "undefined" &&
      typeof window.confirm === "function" &&
      !window.confirm("Discard all files and results?")
    ) {
      return;
    }

    processingRunId += 1;
    abortActiveProcessing();
    await releaseWakeLock();

    clearResultsState();
    files = [];
    queue = [];
    nextQueueId = 0;
    pauseRequested = false;
    cancelCurrentRequested = false;
    currentQueueId = null;
    workflowState = WORKFLOW_STATES.EMPTY;
    settingsVersion = 1;
    showStalePrompt = false;
    staleCount = 0;
    emphasizeShareOut = false;

    rotation = 0;
    maxContentBoostStops = 2.3;
    quality = 0.95;
    discardGainMap = false;
    stripExif = false;
    keepScreenAwake = true;

    notice = null;
    error = null;
    activeMobileTab = "convert";
    activeDesktopTab = "all";
    openSheet = "none";

    await clearQueueState();
    dispatch("reset");
  }

  function removeImage(index) {
    const removed = results[index];
    if (removed?.url) URL.revokeObjectURL(removed.url);

    const removedQueueId = removed?.queueId;
    if (removedQueueId !== undefined) {
      queue = queue.filter((item) => item.id !== removedQueueId);
      files = queue.map((item) => item.file);
      schedulePersistQueueState();
    }

    results = results.filter((_, i) => i !== index);

    const newSelection = new Set();
    selectedIndices.forEach((i) => {
      if (i < index) newSelection.add(i);
      else if (i > index) newSelection.add(i - 1);
    });
    selectedIndices = newSelection;

    if (queue.length === 0) {
      void reset(false);
    }
  }

  onMount(() => {
    let mediaQuery = null;
    let handleMediaChange = null;
    backendPreference = loadBackendPreference();

    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
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

    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (
        document.hidden &&
        (workflowState === WORKFLOW_STATES.PROCESSING_ACTIVE ||
          workflowState === WORKFLOW_STATES.PROCESSING_PAUSING)
      ) {
        backgroundProcessingNotice =
          "Processing continues best-effort in the background, but your OS/browser may pause this tab.";
      } else {
        backgroundProcessingNotice = null;
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    void (async () => {
      try {
        const persistedQueue = await loadQueueState();
        if (persistedQueue?.hasPending && (!files || files.length === 0)) {
          queueRestoreNotice =
            "Previous queue could not be restored. Please re-add files.";
          setNotice(queueRestoreNotice);
        }
      } catch (e) {
        console.warn("[UI] Failed to load persisted queue state:", e);
      }

      initializeQueueFromFiles(files);
      consumeLaunchIntent();
    })();

    return () => {
      processingRunId += 1;
      abortActiveProcessing();
      clearTimeout(noticeTimer);
      releaseResultUrls(results);
      void releaseWakeLock();

      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }

      if (mediaQuery && handleMediaChange) {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", handleMediaChange);
        } else if (typeof mediaQuery.removeListener === "function") {
          mediaQuery.removeListener(handleMediaChange);
        }
      }
    };
  });
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
        aria-selected={activeMobileTab === "convert"}
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
        aria-selected={activeMobileTab === "results"}
        aria-controls="panel-results"
        on:click={() => setActiveTab("results")}
      >
        Results <span class="tab-badge">{results.length}</span>
      </button>
    </div>
  {/if}

  <div
    class="processor-layout"
    class:desktop-two-pane={isDesktopLayout}
    data-desktop-tab={activeDesktopTab}
    data-testid={isDesktopLayout ? "desktop-two-pane" : undefined}
  >
    <section class="controls-column">
      {#if showConvertPanel}
        <div class="controls card panel convert-panel" id="panel-convert">
          <h2>Convert</h2>
          <p class="panel-intro">
            Queue images, process locally, then export to other apps.
          </p>

          <div class="control-group" data-testid="quick-controls">
            <label for="boost">HDR Strength (Max Content Boost Stops)</label>
            <div class="range-wrapper">
              <input
                type="range"
                id="boost"
                min="0.0"
                max="4.0"
                step="0.1"
                bind:value={maxContentBoostStops}
                on:input={handleSettingChange}
              />
              <span class="value">{maxContentBoostStops.toFixed(1)} stops</span>
            </div>
          </div>

          <div class="control-group horizontal">
            <label for="quality">Quality</label>
            <div class="select-wrapper">
              <select
                id="quality"
                bind:value={quality}
                on:change={handleSettingChange}
              >
                <option value={1.0}>Lossless</option>
                <option value={0.95}>High</option>
                <option value={0.75}>Medium</option>
                <option value={0.5}>Low</option>
              </select>
            </div>
          </div>

          {#if showCapabilityRestrictionUi}
            <section
              class="capability-restriction card"
              data-testid="capability-restriction-banner"
              role="status"
            >
              <p>Browser capability limits output quality in this session.</p>
              <p class="help-text">
                Runtime: {formatExecutionProviderLabel(
                  pipelineGmnetCapability?.provider,
                )}
                • Gain map max: {formatLongEdge(
                  pipelineGmnetCapability?.gainMapMaxLongEdge,
                )}
                • Max output long edge: {formatLongEdge(
                  pipelineGmnetCapability?.outputMaxLongEdge,
                )}
              </p>
              <p class="help-text">
                Larger inputs will be downscaled before export.
              </p>
              {#if capabilityRestrictionAppliedToCurrentFile}
                <p
                  class="help-text"
                  data-testid="capability-restriction-current-file"
                >
                  Current file was downscaled due to browser capability.
                </p>
              {/if}
            </section>
          {/if}

          <div class="actions compact-actions">
            <input
              type="file"
              id="add-files"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,.heic,.heif,.tif,.tiff"
              style="display: none;"
              on:change={handleAddFiles}
            />
            <button
              class="secondary"
              on:click={() => document.getElementById("add-files").click()}
            >
              Add Images
            </button>
            {#if queueControlVisibility !== "hidden"}
              <button
                class="primary"
                data-testid="queue-smart-control"
                on:click={handleQueueSmartControl}
                disabled={workflowState === WORKFLOW_STATES.PROCESSING_PAUSING}
              >
                {queueControlVisibility === "pause"
                  ? "Pause Queue"
                  : "Resume Queue"}
              </button>
            {/if}
            {#if canCancelCurrent}
              <button
                class="secondary"
                data-testid="cancel-current-control"
                on:click={cancelCurrent}
              >
                Cancel Current
              </button>
            {/if}
          </div>

          {#if showPipelineStatusCard}
            <div
              class="pipeline-status"
              data-testid="pipeline-status"
              data-phase={latestPipelineEvent?.phase || ""}
              data-stage={latestPipelineEvent?.stage || ""}
              data-elapsed-ms={Math.round(latestPipelineEvent?.elapsedMs || 0)}
            >
              {#if showPipelineCompleteSummary}
                <p class="pipeline-title">Processing complete</p>
              {:else}
                <div class="pipeline-header-row">
                  <p class="pipeline-title">{pipelineStatusLabel}</p>
                  <p class="pipeline-percent">
                    {Math.round(pipelineOverallProgress)}%
                  </p>
                </div>

                {#if pipelineFileLabel}
                  <p class="help-text pipeline-file-label">
                    {pipelineFileLabel}
                  </p>
                {/if}

                {#if pipelineFileName}
                  <p
                    class="help-text pipeline-file-name"
                    data-testid="pipeline-file-name"
                  >
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
                    Stage {Math.round(pipelineStageProgress)}% • {latestPipelineEvent?.stage ||
                      "pipeline"}
                  </p>
                  <p class="help-text">
                    {formatMs(latestPipelineEvent?.elapsedMs)}
                  </p>
                </div>

                {#if aiModelStatusVisible}
                  <div
                    class="pipeline-ai-status"
                    data-testid="pipeline-ai-status"
                  >
                    <div class="pipeline-ai-header-row">
                      <p class="help-text pipeline-ai-message">
                        {aiModelStatusMessage}
                      </p>
                      {#if isAiModelDownloadNote(aiModelStatusMessage)}
                        <p class="help-text pipeline-ai-percent">
                          {Math.round(aiModelStatusProgress)}%
                        </p>
                      {/if}
                    </div>
                    {#if isAiModelDownloadNote(aiModelStatusMessage)}
                      <div
                        class="progress-track"
                        data-testid="pipeline-ai-progress"
                        role="progressbar"
                        aria-label="AI model progress"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={Math.round(aiModelStatusProgress)}
                      >
                        <span
                          class="progress-fill"
                          style={`width: ${Math.round(aiModelStatusProgress)}%`}
                        ></span>
                      </div>
                    {:else}
                      <div
                        class="pipeline-ai-spinner"
                        data-testid="pipeline-ai-spinner"
                        aria-hidden="true"
                      ></div>
                    {/if}
                  </div>
                {:else if pipelineStatusNote}
                  <p class="help-text">{pipelineStatusNote}</p>
                {/if}

                {#if pipelineExecutionProvider}
                  <p
                    class="help-text"
                    data-testid="pipeline-execution-provider"
                  >
                    GMNet runtime: {formatExecutionProviderLabel(
                      pipelineExecutionProvider,
                    )}
                  </p>
                {/if}

                {#if latestPipelineEvent?.phase === "pipeline-complete"}
                  <p class="help-text">
                    Slowest stage: {getSlowestStage(
                      latestPipelineEvent.stageDurationsMs,
                    ) || "n/a"}
                  </p>
                {/if}
              {/if}
            </div>
          {/if}

          {#if backgroundProcessingNotice}
            <p class="help-text notice">{backgroundProcessingNotice}</p>
          {/if}

          {#if queueRestoreNotice}
            <p class="help-text notice">{queueRestoreNotice}</p>
          {/if}

          {#if showStalePrompt && staleCount > 0}
            <div class="stale-prompt card" data-testid="stale-reprocess-prompt">
              <p>{staleCount} result(s) were generated with older settings.</p>
              <div class="stale-actions">
                <button class="primary small" on:click={openReprocessSheet}
                  >Reprocess</button
                >
              </div>
            </div>
          {/if}

          {#if notice}
            <p class="help-text notice" data-testid="notice-message">
              {notice}
            </p>
          {/if}
        </div>
      {/if}

      {#if showSettingsPanel}
        <div class="controls card panel settings-panel" id="panel-settings">
          <div class="settings-header">
            <h2>Settings</h2>
          </div>
          <div data-testid="advanced-settings">
            <div class="control-group">
              <span class="label">Rotation</span>
              <div class="button-group">
                <button
                  on:click={() => rotate(-90)}
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

            <div class="control-group switch-group">
              <label class="switch">
                <input
                  type="checkbox"
                  bind:checked={useJpegli}
                  on:change={handleSettingChange}
                />
                <span class="slider"></span>
              </label>
              <div class="switch-text">
                <span class="switch-label">High-Quality JPEG Encoding</span>
                <p class="help-text">
                  Use Jpegli WASM encoder for smaller files and better quality.
                  Significantly slower on large images.
                </p>
              </div>
            </div>

            <div class="control-group switch-group">
              <label class="switch">
                <input
                  type="checkbox"
                  bind:checked={discardGainMap}
                  on:change={handleSettingChange}
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
                />
                <span class="slider"></span>
              </label>
              <span class="switch-label">Strip EXIF data</span>
            </div>

            {#if capabilities.supportsWakeLock}
              <div class="control-group switch-group">
                <label class="switch">
                  <input type="checkbox" bind:checked={keepScreenAwake} />
                  <span class="slider"></span>
                </label>
                <span class="switch-label"
                  >Keep screen awake while processing</span
                >
              </div>
            {/if}

            <div class="control-group horizontal">
              <label for="backend-preference-select">Backend</label>
              <div class="select-wrapper">
                <select
                  id="backend-preference-select"
                  value={backendPreference}
                  on:change={handleBackendPreferenceChange}
                  data-testid="backend-preference-select"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="webgpu">WebGPU</option>
                  <option value="webgl">WebGL</option>
                  <option value="wasm">WASM</option>
                </select>
              </div>
              {#if backendPreference === "wasm"}
                <p class="help-text">
                  Maximum resolution, slower processing speed.
                </p>
              {:else if backendPreference !== "auto"}
                <p class="help-text">
                  Manual backend mode is strict and fails loudly if unsupported.
                </p>
              {/if}
            </div>
          </div>
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
        <div
          class="results-container"
          class:loading={processing}
          id="panel-results"
        >
          {#if processing && results.length === 0}
            <div class="loading-overlay">
              <div class="spinner"></div>
              <p>
                Processing... {Math.round(pipelineOverallProgress)}%
                {#if latestPipelineEvent}
                  ({pipelineStatusLabel}, {Math.round(pipelineStageProgress)}%
                  stage, {formatMs(latestPipelineEvent.elapsedMs)})
                {/if}
              </p>
            </div>
          {/if}

          {#if results.length > 0}
            <div class="results">
              <div class="results-header">
                <h3>Results</h3>
                <div class="selection-controls compact">
                  <button class="text-btn" on:click={toggleSelectionSet}>
                    {selectionToggleState === "all"
                      ? "Clear Selection"
                      : "Select All"}
                  </button>
                  {#if isDesktopLayout}
                    <button
                      class="secondary small"
                      data-testid="results-discard-all"
                      on:click={() => reset()}
                    >
                      Discard all
                    </button>
                  {/if}
                  {#if isDesktopLayout}
                    <button
                      class="primary small"
                      on:click={openExportSheet}
                      data-testid={emphasizeShareOut
                        ? "share-out-cta"
                        : undefined}
                    >
                      Export ({selectedIndices.size})
                    </button>
                  {/if}
                </div>
              </div>

              {#if !isDesktopLayout}
                <div class="results-tools" data-testid="mobile-results-tools">
                  <div class="button-group results-rotation-controls">
                    <button
                      on:click={() => rotate(-90)}
                      class="icon-btn"
                      title="Rotate Left"
                      data-testid="results-rotate-left"
                    >
                      Rotate Left
                    </button>
                    <button
                      on:click={() => rotate(90)}
                      class="icon-btn"
                      title="Rotate Right"
                      data-testid="results-rotate-right"
                    >
                      Rotate Right
                    </button>
                    <span class="value">{rotation}°</span>
                  </div>
                  {#if hasRotationStaleResults}
                    <div class="stale-actions">
                      <button
                        class="secondary small"
                        data-testid="results-reprocess-btn"
                        on:click={openReprocessSheet}
                      >
                        Reprocess
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}

              <div class="grid" data-testid="results-grid">
                {#each results as result, i}
                  <div
                    class="result-card card"
                    class:selected={selectedIndices.has(i)}
                    class:stale={getQueueItemStatus(result.queueId) ===
                      QUEUE_ITEM_STATES.STALE}
                    class:failed={getQueueItemStatus(result.queueId) ===
                      QUEUE_ITEM_STATES.FAILED}
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
                      <p class="size">
                        {(result.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p class="status-tag">
                        {getQueueItemStatus(result.queueId)}
                      </p>
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

  {#if !isDesktopLayout && activeMobileTab === "results" && results.length > 0}
    <div class="mobile-action-bar" data-testid="mobile-action-bar">
      <button
        class="secondary"
        data-testid="results-discard-all"
        on:click={() => reset()}
      >
        Discard all
      </button>
      <button
        class="primary"
        on:click={openExportSheet}
        data-testid={emphasizeShareOut ? "share-out-cta" : undefined}
      >
        Export ({selectedIndices.size})
      </button>
    </div>
  {/if}

  {#if !showSettingsPanel && openSheet !== "settings"}
    <div class="fab-layer">
      <button
        class="floating-gear"
        type="button"
        data-testid="floating-gear"
        aria-label="Open settings"
        on:click={openSettingsSurface}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.08-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.03 7.03 0 0 0-1.7-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65c-.62.24-1.19.56-1.7.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.05.32-.08.65-.08.98s.03.66.08.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.22.39.31.62.22l2.49-1c.51.42 1.08.74 1.7.98l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.62-.24 1.19-.56 1.7-.98l2.49 1c.23.09.49 0 .62-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z"
          />
        </svg>
        <span class="sr-only">Open settings</span>
      </button>
    </div>
  {/if}

  {#if openSheet !== "none"}
    <button
      class="sheet-backdrop"
      type="button"
      aria-label="Close panel"
      on:click={closeSheet}
    ></button>
  {/if}

  {#if openSheet === "settings" && !isDesktopLayout}
    <div class="sheet-card" data-testid="settings-sheet">
      <div class="sheet-header">
        <h3>Settings</h3>
        <button class="text-btn" on:click={closeSheet}>Done</button>
      </div>

      <div data-testid="advanced-settings">
        <div class="control-group switch-group">
          <label class="switch">
            <input
              type="checkbox"
              bind:checked={useJpegli}
              on:change={handleSettingChange}
            />
            <span class="slider"></span>
          </label>
          <div class="switch-text">
            <span class="switch-label">High-Quality JPEG Encoding</span>
            <p class="help-text">
              Use Jpegli WASM encoder for smaller files and better quality.
              Significantly slower on large images.
            </p>
          </div>
        </div>

        <div class="control-group switch-group">
          <label class="switch">
            <input
              type="checkbox"
              bind:checked={discardGainMap}
              on:change={handleSettingChange}
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
            />
            <span class="slider"></span>
          </label>
          <span class="switch-label">Strip EXIF data</span>
        </div>

        {#if capabilities.supportsWakeLock}
          <div class="control-group switch-group">
            <label class="switch">
              <input type="checkbox" bind:checked={keepScreenAwake} />
              <span class="slider"></span>
            </label>
            <span class="switch-label">Keep screen awake while processing</span>
          </div>
        {/if}

        <div class="control-group horizontal">
          <label for="backend-preference-select-mobile">Backend</label>
          <div class="select-wrapper">
            <select
              id="backend-preference-select-mobile"
              value={backendPreference}
              on:change={handleBackendPreferenceChange}
              data-testid="backend-preference-select-mobile"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="webgpu">WebGPU</option>
              <option value="webgl">WebGL</option>
              <option value="wasm">WASM</option>
            </select>
          </div>
          {#if backendPreference === "wasm"}
            <p class="help-text">
              Maximum resolution, slower processing speed.
            </p>
          {:else if backendPreference !== "auto"}
            <p class="help-text">
              Manual backend mode is strict and fails loudly if unsupported.
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if openSheet === "export"}
    <div class="sheet-card" data-testid="export-sheet">
      <div class="sheet-header">
        <h3>Export</h3>
        <button class="text-btn" on:click={closeSheet}>Done</button>
      </div>

      <p class="help-text">
        {#if selectedIndices.size === 0}
          Select at least one result to export.
        {:else}
          {selectedIndices.size} item(s) selected.
        {/if}
      </p>

      {#if showCapabilityRestrictionUi}
        <section
          class="capability-restriction card"
          data-testid="export-capability-restriction"
          role="status"
        >
          <p>Export quality is limited by browser runtime capability.</p>
          <p class="help-text">
            Runtime: {formatExecutionProviderLabel(
              pipelineGmnetCapability?.provider,
            )}
            • Gain map max: {formatLongEdge(
              pipelineGmnetCapability?.gainMapMaxLongEdge,
            )}
            • Max output long edge: {formatLongEdge(
              pipelineGmnetCapability?.outputMaxLongEdge,
            )}
          </p>
        </section>
      {/if}

      <div class="sheet-actions">
        {#if selectedIndices.size > 1}
          <div class="download-separate-action">
            <button
              class="primary"
              on:click={() => downloadSelected(false)}
              disabled={selectedIndices.size === 0}
            >
              Download as separate files
            </button>
            <span class="download-tooltip-anchor">
              <button
                class="info-icon"
                type="button"
                aria-label="About separate file downloads">i</button
              >
              <span class="download-tooltip" role="tooltip">
                Not all browsers allow downloading multiple separate files
                simultaneously.
              </span>
            </span>
          </div>
        {:else}
          <button
            class="primary"
            on:click={() => downloadSelected(false)}
            disabled={selectedIndices.size === 0}
          >
            Download
          </button>
        {/if}
        {#if selectedIndices.size > 1}
          <button class="primary" on:click={() => downloadSelected(true)}
            >Download as single ZIP file</button
          >
        {/if}
        {#if hasShareCapability}
          <button
            class="primary share-btn"
            on:click={shareSelected}
            disabled={selectedIndices.size === 0}
            title="Share to other apps"
            data-testid={emphasizeShareOut ? "share-out-cta" : undefined}
          >
            Share
          </button>
        {/if}
      </div>
    </div>
  {/if}

  {#if openSheet === "reprocess"}
    <div class="sheet-card" data-testid="reprocess-sheet">
      <div class="sheet-header">
        <h3>Reprocess</h3>
        <button class="text-btn" on:click={closeSheet}>Done</button>
      </div>
      <div class="sheet-actions">
        <button class="primary" on:click={reprocessSelectedStale}
          >Reprocess Selected</button
        >
        <button class="secondary" on:click={reprocessAllStale}
          >Reprocess All Stale</button
        >
        <button class="text-btn" on:click={keepCurrentResults}
          >Keep Current Results</button
        >
      </div>
    </div>
  {/if}

  {#if showWasmRecommendationModal}
    <div
      class="sheet-backdrop"
      role="presentation"
      data-testid="wasm-recommendation-backdrop"
    ></div>
    <div
      class="sheet-card wasm-recommendation"
      data-testid="wasm-recommendation-modal"
    >
      <div class="sheet-header">
        <h3>High Resolution Recommendation</h3>
      </div>
      <p class="help-text">
        This image path is constrained by {formatExecutionProviderLabel(
          pipelineGmnetCapability?.provider,
        ) || "GPU"} capability.
      </p>
      <p class="help-text">
        Switch to WASM for higher resolution output. WASM is slower than GPU
        runtimes.
      </p>
      <div class="sheet-actions">
        <button
          class="primary"
          type="button"
          on:click={acceptWasmRecommendation}
          data-testid="wasm-recommendation-accept"
        >
          Switch to WASM
        </button>
        <button
          class="secondary"
          type="button"
          on:click={dismissWasmRecommendation}
          data-testid="wasm-recommendation-dismiss"
        >
          Keep current backend
        </button>
      </div>
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .control-group.switch-group .switch-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .control-group.switch-group .switch-text .help-text {
    margin: 0;
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
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--primary-color) 45%, transparent);
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
    font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono",
      "Liberation Mono", monospace;
    font-size: 0.95rem;
    min-width: 3ch;
  }

  .help-text {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
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

  .compact-actions button {
    flex: 1;
    min-width: 130px;
  }

  .stale-prompt {
    padding: 0.8rem;
    display: grid;
    gap: 0.55rem;
  }

  .stale-prompt p {
    margin: 0;
    font-size: 0.9rem;
  }

  .capability-restriction {
    border-color: color-mix(
      in srgb,
      var(--queue-warning, #f59e0b) 60%,
      var(--border-subtle)
    );
    background: color-mix(
      in srgb,
      var(--queue-warning, #f59e0b) 10%,
      var(--surface-muted)
    );
    display: grid;
    gap: 0.35rem;
    padding: 0.7rem 0.8rem;
  }

  .capability-restriction p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .stale-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    align-items: center;
  }

  .notice {
    color: var(--text-color);
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

  .pipeline-ai-status {
    display: grid;
    gap: 0.45rem;
  }

  .pipeline-ai-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  }

  .pipeline-ai-message {
    color: var(--text-color);
  }

  .pipeline-ai-percent {
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .pipeline-ai-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid color-mix(in srgb, var(--text-muted) 35%, transparent);
    border-left-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
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
    background: linear-gradient(
      90deg,
      var(--primary-color),
      color-mix(in srgb, var(--primary-color) 70%, #ffffff)
    );
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
    justify-content: center;
    gap: 0.45rem;
    width: 100%;
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

  .selection-controls.compact {
    gap: 0.5rem;
  }

  .results-tools {
    display: grid;
    gap: 0.55rem;
  }

  .results-rotation-controls {
    align-items: center;
  }

  .results-rotation-controls .value {
    margin-left: auto;
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
    transition:
      transform 0.15s ease,
      border-color 0.15s ease;
  }

  .result-card:hover {
    transform: translateY(-1px);
  }

  .result-card.selected {
    border-color: var(--primary-color);
    background-color: var(--surface-interactive);
  }

  .result-card.stale {
    border-color: var(--queue-stale);
  }

  .result-card.failed {
    border-color: var(--queue-failed);
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

  .status-tag {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
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

  .fab-layer {
    position: fixed;
    right: 1rem;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 4.8rem);
    display: grid;
    gap: 0.55rem;
    justify-items: end;
    z-index: 25;
  }

  .floating-gear {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: var(--primary-color);
    color: var(--text-on-primary);
    box-shadow: var(--shadow-lg);
    display: grid;
    place-items: center;
    padding: 0;
  }

  .floating-gear svg {
    width: 24px;
    height: 24px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sheet-backdrop {
    position: fixed;
    inset: 0;
    border: none;
    padding: 0;
    margin: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 29;
  }

  .sheet-card {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.6rem);
    width: min(92vw, 520px);
    max-height: min(72vh, 680px);
    overflow: auto;
    padding: 0.95rem;
    border-radius: 14px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-raised);
    z-index: 30;
    display: grid;
    gap: 0.8rem;
    box-shadow: var(--shadow-lg);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  }

  .sheet-header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .sheet-actions {
    display: grid;
    gap: 0.55rem;
  }

  .download-separate-action {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.45rem;
    align-items: center;
  }

  .download-tooltip-anchor {
    position: relative;
    display: grid;
    place-items: center;
  }

  .info-icon {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 999px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-muted);
    color: var(--text-color);
    font-weight: 700;
    line-height: 1;
    padding: 0;
  }

  .download-tooltip {
    position: absolute;
    right: 0;
    bottom: calc(100% + 0.4rem);
    width: min(280px, 70vw);
    padding: 0.5rem 0.6rem;
    border-radius: 8px;
    border: 1px solid var(--border-subtle);
    background: var(--surface-raised);
    color: var(--text-color);
    font-size: 0.78rem;
    line-height: 1.35;
    box-shadow: var(--shadow-lg);
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
    z-index: 5;
  }

  .download-tooltip-anchor:hover .download-tooltip,
  .download-tooltip-anchor:focus-within .download-tooltip {
    opacity: 1;
    transform: translateY(0);
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

    .fab-layer {
      right: 1.25rem;
      bottom: 1.25rem;
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
