import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readProjectFile(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('PWA update activation policy', () => {
  it('uses prompt-controlled service worker activation with an explicit skip-waiting handoff', () => {
    const viteConfig = readProjectFile('vite.config.ts');
    const serviceWorker = readProjectFile('src/sw.ts');

    expect(viteConfig).toContain("registerType: 'prompt'");
    expect(viteConfig).not.toContain("registerType: 'autoUpdate'");
    expect(serviceWorker).not.toMatch(/^\s*self\.skipWaiting\(\);$/m);
    expect(serviceWorker).not.toContain("import { clientsClaim } from 'workbox-core'");
    expect(serviceWorker).not.toMatch(/^\s*clientsClaim\(\);$/m);
    expect(serviceWorker).toMatch(/message\?\.type === 'SKIP_WAITING'/);
    expect(serviceWorker).toMatch(/self\.skipWaiting\(\)/);
  });
});
