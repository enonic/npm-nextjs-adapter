import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from './constants';
import {ENV_VARS} from '../src/common/constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
} as unknown as Console;


describe('index', () => {

    beforeEach(() => {
        // nothing here
        jest.resetModules();
    });

    afterEach(() => {
        // nothing here
    });

    it('returns process.env.ENONIC_APP_NAME', () => {

        setupServerEnv();

        import('../src').then((moduleName) => {
            expect(moduleName.APP_NAME).toEqual('com.enonic.app.enonic');
        });
    });

    it('throws when process.env.ENONIC_APP_NAME is missing', () => {

        setupServerEnv({
            [ENV_VARS.APP_NAME]: undefined
            });

            expect(import('../src'))
                .rejects.toThrow(Error("Environment variable 'ENONIC_APP_NAME' is missing (from .env?)"));
        }
    );

    it('throws when process.env.ENONIC_API is missing', () => {

        setupServerEnv({
            [ENV_VARS.API_URL]: undefined
            });

            expect(import('../src'))
                .rejects.toThrow(Error("Environment variable 'ENONIC_API' is missing (from .env?)"));
        }
    );
}); // describe index
