import { afterEach, describe, expect, jest, test as it } from '@jest/globals';
import { META } from './constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
} as unknown as Console;


describe('index (CLIENT)', () => {

    afterEach(() => {
        jest.resetModules();
    });

    it('does not require ENONIC_* env vars on the client (CLIENT)', async () => {
        jest.replaceProperty(process, 'env', {});

        const { APP_NAME } = await import('../src');

        expect(APP_NAME).toBeUndefined();
    });

    it('should process urls same way as on the server (CLIENT)', async () => {
        const { UrlProcessor } = await import('../src');

        // absolute urls are now returned as-is
        expect(UrlProcessor.process('https://localhost:8080/some/test/url', META)).toEqual(
            'https://localhost:8080/some/test/url');
    });
}); // describe index
