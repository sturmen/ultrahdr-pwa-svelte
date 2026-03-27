<script>
  import { onMount, tick } from "svelte";
  import ImageProcessor from "./lib/ImageProcessor.svelte";
  import InitializationGate from "./lib/InitializationGate.svelte";
  import {
    createProcessingRuntime,
    RUNTIME_INIT_STEP_LABELS,
    RUNTIME_INIT_STEP_ORDER,
  } from "./lib/processing.js";
  import {
    consumeSharedFilesFromLaunch,
    registerLaunchQueueConsumer,
  } from "./lib/share-target-launch.js";
  import {
    createDefaultPwaUpdateState,
    createPwaUpdateCoordinator,
  } from "./lib/pwa-updater.js";

  const version = import.meta.env.VITE_APP_VERSION || "dev";

  let files = [];
  let shareLaunchChecked = false;
  let launchSource = "regular";
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
  let runtimeInitMode = null;
  let runtimeInitDegraded = false;
  let appDisposed = false;
  const processingRuntime = createProcessingRuntime();

  function createRuntimeInitSteps() {
    return RUNTIME_INIT_STEP_ORDER.map((stepId) => ({
      id: stepId,
      label: RUNTIME_INIT_STEP_LABELS[stepId] || stepId,
      status: "pending",
      note: "",
      diagnostics: null,
      errorCode: null,
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
    });
  }

  function buildRuntimeInitFailure(
    error,
    {
      runtimeInitProgressTrace = null,
      runtimeInitFailureHistory = null,
    } = {},
  ) {
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
    const normalizedHistory = Array.isArray(runtimeInitFailureHistory)
      ? runtimeInitFailureHistory.map((record) => (
        record && typeof record === "object" ? { ...record } : record
      ))
      : null;

    if (Array.isArray(runtimeInitProgressTrace) && runtimeInitProgressTrace.length > 0) {
      diagnostics.runtimeInitProgressTrace = runtimeInitProgressTrace;
    }
    if (Array.isArray(runtimeInitFailureHistory)) {
      diagnostics.runtimeInitFailureHistory = normalizedHistory;
      diagnostics.runtimeInitFailureHistoryCount = normalizedHistory.length;
    }

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
    runtimeInitMode = null;
    runtimeInitDegraded = false;
    runtimeInitSteps = createRuntimeInitSteps();

    try {
      const runtimeInitOptions = resolveRuntimeInitOverrides(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const runtimeResult = await processingRuntime.initialize({
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
      runtimeInitMode =
        typeof runtimeResult?.runtimeMode === "string"
          ? runtimeResult.runtimeMode
          : null;
      runtimeInitDegraded =
        Boolean(runtimeResult?.runtimeDegraded) ||
        runtimeInitMode === "main-thread-wasm";
      runtimeInitState = "ready";
      return true;
    } catch (error) {
      if (appDisposed || runId !== runtimeInitRunId) {
        return false;
      }
      const runtimeInitProgressTrace = typeof processingRuntime.getRuntimeInitProgressTrace === "function"
        ? processingRuntime.getRuntimeInitProgressTrace()
        : null;
      const runtimeInitFailureHistory = typeof processingRuntime.getRuntimeInitFailureHistory === "function"
        ? processingRuntime.getRuntimeInitFailureHistory()
        : null;
      runtimeInitFailure = buildRuntimeInitFailure(error, {
        runtimeInitProgressTrace,
        runtimeInitFailureHistory,
      });
      runtimeInitState = "failed";
      runtimeInitMode = null;
      runtimeInitDegraded = false;
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
    const input =
      document.getElementById("file-upload") ||
      document.getElementById("add-files");
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

  async function dismissAppUpdate() {
    await pwaUpdateCoordinator?.dismissUpdateNotification?.();
  }

  async function validateOfflineReadiness() {
    await pwaUpdateCoordinator?.validateOfflineReadiness?.();
  }

  async function repairOfflineReadiness() {
    await pwaUpdateCoordinator?.repairOfflineReadiness?.();
  }

  function formatOfflineBundleBytes(totalBytes) {
    const normalized = Number(totalBytes);
    if (!Number.isFinite(normalized) || normalized <= 0) {
      return null;
    }
    const totalMegabytes = normalized / (1024 * 1024);
    if (totalMegabytes >= 10) {
      return `${Math.round(totalMegabytes)} MB`;
    }
    return `${totalMegabytes.toFixed(1)} MB`;
  }

  function formatOfflineValidatedAt(validatedAtMs) {
    const normalized = Number(validatedAtMs);
    if (!Number.isFinite(normalized) || normalized <= 0) {
      return null;
    }
    try {
      return new Date(normalized).toLocaleString();
    } catch {
      return null;
    }
  }

  function describeOfflineReadiness(state) {
    if (!state || typeof state !== "object") {
      return {
        title: "Offline bundle not ready yet",
        tone: "warning",
      };
    }
    if (
      state.offlineBundleActionInFlight &&
      state.offlineReadinessAction === "repair"
    ) {
      return {
        title: "Repairing offline bundle",
        tone: "warning",
      };
    }
    if (
      state.offlineBundleActionInFlight &&
      state.offlineReadinessAction === "validate"
    ) {
      return {
        title: "Validating offline bundle",
        tone: "neutral",
      };
    }
    if (state.bundleReady) {
      return {
        title: "Ready for offline conversion",
        tone: "ready",
      };
    }
    if (
      state.bundleState === "CORRUPT" ||
      state.bundleState === "FAILED" ||
      state.bundleState === "STALE"
    ) {
      return {
        title: "Repair needed before offline conversion",
        tone: "warning",
      };
    }
    return {
      title: "Offline bundle not ready yet",
      tone: "neutral",
    };
  }

  $: offlineReadinessSummary = describeOfflineReadiness(pwaUpdateState);
  $: offlineBundleSizeLabel = formatOfflineBundleBytes(
    pwaUpdateState.offlineBundleTotalBytes,
  );
  $: offlineBundleValidatedAtLabel = formatOfflineValidatedAt(
    pwaUpdateState.bundleLastValidatedAt,
  );

  function handleRuntimeRetry() {
    void bootApp({ forceRetry: true });
  }

  onMount(() => {
    appDisposed = false;
    registerLaunchQueueConsumer();
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
  <header class="app-header" data-testid="app-topbar">
    <h1>UltraHDR Converter</h1>
    {#if runtimeInitState === "ready"}
      <button
        class="topbar-link"
        type="button"
        data-testid="app-about-link"
        on:click={openAbout}
      >
        About
      </button>
    {/if}
  </header>

  <section class="content-area" aria-live="polite">
    {#if runtimeInitState === "ready"}
      <span class="runtime-ready-marker" data-testid="runtime-init-ready"
        >Runtime ready</span
      >
      <span class="runtime-ready-marker" data-testid="runtime-init-provider">
        Runtime provider: {runtimeInitExecutionProvider || "unknown"}
      </span>
      {#if runtimeInitDegraded}
        <p class="runtime-ready-marker" data-testid="runtime-init-degraded">
          Compatibility mode active ({runtimeInitMode || "degraded runtime"}).
          Some devices may process more slowly.
        </p>
      {/if}
      <section
        class={`offline-readiness-card ${offlineReadinessSummary.tone}`}
        data-testid="offline-readiness-card"
        aria-live="polite"
      >
        <div class="offline-readiness-copy">
          <p class="offline-readiness-eyebrow">Offline readiness</p>
          <h2>{offlineReadinessSummary.title}</h2>
          <p>
            Confirm the AI models and encoders are cached before you lose
            connectivity.
          </p>
          <div class="offline-readiness-metadata">
            {#if pwaUpdateState.offlineBundleAssetCount}
              <span>{pwaUpdateState.offlineBundleAssetCount} assets</span>
            {/if}
            {#if offlineBundleSizeLabel}
              <span>{offlineBundleSizeLabel}</span>
            {/if}
            {#if offlineBundleValidatedAtLabel}
              <span>Last checked: {offlineBundleValidatedAtLabel}</span>
            {/if}
          </div>
          {#if pwaUpdateState.bundleDiagnostics}
            <div class="offline-readiness-diagnostics">
              {#if Number(pwaUpdateState.bundleDiagnostics.missingAssetCount) > 0}
                <span>
                  Missing assets: {pwaUpdateState.bundleDiagnostics.missingAssetCount}
                </span>
              {/if}
              {#if Number(pwaUpdateState.bundleDiagnostics.mismatchedAssetCount) > 0}
                <span>
                  Corrupt assets: {pwaUpdateState.bundleDiagnostics.mismatchedAssetCount}
                </span>
              {/if}
            </div>
          {/if}
          {#if pwaUpdateState.offlineBundleActionError}
            <p class="offline-readiness-error">
              {pwaUpdateState.offlineBundleActionError}
            </p>
          {/if}
        </div>
        <div class="offline-readiness-actions">
          <button
            type="button"
            class="footer-link"
            on:click={validateOfflineReadiness}
            disabled={pwaUpdateState.offlineBundleActionInFlight}
          >
            {#if pwaUpdateState.offlineBundleActionInFlight &&
            pwaUpdateState.offlineReadinessAction === "validate"}
              Validating...
            {:else}
              Validate offline bundle
            {/if}
          </button>
          <button
            type="button"
            class="footer-link"
            on:click={repairOfflineReadiness}
            disabled={pwaUpdateState.offlineBundleActionInFlight}
          >
            {#if pwaUpdateState.offlineBundleActionInFlight &&
            pwaUpdateState.offlineReadinessAction === "repair"}
              Repairing...
            {:else}
              Repair offline bundle
            {/if}
          </button>
        </div>
      </section>
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
    {:else}
      <ImageProcessor
        {files}
        {launchSource}
        {launchIntent}
        runtime={processingRuntime}
        runtimeExecutionProvider={runtimeInitExecutionProvider}
        on:reset={handleReset}
        on:processingbusychange={handleProcessingBusyChange}
      />
    {/if}
  </section>

  {#if runtimeInitState === "ready" && pwaUpdateState.notificationVisible}
    <div class="pwa-update-snackbar" data-testid="pwa-update-snackbar" role="status">
      <span class="pwa-update-snackbar-copy">
        {#if pwaUpdateState.pendingUntilIdle}
          Reload will happen when processing becomes idle.
        {:else}
          A new version is ready.
        {/if}
      </span>
      <button
        class="footer-link pwa-update-snackbar-action"
        type="button"
        on:click={applyAppUpdate}
        disabled={pwaUpdateState.applying || pwaUpdateState.pendingUntilIdle}
      >
        {#if pwaUpdateState.pendingUntilIdle}
          Waiting for idle...
        {:else if pwaUpdateState.applying}
          Updating...
        {:else}
          Reload
        {/if}
      </button>
      <button
        class="footer-link pwa-update-snackbar-action"
        type="button"
        on:click={dismissAppUpdate}
        disabled={pwaUpdateState.applying}
      >
        Dismiss
      </button>
    </div>
  {/if}

  <footer class="footer">
    {#if runtimeInitState === "ready"}
      {#if activeView === "about"}
        <button class="footer-link" type="button" on:click={openConverter}
          >Back to Converter</button
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
    gap: 1.15rem;
  }

  .app-header {
    padding-top: 0.15rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 2.5rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.2rem, 2vw, 1.55rem);
  }

  .topbar-link {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: var(--text-link);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .topbar-link:hover {
    text-decoration: underline;
  }

  .content-area {
    min-height: 40vh;
    display: grid;
    gap: 1rem;
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

  .offline-readiness-card {
    max-width: 980px;
    margin: 0 auto;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--border-subtle);
    background:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.92),
        rgba(244, 247, 250, 0.96)
      ),
      var(--surface);
    display: grid;
    gap: 0.9rem;
  }

  .offline-readiness-card.ready {
    border-color: rgba(21, 128, 61, 0.28);
  }

  .offline-readiness-card.warning {
    border-color: rgba(180, 83, 9, 0.34);
  }

  .offline-readiness-card h2,
  .offline-readiness-card p {
    margin: 0;
  }

  .offline-readiness-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }

  .offline-readiness-metadata,
  .offline-readiness-diagnostics,
  .offline-readiness-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .offline-readiness-metadata span,
  .offline-readiness-diagnostics span {
    padding: 0.35rem 0.55rem;
    border-radius: 999px;
    background: var(--surface-muted);
    color: var(--text-secondary);
    font-size: 0.88rem;
  }

  .offline-readiness-error {
    color: var(--queue-failed);
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

  .about-page {
    max-width: 720px;
    margin: 0 auto;
    padding: 0.2rem 0.1rem 0.45rem;
    display: grid;
    gap: 0.8rem;
  }

  .about-page h2,
  .about-page h3,
  .about-page p {
    margin: 0;
  }

  .about-page h2 {
    font-size: clamp(1.05rem, 2.2vw, 1.25rem);
    letter-spacing: -0.02em;
  }

  .about-page h3 {
    font-size: 0.94rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .about-page p {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .about-copy {
    display: grid;
    gap: 0.7rem;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.9rem;
    align-items: center;
    color: var(--text-muted);
    font-size: 0.8rem;
    border-top: 1px solid var(--divider-subtle);
    padding-top: 0.8rem;
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

  .pwa-update-snackbar {
    position: fixed;
    left: 0.75rem;
    right: 0.75rem;
    bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
    z-index: 120;
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem 0.8rem;
    align-items: center;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--border-subtle);
    border-radius: 1rem;
    background: color-mix(in srgb, var(--surface-active) 96%, transparent);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(16px) saturate(115%);
  }

  .pwa-update-snackbar-copy {
    color: var(--text-secondary);
    font-size: 0.9rem;
    flex: 1 1 14rem;
  }

  .pwa-update-snackbar-action:disabled {
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

    .pwa-update-snackbar {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      width: min(680px, calc(100vw - 1.5rem));
    }
  }
</style>
