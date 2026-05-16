/**
 * @vitest-environment jsdom
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { installLibheifFetchMock, installRealFixtureConsoleSpies } from './gain-map-real-fixture.test-utils';

let restoreSpies: () => void;
let restoreFetchMock: () => void;

beforeAll(() => {
    restoreSpies = installRealFixtureConsoleSpies();
    restoreFetchMock = installLibheifFetchMock();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: URL | string | Request) => {
        const url = input instanceof Request ? input.url : String(input);
        if (url.includes('jpegli')) {
            const candidates = [
                path.resolve(process.cwd(), 'public', 'assets', 'jpegli_wasm.wasm'),
                path.resolve(process.cwd(), 'assets', 'jpegli_wasm.wasm'),
                path.resolve(process.cwd(), 'public', 'assets', 'jpegli_wasm.js'),
                path.resolve(process.cwd(), 'assets', 'jpegli_wasm.js'),
            ];
            for (const candidate of candidates) {
                if (fs.existsSync(candidate) && url.includes(candidate.endsWith('.wasm') ? '.wasm' : '.js')) {
                    const bytes = fs.readFileSync(candidate);
                    return new Response(bytes, { status: 200 });
                }
            }
        }
        return originalFetch(input);
    });
});

afterAll(() => {
    restoreFetchMock?.();
    restoreSpies?.();
});

function loadJpegFixture(filename: string): File {
    const filePath = path.resolve(process.cwd(), 'fixtures', filename);
    const bytes = fs.readFileSync(filePath);
    const file = new File([bytes], filename, { type: 'image/jpeg' });
    if (!file.arrayBuffer) {
        (file as unknown as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = async () =>
            bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }
    return file;
}

describe('JPEG HDR Intent Extraction (Real Files) - DaVinci Resolve', () => {
    it('classifies test_hdr_jpeg_davinci_resolve.jpg as Rec.2020 PQ HDR-intent', async () => {
        const { parseJpegCicpFromApp2, isJpegHdrInputCicp } = await import('../jpeg-hdr-processing.ts');
        const file = loadJpegFixture('test_hdr_jpeg_davinci_resolve.jpg');
        const bytes = new Uint8Array(await file.arrayBuffer());

        const cicp = parseJpegCicpFromApp2(bytes);
        expect(cicp).not.toBeNull();
        expect(cicp).toEqual({
            primaries: 9,
            transfer: 16,
            matrix: 9,
            fullRange: true,
        });
        expect(isJpegHdrInputCicp(cicp)).toBe(true);
    });

});
