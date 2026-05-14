/**
 * @vitest-environment jsdom
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { installLibheifFetchMock, installRealFixtureConsoleSpies } from './gain-map-real-fixture.test-utils';

let restoreSpies: () => void;
let restoreFetchMock: () => void;
const consoleErrorSpy = vi.fn();
let originalConsoleError: typeof console.error;

beforeAll(() => {
    restoreSpies = installRealFixtureConsoleSpies();
    restoreFetchMock = installLibheifFetchMock();
    originalConsoleError = console.error;
    console.error = vi.fn((...args: unknown[]) => {
        consoleErrorSpy(...args);
        originalConsoleError(...args);
    });
});

afterAll(() => {
    console.error = originalConsoleError;
    restoreFetchMock?.();
    restoreSpies?.();
});

function loadHeicFixture(filename: string): File {
    const filePath = path.resolve(process.cwd(), 'fixtures', filename);
    const bytes = fs.readFileSync(filePath);
    const file = new File([bytes], filename, { type: 'image/heic' });
    if (!file.arrayBuffer) {
        (file as unknown as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = async () =>
            bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }
    return file;
}

describe('HDR Intent Extraction (Real Files) - DaVinci Resolve HEIC', () => {
    it('reports a verbose HEIF HDR decode failure with code/bpp/primaries/transfer context', async () => {
        const { processHeifHdr } = await import('../heif-hdr-processing.ts');
        const { getRecordedDiagnosticsEvents, DIAGNOSTICS_EVENT_NAMES } = await import('../diagnostics-events.ts');
        const file = loadHeicFixture('test_hdr_heif_davinci_resolve.heic');

        await expect(processHeifHdr(file)).rejects.toThrow(/HEIF HDR primary image decode failed \(code=.+, bpp=.+, primaries=9, transfer=(16|18), \d+x\d+\)/);

        const events = getRecordedDiagnosticsEvents(globalThis);
        const failureEvent = events.find(
            (event) => event.name === DIAGNOSTICS_EVENT_NAMES.processingMemory.hdrIntentDecodeFailed,
        );
        expect(failureEvent).toBeDefined();
        expect(failureEvent?.context.primaries).toBe(9);
        expect([16, 18]).toContain(failureEvent?.context.transfer as number);
        expect(failureEvent?.context.source).toBe('heif');
        expect(failureEvent?.context.filename).toBe('test_hdr_heif_davinci_resolve.heic');

        const errorCalls = consoleErrorSpy.mock.calls.map((call) => call.map((value) => String(value)).join(' '));
        expect(errorCalls.some((line) => line.includes('[HEIF HDR] primary image decode failed'))).toBe(true);
    }, 60000);
});
