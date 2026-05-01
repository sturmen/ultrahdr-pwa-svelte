import { test, expect, chromium } from '@playwright/test';
import { ensureRuntimeGateReady } from './runtime-gate.ts';

test('requires real Android Chromium WebGPU runtime', async ({}, testInfo) => {
    const cdpUrl = process.env.ANDROID_REAL_CDP_URL;
    if (!cdpUrl) {
        throw new Error(
            'Missing ANDROID_REAL_CDP_URL. Start Chrome on a real Android device with remote debugging and set this env var to the CDP endpoint.',
        );
    }

    const browser = await chromium.connectOverCDP(cdpUrl);
    try {
        const context = browser.contexts()[0] || await browser.newContext();
        const page = context.pages()[0] || await context.newPage();
        const baseUrl = testInfo.project.use.baseURL || 'http://localhost:4173/';
        await page.goto(String(baseUrl));

        const ready = await ensureRuntimeGateReady(page, testInfo, {
            timeoutMs: 45_000,
            expectedProvider: 'webgpu',
        });

        expect(ready.resolvedExecutionProvider).toBe('webgpu');
    } finally {
        await browser.close();
    }
});
