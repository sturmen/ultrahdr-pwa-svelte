import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('main entrypoint bootstrap', () => {
  it('uses the Svelte 5 mount API and installs the gain-map test API', () => {
    const mainSource = readFileSync(resolve('src/main.ts'), 'utf8');

    expect(mainSource).toContain("import { mount } from 'svelte'");
    expect(mainSource).toContain("import App from './App.svelte'");
    expect(mainSource).toContain("import { installGainMapTestApi } from './lib/gain-map-test-api.ts'");
    expect(mainSource).toContain('installGainMapTestApi(globalThis);');
    expect(mainSource).toContain('mount(App, {');
    expect(mainSource).toContain("target: document.getElementById('app')");
    expect(mainSource).not.toContain('new App({');
  });
});
