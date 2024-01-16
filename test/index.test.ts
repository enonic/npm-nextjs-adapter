import type {Context} from '../src/types';

import {
    // afterAll,
    afterEach,
    // beforeAll,
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {
    ENONIC_API,
    ENONIC_APP_NAME,
    ENONIC_PROJECTS
} from './constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


// const OLD_ENV = process.env;


describe('index', () => {

    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            // ...OLD_ENV,
            ENONIC_API,
            ENONIC_APP_NAME,
            ENONIC_PROJECTS
        });
    });

    afterEach(() => {
        // Might restore the value of replaceProperty, but since process.env is used in a module, must reset modules too.
        jest.restoreAllMocks();
        jest.resetModules();
    });

    describe('APP_NAME', () => {
        it('returns process.env.ENONIC_APP_NAME', () => {
            import('../src').then((moduleName) => {
                expect(moduleName.APP_NAME).toEqual('com.enonic.app.enonic');
            });
        });

        it('returns process.env.NEXT_PUBLIC_ENONIC_APP_NAME (when ENONIC_APP_NAME is not set)', () => {
            // Might restore the value of replaceProperty, but since process.env is used in a module, must reset modules too.
            jest.restoreAllMocks();
            jest.resetModules(); // Does reset replaceProperty
            jest.replaceProperty(process, 'env', {
                // ...OLD_ENV,
                ENONIC_API,
                ENONIC_PROJECTS,
                NEXT_PUBLIC_ENONIC_APP_NAME: 'com.enonic.app.next-public',
            });
            import('../src').then((moduleName) => {
                expect(moduleName.APP_NAME).toEqual('com.enonic.app.next-public');
            });
        });
    });
}); // describe index
