import { describe, expect, it } from "vitest";
import {
  FLOATING_SETTINGS_BUTTON_BOTTOM,
  FLOATING_SETTINGS_BUTTON_LIFTED_BOTTOM,
  PWA_UPDATE_SNACKBAR_COPY,
  PWA_UPDATE_SNACKBAR_DISMISS_LABEL,
  PWA_UPDATE_SNACKBAR_RELOAD_LABEL,
} from "../constants.ts";

describe("shared UI constants", () => {
  it("exports update snackbar copy labels", () => {
    expect(PWA_UPDATE_SNACKBAR_COPY.ready).toBe("A new version is ready.");
    expect(PWA_UPDATE_SNACKBAR_COPY.pendingUntilIdle).toBe(
      "Reload will happen when processing becomes idle.",
    );
    expect(PWA_UPDATE_SNACKBAR_RELOAD_LABEL.idle).toBe("Reload");
    expect(PWA_UPDATE_SNACKBAR_RELOAD_LABEL.pendingUntilIdle).toBe("Waiting for idle...");
    expect(PWA_UPDATE_SNACKBAR_RELOAD_LABEL.applying).toBe("Updating...");
    expect(PWA_UPDATE_SNACKBAR_DISMISS_LABEL).toBe("Dismiss");
  });

  it("exports floating settings button offsets", () => {
    expect(FLOATING_SETTINGS_BUTTON_BOTTOM).toBe(
      "calc(env(safe-area-inset-bottom, 0px) + 4.8rem)",
    );
    expect(FLOATING_SETTINGS_BUTTON_LIFTED_BOTTOM).toBe(
      "calc(env(safe-area-inset-bottom, 0px) + 9.6rem)",
    );
  });
});
