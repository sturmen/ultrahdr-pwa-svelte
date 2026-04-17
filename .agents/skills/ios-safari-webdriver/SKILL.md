---
name: ios-safari-webdriver
description: Use this skill when working on iOS Safari bugs for a web app, especially when the task mentions a real iPhone, USB-connected device, WebDriver, Safari automation, Appium, touch or gesture bugs, viewport issues, scrolling, orientation changes, PWA behavior, image rendering, keyboard behavior, or natural-language test scenarios that should become executable real-device tests.
---

# Purpose

This skill turns natural-language iOS Safari bug reports or test scenarios into executable WebDriver-based tests, runs them against a real USB-connected iPhone when available, gathers evidence, applies the smallest safe fix, and reruns the tests.

Use this skill for real-device iOS Safari validation. Do not use it for generic browser testing when desktop WebKit or an existing simulator-only workflow is sufficient.

# When to use this skill

Use this skill when any of the following are true:

- The task explicitly asks for iPhone Safari, iOS Safari, Mobile Safari, WebDriver, Appium, or Safari automation.
- The task asks to convert natural-language scenarios into executable tests.
- The bug likely depends on real device behavior, such as:
  - tap, touch, drag, pinch, long press, scroll, momentum scroll
  - viewport sizing, safe areas, dynamic toolbar, orientation
  - keyboard appearance, focus, input zoom, file picker
  - PWA install/open behavior
  - camera, image decoding, color/HDR image rendering
  - permission prompts or Safari-specific media behavior
- The task mentions a USB-connected iPhone on a Mac host.

Do not use this skill for:
- pure unit-test work
- generic Chromium-only bugs
- unrelated backend issues
- broad refactors without a concrete reproduction flow

# Success criteria

A task using this skill is successful only if all of the following are true:

1. The scenario has been translated into a focused executable test.
2. Real-device prerequisites have been checked and explicitly reported.
3. The failing behavior is reproduced or the setup blocker is identified precisely.
4. Any code change is minimal and directly tied to the reproduced issue.
5. The targeted test passes after the change.
6. A brief regression check is run afterward.

# Required environment assumptions

Assume the host machine is a Mac. Real-device Safari automation depends on host and device configuration. Before writing or running tests, verify the setup instead of assuming it works.

Check for all of the following:

1. An iPhone is connected to the Mac by USB.
2. The device is trusted by the host.
3. The iPhone is unlocked.
4. On the iPhone:
   - Safari Web Inspector is enabled.
   - Safari Remote Automation is enabled.
5. On the Mac:
   - Safari remote automation is enabled.
   - `safaridriver --enable` has already been run if required by the toolchain.
6. The app under test is reachable from the iPhone.

If any item is missing, stop the active test loop and print a concise blocking report with the exact missing prerequisite.

# Preferred toolchain selection

Choose the narrowest existing toolchain already present in the repository.

Order of preference:

1. Existing WebDriver/Appium/Safari real-device stack already in the repo.
2. Existing WebDriverIO or Selenium setup that can target iOS Safari.
3. Existing Appium setup targeting Safari on iPhone.
4. If no real-device stack exists, create the smallest maintainable Appium-based Safari harness only if the task requires executable real-device testing and no existing equivalent is available.

Do not introduce a second competing test framework when one already exists.

# Input contract

You may receive input in any of these forms:

- a natural-language bug report
- one or more natural-language test scenarios
- an issue title plus reproduction notes
- a request like “write a test for this iOS Safari bug”
- a request like “run this on the connected iPhone”

Treat the natural-language scenario as the source of truth. Preserve it in the generated test file as a comment above the test.

# How to convert natural-language scenarios into tests

For each scenario:

1. Extract a short test title.
2. Identify preconditions.
3. Identify the exact sequence of user actions.
4. Identify expected visible outcomes.
5. Identify any Safari- or iPhone-specific constraints.
6. Encode those into one focused executable test.

When the scenario is ambiguous:
- choose the narrowest interpretation consistent with the text
- avoid inventing product requirements
- document the assumption in a comment in the test

Each generated test should contain:
- title
- original scenario as a block comment
- explicit setup
- exact actions
- exact assertions
- cleanup if needed

# Test authoring rules

- Put generated tests under `tests/ios-safari/` unless the repo already uses a different established location.
- Use file names based on the feature or bug, such as:
  - `tests/ios-safari/orientation-hdr-image.spec.ts`
  - `tests/ios-safari/pwa-open-from-share-sheet.spec.ts`
- Keep each test small and deterministic.
- Prefer assertions based on stable UI state, text, element geometry, computed values, or URL state.
- Prefer explicit waits for stable conditions instead of fixed sleeps.
- Use fixed sleeps only when platform timing leaves no robust alternative, and keep them minimal.
- For touch and gesture actions, use the test framework’s supported interaction APIs rather than fragile DOM event dispatch when real device behavior matters.
- Capture artifacts on failure when the stack supports them:
  - screenshot
  - page source or DOM snapshot
  - console output
  - session/device details

# Execution workflow

For each requested task, follow this exact order:

1. Read the bug report or scenario carefully.
2. Inspect the repository and detect the existing package manager, scripts, and test stack.
3. Verify the real-device prerequisites.
4. Start or verify the local dev server.
5. Confirm the app URL is reachable from the iPhone.
6. Create or update one focused executable test for the scenario.
7. Run only that focused test first.
8. If the test fails:
   - determine the smallest plausible root cause
   - patch the smallest relevant area of code
   - rerun the same test
9. Once the focused test passes, run the broader iOS Safari suite or the nearest regression subset.
10. Report the outcome in the required format below.

# Code-change policy

When fixing a failure:

- Prefer the smallest safe change that explains the observed behavior.
- Avoid unrelated cleanup.
- Do not rename or move files unless necessary.
- Do not rewrite large areas of the UI to satisfy one flaky test.
- Do not weaken assertions solely to make a failing test pass.
- Do not add broad compatibility code without evidence that it is required for iOS Safari.

# Reporting format

Every run must end with this structure:

## Setup check
- USB-connected iPhone: pass/fail
- Device trusted: pass/fail
- Device unlocked: pass/fail
- Web Inspector enabled: pass/fail
- Remote Automation enabled: pass/fail
- Host Safari automation enabled: pass/fail
- App reachable from device: pass/fail

## Scenario
<original natural-language scenario>

## Generated test
- File: <path>
- Test: <name>

## Result
- pass/fail

## If failed
- exact failing step
- exact failing assertion or driver error
- artifacts captured

## Code changes
- list of edited files
- one-line reason for each

## Root cause
- concise explanation tied to observed behavior

## Regression check
- what broader suite or subset was run
- pass/fail

## Next action
- the immediate next step taken, or `none`

# Behavior when blocked

If blocked by environment setup, do not continue guessing. Report the blocker precisely.

Example blockers:
- iPhone connected but not trusted
- Remote Automation disabled on the device
- local dev server not bound to a reachable host
- no existing real-device stack and adding one would require new dependencies
- app cannot load on the device due to network restrictions

When blocked, provide:
- the exact blocking condition
- the exact setting, command, or file needed
- whether code changes were attempted: yes or no

# Repo adaptation rules

At the start of each task:
- inspect `package.json`, lockfiles, test directories, and existing scripts
- reuse existing commands whenever possible
- avoid guessing package manager or port if the repo already specifies them
- if the repo contains iOS Safari test helpers, prefer extending them over creating new ones

# Suggested command discovery behavior

Look for and prefer existing commands such as:
- install
- dev
- build
- lint
- test
- test:ios
- test:ios-safari
- appium
- webdriver
- e2e

If no command exists for real-device iOS Safari tests, create the smallest clear command surface needed and keep it narrowly scoped.

# Real-device URL rules

The app must be reachable from the iPhone.

Prefer, in order:
1. an existing documented local URL workflow in the repo
2. a LAN-reachable host-bound dev server
3. a documented local tunnel already used in the project

Do not silently switch to a simulator-only flow when the task explicitly requires a real connected iPhone.

# Safety boundaries

- Never commit, push, merge, or open a PR unless explicitly requested.
- Never modify macOS security settings, Safari preferences, device trust, or iPhone settings automatically unless explicitly requested.
- Never install global tools unless explicitly necessary and approved by the task context.
- Never change signing, provisioning, or unrelated mobile configuration.
- Never fake a pass when a real-device run did not occur.

# Notes on Codex behavior

This skill is for a repeatable workflow. Keep the loop tight:
- reproduce
- isolate
- patch
- rerun
- summarize

Prefer one failing scenario and one fix at a time.