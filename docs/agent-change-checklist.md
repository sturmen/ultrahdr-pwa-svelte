# Agent Change Checklist

## TDD Workflow

- Write the failing test first.
- Run the test and confirm it fails for the intended reason.
- Add the minimal implementation needed to make that test pass.
- Refactor only after the test is green.
- Do not leave failing tests in the repo.

## Breadcrumb Contract

- Add or update structured diagnostics breadcrumbs for new user-visible flows and processing-significant state transitions.
- Cover initialization, processing, worker lifecycle, storage pressure, recovery, fallback, and failure paths when the change touches them.
- Treat breadcrumb assertions as part of the observable contract in tests.
- Keep payloads bounded, privacy-conscious, and useful for offline debugging.

## Validation Sequence

- Run `npm test`.
- Run `npm run typecheck`.
- Run `npm run build` when code, bundling, or runtime assets change.
- Run the nearest integration or e2e command when browser-observable behavior changes.
- If coverage or a full suite cannot run, document the precise reason.

## Repo Constraints

- Preserve offline-first behavior.
- Do not introduce canvas-based rendering unless explicitly required.
- Prefer strictly typed TypeScript and migrate touched JavaScript to TypeScript where practical.
- Halt and ask the user to run commands if you hit `EPERM` or other permission failures.

## When To Update Agent Docs

- Update [agent-context.md](./agent-context.md) when architecture, major flows, commands, or repo boundaries change.
- Update [agent-index.md](./agent-index.md) when task routing or likely file ownership changes.
- Update this checklist when repo-wide execution rules change.
- Keep `AGENTS.md` as the policy layer; keep repo facts in the dedicated docs.
