You practice TDD (test-driven development) where, when implementing a feature, you write a failing test for it first and then make the necessary changes to complete the feature and make the test pass.

You anticipate edge cases with your test definitions, like offline mode, odd device properties, missing device capabilities (like javascript disabled).

You strive for 100% test coverage.

If there is not an existing framework in the project to test the desired change, you suggest a way to create such a test.

Build instructions:
`npm run build:wasm && npm run build`

Test instrucitons:
`npm run test`

Preview instructions:
`npm run preview`

Deploy instructions:
`npm run deploy`

To test every task completion, you must successfully run *all* build steps and unit tests, even the ones not affected by your changes.

All new code should be written with an "AI-agent-first" philoosphy so that functionality and their tests can be effectively run autonomously by AI agents without needing human intervention during development and iteration.

If you run into EPERM or other permission errors, you should halt and ask the user to run the commands on your behalf.

12. Decision-Complete Implementation Addendum

12.1 Implementation Invariants (Non-Negotiable)

The following constraints apply globally and override any ambiguous instruction elsewhere in this document.
	1.	No Production Mocks
	•	No mock repositories, mock model outputs, stub metadata writers, or fake data providers may exist in production targets.
	•	Any type named Mock*, Fake*, Stub*, or Sample* must exist only in test targets.
	•	Production behavior must use real system APIs (PhotoKit, persistence layer, on-device models, etc.).
	2.	End-to-End Functionality Required
Every primary feature flow must be operational end-to-end:
	•	Onboarding → Permissions → Model Initialization → Main Stack → Metadata Writeback → History → Settings → Voice Chat.
	•	Data created in one flow must persist and be visible in subsequent flows.
	3.	No Placeholders
	•	No TODO/FIXME markers.
	•	No placeholder screens, static demo text, or hardcoded example photos.
	•	No “Coming Soon” UI elements.
	4.	Offline Guarantee
	•	No network calls unless explicitly permitted in this document.
	•	Unit tests must run in a network-disabled environment.
	•	The app must remain fully functional in airplane mode.
	5.	Deterministic Behavior
	•	No hidden randomness.
	•	Any non-deterministic behavior must use injected seeds and be testable.

⸻

12.2 Definition of Done (Global)

A feature or task is considered complete only if all of the following are true:
	1.	All unit tests pass.
	2.	All integration tests pass.
	3.	All UI tests pass.
	4.	Coverage meets or exceeds the specified threshold (see 12.3).
	5.	Manual Acceptance Script (Section 12.8) passes.
	6.	No production code references test-only utilities.
	7.	No TODO/FIXME markers remain.

If any condition fails, the task is incomplete.

⸻

12.3 Testing & Coverage Requirements
	1.	Minimum Coverage
	•	100% line coverage for core domain logic.
	•	95%+ line coverage overall unless explicitly justified inline.
	2.	Required Test Categories
For each major feature:
	•	Unit tests (pure logic)
	•	Integration tests (boundary layers: persistence, metadata writer, model adapter)
	•	UI tests (user flows)
	3.	Failure Simulation
Tests must simulate:
	•	Permissions denied
	•	Model initialization failure
	•	Corrupt metadata
	•	No compatible photos
	•	Offline mode
	•	Low storage condition