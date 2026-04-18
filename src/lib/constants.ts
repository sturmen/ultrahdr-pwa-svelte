export const IMAGE_MAX_LONG_EDGE = 16384;
export const GMNET_MAX_LONG_EDGE = IMAGE_MAX_LONG_EDGE / 2;

export const PWA_UPDATE_SNACKBAR_COPY = {
  ready: "A new version is ready.",
  pendingUntilIdle: "Reload will happen when processing becomes idle.",
} as const;

export const PWA_UPDATE_SNACKBAR_RELOAD_LABEL = {
  idle: "Reload",
  pendingUntilIdle: "Waiting for idle...",
  applying: "Updating...",
} as const;

export const PWA_UPDATE_SNACKBAR_DISMISS_LABEL = "Dismiss";

export const FLOATING_SETTINGS_BUTTON_BOTTOM =
  "calc(env(safe-area-inset-bottom, 0px) + 4.8rem)";

export const FLOATING_SETTINGS_BUTTON_LIFTED_BOTTOM =
  "calc(env(safe-area-inset-bottom, 0px) + 9.6rem)";
