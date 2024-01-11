import type {
    ContentApiBaseBody,
    Context,
    ProjectLocaleConfig
} from '../../src/types';

import {
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import 'node-fetch-native/polyfill';
import { afterEach } from 'node:test';


globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


const ENONIC_APP_NAME = 'com.enonic.web.enonic.com';

const FETCH_FROM_API_PARAMS_VALID: [
    string,
    ContentApiBaseBody,
    ProjectLocaleConfig,
    {}
] = [
    'http://localhost:8080/site/enonic-homepage/master',
    {
        query: `{
    guillotine {
        query(first: 1) {
            valid
        }
    }
}`,
        variables: {
            // key: 'value'
        }
    },
    {
        default: true,
        project: 'enonic-homepage',
        site: 'enonic-homepage',
        locale: 'en'
    },
    {
        // headerKey: 'headerValue'
    }
];

const OLD_ENV = process.env;


describe('guillotine', () => {

    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            // ENONIC_API_TOKEN: '1234567890',
            ENONIC_API: 'http://localhost:8080/site',
            ENONIC_APP_NAME,
            ENONIC_PROJECTS: 'en:enonic-homepage/enonic-homepage'
        });
        jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
            // console.debug('fetch', input, init);
            const guillotine = {
                query: [{
                    valid: true
                }]
            };
            return Promise.resolve({
                json: () => Promise.resolve({
                    data: {
                        guillotine
                    }
                }),
                text: () => Promise.resolve(JSON.stringify({
                    guillotine
                })),
                ok: true,
                status: 200
            } as Response);
        });
    }); // beforeEach

    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
    });

    describe('fetchFromApi', () => {
        it('returns query results', () => {
            import('../../src/guillotine/fetchFromApi').then((moduleName) => {
                moduleName.fetchFromApi(...FETCH_FROM_API_PARAMS_VALID).then((result) => {
                    console.debug(result);
                    expect(result).toEqual({
                        data: {
                            guillotine: {
                                query: [{
                                    valid: true
                                }]
                            }
                        }
                    });
                });
            });
        });

        it('throws a nice error when fetch throws', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                throw new Error('fetch error');
            });
            import('../../src/guillotine/fetchFromApi').then((moduleName) => {
                expect(() => moduleName.fetchFromApi(...FETCH_FROM_API_PARAMS_VALID)).rejects.toThrow(Error(JSON.stringify({
                    code: 'API',
                    message: 'fetch error'
                })));
            });
        });
    }); // fetchFromApi
});