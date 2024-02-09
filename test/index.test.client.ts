import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {ENONIC_API, ENONIC_APP_NAME, ENONIC_PROJECTS} from './constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


describe('index (CLIENT)', () => {

    beforeEach(() => {
        // nothing here
        jest.resetModules();
    });

    afterEach(() => {
        // nothing here
    });

    it('returns process.env.NEXT_PUBLIC_ENONIC_APP_NAME (CLIENT)', () => {

        jest.replaceProperty(process, 'env', {
            NEXT_PUBLIC_ENONIC_API: ENONIC_API,
            NEXT_PUBLIC_ENONIC_PROJECTS: ENONIC_PROJECTS,
            NEXT_PUBLIC_ENONIC_APP_NAME: ENONIC_APP_NAME,
        });

        import('../src').then((moduleName) => {
            expect(moduleName.APP_NAME).toEqual(ENONIC_APP_NAME);
        });
    });

    it('throws when process.env.NEXT_PUBLIC_ENONIC_APP_NAME is missing (CLIENT)', () => {

            jest.replaceProperty(process, 'env', {
                NEXT_PUBLIC_ENONIC_API: ENONIC_API,
                NEXT_PUBLIC_ENONIC_PROJECTS: ENONIC_PROJECTS,
            });

            expect(import('../src'))
                .rejects.toThrow(Error("Environment variable 'NEXT_PUBLIC_ENONIC_APP_NAME' is missing (from .env?)"));
        }
    );

    it('throws when process.env.NEXT_PUBLIC_ENONIC_API is missing (CLIENT)', () => {

            jest.replaceProperty(process, 'env', {
                NEXT_PUBLIC_ENONIC_PROJECTS: ENONIC_PROJECTS,
                NEXT_PUBLIC_ENONIC_APP_NAME: ENONIC_APP_NAME,
            });

            expect(import('../src'))
                .rejects.toThrow(Error("Environment variable 'NEXT_PUBLIC_ENONIC_API' is missing (from .env?)"));
        }
    );
}); // describe index
