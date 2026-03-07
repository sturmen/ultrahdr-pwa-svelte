<script>
  import { createEventDispatcher } from "svelte";

  export let state = "running";
  export let steps = [];
  export let failure = null;

  const dispatch = createEventDispatcher();
  let copyStatus = "";

  function formatStatus(status) {
    if (status === "passed") return "Passed";
    if (status === "running") return "Running";
    if (status === "failed") return "Failed";
    return "Pending";
  }

  function statusSymbol(status) {
    if (status === "passed") return "✓";
    if (status === "failed") return "!";
    if (status === "running") return "…";
    return "○";
  }

  function buildDiagnosticsPayload() {
    if (!failure) {
      return null;
    }
    const runtimeInitProgressTrace = Array.isArray(failure.runtimeInitProgressTrace)
      ? failure.runtimeInitProgressTrace
      : null;
    const runtimeInitFailureHistory = Array.isArray(failure.runtimeInitFailureHistory)
      ? failure.runtimeInitFailureHistory
      : null;
    const runtimeInitFailureHistoryCount = Number.isFinite(
      Number(failure?.diagnostics?.runtimeInitFailureHistoryCount)
    )
      ? failure.diagnostics.runtimeInitFailureHistoryCount
      : null;
    return {
      errorCode: failure.errorCode || null,
      stepId: failure.stepId || null,
      stepLabel: failure.stepLabel || null,
      message: failure.message || null,
      userMessage: failure.userMessage || null,
      diagnostics: failure.diagnostics || null,
      runtimeInitProgressTrace,
      runtimeInitFailureHistory,
      runtimeInitFailureHistoryCount,
    };
  }

  async function copyDiagnostics() {
    const payload = buildDiagnosticsPayload();
    if (!payload) {
      return;
    }

    const text = JSON.stringify(payload, null, 2);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "readonly");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      copyStatus = "Diagnostics copied.";
    } catch {
      copyStatus = "Could not copy diagnostics. Select text below manually.";
    }
  }

  function retry() {
    copyStatus = "";
    dispatch("retry");
  }

  $: diagnosticsJson = failure
    ? JSON.stringify(buildDiagnosticsPayload(), null, 2)
    : "";
  $: offlineBundleBlocked =
    failure?.errorCode === "RUNTIME_INIT_OFFLINE_BUNDLE_NOT_READY";
</script>

<section
  class="runtime-init-gate card"
  data-testid="runtime-init-gate"
  aria-live="polite"
>
  <h2>Initializing Runtime</h2>
  <p class="description">
    Startup checks must pass before UltraHDR conversion can begin.
  </p>

  {#if state !== "failed"}
    <p class="status-running" data-testid="runtime-init-loading">
      Running startup checks...
    </p>
  {/if}

  <ol class="checklist">
    {#each steps as step (step.id)}
      <li
        class={`step ${step.status || "pending"}`}
        data-testid={`runtime-step-${step.id}`}
      >
        <div class="step-row">
          <span class="symbol" aria-hidden="true"
            >{statusSymbol(step.status)}</span
          >
          <span class="label">{step.label || step.id}</span>
          <span class="status">{formatStatus(step.status)}</span>
        </div>
        {#if step.note}
          <p class="note">{step.note}</p>
        {/if}
      </li>
    {/each}
  </ol>

  {#if state === "failed" && failure}
    <section
      class="failure card"
      data-testid="runtime-init-failure"
      role="alert"
    >
      <h3>Initialization Failed</h3>
      <p>
        <b>Step:</b>
        {failure.stepLabel || failure.stepId || "Unknown step"}
      </p>
      {#if failure.errorCode}
        <p><b>Error code:</b> {failure.errorCode}</p>
      {/if}
      <p>
        {failure.userMessage ||
          failure.message ||
          "Runtime initialization failed."}
      </p>
      {#if offlineBundleBlocked}
        <p
          class="hint"
          data-testid="runtime-init-offline-bundle-blocked"
        >
          Connect to the internet to prepare required runtime assets, then retry
          initialization.
        </p>
      {/if}
      <p class="hint">
        Retry initialization. If the issue persists, copy diagnostics and
        include them in a bug report.
      </p>

      <div class="actions">
        <button
          type="button"
          class="primary"
          data-testid="runtime-init-retry"
          on:click={retry}
        >
          Retry Initialization
        </button>
        <button
          type="button"
          class="secondary"
          data-testid="runtime-init-copy-diagnostics"
          on:click={copyDiagnostics}
        >
          Copy Diagnostics
        </button>
      </div>
      {#if copyStatus}
        <p class="copy-status">{copyStatus}</p>
      {/if}

      <details class="diagnostics">
        <summary data-testid="runtime-init-diagnostics-summary"
          >Technical diagnostics</summary
        >
        <pre data-testid="runtime-init-diagnostics-json">{diagnosticsJson}</pre>
      </details>
    </section>
  {/if}
</section>

<style>
  .runtime-init-gate {
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    gap: 0.8rem;
  }

  .runtime-init-gate h2,
  .runtime-init-gate h3,
  .runtime-init-gate p {
    margin: 0;
  }

  .description,
  .status-running,
  .note,
  .hint,
  .copy-status {
    color: var(--text-secondary);
  }

  .checklist {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.6rem;
  }

  .step {
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 0.65rem 0.75rem;
    background: var(--surface-muted);
  }

  .step.running {
    border-color: var(--queue-processing);
  }

  .step.passed {
    border-color: var(--queue-completed);
  }

  .step.failed {
    border-color: var(--queue-failed);
  }

  .step-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .symbol {
    width: 1.2rem;
    text-align: center;
    font-weight: 700;
  }

  .label {
    flex: 1;
    font-weight: 600;
  }

  .status {
    font-size: 0.85rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .note {
    margin-top: 0.3rem;
    font-size: 0.9rem;
  }

  .failure {
    display: grid;
    gap: 0.55rem;
    border-color: color-mix(
      in srgb,
      var(--queue-failed) 62%,
      var(--border-subtle)
    );
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .primary {
    background: var(--primary-color);
    color: var(--text-on-primary);
  }

  .secondary {
    background: var(--surface-color);
    color: var(--text-color);
    border: 1px solid var(--border-subtle);
  }

  .diagnostics {
    border-top: 1px solid var(--border-subtle);
    padding-top: 0.6rem;
  }

  .diagnostics summary {
    cursor: pointer;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .diagnostics pre {
    margin: 0.5rem 0 0;
    max-height: 220px;
    overflow: auto;
    padding: 0.6rem;
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--surface-color) 88%, transparent);
    color: var(--text-secondary);
    font-size: 0.75rem;
    line-height: 1.45;
  }
</style>
