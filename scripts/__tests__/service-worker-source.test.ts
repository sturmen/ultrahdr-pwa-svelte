import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function resolveRepoPath(...segments: string[]): string {
  return path.resolve(process.cwd(), ...segments);
}

describe('service worker source entry', () => {
  it('uses a strict TypeScript service worker source file', () => {
    const serviceWorkerTsPath = resolveRepoPath('src', 'sw.ts');
    const serviceWorkerJsPath = resolveRepoPath('src', 'sw.js');

    expect(fs.existsSync(serviceWorkerTsPath)).toBe(true);
    expect(fs.existsSync(serviceWorkerJsPath)).toBe(false);
  });

  it('configures vite pwa injectManifest to read the TypeScript service worker source', () => {
    const viteConfigPath = resolveRepoPath('vite.config.ts');
    const viteConfigSource = fs.readFileSync(viteConfigPath, 'utf8');

    expect(viteConfigSource).toContain("srcDir: 'src'");
    expect(viteConfigSource).toContain("filename: 'sw.ts'");
  });
});
