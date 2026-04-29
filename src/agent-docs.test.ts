import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('agent context pack', () => {
  const repoRoot = resolve('.');
  const agentContextPath = resolve(repoRoot, 'docs/agent-context.md');
  const agentIndexPath = resolve(repoRoot, 'docs/agent-index.md');
  const checklistPath = resolve(repoRoot, 'docs/agent-change-checklist.md');

  it('provides dedicated agent context docs with the expected topic coverage', () => {
    expect(existsSync(agentContextPath)).toBe(true);
    expect(existsSync(agentIndexPath)).toBe(true);
    expect(existsSync(checklistPath)).toBe(true);

    const agentContext = readFileSync(agentContextPath, 'utf8');
    const agentIndex = readFileSync(agentIndexPath, 'utf8');
    const checklist = readFileSync(checklistPath, 'utf8');

    expect(agentContext).toContain('## Purpose');
    expect(agentContext).toContain('## Constraints');
    expect(agentContext).toContain('## Top-Level Modules');
    expect(agentContext).toContain('## Key Runtime Flows');
    expect(agentContext).toContain('## Commands');
    expect(agentContext).toContain('## Diagnostics Breadcrumbs');
    expect(agentContext).toContain('## Boundaries');

    expect(agentIndex).toContain('## Task Router');
    expect(agentIndex).toContain('processing pipeline bug');
    expect(agentIndex).toContain('offline/runtime issue');
    expect(agentIndex).toContain('PWA/service worker');
    expect(agentIndex).toContain('GMNet/model/runtime');
    expect(agentIndex).toContain('Playwright regression');
    expect(agentIndex).toContain('build/versioning');

    expect(checklist).toContain('## TDD Workflow');
    expect(checklist).toContain('## Breadcrumb Contract');
    expect(checklist).toContain('## Runtime Asset Discipline');
    expect(checklist).toContain('Do not fetch runtime assets directly with raw `fetch(...)`');
    expect(checklist).toContain('src/lib/runtime-asset-definitions.ts');
    expect(checklist).toContain('src/lib/runtime-assets.ts');
    expect(checklist).toContain('## Validation Sequence');
    expect(checklist).toContain('## When To Update Agent Docs');
  });

  it('makes AGENTS.md the policy layer and points to the dedicated docs', () => {
    const agentsInstructions = readFileSync(resolve(repoRoot, 'AGENTS.md'), 'utf8');

    expect(agentsInstructions).toContain('docs/agent-context.md');
    expect(agentsInstructions).toContain('docs/agent-index.md');
    expect(agentsInstructions).toContain('docs/agent-change-checklist.md');
    expect(agentsInstructions).toContain('read the agent-context docs before broad repo exploration');
    expect(agentsInstructions).toContain('prefer targeted reads');
    expect(agentsInstructions).toContain('update agent docs when behavior, architecture, commands, or file ownership changes');
  });

  it('keeps Claude and Gemini guidance as thin wrappers instead of duplicated repo rules', () => {
    const claudeInstructions = readFileSync(resolve(repoRoot, 'CLAUDE.md'), 'utf8');
    const geminiInstructions = readFileSync(resolve(repoRoot, 'GEMINI.md'), 'utf8');

    for (const instructions of [claudeInstructions, geminiInstructions]) {
      expect(instructions).toContain('AGENTS.md');
      expect(instructions).toContain('docs/agent-context.md');
      expect(instructions).toContain('docs/agent-index.md');
      expect(instructions).toContain('docs/agent-change-checklist.md');
      expect(instructions).not.toContain('Red–Green–Refactor Cycle (Mandatory)');
      expect(instructions).not.toContain('Diagnostics Breadcrumb Requirement');
    }
  });
});
