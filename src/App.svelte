<script>
  import { onMount, tick } from "svelte";
  import DropZone from "./lib/DropZone.svelte";
  import ImageProcessor from "./lib/ImageProcessor.svelte";
  import InitializationGate from "./lib/InitializationGate.svelte";
  import {
    initializeRuntime,
    RUNTIME_INIT_STEP_LABELS,
    RUNTIME_INIT_STEP_ORDER,
  } from "./lib/processing.js";
  import { consumeSharedFilesFromLaunch } from "./lib/share-target-launch.js";
  import { loadQueueState } from "./lib/share-store.js";
  import {
    createDefaultPwaUpdateState,
    createPwaUpdateCoordinator,
  } from "./lib/pwa-updater.js";

  const version = import.meta.env.VITE_APP_VERSION || "dev";

  let files = [];
  let shareLaunchChecked = false;
  let launchSource = "regular";
  let restoreNotice = null;
  let launchIntent = { action: null, tab: null };
  let activeView = "converter";
  let isProcessingBusy = false;
  let pwaUpdateState = createDefaultPwaUpdateState();
  let pwaUpdateCoordinator = null;
  let runtimeInitState = "running";
  let runtimeInitSteps = createRuntimeInitSteps();
  let runtimeInitFailure = null;
  let runtimeInitRunId = 0;
  let runtimeInitExecutionProvider = null;
  let runtimeInitGmnetCapability = null;
  let appDisposed = false;

  function createRuntimeInitSteps() {
    return RUNTIME_INIT_STEP_ORDER.map((stepId) => ({
      id: stepId,
      label: RUNTIME_INIT_STEP_LABELS[stepId] || stepId,
      status: "pending",
      note: "",
      diagnostics: null,
      errorCode: null,
      attempts: [],
    }));
  }

  function withStackSnippet(stack) {
    if (typeof stack !== "string" || stack.length === 0) {
      return null;
    }
    return stack.split("\n").slice(0, 8).join("\n");
  }

  function findRuntimeStepLabel(stepId) {
    return (
      RUNTIME_INIT_STEP_LABELS[stepId] ||
      runtimeInitSteps.find((step) => step.id === stepId)?.label ||
      stepId ||
      "Unknown step"
    );
  }

  function updateRuntimeStep(stepId, changes = {}) {
    if (!stepId) {
      return;
    }
    const existingIndex = runtimeInitSteps.findIndex(
      (step) => step.id === stepId,
    );
    if (existingIndex === -1) {
      runtimeInitSteps = [
        ...runtimeInitSteps,
        {
          id: stepId,
          label: findRuntimeStepLabel(stepId),
          status: "pending",
          note: "",
          diagnostics: null,
          errorCode: null,
          attempts: [],
          ...changes,
        },
      ];
      return;
    }

    runtimeInitSteps = runtimeInitSteps.map((step, index) =>
      index === existingIndex
        ? {
            ...step,
            ...changes,
          }
        : step,
    );
  }

  function normalizeProbeAttempt(rawAttempt) {
    if (!rawAttempt || typeof rawAttempt !== "object") {
      return null;
    }
    const provider = normalizeExecutionProvider(rawAttempt.provider || "");
    const candidateLongEdge = Math.floor(Number(rawAttempt.candidateLongEdge));
    if (
      !provider ||
      !Number.isFinite(candidateLongEdge) ||
      candidateLongEdge < 1
    ) {
      return null;
    }
    const rawStatus = String(rawAttempt.status || "")
      .trim()
      .toLowerCase();
    const status =
      rawStatus === "passed" ||
      rawStatus === "failed" ||
      rawStatus === "running"
        ? rawStatus
        : "running";
    const probeHeight = Math.max(1, Math.floor((candidateLongEdge * 2) / 3));
    return {
      provider,
      candidateLongEdge,
      probeHeight,
      status,
      durationMs: Number.isFinite(Number(rawAttempt.durationMs))
        ? Number(rawAttempt.durationMs)
        : undefined,
      error:
        rawAttempt.error && typeof rawAttempt.error === "object"
          ? {
              name:
                typeof rawAttempt.error.name === "string"
                  ? rawAttempt.error.name
                  : "Error",
              message:
                typeof rawAttempt.error.message === "string"
                  ? rawAttempt.error.message
                  : String(rawAttempt.error),
            }
          : undefined,
    };
  }

  function mergeRuntimeStepAttempts(existingAttempts = [], event = null) {
    if (!event || typeof event !== "object") {
      return existingAttempts;
    }
    if (Array.isArray(event.probeAttempts)) {
      return event.probeAttempts
        .map((attempt) => normalizeProbeAttempt(attempt))
        .filter(Boolean);
    }

    const incomingAttempt = normalizeProbeAttempt(event.probeAttempt);
    if (!incomingAttempt) {
      return existingAttempts;
    }
    const key = `${incomingAttempt.provider}:${incomingAttempt.candidateLongEdge}`;
    const nextAttempts = Array.isArray(existingAttempts)
      ? [...existingAttempts]
      : [];
    const existingIndex = nextAttempts.findIndex(
      (attempt) => `${attempt.provider}:${attempt.candidateLongEdge}` === key,
    );
    if (existingIndex === -1) {
      nextAttempts.push(incomingAttempt);
    } else {
      nextAttempts[existingIndex] = {
        ...nextAttempts[existingIndex],
        ...incomingAttempt,
      };
    }
    return nextAttempts;
  }

  function normalizeExecutionProvider(value) {
    if (typeof value !== "string") {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
  }

  function applyRuntimeProgressEvent(event) {
    if (!event || typeof event !== "object") {
      return;
    }
    const stepId = event.stepId;
    if (!stepId) {
      return;
    }
    updateRuntimeStep(stepId, {
      label: event.stepLabel || findRuntimeStepLabel(stepId),
      status: event.status || "pending",
      note: event.note || "",
      diagnostics:
        event.diagnostics && typeof event.diagnostics === "object"
          ? { ...event.diagnostics }
          : null,
      errorCode: typeof event.errorCode === "string" ? event.errorCode : null,
      attempts: mergeRuntimeStepAttempts(
        runtimeInitSteps.find((step) => step.id === stepId)?.attempts || [],
        event,
      ),
    });
  }

  function buildRuntimeInitFailure(error) {
    const stepId =
      typeof error?.stepId === "string" && error.stepId.length > 0
        ? error.stepId
        : "onnx-load";
    const errorCode =
      typeof error?.code === "string" && error.code.length > 0
        ? error.code
        : "RUNTIME_INIT_UNKNOWN";
    const userMessage =
      typeof error?.userMessage === "string" && error.userMessage.length > 0
        ? error.userMessage
        : error?.message || "Runtime initialization failed.";
    const diagnostics = {
      ...(error?.diagnostics && typeof error.diagnostics === "object"
        ? { ...error.diagnostics }
        : {}),
      errorCode,
      stepId,
      message: error?.message || userMessage,
      stackSnippet: error?.stackSnippet || withStackSnippet(error?.stack),
    };

    return {
      stepId,
      stepLabel: findRuntimeStepLabel(stepId),
      errorCode,
      userMessage,
      message: error?.message || userMessage,
      diagnostics,
    };
  }

  async function runRuntimeInitialization({ forceRetry = false } = {}) {
    const runId = ++runtimeInitRunId;
    runtimeInitState = "running";
    runtimeInitFailure = null;
    runtimeInitExecutionProvider = null;
    runtimeInitGmnetCapability = null;
    runtimeInitSteps = createRuntimeInitSteps();

    try {
      const runtimeInitOptions = resolveRuntimeInitOverrides(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const runtimeResult = await initializeRuntime({
        forceRetry,
        onProgress: (event) => {
          if (appDisposed || runId !== runtimeInitRunId) {
            return;
          }
          applyRuntimeProgressEvent(event);
        },
        ...(runtimeInitOptions ? { runtimeInitOptions } : {}),
      });
      if (appDisposed || runId !== runtimeInitRunId) {
        return false;
      }
      runtimeInitExecutionProvider = normalizeExecutionProvider(
        runtimeResult?.resolvedExecutionProvider,
      );
      runtimeInitGmnetCapability =
        runtimeResult?.gmnetCapability &&
        typeof runtimeResult.gmnetCapability === "object"
          ? { ...runtimeResult.gmnetCapability }
          : null;
      runtimeInitState = "ready";
      return true;
    } catch (error) {
      if (appDisposed || runId !== runtimeInitRunId) {
        return false;
      }
      runtimeInitFailure = buildRuntimeInitFailure(error);
      runtimeInitState = "failed";
      updateRuntimeStep(runtimeInitFailure.stepId, {
        status: "failed",
        note: runtimeInitFailure.userMessage,
        errorCode: runtimeInitFailure.errorCode,
        diagnostics: runtimeInitFailure.diagnostics,
      });
      return false;
    }
  }

  async function initializeLaunchContext() {
    launchIntent = parseLaunchIntent(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const sharedFiles = await consumeSharedFilesFromLaunch();
    if (sharedFiles.length > 0) {
      files = sharedFiles;
      launchSource = "share-target";
    } else {
      launchSource = "regular";
      try {
        const persistedQueue = await loadQueueState();
        if (persistedQueue?.hasPending) {
          restoreNotice =
            "Previous queue could not be restored. Please re-add files.";
        }
      } catch (e) {
        console.warn("[App] Unable to load persisted queue state:", e);
      }
    }
    shareLaunchChecked = true;
    await maybeAutoPickImages();
  }

  async function bootApp({ forceRetry = false } = {}) {
    if (!forceRetry && runtimeInitState === "ready") {
      return;
    }
    shareLaunchChecked = false;
    const initialized = await runRuntimeInitialization({ forceRetry });
    if (!initialized || appDisposed) {
      return;
    }
    await initializeLaunchContext();
  }

  function handleFiles(event) {
    files = Array.from(event.detail);
  }

  function handleReset() {
    files = [];
    launchSource = "regular";
    launchIntent = { action: null, tab: null };
    isProcessingBusy = false;
  }

  function openAbout() {
    activeView = "about";
  }

  function openConverter() {
    activeView = "converter";
  }

  function parseLaunchIntent(search) {
    const params = new URLSearchParams(search || "");
    const action = params.get("action");
    const tab = params.get("tab");
    return {
      action: action || null,
      tab: tab || null,
    };
  }

  function resolveRuntimeInitOverrides(search) {
    const params = new URLSearchParams(search || "");
    const smokeAssetPath = params.get("__uhdr_test_smoke_asset_path");
    const modelVariant = params.get("__uhdr_test_model_variant");
    const forceSmokeFailure = params.get("__uhdr_test_force_smoke_failure");
    const options = {};
    if (
      typeof smokeAssetPath === "string" &&
      smokeAssetPath.trim().length > 0
    ) {
      options.smokeAssetPath = smokeAssetPath.trim();
    }
    if (typeof modelVariant === "string" && modelVariant.trim().length > 0) {
      options.modelVariant = modelVariant.trim();
    }
    if (
      forceSmokeFailure === "1" ||
      (typeof forceSmokeFailure === "string" &&
        forceSmokeFailure.trim().toLowerCase() === "true")
    ) {
      options.forceSmokeFailure = true;
    }
    return Object.keys(options).length > 0 ? options : null;
  }

  async function maybeAutoPickImages() {
    if (launchIntent.action !== "pick" || files.length > 0) return;
    await tick();
    const input = document.getElementById("file-upload");
    if (input && typeof input.click === "function") {
      input.click();
    }
  }

  function handleProcessingBusyChange(event) {
    isProcessingBusy = Boolean(event.detail?.busy);
    pwaUpdateCoordinator?.setBusy(isProcessingBusy);
  }

  async function applyAppUpdate() {
    await pwaUpdateCoordinator?.applyUpdate();
  }

  function handleRuntimeRetry() {
    void bootApp({ forceRetry: true });
  }

  onMount(() => {
    appDisposed = false;
    pwaUpdateCoordinator = createPwaUpdateCoordinator({
      onStateChange: (nextState) => {
        pwaUpdateState = nextState;
      },
      isBusy: () => isProcessingBusy,
    });

    void bootApp();

    return () => {
      appDisposed = true;
      pwaUpdateCoordinator?.dispose();
      pwaUpdateCoordinator = null;
    };
  });
</script>

<main
  class="app-shell"
  data-testid="app-shell"
  data-runtime-init-state={runtimeInitState}
>
  <header class="app-header">
    <h1>UltraHDR Converter</h1>
  </header>

  <section class="content-area" aria-live="polite">
    {#if runtimeInitState === "ready"}
      <span class="runtime-ready-marker" data-testid="runtime-init-ready"
        >Runtime ready</span
      >
      <span class="runtime-ready-marker" data-testid="runtime-init-provider">
        Runtime provider: {runtimeInitExecutionProvider || "unknown"}
      </span>
    {/if}
    {#if runtimeInitState !== "ready"}
      <InitializationGate
        state={runtimeInitState}
        steps={runtimeInitSteps}
        failure={runtimeInitFailure}
        on:retry={handleRuntimeRetry}
      />
    {:else if activeView === "about"}
      <article class="about-page" data-testid="about-page">
        <h2>About UltraHDR Converter</h2>
        <p>
          UltraHDR Converter turns your existing photos into UltraHDR images
          directly in your browser. Your files stay on your device, and output
          images are generated locally.
        </p>

        <div
          class="about-taglines"
          role="list"
          aria-label="UltraHDR Converter advantages"
        >
          <span role="listitem">No Cloud Upload</span>
          <span role="listitem">Works Offline</span>
          <span role="listitem">Private Processing</span>
          <span role="listitem">Share In and Share Out</span>
        </div>

        <div class="about-copy">
          <h3>How This PWA Works</h3>
          <p>
            The app is a Progressive Web App (PWA), which means it can install
            like a mobile app while still running web technology under the hood.
            On supported browsers, its interface and assets are cached so it can
            launch and run even without a network connection.
          </p>
          <p>
            When you pick or share photos into the app, conversion runs in your
            browser using a local WebAssembly encoder. The queue processes each
            file on-device, updates progress in real time, and then lets you
            export by Share or Download when each result is ready.
          </p>
          <p>
            Because processing is local, performance depends on your device and
            browser. Newer phones and desktops complete batches faster, while
            older devices may pause background tabs more aggressively to save
            power.
          </p>
        </div>
      </article>
    {:else if !shareLaunchChecked}
      <div class="drop-container">
        <p class="share-loading">Loading shared images...</p>
      </div>
    {:else if files.length === 0}
      <div class="drop-container">
        <DropZone on:files={handleFiles} />
        {#if restoreNotice}
          <p class="restore-notice">{restoreNotice}</p>
        {/if}
      </div>
    {:else}
      <ImageProcessor
        {files}
        {launchSource}
        {launchIntent}
        runtimeExecutionProvider={runtimeInitExecutionProvider}
        runtimeGmnetCapability={runtimeInitGmnetCapability}
        on:reset={handleReset}
        on:processingbusychange={handleProcessingBusyChange}
      />
    {/if}
  </section>

  <footer class="footer">
    <p class="footer-compatibility">
      <b>Try Google Chrome on Windows/macOS if you run into issues.</b>
    </p>
    {#if runtimeInitState === "ready"}
      {#if activeView === "about"}
        <button class="footer-link" type="button" on:click={openConverter}
          >Back to Converter</button
        >
      {:else}
        <button class="footer-link" type="button" on:click={openAbout}
          >About</button
        >
      {/if}
      {#if pwaUpdateState.updateAvailable}
        {#if pwaUpdateState.pendingUntilIdle}
          <span class="footer-update" data-testid="pwa-update-pending">
            Update downloaded. It can be applied when processing is idle.
          </span>
        {:else}
          <span class="footer-update" data-testid="pwa-update-available">
            A newer version is ready.
            <button
              class="footer-link footer-update-action"
              type="button"
              on:click={applyAppUpdate}
              disabled={pwaUpdateState.applying}
            >
              {pwaUpdateState.applying ? "Updating..." : "Update now"}
            </button>
          </span>
        {/if}
      {:else if pwaUpdateState.checking}
        <span class="footer-update" data-testid="pwa-update-checking"
          >Checking for updates...</span
        >
      {/if}
    {/if}
    <a href="https://gregbenzphotography.com/hdr/#whatishdr">What is HDR?</a>
    <a href="https://github.com/sturmen/ultrahdr-pwa-svelte">Source code</a>
    <span>Version {version}</span>
  </footer>
</main>

<style>
  .app-shell {
    display: grid;
    gap: 1rem;
  }

  .app-header {
    padding-top: 0.25rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.3rem, 2.2vw, 1.8rem);
  }

  .content-area {
    min-height: 40vh;
  }

  .runtime-ready-marker {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    border: 0;
    white-space: nowrap;
  }

  .drop-container {
    max-width: 980px;
    margin: 0 auto;
  }

  .share-loading {
    color: var(--text-secondary);
    padding: 2rem 1rem;
    text-align: center;
  }

  .restore-notice {
    margin: 0.8rem 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .about-page {
    max-width: 820px;
    margin: 0 auto;
    padding: 0.4rem 0.1rem 0.6rem;
    display: grid;
    gap: 0.9rem;
  }

  .about-page h2,
  .about-page h3,
  .about-page p {
    margin: 0;
  }

  .about-page h2 {
    font-size: clamp(1.1rem, 2.4vw, 1.4rem);
  }

  .about-page h3 {
    font-size: 1rem;
  }

  .about-page p {
    color: var(--text-secondary);
    line-height: 1.55;
  }

  .about-taglines {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .about-taglines span {
    border: 1px solid var(--border-subtle);
    background: var(--surface-muted);
    color: var(--text-muted);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .about-copy {
    display: grid;
    gap: 0.7rem;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    align-items: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    border-top: 1px solid var(--border-subtle);
    padding-top: 1rem;
  }

  .footer-compatibility {
    margin: 0;
    flex-basis: 100%;
  }

  .footer a {
    color: var(--text-link);
    text-decoration: none;
  }

  .footer-link {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: var(--text-link);
    text-decoration: none;
    cursor: pointer;
  }

  .footer-link:hover {
    text-decoration: underline;
  }

  .footer-update {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    color: var(--text-secondary);
  }

  .footer-update-action:disabled {
    opacity: 0.65;
    cursor: progress;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    .app-shell {
      gap: 1.25rem;
    }

    .about-page {
      gap: 1rem;
    }
  }
</style>
