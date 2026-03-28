<script lang="ts">
  import { createEventDispatcher, onMount, tick } from "svelte";
  import DropZone from "./DropZone.svelte";
  import OfflineReadinessCard from "./OfflineReadinessCard.svelte";
  import { getCapabilities } from "./capabilities.js";
  import JSZip from "jszip";
  import {
    clampMaxContentBoostStops,
    convertStopsToMaxContentBoost,
    DEFAULT_MAX_CONTENT_BOOST_STOPS,
    MAX_CONTENT_BOOST_STOPS_RANGE,
  } from "./max-content-boost.js";
  import {
    buildShareFilesFromStorage,
    getSelectedResults,
    loadSelectedResultBlobs,
    releaseResultUrls,
  } from "./result-management";
  import {
    clearSessionQueuePayloads,
    clearQueueState,
    deleteQueuePayloads,
    getQueueInputFile,
    getQueueOutputBlob,
    getQueuePreviewBlob,
    loadQueueState,
    normalizePersistedQueueState,
    shouldPauseForStorageWrite,
    storeQueueInputFile,
    storeQueueOutputBlob,
    storeQueuePreviewBlob,
    storeQueueState,
  } from "./share-store.ts";
  import {
    QUEUE_ITEM_STATES,
    selectExportableQueueIds,
    selectWorkflowCards,
    WORKFLOW_EVENTS,
    WORKFLOW_STATES,
    transitionWorkflow,
  } from "./workflow-state";
  import { clearQueueBadge, setQueueBadge } from "./badge.ts";
  import {
    acquireProcessingLock,
    releaseProcessingLock,
  } from "./processing-lock.js";
  import {
    DEFAULT_PROCESSING_PREFERENCES,
    loadProcessingPreferences,
    normalizeProcessingPreferences,
    resolveCheckpointingForRun,
    saveProcessingPreferences,
  } from "./processing-preferences.ts";
  import { isChromiumRuntime } from "./runtime-browser.ts";
  import {
    classifyInputProcessingPath,
    probeInputProcessingPathFromHeaders,
  } from "./processing-path.js";
  import { imageDataToJpegBlob, loadImageData, resizeImageData } from "./image-utils.js";

  export let files = [];
  export let launchSource = "regular";
  export let launchIntent = { action: null, tab: null };
  export let runtime = null;
  export let runtimeExecutionProvider = null;
  export let pwaUpdateState = null;
  export let onValidateOfflineReadiness = () => {};
  export let onRepairOfflineReadiness = () => {};

  let maxContentBoostStops = DEFAULT_MAX_CONTENT_BOOST_STOPS;

  let rotation = 0;
  let quality = 0.95;
  let discardGainMap = false;
  let stripExif = false;
  let keepScreenAwake = true;
  let backendPreference = "auto";
  let gmnetCheckpointingPreference = "auto";

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
  let selectedQueueIds = new Set();
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
  let viewerOpen = false;
  let viewerIndex = -1;
  let viewerTouchStartX = null;
  let viewerTouchStartY = null;
  let viewerTouchCurrentX = null;
  let viewerTouchCurrentY = null;
  let viewerBounceDirection = "none";
  let viewerBounceTimeout = null;
  let viewerZoomScale = 1;
  let viewerPanX = 0;
  let viewerPanY = 0;
  let viewerDragActive = false;
  let viewerDragStartX = 0;
  let viewerDragStartY = 0;
  let viewerCompareActive = false;
  let viewerDesktopChromeVisible = false;
  let viewerDesktopChromeTimeout = null;
  let viewerLastTapTime = 0;
  let viewerLastTapX = 0;
  let viewerLastTapY = 0;
  let viewerPinchStartDistance = null;
  let viewerPinchStartScale = 1;
  let selectionToggleState = "none";
  let queueControlVisibility = "hidden";
  let failedQueueCount = 0;
  let showQueueOverflow = false;
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
  let currentProcessingPath = "unknown";
  let lastCompletedProcessingPath = "unknown";
  let backendRestartPending = false;
  let backendRestartAwaitingPathDecision = false;
  let processingPathByQueueId = new Map();
  let persistTaskPending = false;
  let pendingMobileInferenceFiles = [];
  let mobileInferenceWarningOpen = false;
  let mobileInferenceChallengeValue = "";
  let mobileInferenceAcknowledgedForSession = false;
  let workflowCards = [];
  let exportableQueueIds = new Set();
  let currentViewerCard = null;
  let viewerHasComparePreview = false;
  let viewerPreviewKind = "single";
  let viewerImageSrc = "";
  let viewerImageAlt = "";
  let viewerIsZoomed = false;
  let viewerFilmstripElement = null;
  let effectiveViewerDesktopChromeVisible = false;

  const capabilities = getCapabilities();
  const dispatch = createEventDispatcher();
  const VIEWER_SWIPE_THRESHOLD_PX = 48;
  const VIEWER_VERTICAL_GUARD_PX = 80;
  const VIEWER_BOUNCE_RESET_MS = 180;
  const VIEWER_ZOOM_SCALE = 2.5;
  const VIEWER_MIN_ZOOM_SCALE = 1;
  const VIEWER_MAX_ZOOM_SCALE = 4;
  const VIEWER_DOUBLE_TAP_DELAY_MS = 300;
  const VIEWER_DOUBLE_TAP_DISTANCE_PX = 24;
  const VIEWER_DESKTOP_CHROME_IDLE_MS = 1600;
  const MOBILE_INFERENCE_ACKNOWLEDGEMENT =
    "I will also try Chrome on Windows or macOS";

  const PROGRESS_STAGE_ORDER = [
    "wasm-load",
    "preprocess-file",
    "read-source-buffer",
    "detect-ultrahdr",
    "read-input-data-url",
    "extract-exif",
    "decode-image-data",
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
  $: shouldRestrictInferenceBrowser =
    !isSupportedDesktopChromeBrowser(capabilities);
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
  $: workflowCards = selectWorkflowCards({
    mode: "idle",
    activeQueueId: currentQueueId,
    pendingIntent: null,
    queue,
    nextQueueId,
  });
  $: exportableQueueIds = new Set(
    selectExportableQueueIds({
      mode: "idle",
      activeQueueId: currentQueueId,
      pendingIntent: null,
      queue,
      nextQueueId,
    }),
  );
  $: canPauseQueue =
    workflowState === WORKFLOW_STATES.PROCESSING_ACTIVE ||
    workflowState === WORKFLOW_STATES.PROCESSING_PAUSING;
  $: canResumeQueue = workflowState === WORKFLOW_STATES.PROCESSING_PAUSED;
  $: canCancelCurrent = processing && currentQueueId !== null;
  $: showPreservedGainMapNotice =
    !discardGainMap &&
    (currentProcessingPath === "preserved" ||
      lastCompletedProcessingPath === "preserved");
  $: queueControlVisibility = canPauseQueue
    ? "pause"
    : canResumeQueue
      ? "resume"
      : "hidden";
  $: failedQueueCount = queue.filter(
    (item) => item.status === QUEUE_ITEM_STATES.FAILED,
  ).length;
  $: showQueueOverflow =
    canCancelCurrent || failedQueueCount > 0 || queue.length > 0;
  $: selectionToggleState =
    exportableQueueIds.size === 0 || selectedQueueIds.size === 0
      ? "none"
      : selectedQueueIds.size === exportableQueueIds.size
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
  $: if (showStalePrompt && staleCount === 0) {
    showStalePrompt = false;
  }
  $: if (isDesktopLayout && openSheet === "settings") {
    openSheet = "none";
  }
  $: effectiveViewerDesktopChromeVisible =
    !isDesktopLayout || viewerDesktopChromeVisible;
  $: currentViewerCard =
    viewerOpen && viewerIndex >= 0 && viewerIndex < workflowCards.length
      ? workflowCards[viewerIndex]
      : null;
  $: viewerHasComparePreview = Boolean(currentViewerCard?.hasComparePreview);
  $: viewerPreviewKind = viewerHasComparePreview
    ? viewerCompareActive
      ? "source"
      : "compare"
    : "single";
  $: viewerImageSrc = viewerPreviewKind === "source"
    ? currentViewerCard?.sourcePreviewUrl
    : currentViewerCard?.comparePreviewUrl || currentViewerCard?.previewUrl || "";
  $: viewerImageAlt = currentViewerCard?.previewAlt || "";
  $: viewerIsZoomed = viewerZoomScale > 1;
  $: if (!viewerOpen) {
    viewerBounceDirection = "none";
  }
  $: if (viewerOpen && workflowCards.length === 0) {
    closeViewer();
  }
  $: if (viewerOpen && viewerIndex >= workflowCards.length && workflowCards.length > 0) {
    viewerIndex = workflowCards.length - 1;
  }
  $: if (
    isDesktopLayout &&
    viewerOpen &&
    workflowCards.length > 1 &&
    viewerIndex >= 0
  ) {
    void scrollViewerFilmstripToActive(viewerIndex);
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

  function isSupportedDesktopChromeBrowser(inputCapabilities) {
    const userAgent = String(inputCapabilities?.userAgent || "").toLowerCase();
    const isMobileOs = inputCapabilities?.isAndroid || inputCapabilities?.isIOS;
    const isDesktopPlatform =
      !isMobileOs &&
      !/android|iphone|ipad|ipod|mobile/.test(userAgent);
    const isChromeOrChromium =
      userAgent.includes("chromium") || userAgent.includes("chrome/");
    const isExcludedChromiumVariant =
      userAgent.includes("edg/") ||
      userAgent.includes("edgios") ||
      userAgent.includes("opr/") ||
      userAgent.includes("opera");

    return isDesktopPlatform && isChromeOrChromium && !isExcludedChromiumVariant;
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

  function snapshotProcessingPreferences() {
    return {
      backendPreference,
      gmnetCheckpointingPreference,
      maxContentBoostStops,
      quality,
      discardGainMap,
      stripExif,
      keepScreenAwake,
      rotation,
    };
  }

  function applyPreferencesToState(preferences = {}) {
    const normalized = normalizeProcessingPreferences(preferences);
    backendPreference = normalized.backendPreference;
    gmnetCheckpointingPreference = normalized.gmnetCheckpointingPreference;
    maxContentBoostStops = normalized.maxContentBoostStops;
    quality = normalized.quality;
    discardGainMap = normalized.discardGainMap;
    stripExif = normalized.stripExif;
    keepScreenAwake = normalized.keepScreenAwake;
    rotation = normalized.rotation;
  }

  function persistCurrentProcessingPreferences() {
    const normalized = saveProcessingPreferences(
      snapshotProcessingPreferences(),
    );
    applyPreferencesToState(normalized);
    return normalized;
  }

  function resolveForcedProviderFromPreference(preference = backendPreference) {
    const normalized = normalizeProcessingPreferences({
      ...DEFAULT_PROCESSING_PREFERENCES,
      backendPreference: preference,
    }).backendPreference;
    if (normalized === "auto") {
      return null;
    }
    return normalized;
  }

  function shouldShowWebGlBackendOption() {
    return !isChromiumRuntime(globalThis);
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
    const isInferenceStage = event?.stage === "generate-gain-map";
    const stageImpliesGenerated =
      event?.stage === "constrain-sdr-image" ||
      event?.stage === "prepare-gmnet-input" ||
      event?.stage === "generate-gain-map";
    const processingPath = normalizeProcessingPath(event?.processingPath);
    const executionProvider = resolveExecutionProviderFromEvent(event);
    if (!isInferenceStage) {
      pipelineExecutionProvider = null;
    } else if (executionProvider) {
      pipelineExecutionProvider = executionProvider;
    } else if (!pipelineExecutionProvider) {
      pipelineExecutionProvider = normalizeExecutionProvider(
        runtimeExecutionProvider,
      );
    }

    if (phase === "pipeline-start") {
      currentProcessingPath = "unknown";
    }
    if (processingPath !== "unknown") {
      currentProcessingPath = processingPath;
      if (queueId !== null && queueId !== undefined) {
        processingPathByQueueId = new Map(processingPathByQueueId).set(
          queueId,
          processingPath,
        );
        updateQueueItem(queueId, {
          processingPath,
        });
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
        updateQueueItem(queueId, {
          processingPath: "generated",
        });
      }
      if (backendRestartAwaitingPathDecision) {
        backendRestartAwaitingPathDecision = false;
        backendRestartPending = true;
        abortActiveProcessing();
      }
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

    if (isInferenceStage) {
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

    if (queueId !== null && queueId !== undefined) {
      if (phase === "stage-progress") {
        updateQueueItem(queueId, {
          status: QUEUE_ITEM_STATES.PROCESSING,
          progress: {
            stage: String(event?.stage || "pipeline"),
            label: String(event?.note || pipelineStatusLabel || "Processing"),
            percent: Math.round(clampPercent(event?.stageProgress)),
            visible: true,
          },
        });
      } else if (
        phase === "pipeline-complete" ||
        phase === "pipeline-error" ||
        phase === "stage-error"
      ) {
        updateQueueItem(queueId, {
          progress: null,
        });
      }
    }
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

  function openQueueSheet() {
    openSheet = "queue";
  }

  function closeSheet() {
    openSheet = "none";
  }

  function clearViewerBounceTimeout() {
    if (viewerBounceTimeout !== null) {
      clearTimeout(viewerBounceTimeout);
      viewerBounceTimeout = null;
    }
  }

  function triggerViewerBounce(direction) {
    viewerBounceDirection = direction;
    clearViewerBounceTimeout();
    viewerBounceTimeout = setTimeout(() => {
      viewerBounceDirection = "none";
      viewerBounceTimeout = null;
    }, VIEWER_BOUNCE_RESET_MS);
  }

  function resetViewerTransform() {
    viewerZoomScale = 1;
    viewerPanX = 0;
    viewerPanY = 0;
    viewerDragActive = false;
    viewerDragStartX = 0;
    viewerDragStartY = 0;
    viewerLastTapTime = 0;
    viewerLastTapX = 0;
    viewerLastTapY = 0;
    viewerPinchStartDistance = null;
    viewerPinchStartScale = 1;
  }

  function clearViewerDesktopChromeTimeout() {
    if (viewerDesktopChromeTimeout !== null) {
      clearTimeout(viewerDesktopChromeTimeout);
      viewerDesktopChromeTimeout = null;
    }
  }

  function scheduleViewerDesktopChromeHide() {
    if (!isDesktopLayout) return;
    clearViewerDesktopChromeTimeout();
    viewerDesktopChromeTimeout = setTimeout(() => {
      viewerDesktopChromeVisible = false;
      viewerDesktopChromeTimeout = null;
    }, VIEWER_DESKTOP_CHROME_IDLE_MS);
  }

  function resetViewerEphemeralState() {
    resetViewerTransform();
    viewerCompareActive = false;
    viewerDesktopChromeVisible = false;
    clearViewerDesktopChromeTimeout();
    viewerLastTapTime = 0;
    viewerLastTapX = 0;
    viewerLastTapY = 0;
    viewerPinchStartDistance = null;
    viewerPinchStartScale = 1;
    viewerTouchStartX = null;
    viewerTouchStartY = null;
    viewerTouchCurrentX = null;
    viewerTouchCurrentY = null;
  }

  function getViewerPanBounds(scale = viewerZoomScale) {
    const width = typeof window !== "undefined" ? window.innerWidth || 0 : 0;
    const height = typeof window !== "undefined" ? window.innerHeight || 0 : 0;
    return {
      maxX: Math.max(0, ((width * scale) - width) / 2),
      maxY: Math.max(0, ((height * scale) - height) / 2),
    };
  }

  function clampViewerPan(x, y, scale = viewerZoomScale) {
    const bounds = getViewerPanBounds(scale);
    return {
      x: Math.max(-bounds.maxX, Math.min(bounds.maxX, x)),
      y: Math.max(-bounds.maxY, Math.min(bounds.maxY, y)),
    };
  }

  function setViewerPan(x, y) {
    const next = clampViewerPan(x, y);
    viewerPanX = next.x;
    viewerPanY = next.y;
  }

  function setViewerZoomScale(nextScale) {
    const boundedScale = Math.max(
      VIEWER_MIN_ZOOM_SCALE,
      Math.min(VIEWER_MAX_ZOOM_SCALE, nextScale),
    );
    viewerZoomScale = boundedScale > 1 ? boundedScale : 1;
    if (viewerZoomScale === 1) {
      viewerPanX = 0;
      viewerPanY = 0;
      viewerDragActive = false;
    } else {
      setViewerPan(viewerPanX, viewerPanY);
    }
  }

  function toggleViewerZoom() {
    setViewerZoomScale(viewerIsZoomed ? 1 : VIEWER_ZOOM_SCALE);
  }

  function getTouchDistance(touches) {
    if (!touches || touches.length < 2) return null;
    const [firstTouch, secondTouch] = touches;
    const deltaX = secondTouch.clientX - firstTouch.clientX;
    const deltaY = secondTouch.clientY - firstTouch.clientY;
    return Math.hypot(deltaX, deltaY);
  }

  function isDoubleTap(clientX, clientY) {
    const now = Date.now();
    const deltaTime = now - viewerLastTapTime;
    const deltaX = clientX - viewerLastTapX;
    const deltaY = clientY - viewerLastTapY;
    const isNearby =
      Math.hypot(deltaX, deltaY) <= VIEWER_DOUBLE_TAP_DISTANCE_PX;
    viewerLastTapTime = now;
    viewerLastTapX = clientX;
    viewerLastTapY = clientY;
    return deltaTime >= 0 && deltaTime <= VIEWER_DOUBLE_TAP_DELAY_MS && isNearby;
  }

  function beginViewerDrag(clientX, clientY) {
    if (!viewerIsZoomed) return;
    viewerDragActive = true;
    viewerDragStartX = clientX - viewerPanX;
    viewerDragStartY = clientY - viewerPanY;
  }

  function updateViewerDrag(clientX, clientY) {
    if (!viewerDragActive) return;
    setViewerPan(clientX - viewerDragStartX, clientY - viewerDragStartY);
  }

  function endViewerDrag() {
    viewerDragActive = false;
  }

  function activateViewerCompare() {
    if (!viewerHasComparePreview) return;
    viewerCompareActive = true;
  }

  function deactivateViewerCompare() {
    viewerCompareActive = false;
  }

  function openViewer(index) {
    if (!Number.isInteger(index) || !workflowCards[index]) return;
    viewerIndex = index;
    viewerOpen = true;
    viewerBounceDirection = "none";
    resetViewerEphemeralState();
  }

  function closeViewer() {
    viewerOpen = false;
    viewerIndex = -1;
    viewerBounceDirection = "none";
    clearViewerBounceTimeout();
    resetViewerEphemeralState();
  }

  function showPreviousInViewer() {
    if (!viewerOpen) return;
    if (viewerIndex <= 0) {
      triggerViewerBounce("left");
      return;
    }
    viewerIndex -= 1;
    viewerBounceDirection = "none";
    resetViewerEphemeralState();
  }

  function showNextInViewer() {
    if (!viewerOpen) return;
    if (viewerIndex >= workflowCards.length - 1) {
      triggerViewerBounce("right");
      return;
    }
    viewerIndex += 1;
    viewerBounceDirection = "none";
    resetViewerEphemeralState();
  }

  function showViewerIndex(index) {
    if (!viewerOpen) return;
    if (!Number.isInteger(index) || !workflowCards[index]) return;
    if (index === viewerIndex) return;
    viewerIndex = index;
    viewerBounceDirection = "none";
    resetViewerEphemeralState();
  }

  async function scrollViewerFilmstripToActive(index) {
    await tick();
    if (!viewerFilmstripElement) return;
    const activeItem = viewerFilmstripElement.querySelector(
      `[data-testid="photo-viewer-filmstrip-item-${index}"]`,
    );
    if (!(activeItem instanceof HTMLElement)) return;
    const scrollIntoViewFn =
      typeof activeItem.scrollIntoView === "function"
        ? activeItem.scrollIntoView
        : typeof Element !== "undefined" &&
            typeof Element.prototype.scrollIntoView === "function"
          ? Element.prototype.scrollIntoView
          : null;
    if (!scrollIntoViewFn) return;
    scrollIntoViewFn.call(activeItem, {
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }

  function handleViewerTouchStart(event) {
    const touches = event?.touches;
    if (!touches?.length) return;
    if (touches.length >= 2) {
      const distance = getTouchDistance(touches);
      if (distance !== null) {
        viewerPinchStartDistance = distance;
        viewerPinchStartScale = viewerZoomScale;
      }
      viewerDragActive = false;
      viewerTouchStartX = null;
      viewerTouchStartY = null;
      viewerTouchCurrentX = null;
      viewerTouchCurrentY = null;
      return;
    }
    const touch = touches[0];
    if (isDoubleTap(touch.clientX, touch.clientY)) {
      toggleViewerZoom();
      viewerTouchStartX = null;
      viewerTouchStartY = null;
      viewerTouchCurrentX = null;
      viewerTouchCurrentY = null;
      return;
    }
    if (viewerIsZoomed) {
      beginViewerDrag(touch.clientX, touch.clientY);
      return;
    }
    viewerTouchStartX = touch.clientX;
    viewerTouchStartY = touch.clientY;
    viewerTouchCurrentX = touch.clientX;
    viewerTouchCurrentY = touch.clientY;
  }

  function handleViewerTouchMove(event) {
    const touches = event?.touches;
    if (!touches?.length) return;
    if (touches.length >= 2) {
      const distance = getTouchDistance(touches);
      if (distance !== null && viewerPinchStartDistance !== null) {
        const pinchScale =
          viewerPinchStartScale * (distance / viewerPinchStartDistance);
        setViewerZoomScale(pinchScale);
      }
      return;
    }
    const touch = touches[0];
    if (viewerDragActive) {
      updateViewerDrag(touch.clientX, touch.clientY);
      return;
    }
    viewerTouchCurrentX = touch.clientX;
    viewerTouchCurrentY = touch.clientY;
  }

  function handleViewerTouchEnd(event) {
    if (viewerPinchStartDistance !== null) {
      viewerPinchStartDistance = null;
      viewerPinchStartScale = viewerZoomScale;
      if (!event?.touches?.length) {
        endViewerDrag();
      }
      return;
    }
    if (viewerDragActive) {
      endViewerDrag();
      return;
    }
    if (viewerTouchStartX === null || viewerTouchStartY === null) return;
    const touch = event?.changedTouches?.[0];
    const endX = touch?.clientX ?? viewerTouchCurrentX ?? viewerTouchStartX;
    const endY = touch?.clientY ?? viewerTouchCurrentY ?? viewerTouchStartY;
    const deltaX = endX - viewerTouchStartX;
    const deltaY = endY - viewerTouchStartY;

    viewerTouchStartX = null;
    viewerTouchStartY = null;
    viewerTouchCurrentX = null;
    viewerTouchCurrentY = null;

    if (Math.abs(deltaX) < VIEWER_SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (Math.abs(deltaY) > VIEWER_VERTICAL_GUARD_PX) return;

    if (deltaX > 0) {
      showPreviousInViewer();
      return;
    }
    showNextInViewer();
  }

  function handleViewerMouseDown(event) {
    if (!viewerIsZoomed) return;
    beginViewerDrag(event.clientX, event.clientY);
  }

  function handleViewerMouseMove(event) {
    if (isDesktopLayout) {
      viewerDesktopChromeVisible = true;
      scheduleViewerDesktopChromeHide();
    }
    if (!viewerDragActive) return;
    updateViewerDrag(event.clientX, event.clientY);
  }

  function handleViewerMouseUp() {
    endViewerDrag();
  }

  function handleViewerMouseLeave() {
    handleViewerMouseUp();
    if (isDesktopLayout) {
      clearViewerDesktopChromeTimeout();
      viewerDesktopChromeVisible = false;
    }
  }

  function handleViewerChromeFocusIn() {
    if (!isDesktopLayout) return;
    viewerDesktopChromeVisible = true;
    scheduleViewerDesktopChromeHide();
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

  function buildProcessingOptions(abortSignal, fileIndex, totalFiles, queueId) {
    const options = {
      maxContentBoost: convertStopsToMaxContentBoost(maxContentBoostStops),
      rotation,
      quality,
      discardGainMap,
      stripExif,
      gmnetModelVariant: "realworld",
      gmnetCheckpointing: resolveCheckpointingForRun(
        gmnetCheckpointingPreference,
        globalThis,
      ),
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
      file: null,
      name: file.name,
      status: QUEUE_ITEM_STATES.QUEUED,
      settingsVersion: settingsVersion,
      error: null,
      processingPath: "unknown",
      inputPreviewUrl: URL.createObjectURL(file),
      outputPreviewUrl: null,
      result: null,
      progress: null,
    }));
  }

  function summarizeQueueRestore(resumedCount, missingCount) {
    const parts = [];
    if (resumedCount > 0) {
      parts.push(`Resumed ${resumedCount}`);
    }
    if (missingCount > 0) {
      parts.push(`${missingCount} missing`);
    }
    return parts.join(" • ");
  }

  function inferWorkflowStateFromQueue(items) {
    if (!items.length) {
      return WORKFLOW_STATES.EMPTY;
    }
    if (
      items.some(
        (item) =>
          item.status === QUEUE_ITEM_STATES.QUEUED ||
          item.status === QUEUE_ITEM_STATES.PROCESSING,
      )
    ) {
      return WORKFLOW_STATES.QUEUE_READY;
    }
    if (items.some((item) => item.status === QUEUE_ITEM_STATES.FAILED)) {
      return WORKFLOW_STATES.ERROR_RECOVERABLE;
    }
    if (
      items.some(
        (item) =>
          item.status === QUEUE_ITEM_STATES.COMPLETED ||
          item.status === QUEUE_ITEM_STATES.STALE,
      )
    ) {
      return WORKFLOW_STATES.PROCESSING_DONE;
    }
    return WORKFLOW_STATES.EMPTY;
  }

  function createResultRecordFromQueueItem(queueItem, outputUrl, blobSize) {
    return {
      originalName: queueItem.name,
      url: outputUrl,
      size: blobSize,
      index: queueItem.id,
      queueId: queueItem.id,
      settingsVersion: queueItem.settingsVersion,
      rotation,
      processingPath: queueItem.processingPath,
    };
  }

  async function restoreQueueFromSnapshot(snapshot) {
    const restoredQueue = [];
    const restoredResults = [];
    let resumedCount = 0;
    let missingCount = 0;

    for (const item of snapshot.queue) {
      const storedInput = await getQueueInputFile(item.id);
      const storedPreview = await getQueuePreviewBlob(item.id);
      const storedOutput =
        item.status === QUEUE_ITEM_STATES.COMPLETED ||
        item.status === QUEUE_ITEM_STATES.STALE
          ? await getQueueOutputBlob(item.id)
          : null;
      const isPendingItem =
        item.status === QUEUE_ITEM_STATES.QUEUED ||
        item.status === QUEUE_ITEM_STATES.PROCESSING;

      const previewSource = storedPreview || storedInput || storedOutput;
      if (isPendingItem && !storedInput) {
        missingCount += 1;
        restoredQueue.push({
          id: item.id,
          file: null,
          name: item.name,
          status: QUEUE_ITEM_STATES.FAILED,
          settingsVersion: item.settingsVersion,
          error: "Restore failed: input missing",
          processingPath: item.processingPath,
          inputPreviewUrl: previewSource ? URL.createObjectURL(previewSource) : "",
          outputPreviewUrl: null,
          result: null,
          progress: null,
        });
        continue;
      }

      const inputPreviewUrl = previewSource ? URL.createObjectURL(previewSource) : "";
      const outputPreviewUrl = storedOutput ? URL.createObjectURL(storedOutput) : null;
      const normalizedStatus =
        item.status === QUEUE_ITEM_STATES.PROCESSING
          ? QUEUE_ITEM_STATES.QUEUED
          : item.status;
      const restoredQueueItem = {
        id: item.id,
        file: null,
        name: item.name,
        status: normalizedStatus,
        settingsVersion: item.settingsVersion,
        error: item.error,
        processingPath: item.processingPath,
        inputPreviewUrl,
        outputPreviewUrl,
        result: storedOutput
          ? {
              outputUrl: outputPreviewUrl,
              size: storedOutput.size,
              persisted: true,
            }
          : null,
        progress: null,
      };

      if (normalizedStatus === QUEUE_ITEM_STATES.QUEUED) {
        resumedCount += 1;
      }

      if (storedOutput && outputPreviewUrl) {
        restoredResults.push(
          createResultRecordFromQueueItem(
            restoredQueueItem,
            outputPreviewUrl,
            storedOutput.size,
          ),
        );
      }

      restoredQueue.push(restoredQueueItem);
    }

    return {
      queue: restoredQueue,
      results: restoredResults,
      resumedCount,
      missingCount,
    };
  }

  async function createPreviewBlob(file) {
    try {
      const maxDimension = 256;
      const { imageData } = await loadImageData(file);
      const sourceWidth = imageData.width || 1;
      const sourceHeight = imageData.height || 1;
      const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
      const previewWidth = Math.max(1, Math.round(sourceWidth * scale));
      const previewHeight = Math.max(1, Math.round(sourceHeight * scale));
      const resized = await resizeImageData(imageData, previewWidth, previewHeight);
      return await imageDataToJpegBlob(resized, 0.7);
    } catch {
      return file;
    }
  }

  async function ensureStorageCapacity(requiredBytes) {
    const decision = await shouldPauseForStorageWrite(requiredBytes);
    if (!decision?.pause) {
      return true;
    }

    processing = false;
    pauseRequested = true;
    workflowState = WORKFLOW_STATES.PROCESSING_PAUSED;
    setNotice(
      "Storage is too full to continue. Export or remove results before resuming.",
    );
    return false;
  }

  async function persistFileBackedQueueItem(file) {
    if (!(await ensureStorageCapacity(file?.size || 0))) {
      return null;
    }

    const queueItem = createQueueItems([file])[0];
    await storeQueueInputFile(queueItem.id, file);
    const previewBlob = await createPreviewBlob(file);
    await storeQueuePreviewBlob(queueItem.id, previewBlob);

    if (queueItem.inputPreviewUrl) {
      URL.revokeObjectURL(queueItem.inputPreviewUrl);
    }
    queueItem.inputPreviewUrl = URL.createObjectURL(previewBlob);
    return queueItem;
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

  function queueNonUrgentTask(task) {
    const runtime = globalThis;
    if (typeof runtime?.scheduler?.postTask === "function") {
      return runtime.scheduler
        .postTask(task, { priority: "background" })
        .catch(() => task());
    }
    if (typeof runtime?.requestIdleCallback === "function") {
      return new Promise((resolve) => {
        runtime.requestIdleCallback(
          () => {
            Promise.resolve(task()).finally(resolve);
          },
          { timeout: 500 },
        );
      });
    }
    return Promise.resolve().then(task);
  }

  function schedulePersistQueueState(options = {}) {
    if (options?.urgent) {
      void persistQueueStateSnapshot();
      return;
    }
    if (persistTaskPending) {
      return;
    }
    persistTaskPending = true;
    void queueNonUrgentTask(async () => {
      persistTaskPending = false;
      await persistQueueStateSnapshot();
    });
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
    outputUrl,
    blobSize,
    appliedSettingsVersion,
    appliedRotation,
    processingPath = "unknown",
  ) {
    const resultRecord = {
      originalName: queueItem.name,
      url: outputUrl,
      size: blobSize,
      index: queueItem.id,
      queueId: queueItem.id,
      settingsVersion: appliedSettingsVersion,
      rotation: appliedRotation,
      processingPath,
    };

    const existingIndex = results.findIndex(
      (result) => result.queueId === queueItem.id,
    );
    const nextSelection = new Set(selectedQueueIds);
    if (existingIndex >= 0) {
      URL.revokeObjectURL(results[existingIndex].url);
      results = results.map((result, index) =>
        index === existingIndex ? resultRecord : result,
      );
      nextSelection.add(queueItem.id);
    } else {
      results = [...results, resultRecord];
      nextSelection.add(queueItem.id);
    }
    selectedQueueIds = nextSelection;
    updateQueueItem(queueItem.id, {
      outputPreviewUrl: outputUrl,
      result: {
        outputUrl,
        size: blobSize,
        persisted: true,
      },
      progress: null,
    });
  }

  async function persistOutputForQueueItem(
    queueItem,
    blob,
    appliedSettingsVersion,
    appliedRotation,
    processingPath = "unknown",
  ) {
    if (!(await ensureStorageCapacity(blob?.size || 0))) {
      throw new Error(
        "Storage is too full to continue. Export or remove results before resuming.",
      );
    }

    await storeQueueOutputBlob(queueItem.id, blob);
    const outputUrl = URL.createObjectURL(blob);
    upsertResult(
      queueItem,
      outputUrl,
      blob.size,
      appliedSettingsVersion,
      appliedRotation,
      processingPath,
    );
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
    let queueLockAcquired = false;

    try {
      queueLockAcquired = await acquireProcessingLock();
      if (!queueLockAcquired) {
        processing = false;
        pauseRequested = false;
        setNotice(
          "Processing is already active in another tab. Return to that tab or pause it first.",
        );
        return;
      }

      await acquireWakeLockIfNeeded();

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
          const activeInput = await getQueueInputFile(nextItem.id);
          if (!activeInput) {
            throw new Error("Queued input is unavailable in storage.");
          }

          const blob = await runtime.process(
            activeInput,
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
          await persistOutputForQueueItem(
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
      if (queueLockAcquired) {
        await releaseProcessingLock();
      }
      queueLoopActive = false;
    }
  }

  async function initializeQueueFromFiles(initialFiles) {
    const normalizedFiles = Array.from(initialFiles || []).filter(
      (file) => file instanceof File,
    );
    if (normalizedFiles.length === 0) {
      workflowState = WORKFLOW_STATES.EMPTY;
      return;
    }

    const persistedItems = (
      await Promise.all(
        normalizedFiles.map((file) => persistFileBackedQueueItem(file)),
      )
    ).filter(Boolean);
    if (persistedItems.length === 0) {
      return;
    }

    queue = persistedItems;
    files = [];
    setWorkflow(WORKFLOW_EVENTS.FILES_ADDED);
    startQueue();
  }

  async function initializeQueueFromPersistedState(rawSnapshot) {
    const snapshot = normalizePersistedQueueState(rawSnapshot);
    if (!snapshot) {
      return false;
    }

    const restored = await restoreQueueFromSnapshot(snapshot);
    if (restored.queue.length === 0) {
      await clearQueueState();
      return false;
    }

    queue = restored.queue;
    results = restored.results;
    selectedQueueIds = new Set(
      restored.results.map((result) => result.queueId),
    );
    nextQueueId = restored.queue.reduce(
      (maxId, item) => Math.max(maxId, item.id + 1),
      0,
    );
    settingsVersion = Math.max(snapshot.settingsVersion, settingsVersion);
    workflowState = inferWorkflowStateFromQueue(restored.queue);
    queueRestoreNotice = summarizeQueueRestore(
      restored.resumedCount,
      restored.missingCount,
    );

    if (restored.resumedCount > 0) {
      startQueue();
    } else {
      schedulePersistQueueState({ urgent: true });
    }

    return true;
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
    persistCurrentProcessingPreferences();
  }

  function applyBackendPreferenceChange(nextPreference) {
    const normalizedPreference = normalizeProcessingPreferences({
      ...snapshotProcessingPreferences(),
      backendPreference: nextPreference,
    }).backendPreference;
    if (normalizedPreference === backendPreference) {
      return;
    }
    backendPreference = normalizedPreference;
    persistCurrentProcessingPreferences();
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

  function handleGmnetCheckpointingPreferenceChange(event) {
    const normalizedPreference = normalizeProcessingPreferences({
      ...snapshotProcessingPreferences(),
      gmnetCheckpointingPreference: event?.target?.value,
    }).gmnetCheckpointingPreference;
    if (normalizedPreference === gmnetCheckpointingPreference) {
      return;
    }
    gmnetCheckpointingPreference = normalizedPreference;
    handleSettingChange();
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
    closeSheet();
  }

  function selectedStaleQueueIds() {
    const ids = new Set();
    selectedQueueIds.forEach((queueId) => {
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

  function retryFailedQueueItems() {
    const failedIds = new Set(
      queue
        .filter((item) => item.status === QUEUE_ITEM_STATES.FAILED)
        .map((item) => item.id),
    );
    if (requeueByIds(failedIds)) {
      closeSheet();
      startQueue();
    }
  }

  async function enqueueFiles(fileList) {
    const newFiles = Array.from(fileList || []).filter(
      (file) => file instanceof File,
    );
    if (newFiles.length === 0) return false;

    const addedItems = (
      await Promise.all(newFiles.map((file) => persistFileBackedQueueItem(file)))
    ).filter(Boolean);
    if (addedItems.length === 0) {
      return false;
    }

    queue = [...queue, ...addedItems];
    files = [];

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

    return true;
  }

  function isMobileInferenceAcknowledgementValid(value) {
    return (
      typeof value === "string" &&
      value.trim().toLowerCase() ===
        MOBILE_INFERENCE_ACKNOWLEDGEMENT.toLowerCase()
    );
  }

  function closeMobileInferenceWarning() {
    mobileInferenceWarningOpen = false;
    mobileInferenceChallengeValue = "";
  }

  function cancelMobileInferenceWarning() {
    pendingMobileInferenceFiles = [];
    closeMobileInferenceWarning();
  }

  async function proceedWithMobileInferenceWarning() {
    if (!isMobileInferenceAcknowledgementValid(mobileInferenceChallengeValue)) {
      return;
    }
    const pendingFiles = pendingMobileInferenceFiles;
    pendingMobileInferenceFiles = [];
    mobileInferenceAcknowledgedForSession = true;
    closeMobileInferenceWarning();
    await enqueueFiles(pendingFiles);
  }

  async function classifyInputProcessingPathForGate(file) {
    const headerProbeClassification =
      await probeInputProcessingPathFromHeaders(file);
    if (headerProbeClassification !== "unknown") {
      return headerProbeClassification;
    }
    return classifyInputProcessingPath(file);
  }

  async function gateAndEnqueueFiles(fileList) {
    const newFiles = Array.from(fileList || []).filter(
      (file) => file instanceof File,
    );
    if (newFiles.length === 0) return false;

    if (!shouldRestrictInferenceBrowser || mobileInferenceAcknowledgedForSession) {
      return enqueueFiles(newFiles);
    }

    const classifications = await Promise.all(
      newFiles.map((file) => classifyInputProcessingPathForGate(file)),
    );
    const safeFiles = [];
    const unsafeFiles = [];

    classifications.forEach((classification, index) => {
      const file = newFiles[index];
      if (classification === "preserved") {
        safeFiles.push(file);
      } else {
        unsafeFiles.push(file);
      }
    });

    if (safeFiles.length > 0) {
      await enqueueFiles(safeFiles);
    }

    if (unsafeFiles.length > 0) {
      pendingMobileInferenceFiles = [
        ...pendingMobileInferenceFiles,
        ...unsafeFiles,
      ];
      mobileInferenceWarningOpen = true;
      mobileInferenceChallengeValue = "";
    }

    return safeFiles.length > 0 || unsafeFiles.length > 0;
  }

  async function handleAddFiles(event) {
    await gateAndEnqueueFiles(event?.target?.files);
    if (event?.target) {
      event.target.value = "";
    }
  }

  async function handleDropZoneFiles(event) {
    await gateAndEnqueueFiles(event?.detail);
  }

  function toggleSelection(queueId) {
    if (!exportableQueueIds.has(queueId)) {
      return;
    }
    if (selectedQueueIds.has(queueId)) {
      selectedQueueIds.delete(queueId);
    } else {
      selectedQueueIds.add(queueId);
    }
    selectedQueueIds = selectedQueueIds;
  }

  function selectAll() {
    exportableQueueIds.forEach((queueId) => selectedQueueIds.add(queueId));
    selectedQueueIds = selectedQueueIds;
  }

  function deselectAll() {
    selectedQueueIds.clear();
    selectedQueueIds = selectedQueueIds;
  }

  async function download(result) {
    const blob = await getQueueOutputBlob(result.queueId);
    if (!blob) {
      setNotice("Stored output is unavailable. Reprocess the image to export it.");
      return;
    }
    const a = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    a.href = downloadUrl;
    a.download = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  }

  async function downloadSelected(asZip = false) {
    const selectedResults = getSelectedResults(results, selectedQueueIds);
    if (selectedResults.length === 0) return;

    if (selectedResults.length === 1) {
      await download(selectedResults[0]);
      closeSheet();
      return;
    }

    if (!asZip) {
      await Promise.all(selectedResults.map((result) => download(result)));
      closeSheet();
      return;
    }

    const loadedResults = await loadSelectedResultBlobs(results, selectedQueueIds, {
      loadResultBlob: getQueueOutputBlob,
    });
    const zip = new JSZip();
    for (const { result, blob } of loadedResults) {
      const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
      zip.file(filename, blob);
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
    const selectedResults = getSelectedResults(results, selectedQueueIds);
    if (selectedResults.length === 0) return;

    try {
      const filesToShare = await buildShareFilesFromStorage(
        results,
        selectedQueueIds,
        {
          loadResultBlob: getQueueOutputBlob,
        },
      );

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
        const loadedResults = await loadSelectedResultBlobs(
          results,
          selectedQueueIds,
          {
            loadResultBlob: getQueueOutputBlob,
          },
        );
        const zip = new JSZip();
        for (const { result, blob } of loadedResults) {
          const filename = `ultrahdr-${result.originalName.replace(/\.[^/.]+$/, "")}.jpg`;
          zip.file(filename, blob);
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
    closeViewer();
    selectedQueueIds = new Set();
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
    maxContentBoostStops = DEFAULT_MAX_CONTENT_BOOST_STOPS;
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
    await clearSessionQueuePayloads();
    dispatch("reset");
  }

  function removeImage(queueId) {
    const removed = results.find((result) => result.queueId === queueId);
    const cardIndex = workflowCards.findIndex((card) => card.queueId === queueId);
    if (removed?.url) URL.revokeObjectURL(removed.url);

    if (viewerOpen) {
      if (workflowCards.length <= 1) {
        closeViewer();
      } else if (cardIndex === viewerIndex) {
        viewerIndex = Math.min(viewerIndex, workflowCards.length - 2);
      } else if (cardIndex >= 0 && cardIndex < viewerIndex) {
        viewerIndex -= 1;
      }
    }

    if (queueId !== undefined) {
      const queueItem = queue.find((item) => item.id === queueId);
      if (queueItem?.inputPreviewUrl) {
        URL.revokeObjectURL(queueItem.inputPreviewUrl);
      }
      if (queueItem?.outputPreviewUrl) {
        URL.revokeObjectURL(queueItem.outputPreviewUrl);
      }
      queue = queue.filter((item) => item.id !== queueId);
      files = [];
      schedulePersistQueueState();
      void deleteQueuePayloads(queueId);
    }

    results = results.filter((result) => result.queueId !== queueId);

    if (queueId !== undefined && queueId !== null) {
      selectedQueueIds.delete(queueId);
      selectedQueueIds = selectedQueueIds;
    }

    if (queue.length === 0) {
      void reset(false);
    }
  }

  onMount(() => {
    let mediaQuery = null;
    let handleMediaChange = null;
    applyPreferencesToState(loadProcessingPreferences(globalThis));

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
        if (
          !document.hidden &&
          (workflowState === WORKFLOW_STATES.PROCESSING_ACTIVE ||
            workflowState === WORKFLOW_STATES.PROCESSING_PAUSING)
        ) {
          void acquireWakeLockIfNeeded();
        }
      }
    };

    const handlePageHide = () => {
      void persistQueueStateSnapshot();
    };

    const handleWindowKeyDown = (event) => {
      if (!viewerOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousInViewer();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextInViewer();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", handlePageHide);
      window.addEventListener("keydown", handleWindowKeyDown);
    }

    void (async () => {
      try {
        const persistedQueue = await loadQueueState();
        const restored = await initializeQueueFromPersistedState(persistedQueue);
        if (!restored) {
          queueRestoreNotice = null;
        }
      } catch (e) {
        console.warn("[UI] Failed to load persisted queue state:", e);
      }

      if (queue.length === 0) {
        await initializeQueueFromFiles(files);
      } else if (Array.isArray(files) && files.length > 0) {
        await enqueueFiles(files);
      }
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
      if (typeof window !== "undefined") {
        window.removeEventListener("pagehide", handlePageHide);
        window.removeEventListener("keydown", handleWindowKeyDown);
      }

      clearViewerBounceTimeout();

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
        <div
          class="controls card panel convert-panel"
          id="panel-convert"
          aria-label="Convert controls"
        >
          <div class="control-group" data-testid="quick-controls">
            <label for="boost">HDR Strength (Max Content Boost Stops)</label>
            <div class="range-wrapper">
              <input
                type="range"
                id="boost"
                min={MAX_CONTENT_BOOST_STOPS_RANGE.min}
                max={MAX_CONTENT_BOOST_STOPS_RANGE.max}
                step={MAX_CONTENT_BOOST_STOPS_RANGE.step}
                bind:value={maxContentBoostStops}
                on:input={(event) => {
                  maxContentBoostStops = clampMaxContentBoostStops(event?.target?.value);
                  handleSettingChange();
                }}
              />
              <span class="value">{maxContentBoostStops.toFixed(1)} stops</span>
            </div>
            {#if showPreservedGainMapNotice}
              <p class="hint preserved-gainmap-note">
                Preserved gain maps keep their source metadata. HDR strength only
                applies when generating a new gain map or after discarding the
                imported gain map.
              </p>
            {/if}
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

          <div class="actions compact-actions">
            <input
              type="file"
              id="add-files"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,.heic,.heif,.hif,.tif,.tiff"
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
                {queueControlVisibility === "pause" ? "Pause" : "Resume"}
              </button>
            {/if}
            {#if showQueueOverflow}
              <button
                class="secondary"
                type="button"
                data-testid="queue-overflow-trigger"
                aria-label="Open queue actions"
                on:click={openQueueSheet}
              >
                More
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

                {#if typeof latestPipelineEvent?.gmnetMemoryMode === "string"}
                  <p class="help-text" data-testid="pipeline-memory-mode">
                    Memory mode: {latestPipelineEvent.gmnetMemoryMode}
                  </p>
                {/if}

                {#if Number.isFinite(latestPipelineEvent?.gmnetCheckpointTilesCompleted) && Number.isFinite(latestPipelineEvent?.gmnetCheckpointTilesTotal)}
                  <p
                    class="help-text"
                    data-testid="pipeline-checkpoint-progress"
                  >
                    Checkpoint progress: {Math.max(
                      0,
                      Math.floor(
                        Number(
                          latestPipelineEvent.gmnetCheckpointTilesCompleted,
                        ),
                      ),
                    )}/{Math.max(
                      0,
                      Math.floor(
                        Number(latestPipelineEvent.gmnetCheckpointTilesTotal),
                      ),
                    )}
                  </p>
                {/if}

                {#if latestPipelineEvent?.gmnetCheckpointResumed === true}
                  <p
                    class="help-text"
                    data-testid="pipeline-checkpoint-resumed"
                  >
                    Resumed from checkpoint
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
                <button class="primary small" on:click={reprocessSelectedStale}
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
        <div
          class="controls card panel settings-panel"
          id="panel-settings"
          aria-label="Processing settings"
        >
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
                  <input
                    type="checkbox"
                    bind:checked={keepScreenAwake}
                    on:change={handleSettingChange}
                  />
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
                  {#if shouldShowWebGlBackendOption()}
                    <option value="webgl">WebGL</option>
                  {/if}
                  <option value="wasm">WASM</option>
                </select>
              </div>
            </div>

            <div class="control-group horizontal">
              <label for="gmnet-memory-mode-select">GMNet Memory Mode</label>
              <div class="select-wrapper">
                <select
                  id="gmnet-memory-mode-select"
                  value={gmnetCheckpointingPreference}
                  on:change={handleGmnetCheckpointingPreferenceChange}
                  data-testid="gmnet-memory-mode-select"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="force">Force checkpointing</option>
                  <option value="off">In-memory only</option>
                </select>
              </div>
            </div>

            <OfflineReadinessCard
              state={pwaUpdateState}
              onValidate={onValidateOfflineReadiness}
              onRepair={onRepairOfflineReadiness}
            />
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
          data-testid="results-container"
          id="panel-results"
        >
          {#if workflowCards.length > 0}
            <div class="results">
              <div class="results-header">
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
                      Clear
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
                      Export ({selectedQueueIds.size})
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
                        on:click={reprocessSelectedStale}
                      >
                        Reprocess
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}

              <div class="grid" data-testid="results-grid">
                {#each workflowCards as card, i}
                  <div
                    class="result-card card"
                    data-testid={`workflow-card-${i}`}
                    class:selected={selectedQueueIds.has(card.queueId)}
                    class:pending={card.status === QUEUE_ITEM_STATES.QUEUED ||
                      card.status === QUEUE_ITEM_STATES.PROCESSING}
                    class:stale={card.status === QUEUE_ITEM_STATES.STALE}
                    class:failed={card.status === QUEUE_ITEM_STATES.FAILED}
                  >
                    {#if card.isSelectable}
                      <div class="selection-indicator">
                        <button
                          type="button"
                          class="selection-toggle"
                          on:click|stopPropagation={() => toggleSelection(card.queueId)}
                          aria-label={`Toggle selection for ${card.filename}`}
                          data-testid={card.hasOutput
                            ? `result-select-${i}`
                            : `workflow-card-select-${i}`}
                        >
                          {#if selectedQueueIds.has(card.queueId)}
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
                        </button>
                      </div>
                    {/if}

                    <button
                      class="remove-btn"
                      on:click|stopPropagation={() => removeImage(card.queueId)}
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
                      <button
                        type="button"
                        class="preview-btn"
                        on:click={() => openViewer(i)}
                        data-testid={`result-thumbnail-${i}`}
                        aria-label={`Open ${card.filename}`}
                      >
                        <img src={card.previewUrl} alt={card.previewAlt} />
                        {#if card.overlayVisible}
                          <div
                            class="card-progress-overlay"
                            data-testid={`workflow-card-progress-${i}`}
                          >
                            <div
                              class="card-progress-ring"
                              role="progressbar"
                              aria-label={`${card.filename} progress`}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-valuenow={card.progressPercent || 0}
                              style={`--progress:${card.progressPercent || 0};`}
                            ></div>
                          </div>
                        {/if}
                      </button>
                    </div>
                    <div class="info">
                      <p class="filename">{card.filename}</p>
                      {#if card.hasOutput}
                        <p class="size">
                          {((results.find((result) => result.queueId === card.queueId)?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      {/if}
                      <p class="status-tag">
                        {card.statusLabel}
                      </p>
                      {#if card.error}
                        <p class="size">{card.error}</p>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else if !processing}
            {#if queue.length === 0}
              <div class="results-placeholder card results-empty-gallery">
                <DropZone on:files={handleDropZoneFiles} />
              </div>
            {:else}
              <div class="results-placeholder card">
                <p>No results yet. Process an image from the Convert tab.</p>
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </section>
  </div>

  {#if !isDesktopLayout && activeMobileTab === "results" && workflowCards.length > 0}
    <div class="mobile-action-bar" data-testid="mobile-action-bar">
      <button
        class="secondary"
        data-testid="results-discard-all"
        on:click={() => reset()}
      >
        Clear
      </button>
      <button
        class="primary"
        on:click={openExportSheet}
        data-testid={emphasizeShareOut ? "share-out-cta" : undefined}
      >
        Export ({selectedQueueIds.size})
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

  {#if viewerOpen && currentViewerCard}
    <div
      class="photo-viewer-modal"
      data-testid="photo-viewer-modal"
      data-bounce={viewerBounceDirection}
      data-zoomed={viewerIsZoomed ? "true" : "false"}
      data-desktop-chrome-visible={effectiveViewerDesktopChromeVisible
        ? "true"
        : "false"}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabindex="-1"
      on:touchstart={handleViewerTouchStart}
      on:touchmove={handleViewerTouchMove}
      on:touchend={handleViewerTouchEnd}
      on:mousedown={handleViewerMouseDown}
      on:mousemove={handleViewerMouseMove}
      on:mouseup={handleViewerMouseUp}
      on:mouseleave={handleViewerMouseLeave}
    >
      <div class="photo-viewer-stage">
        <img
          class="photo-viewer-image"
          data-testid="photo-viewer-image"
          data-preview-kind={viewerPreviewKind}
          src={viewerImageSrc}
          alt={viewerImageAlt}
          style={`max-width: calc(100vw - 1.5rem); max-height: calc(100vh - 1.5rem); transform: translate3d(${viewerPanX}px, ${viewerPanY}px, 0) scale(${viewerZoomScale});`}
          on:dblclick={toggleViewerZoom}
        />
      </div>
      {#if viewerHasComparePreview}
        <button
          type="button"
          class="photo-viewer-compare"
          data-testid="photo-viewer-compare"
          aria-label="Hold to compare with source preview"
          aria-pressed={viewerCompareActive ? "true" : "false"}
          on:mousedown|stopPropagation={activateViewerCompare}
          on:mouseup|stopPropagation={deactivateViewerCompare}
          on:mouseleave|stopPropagation={deactivateViewerCompare}
          on:touchstart|stopPropagation={activateViewerCompare}
          on:touchend|stopPropagation={deactivateViewerCompare}
          on:touchcancel|stopPropagation={deactivateViewerCompare}
          on:blur={deactivateViewerCompare}
        >
          Hold for Original
        </button>
      {/if}
      {#if viewerIsZoomed}
        <button
          type="button"
          class="photo-viewer-reset"
          data-testid="photo-viewer-reset-zoom"
          aria-label="Reset zoom"
          on:click={resetViewerTransform}
        >
          Reset Zoom
        </button>
      {/if}
      {#if isDesktopLayout && workflowCards.length > 1}
        <div
          class="photo-viewer-position"
          data-testid="photo-viewer-position"
          data-visible={effectiveViewerDesktopChromeVisible ? "true" : "false"}
          aria-live="polite"
        >
          {viewerIndex + 1} / {workflowCards.length}
        </div>
        <button
          type="button"
          class="photo-viewer-nav photo-viewer-nav-prev"
          data-testid="photo-viewer-prev"
          data-visible={effectiveViewerDesktopChromeVisible ? "true" : "false"}
          aria-label="Previous photo"
          disabled={viewerIndex <= 0}
          on:focus={handleViewerChromeFocusIn}
          on:click={showPreviousInViewer}
        >
          ‹
        </button>
        <button
          type="button"
          class="photo-viewer-nav photo-viewer-nav-next"
          data-testid="photo-viewer-next"
          data-visible={effectiveViewerDesktopChromeVisible ? "true" : "false"}
          aria-label="Next photo"
          disabled={viewerIndex >= workflowCards.length - 1}
          on:focus={handleViewerChromeFocusIn}
          on:click={showNextInViewer}
        >
          ›
        </button>
        <div
          class="photo-viewer-filmstrip"
          data-testid="photo-viewer-filmstrip"
          data-visible={effectiveViewerDesktopChromeVisible ? "true" : "false"}
          bind:this={viewerFilmstripElement}
        >
          {#each workflowCards as card, index}
            <button
              type="button"
              class="photo-viewer-filmstrip-item"
              class:active={index === viewerIndex}
              data-testid={`photo-viewer-filmstrip-item-${index}`}
              data-active={index === viewerIndex ? "true" : "false"}
              aria-label={`View ${card.filename}`}
              aria-current={index === viewerIndex ? "true" : undefined}
              on:focus={handleViewerChromeFocusIn}
              on:click={() => showViewerIndex(index)}
            >
              <img src={card.previewUrl} alt={card.previewAlt} />
            </button>
          {/each}
        </div>
      {/if}
      <button
        type="button"
        class="photo-viewer-close"
        data-testid="photo-viewer-close"
        data-visible={effectiveViewerDesktopChromeVisible ? "true" : "false"}
        aria-label="Close photo viewer"
        style="position: absolute; top: 0.5rem; right: 0.5rem; top: calc(env(safe-area-inset-top, 0px) + 0.5rem); right: calc(env(safe-area-inset-right, 0px) + 0.5rem);"
        on:focus={handleViewerChromeFocusIn}
        on:click={closeViewer}
      >
        ×
      </button>
    </div>
  {/if}

  {#if mobileInferenceWarningOpen}
    <div class="blocking-modal-backdrop" aria-hidden="true"></div>
    <div
      class="blocking-modal-card"
      data-testid="mobile-inference-warning-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-inference-warning-title"
      aria-describedby="mobile-inference-warning-description"
    >
      <h3 id="mobile-inference-warning-title">
        This browser has severe memory limitations
      </h3>
      <p
        class="help-text blocking-modal-copy"
        id="mobile-inference-warning-description"
      >
        This webapp may require more memory than your browser permits. Please
        try Chrome on Windows or macOS.
      </p>
      <p class="help-text blocking-modal-copy">
        Type "{MOBILE_INFERENCE_ACKNOWLEDGEMENT}" to proceed anyway.
      </p>
      <input
        type="text"
        class="blocking-modal-input"
        data-testid="mobile-inference-warning-input"
        bind:value={mobileInferenceChallengeValue}
        aria-label="Type the browser warning acknowledgement to proceed"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <div class="blocking-modal-actions">
        <button
          type="button"
          class="secondary"
          data-testid="mobile-inference-warning-cancel"
          on:click={cancelMobileInferenceWarning}
        >
          Cancel
        </button>
        <button
          type="button"
          class="primary"
          data-testid="mobile-inference-warning-proceed"
          on:click={proceedWithMobileInferenceWarning}
          disabled={!isMobileInferenceAcknowledgementValid(
            mobileInferenceChallengeValue,
          )}
        >
          Continue
        </button>
      </div>
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
        <button class="text-btn" on:click={closeSheet}>Done</button>
      </div>

      <div data-testid="advanced-settings">
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
              <input
                type="checkbox"
                bind:checked={keepScreenAwake}
                on:change={handleSettingChange}
              />
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
              {#if shouldShowWebGlBackendOption()}
                <option value="webgl">WebGL</option>
              {/if}
              <option value="wasm">WASM</option>
            </select>
          </div>
        </div>

        <div class="control-group horizontal">
          <label for="gmnet-memory-mode-select-mobile">GMNet Memory Mode</label>
          <div class="select-wrapper">
            <select
              id="gmnet-memory-mode-select-mobile"
              value={gmnetCheckpointingPreference}
              on:change={handleGmnetCheckpointingPreferenceChange}
              data-testid="gmnet-memory-mode-select-mobile"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="force">Force checkpointing</option>
              <option value="off">In-memory only</option>
            </select>
          </div>
        </div>

        <OfflineReadinessCard
          state={pwaUpdateState}
          onValidate={onValidateOfflineReadiness}
          onRepair={onRepairOfflineReadiness}
        />
      </div>
    </div>
  {/if}

  {#if openSheet === "queue"}
    <div class="sheet-card" data-testid="queue-sheet">
      <div class="sheet-header">
        <h3>Queue</h3>
        <button class="text-btn" on:click={closeSheet}>Done</button>
      </div>

      <div class="sheet-actions">
        {#if canCancelCurrent}
          <button
            class="secondary"
            data-testid="cancel-current-control"
            on:click={cancelCurrent}
          >
            Stop
          </button>
        {/if}
        {#if failedQueueCount > 0}
          <button class="primary" on:click={retryFailedQueueItems}>
            Retry failed
          </button>
        {/if}
        <button
          class="secondary"
          data-testid="results-discard-all"
          on:click={() => reset()}
        >
          Clear
        </button>
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
        {#if selectedQueueIds.size === 0}
          Select at least one result to export.
        {:else}
          {selectedQueueIds.size} item(s) selected.
        {/if}
      </p>

      <div class="sheet-actions">
        {#if selectedQueueIds.size > 1}
          <div class="download-separate-action">
            <button
              class="primary"
              on:click={() => downloadSelected(false)}
              disabled={selectedQueueIds.size === 0}
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
            disabled={selectedQueueIds.size === 0}
          >
            Download
          </button>
        {/if}
        {#if selectedQueueIds.size > 1}
          <button class="primary" on:click={() => downloadSelected(true)}
            >Download as single ZIP file</button
          >
        {/if}
        {#if hasShareCapability}
          <button
            class="primary share-btn"
            on:click={shareSelected}
            disabled={selectedQueueIds.size === 0}
            title="Share to other apps"
            data-testid={emphasizeShareOut ? "share-out-cta" : undefined}
          >
            Share
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .processor {
    width: 100%;
    margin: 0 auto;
    display: grid;
    gap: 0.85rem;
  }

  .mobile-tab-bar {
    position: sticky;
    top: 0.5rem;
    z-index: 15;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.3rem;
    padding: 0.28rem;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 90%, transparent);
    backdrop-filter: blur(14px);
    border-radius: 999px;
    box-shadow: var(--shadow-sm);
  }

  .tab-btn {
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    min-height: 44px;
    border-radius: 999px;
    font-size: 0.86rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }

  .tab-btn[aria-selected="true"] {
    background: color-mix(in srgb, var(--surface-active) 84%, transparent);
    border-color: color-mix(in srgb, var(--primary-color) 26%, transparent);
    color: var(--text-color);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
    gap: 0.85rem;
  }

  .controls-column,
  .results-column {
    display: grid;
    gap: 1rem;
    min-width: 0;
  }

  .panel {
    display: grid;
    gap: 0.9rem;
  }

  .error h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .control-group {
    text-align: left;
    display: grid;
    gap: 0.38rem;
  }

  .control-group.horizontal {
    display: flex;
    align-items: center;
    gap: 0.7rem;
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
    font-weight: 560;
    font-size: 0.83rem;
    letter-spacing: 0.01em;
    color: var(--text-secondary);
  }

  .range-wrapper,
  .select-wrapper,
  .button-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .button-group {
    flex-wrap: wrap;
  }

  input[type="range"] {
    flex: 1;
    height: 5px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--text-muted) 24%, transparent);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  select {
    flex: 1;
    min-height: 44px;
    padding: 0.62rem 0.78rem;
    border-radius: 12px;
    border: 1px solid var(--border-subtle);
    background-color: color-mix(in srgb, var(--surface-color) 94%, transparent);
    color: var(--text-color);
    font-size: 0.93rem;
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
    font-size: 0.88rem;
    min-width: 3ch;
    color: var(--text-color);
  }

  .help-text {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .icon-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 44px;
    padding: 0.52rem 0.82rem;
    background-color: color-mix(in srgb, var(--surface-color) 52%, transparent);
    border: 1px solid var(--border-subtle);
    color: var(--text-color);
    border-radius: 999px;
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
    gap: 0.6rem;
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

  .stale-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    align-items: center;
  }

  .notice {
    color: var(--text-color);
  }

  .pipeline-status {
    margin-top: 0.2rem;
    padding: 0.72rem;
    border: 1px solid var(--border-subtle);
    border-radius: 14px;
    background: color-mix(in srgb, var(--surface-color) 68%, transparent);
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
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--primary-strong) 94%, white 6%),
      var(--primary-color)
    );
    color: var(--text-on-primary);
    border: 1px solid transparent;
    min-height: 44px;
    padding: 0.62rem 0.98rem;
    font-size: 0.92rem;
    font-weight: 700;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
    background-color: color-mix(in srgb, var(--surface-color) 52%, transparent);
    border: 1px solid var(--border-subtle);
    color: var(--text-color);
    min-height: 44px;
    padding: 0.52rem 0.86rem;
    font-size: 0.9rem;
    font-weight: 550;
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

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .results {
    display: grid;
    gap: 0.75rem;
  }

  .results-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.55rem;
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
    gap: 0.45rem;
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
    gap: 0.65rem;
  }

  .result-card {
    padding: 0.42rem;
    display: flex;
    flex-direction: column;
    gap: 0.42rem;
    position: relative;
    cursor: default;
    border: 1px solid var(--divider-subtle);
    transition:
      transform 0.15s ease,
      border-color 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--surface-raised) 90%, transparent),
      color-mix(in srgb, var(--surface-raised) 74%, transparent)
    );
    box-shadow: none;
  }

  .result-card:hover {
    transform: translateY(-1px);
    border-color: color-mix(
      in srgb,
      var(--primary-color) 22%,
      var(--border-subtle)
    );
  }

  .result-card.selected {
    border-color: var(--primary-color);
    background-color: color-mix(
      in srgb,
      var(--surface-interactive) 78%,
      transparent
    );
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--primary-color) 18%, transparent);
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

  .selection-toggle {
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: grid;
    place-items: center;
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

  .preview-btn {
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    display: block;
    cursor: zoom-in;
    position: relative;
  }

  .preview img {
    width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    transition:
      opacity 0.15s ease,
      filter 0.15s ease;
  }

  .result-card.pending .preview img {
    opacity: 0.62;
    filter: saturate(0.88) brightness(0.84);
  }

  .card-progress-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, black 28%, transparent);
    pointer-events: none;
  }

  .card-progress-ring {
    --size: 58px;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background:
      radial-gradient(circle closest-side, rgba(15, 23, 42, 0.88) 72%, transparent 73% 100%),
      conic-gradient(
        var(--primary-color) calc(var(--progress) * 1%),
        color-mix(in srgb, var(--text-muted) 30%, transparent) 0
      );
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
  }

  .info {
    text-align: left;
    padding: 0 0.2rem;
  }

  .filename {
    font-weight: 600;
    margin: 0 0 0.12rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.84rem;
  }

  .size {
    font-size: 0.76rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .status-tag {
    margin: 0.18rem 0 0;
    font-size: 0.68rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
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
    gap: 0.5rem;
    padding: 0.45rem;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 92%, transparent);
    backdrop-filter: blur(16px);
    border-radius: 999px;
    box-shadow: var(--shadow-sm);
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
    width: 52px;
    height: 52px;
    border-radius: 999px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 94%, transparent);
    color: var(--text-color);
    box-shadow: var(--shadow-sm);
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
    background: rgba(7, 11, 14, 0.28);
    z-index: 29;
  }

  .blocking-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(7, 11, 14, 0.55);
    z-index: 34;
  }

  .blocking-modal-card {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(92vw, 420px);
    padding: 1rem;
    border-radius: 20px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 98%, transparent);
    box-shadow: var(--shadow-lg);
    z-index: 35;
    display: grid;
    gap: 0.75rem;
  }

  .blocking-modal-card h3 {
    margin: 0;
    font-size: 1rem;
  }

  .blocking-modal-copy {
    margin: 0;
  }

  .blocking-modal-input {
    width: 100%;
    min-height: 44px;
    padding: 0.7rem 0.8rem;
    border-radius: 12px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-color) 94%, transparent);
    color: var(--text-color);
    font-size: 0.95rem;
    box-sizing: border-box;
  }

  .blocking-modal-actions {
    display: flex;
    gap: 0.55rem;
  }

  .blocking-modal-actions button {
    flex: 1;
  }

  .photo-viewer-modal {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(0, 0, 0, 0.92);
    display: grid;
    place-items: center;
    touch-action: pan-y;
  }

  .photo-viewer-stage {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    padding: 0.75rem;
    overflow: hidden;
  }

  .photo-viewer-image {
    display: block;
    width: auto;
    height: auto;
    max-width: calc(100vw - 1.5rem);
    max-height: calc(100vh - 1.5rem);
    object-fit: contain;
    transform-origin: center center;
    transition: transform 0.18s ease;
    user-select: none;
  }

  .photo-viewer-modal[data-zoomed="true"] .photo-viewer-image {
    cursor: grab;
  }

  .photo-viewer-compare,
  .photo-viewer-reset {
    position: absolute;
    left: max(0.75rem, env(safe-area-inset-left, 0px));
    border: 1px solid color-mix(in srgb, #fff 22%, transparent);
    background: color-mix(in srgb, #000 45%, transparent);
    color: #fff;
    border-radius: 999px;
    padding: 0.65rem 0.9rem;
    font: inherit;
    cursor: pointer;
    z-index: 2;
  }

  .photo-viewer-compare {
    bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
  }

  .photo-viewer-reset {
    bottom: max(3.9rem, calc(env(safe-area-inset-bottom, 0px) + 3.9rem));
  }

  .photo-viewer-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3rem;
    height: 3rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, #fff 22%, transparent);
    background: color-mix(in srgb, #000 45%, transparent);
    color: #fff;
    font-size: 2rem;
    line-height: 1;
    display: grid;
    place-items: center;
    cursor: pointer;
    z-index: 2;
    opacity: 1;
    transition: opacity 0.18s ease;
  }

  .photo-viewer-nav:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .photo-viewer-nav-prev {
    left: 0.75rem;
  }

  .photo-viewer-nav-next {
    right: 0.75rem;
  }

  .photo-viewer-position {
    position: absolute;
    top: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, #fff 18%, transparent);
    background: color-mix(in srgb, #000 48%, transparent);
    color: #fff;
    font-size: 0.95rem;
    line-height: 1;
    z-index: 2;
    opacity: 1;
    transition: opacity 0.18s ease;
  }

  .photo-viewer-filmstrip {
    position: absolute;
    left: 50%;
    bottom: 0.75rem;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    max-width: min(80vw, 56rem);
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    background: color-mix(in srgb, #000 52%, transparent);
    overflow-x: auto;
    z-index: 2;
    opacity: 1;
    transition: opacity 0.18s ease;
  }

  .photo-viewer-modal[data-desktop-chrome-visible="false"] .photo-viewer-nav,
  .photo-viewer-modal[data-desktop-chrome-visible="false"] .photo-viewer-position,
  .photo-viewer-modal[data-desktop-chrome-visible="false"] .photo-viewer-filmstrip,
  .photo-viewer-modal[data-desktop-chrome-visible="false"] .photo-viewer-close {
    opacity: 0.18;
  }

  .photo-viewer-filmstrip-item {
    width: 3.5rem;
    height: 3.5rem;
    padding: 0;
    border-radius: 0.9rem;
    border: 1px solid color-mix(in srgb, #fff 16%, transparent);
    overflow: hidden;
    background: color-mix(in srgb, #000 20%, transparent);
    cursor: pointer;
    flex: 0 0 auto;
  }

  .photo-viewer-filmstrip-item.active {
    border-color: color-mix(in srgb, #fff 70%, transparent);
    box-shadow: 0 0 0 2px color-mix(in srgb, #fff 24%, transparent);
  }

  .photo-viewer-filmstrip-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-viewer-close {
    position: absolute;
    top: max(0.5rem, env(safe-area-inset-top, 0px));
    right: max(0.5rem, env(safe-area-inset-right, 0px));
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, #fff 30%, transparent);
    background: color-mix(in srgb, #000 35%, transparent);
    color: #fff;
    font-size: 1.7rem;
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    opacity: 1;
    transition: opacity 0.15s ease;
    z-index: 2;
  }

  .photo-viewer-modal[data-bounce="left"] .photo-viewer-stage {
    animation: photo-viewer-bounce-left 0.18s ease-out;
  }

  .photo-viewer-modal[data-bounce="right"] .photo-viewer-stage {
    animation: photo-viewer-bounce-right 0.18s ease-out;
  }

  @keyframes photo-viewer-bounce-left {
    0% {
      transform: translateX(0);
    }
    35% {
      transform: translateX(24px);
    }
    100% {
      transform: translateX(0);
    }
  }

  @keyframes photo-viewer-bounce-right {
    0% {
      transform: translateX(0);
    }
    35% {
      transform: translateX(-24px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .sheet-card {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(env(safe-area-inset-bottom, 0px) + 0.6rem);
    width: min(92vw, 520px);
    max-height: min(72vh, 680px);
    overflow: auto;
    padding: 0.9rem;
    border-radius: 20px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 96%, transparent);
    z-index: 30;
    display: grid;
    gap: 0.75rem;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(18px) saturate(115%);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
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
    border-radius: 12px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 96%, transparent);
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
    .progress-fill {
      transition: none;
      animation: none;
    }
  }
</style>
