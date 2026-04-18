<script lang="ts">
  import {
    PWA_UPDATE_SNACKBAR_COPY,
    PWA_UPDATE_SNACKBAR_DISMISS_LABEL,
    PWA_UPDATE_SNACKBAR_RELOAD_LABEL,
  } from "./constants.ts";

  export let pendingUntilIdle = false;
  export let applying = false;
  export let onApplyUpdate: () => void | Promise<void> = () => {};
  export let onDismiss: () => void | Promise<void> = () => {};
</script>

<div
  class="pwa-update-snackbar"
  data-testid="pwa-update-snackbar"
  role="status"
  style:flex-wrap="nowrap"
>
  <span class="pwa-update-snackbar-copy" style:white-space="nowrap">
    {#if pendingUntilIdle}
      {PWA_UPDATE_SNACKBAR_COPY.pendingUntilIdle}
    {:else}
      {PWA_UPDATE_SNACKBAR_COPY.ready}
    {/if}
  </span>
  <div class="pwa-update-snackbar-actions">
    <button
      class="footer-link pwa-update-snackbar-action"
      type="button"
      on:click={onApplyUpdate}
      disabled={applying || pendingUntilIdle}
      style:white-space="nowrap"
    >
      {#if pendingUntilIdle}
        {PWA_UPDATE_SNACKBAR_RELOAD_LABEL.pendingUntilIdle}
      {:else if applying}
        {PWA_UPDATE_SNACKBAR_RELOAD_LABEL.applying}
      {:else}
        {PWA_UPDATE_SNACKBAR_RELOAD_LABEL.idle}
      {/if}
    </button>
    <button
      class="footer-link pwa-update-snackbar-action"
      type="button"
      on:click={onDismiss}
      disabled={applying}
      style:white-space="nowrap"
    >
      {PWA_UPDATE_SNACKBAR_DISMISS_LABEL}
    </button>
  </div>
</div>

<style>
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
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pwa-update-snackbar-actions {
    display: inline-flex;
    flex-shrink: 0;
    gap: 0.8rem;
    align-items: center;
  }

  .pwa-update-snackbar-action:disabled {
    opacity: 0.65;
    cursor: progress;
  }

  @media (min-width: 768px) {
    .pwa-update-snackbar {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      width: min(680px, calc(100vw - 1.5rem));
    }
  }
</style>
