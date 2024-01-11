import type {Context} from '../../src/types';

import {
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import 'node-fetch-native/polyfill';
import { afterEach } from 'node:test';
import { XP_BASE_URL_HEADER } from '../../src/constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;
// globalThis.fetch = fetch;


const ENONIC_APP_NAME = 'com.enonic.web.enonic.com';


const OLD_ENV = process.env;


describe('guillotine', () => {
    // beforeAll(() => {});

    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            // ENONIC_API_TOKEN: '1234567890',
            ENONIC_API: 'http://localhost:8080/site',
            ENONIC_APP_NAME,
            ENONIC_PROJECTS: 'en:project/site,no:prosjekt/nettsted',
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

    // afterAll(() => {});

    describe('fetchContent', () => {
        const TESTS = {
            'edit': 'draft',
            'inline': 'draft',
            'preview': 'draft',
            'live': 'master',
            'admin': 'draft',
            'next': 'master',
        };
        Object.entries(TESTS).forEach(([mode, branch]) => {
            it(`${mode}`, () => {
                import('../../src/guillotine/fetchContent').then((moduleName) => {
                    const context: Context = {
                        headers: {
                            get(name: string) {
                                if (name === 'content-studio-mode') {
                                    return mode;
                                }
                                if (name === 'content-studio-project') {
                                    return 'prosjekt';
                                }
                                if (name === 'jsessionid') {
                                    return '1234';
                                }
                                if (name === XP_BASE_URL_HEADER) {
                                    return '/admin/SOMETHING';
                                }
                                console.error('headers get name', name);
                            }
                        },
                    } as Context;
                    expect(moduleName.fetchContent(context)).resolves.toStrictEqual({
                        common: null,
                        data: null,
                        error: {
                            code: '404',
                            message: 'No meta data found for content, most likely content does not exist',
                        },
                        meta: {
                            apiUrl: `http://localhost:8080/site/prosjekt/${branch}`,
                            baseUrl: '/admin/SOMETHING',
                            canRender: false,
                            catchAll: false,
                            defaultLocale: 'en',
                            locale: 'no',
                            path: '',
                            renderMode: mode,
                            requestType: 'type',
                            type: '',
                        },
                        page: null,
                    });
                });
            });
        });
    });

    // describe('fetchMetaData', () => {
    //     import('../../src/guillotine/fetchContent').then((moduleName) => {
    //         it('', () => {
    //             expect(moduleName.fetchMetaData()).toStrictEqual({});
    //         });
    //     });
    // });
});