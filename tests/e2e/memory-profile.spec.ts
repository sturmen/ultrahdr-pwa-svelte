// @ts-check
/**
 * Memory profiling harness. Runs each fixture through the full pipeline under Chromium
 * (with --enable-precise-memory-info), samples `performance.memory.usedJSHeapSize`
 * every SAMPLE_INTERVAL_MS, and stamps the most recent pipeline stage on every sample.
 * Output is a per-stage peak-heap report written to the test attachment and to stdout.
 *
 * Run:
 *   npx playwright test --project=chromium tests/e2e/memory-profile.spec.ts --reporter=line
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ensureRuntimeGateReady, installStartupRuntimeOverride } from './runtime-gate.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIPELINE_STATE_KEY = '__ultrahdrPipelineState';
const SAMPLES_KEY = '__ultrahdrMemorySamples';
const STAGE_EVENTS_KEY = '__ultrahdrMemoryStageEvents';
const SAMPLE_INTERVAL_MS = 20;
const PROCESSING_TIMEOUT = 600_000;
const POLL_INTERVAL = 250;

const FIXTURES = [
    { label: 'heic-spatial-gainmap', file: 'fixtures/test_hdr_heif_spatial_gainmap.HEIC' },
    { label: 'heic-gainmap', file: 'fixtures/test_hdr_heif_gainmap.HEIC' },
    { label: 'hif-hdr-intent', file: 'fixtures/test_hdr_no_gain_map.HIF' },
    { label: 'sdr-large', file: 'fixtures/test_sdr.jpg' },
    { label: 'jpeg-gainmap', file: 'fixtures/test_hdr_jpeg_gainmap.jpg' },
];

test.use({
    launchOptions: {
        args: [
            '--enable-unsafe-webgpu',
            '--ignore-gpu-blocklist',
            '--use-angle=metal',
            '--enable-precise-memory-info',
            '--js-flags=--expose-gc',
        ],
    },
});

type StageEvent = {
    ts: number;
    elapsedMs: number;
    phase: string;
    stage: string | null;
    substage: string | null;
    usedHeapBytes: number | null;
};

type Sample = { ts: number; used: number; stage: string | null };

type StageReport = {
    stage: string;
    peakHeapMB: number;
    peakAtMs: number;
    endHeapMB: number | null;
    sampleCount: number;
};

async function installMemoryProbe(page: import('@playwright/test').Page) {
    await page.addInitScript(
        ({ samplesKey, stageEventsKey, stateKey, intervalMs }) => {
            const w = window as unknown as Record<string, unknown>;
            if (w[samplesKey]) return;
            const samples: Array<{ ts: number; used: number; stage: string | null }> = [];
            const stageEvents: Array<Record<string, unknown>> = [];
            w[samplesKey] = samples;
            w[stageEventsKey] = stageEvents;

            const perfMem = (): { usedJSHeapSize: number } | null => {
                const p = performance as Performance & {
                    memory?: { usedJSHeapSize: number };
                };
                return p.memory && typeof p.memory.usedJSHeapSize === 'number'
                    ? { usedJSHeapSize: p.memory.usedJSHeapSize }
                    : null;
            };

            const currentStage = (): string | null => {
                const state = w[stateKey] as { stage?: unknown } | undefined;
                if (state && typeof state.stage === 'string') return state.stage;
                return null;
            };

            setInterval(() => {
                const mem = perfMem();
                if (!mem) return;
                samples.push({ ts: performance.now(), used: mem.usedJSHeapSize, stage: currentStage() });
            }, intervalMs);

            const PIPELINE_PROGRESS_EVENT = 'ultrahdr:processing-progress';
            window.addEventListener(PIPELINE_PROGRESS_EVENT, (event) => {
                const mem = perfMem();
                const detail = (event as CustomEvent).detail || {};
                stageEvents.push({
                    ts: performance.now(),
                    elapsedMs: typeof detail.elapsedMs === 'number' ? detail.elapsedMs : null,
                    phase: typeof detail.phase === 'string' ? detail.phase : 'unknown',
                    stage: typeof detail.stage === 'string' ? detail.stage : null,
                    substage: typeof detail.substage === 'string' ? detail.substage : null,
                    usedHeapBytes: mem ? mem.usedJSHeapSize : null,
                });
            });
        },
        {
            samplesKey: SAMPLES_KEY,
            stageEventsKey: STAGE_EVENTS_KEY,
            stateKey: PIPELINE_STATE_KEY,
            intervalMs: SAMPLE_INTERVAL_MS,
        },
    );
}

async function uploadFile(page: import('@playwright/test').Page, fullPath: string) {
    await page.waitForFunction(() =>
        Boolean(document.querySelector('#file-upload') || document.querySelector('#add-files')),
    );
    const selector = await page.evaluate(() =>
        document.querySelector('#file-upload') ? '#file-upload' : '#add-files',
    );
    await page.locator(selector!).setInputFiles(fullPath);
}

async function waitForProcessingDone(page: import('@playwright/test').Page) {
    const start = Date.now();
    while (Date.now() - start < PROCESSING_TIMEOUT) {
        const snapshot = await page.evaluate((stateKey) => {
            const errorEl = document.querySelector('.error p');
            const resultCards = Array.from(document.querySelectorAll('.result-card'));
            const completed = resultCards.filter(
                (c) => !c.classList.contains('pending') && !c.classList.contains('failed'),
            ).length;
            const pending = resultCards.filter((c) => c.classList.contains('pending')).length;
            const pipelineState = (window as Record<string, unknown>)[stateKey] as
                | { phase?: string; error?: { message?: string }; stage?: string }
                | null;
            return {
                errorText: errorEl ? errorEl.textContent : null,
                completed,
                pending,
                phase: pipelineState?.phase || null,
                stage: pipelineState?.stage || null,
                errorMsg: pipelineState?.error?.message || null,
            };
        }, PIPELINE_STATE_KEY);

        if (snapshot.errorText) {
            throw new Error(`Processing failed (DOM): ${snapshot.errorText}`);
        }
        if (snapshot.phase === 'pipeline-error') {
            throw new Error(`Processing failed (pipeline): ${snapshot.errorMsg || 'unknown'} stage=${snapshot.stage}`);
        }
        if (snapshot.completed >= 1 && snapshot.pending === 0) {
            return;
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    }
    throw new Error('Processing timed out');
}

function summarizePerStage(samples: Sample[]): StageReport[] {
    const perStage = new Map<string, { peak: number; peakAtMs: number; last: number; count: number }>();
    for (const s of samples) {
        const key = s.stage || '<pre-pipeline>';
        const entry = perStage.get(key) || { peak: 0, peakAtMs: 0, last: 0, count: 0 };
        if (s.used > entry.peak) {
            entry.peak = s.used;
            entry.peakAtMs = s.ts;
        }
        entry.last = s.used;
        entry.count += 1;
        perStage.set(key, entry);
    }
    const reports: StageReport[] = [];
    for (const [stage, entry] of perStage) {
        reports.push({
            stage,
            peakHeapMB: Number((entry.peak / (1024 * 1024)).toFixed(1)),
            peakAtMs: Number(entry.peakAtMs.toFixed(0)),
            endHeapMB: Number((entry.last / (1024 * 1024)).toFixed(1)),
            sampleCount: entry.count,
        });
    }
    reports.sort((a, b) => b.peakHeapMB - a.peakHeapMB);
    return reports;
}

for (const fixture of FIXTURES) {
    test(`memory profile: ${fixture.label}`, async ({ page }, testInfo) => {
        await installStartupRuntimeOverride(page, { projectName: testInfo.project.name });
        await installMemoryProbe(page);
        await page.goto('/ultrahdr-pwa-svelte/');
        await ensureRuntimeGateReady(page, testInfo, { timeoutMs: 240_000 });

        const memAvail = await page.evaluate(() => {
            const p = performance as Performance & { memory?: { usedJSHeapSize: number } };
            return Boolean(p.memory && typeof p.memory.usedJSHeapSize === 'number');
        });
        test.skip(!memAvail, 'performance.memory not available in this browser');

        const fullPath = path.resolve(__dirname, '../..', fixture.file);
        if (!fs.existsSync(fullPath)) {
            test.skip(true, `fixture missing: ${fixture.file}`);
            return;
        }

        await uploadFile(page, fullPath);
        await waitForProcessingDone(page);

        const { samples, stageEvents, overallPeak } = await page.evaluate(
            ({ samplesKey, stageEventsKey }) => {
                const w = window as Record<string, unknown>;
                const samples = (w[samplesKey] as Array<{ ts: number; used: number; stage: string | null }>) || [];
                const stageEvents = (w[stageEventsKey] as Array<Record<string, unknown>>) || [];
                let peak = 0;
                for (const s of samples) {
                    if (s.used > peak) peak = s.used;
                }
                return { samples, stageEvents, overallPeak: peak };
            },
            { samplesKey: SAMPLES_KEY, stageEventsKey: STAGE_EVENTS_KEY },
        );

        const perStage = summarizePerStage(samples);
        const summary = {
            fixture: fixture.file,
            overallPeakMB: Number((overallPeak / (1024 * 1024)).toFixed(1)),
            sampleCount: samples.length,
            stageCount: stageEvents.length,
            perStagePeakMB: perStage,
        };

        console.log(`\n===== MEMORY PROFILE: ${fixture.label} =====`);
        console.log(JSON.stringify(summary, null, 2));

        const artifactDir = path.resolve(__dirname, '../../test-results/memory-profile');
        fs.mkdirSync(artifactDir, { recursive: true });
        const artifactBase = path.join(artifactDir, fixture.label);
        fs.writeFileSync(`${artifactBase}.samples.json`, JSON.stringify(samples));
        fs.writeFileSync(`${artifactBase}.stage-events.json`, JSON.stringify(stageEvents));
        fs.writeFileSync(`${artifactBase}.summary.json`, JSON.stringify(summary, null, 2));

        expect(samples.length).toBeGreaterThan(0);
        expect(stageEvents.length).toBeGreaterThan(0);
    });
}

test(`memory profile: hif-hdr-intent-repeat-2x`, async ({ page }, testInfo) => {
    await installStartupRuntimeOverride(page, { projectName: testInfo.project.name });
    await installMemoryProbe(page);
    await page.goto('/ultrahdr-pwa-svelte/');
    await ensureRuntimeGateReady(page, testInfo, { timeoutMs: 240_000 });

    const memAvail = await page.evaluate(() => {
        const p = performance as Performance & { memory?: { usedJSHeapSize: number } };
        return Boolean(p.memory && typeof p.memory.usedJSHeapSize === 'number');
    });
    test.skip(!memAvail, 'performance.memory not available in this browser');

    const fullPath = path.resolve(__dirname, '../..', 'fixtures/test_hdr_no_gain_map.HIF');
    if (!fs.existsSync(fullPath)) {
        test.skip(true, 'fixture missing: fixtures/test_hdr_no_gain_map.HIF');
        return;
    }

    // First run.
    await uploadFile(page, fullPath);
    await waitForProcessingDone(page);
    const firstRunPeak = await page.evaluate((samplesKey) => {
        const s = (window as Record<string, unknown>)[samplesKey] as Array<{ used: number }>;
        let peak = 0;
        for (const x of s) if (x.used > peak) peak = x.used;
        return peak;
    }, SAMPLES_KEY);

    // Mark boundary: insert a synthetic stage event so we can split samples.
    const boundaryTs = await page.evaluate((stageEventsKey) => {
        const events = (window as Record<string, unknown>)[stageEventsKey] as Array<Record<string, unknown>>;
        const ts = performance.now();
        events.push({ ts, phase: 'repeat-boundary', stage: null, substage: 'between-runs', usedHeapBytes: null, elapsedMs: null });
        return ts;
    }, STAGE_EVENTS_KEY);

    // Optional V8-accounting disambiguation — gated behind MEMORY_PROFILE_DISAMBIGUATE=1.
    // Allocates 100 MB synchronously, holds briefly, releases. If performance.memory
    // under-reports, the repeat-run extract-source-exif delta is likely a V8 accounting
    // artifact rather than a real retained buffer.
    const disambiguateEnabled = process.env.MEMORY_PROFILE_DISAMBIGUATE === '1';
    let disambiguation: { preMB: number; peakMB: number; postMB: number } | null = null;
    if (disambiguateEnabled) {
        disambiguation = await page.evaluate(async (stageEventsKey) => {
            const events = (window as Record<string, unknown>)[stageEventsKey] as Array<Record<string, unknown>>;
            const perfMem = performance as Performance & { memory?: { usedJSHeapSize: number } };
            const readUsed = (): number => perfMem.memory?.usedJSHeapSize ?? 0;
            const toMB = (b: number): number => Number((b / (1024 * 1024)).toFixed(1));
            const preBytes = readUsed();
            events.push({ ts: performance.now(), phase: 'disambiguate-pre-alloc', stage: null, substage: 'v8-calibration', usedHeapBytes: preBytes, elapsedMs: null });
            let hold: Uint8Array[] | null = [];
            for (let i = 0; i < 10; i++) {
                const chunk = new Uint8Array(10 * 1024 * 1024);
                for (let j = 0; j < chunk.length; j += 4096) chunk[j] = (i + 1) & 0xff;
                hold.push(chunk);
            }
            await new Promise((r) => setTimeout(r, 100));
            const peakBytes = readUsed();
            events.push({ ts: performance.now(), phase: 'disambiguate-peak', stage: null, substage: 'v8-calibration', usedHeapBytes: peakBytes, elapsedMs: null });
            hold = null;
            await new Promise((r) => setTimeout(r, 200));
            const postBytes = readUsed();
            events.push({ ts: performance.now(), phase: 'disambiguate-post-release', stage: null, substage: 'v8-calibration', usedHeapBytes: postBytes, elapsedMs: null });
            return { preMB: toMB(preBytes), peakMB: toMB(peakBytes), postMB: toMB(postBytes) };
        }, STAGE_EVENTS_KEY);
    }

    // Reset UI between runs (keeps worker + cached libheif module alive).
    await page.evaluate(async () => {
        const automation = (window as Record<string, unknown>).__ULTRAHDR_AUTOMATION__ as
            | { resetState?: () => Promise<unknown> }
            | undefined;
        if (automation?.resetState) {
            await automation.resetState();
        }
    });
    await page.waitForTimeout(500);

    // Second run.
    await uploadFile(page, fullPath);
    await waitForProcessingDone(page);

    const { samples, stageEvents, overallPeak } = await page.evaluate(
        ({ samplesKey, stageEventsKey }) => {
            const w = window as Record<string, unknown>;
            const samples = (w[samplesKey] as Array<{ ts: number; used: number; stage: string | null }>) || [];
            const stageEvents = (w[stageEventsKey] as Array<Record<string, unknown>>) || [];
            let peak = 0;
            for (const s of samples) if (s.used > peak) peak = s.used;
            return { samples, stageEvents, overallPeak: peak };
        },
        { samplesKey: SAMPLES_KEY, stageEventsKey: STAGE_EVENTS_KEY },
    );

    const firstSamples = samples.filter((s) => s.ts <= boundaryTs);
    const secondSamples = samples.filter((s) => s.ts > boundaryTs);
    const peakFirst = firstSamples.reduce((m, s) => Math.max(m, s.used), 0);
    const peakSecond = secondSamples.reduce((m, s) => Math.max(m, s.used), 0);
    const endFirst = firstSamples.length > 0 ? firstSamples[firstSamples.length - 1].used : 0;
    const endSecond = secondSamples.length > 0 ? secondSamples[secondSamples.length - 1].used : 0;

    const summary = {
        fixture: 'fixtures/test_hdr_no_gain_map.HIF (2x)',
        overallPeakMB: Number((overallPeak / (1024 * 1024)).toFixed(1)),
        firstRunPeakMB: Number((peakFirst / (1024 * 1024)).toFixed(1)),
        secondRunPeakMB: Number((peakSecond / (1024 * 1024)).toFixed(1)),
        firstRunEndMB: Number((endFirst / (1024 * 1024)).toFixed(1)),
        secondRunEndMB: Number((endSecond / (1024 * 1024)).toFixed(1)),
        peakDeltaMB: Number(((peakSecond - peakFirst) / (1024 * 1024)).toFixed(1)),
        endDeltaMB: Number(((endSecond - endFirst) / (1024 * 1024)).toFixed(1)),
        firstSampleCount: firstSamples.length,
        secondSampleCount: secondSamples.length,
        stageCount: stageEvents.length,
        boundaryTs,
        firstRunPeakReference: Number((firstRunPeak / (1024 * 1024)).toFixed(1)),
        disambiguation,
    };

    console.log(`\n===== MEMORY PROFILE: hif-hdr-intent-repeat-2x =====`);
    console.log(JSON.stringify(summary, null, 2));

    const artifactDir = path.resolve(__dirname, '../../test-results/memory-profile');
    fs.mkdirSync(artifactDir, { recursive: true });
    const artifactBase = path.join(artifactDir, 'hif-hdr-intent-repeat-2x');
    fs.writeFileSync(`${artifactBase}.samples.json`, JSON.stringify(samples));
    fs.writeFileSync(`${artifactBase}.stage-events.json`, JSON.stringify(stageEvents));
    fs.writeFileSync(`${artifactBase}.summary.json`, JSON.stringify(summary, null, 2));

    expect(firstSamples.length).toBeGreaterThan(0);
    expect(secondSamples.length).toBeGreaterThan(0);
});
