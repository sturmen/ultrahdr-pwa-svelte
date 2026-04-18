# MobileSafari Worker Module Re-evaluation

## Status

Open platform/runtime issue. Product-side duplicate-job mitigation remains in place. Temporary verbose tracing used for this investigation has been removed from production code.

## Summary

Real MobileSafari on iPhone re-evaluated the processing worker module graph twice inside the same worker global scope.

This was investigated because one queued HEIC job previously produced two pipeline executions and likely amplified memory pressure.

## Confirmed Findings

- App constructed one worker client, not two.
- Same worker global scope was evaluated twice.
- Each module evaluation registered a `message` listener once.
- One main-thread `postMessage` reached both listeners.
- Product-side shared worker state prevented second listener from running full job path, so current builds no longer do full expensive processing twice for the same `jobId`.

## Real-device Evidence

Observed on real iPhone 13 Pro through Appium + MobileSafari WebDriver.

Sequence captured during investigation:

1. One worker client construction on main thread.
2. Worker entry module evaluated twice in same scope.
3. Static worker dependency module also evaluated twice in same scope.
4. Listener registration happened twice in same scope.
5. One worker process dispatch reached two listeners.
6. First listener processed job.
7. Second listener saw same in-flight `jobId` and was ignored by shared-state guard.

## What This Means

- Root cause of duplicate handling is not app creating two workers.
- Duplicate handling happens at worker module-graph evaluation level inside MobileSafari/WebKit.
- Before mitigation, this likely caused duplicate expensive processing and higher peak memory pressure.
- After mitigation, duplicate module evaluation still wastes some startup work, but per-job heavy processing should run once.

## Unknowns

- Exact WebKit internal trigger for same-scope module-graph re-evaluation.
- Whether issue is specific to this worker/module graph shape or reproducible with a minimal standalone module worker.

## Recommended Next Steps

1. Build minimal standalone MobileSafari module-worker repro outside app code.
2. If repro holds, file WebKit bug with:
   - one worker construction
   - same-scope double evaluation
   - same-message dual listener delivery
3. Keep product-side worker duplicate-job guard.
4. Consider making worker listener registration explicitly idempotent on `self` as extra defense.
