import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('main entrypoint bootstrap', () => {
  it('uses the Svelte 4 application constructor instead of mount()', () => {
    const mainSource = readFileSync(resolve('src/main.js'), 'utf8');

    expect(mainSource).toContain("import App from './App.svelte'");
    expect(mainSource).toContain("new App({");
    expect(mainSource).toContain("target: document.getElementById('app')");
    expect(mainSource).not.toContain("import { mount } from 'svelte'");
    expect(mainSource).not.toContain('mount(App');
  });
});
