import { describe, it, expect } from 'vitest';
import { getCapabilities } from './src/lib/capabilities.js';

describe('useragent_test', () => {
    it('prints', () => {
        console.log("TEST UA:", navigator.userAgent);
        console.log("isSafari:", getCapabilities().isSafari);
    });
});
