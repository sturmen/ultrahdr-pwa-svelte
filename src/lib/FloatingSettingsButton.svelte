<script lang="ts">
  import {
    FLOATING_SETTINGS_BUTTON_BOTTOM,
    FLOATING_SETTINGS_BUTTON_LIFTED_BOTTOM,
  } from "./constants.ts";

  export let liftedForUpdate = false;
  export let onOpen: () => void = () => {};

  $: bottomOffset = liftedForUpdate
    ? FLOATING_SETTINGS_BUTTON_LIFTED_BOTTOM
    : FLOATING_SETTINGS_BUTTON_BOTTOM;
</script>

<div
  class="fab-layer"
  data-testid="floating-settings-layer"
  style:bottom={bottomOffset}
>
  <button
    class="floating-gear"
    type="button"
    data-testid="floating-gear"
    aria-label="Open settings"
    on:click={onOpen}
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

<style>
  .fab-layer {
    position: fixed;
    right: 1rem;
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

  @media (min-width: 1024px) {
    .fab-layer {
      right: 1.25rem;
      bottom: 1.25rem !important;
    }
  }
</style>
