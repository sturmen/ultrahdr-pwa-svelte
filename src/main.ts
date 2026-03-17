import { mount } from 'svelte';

import './app.css';
import App from './App.svelte';
import { installGainMapTestApi } from './lib/gain-map-test-api.ts';

installGainMapTestApi(globalThis);

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;
