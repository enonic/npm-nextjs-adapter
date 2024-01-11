import type {
    ContentApiBaseBody,
    ProjectLocaleConfig
} from '../../src/types';

import {
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import { afterEach } from 'node:test';


global.console = {
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
    // beforeAll(() => {});

    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            // ENONIC_API_TOKEN: '1234567890',
            ENONIC_APP_NAME,
            ENONIC_PROJECTS: 'en:enonic-homepage/enonic-homepage'
        });
        jest.spyOn(global, 'fetch').mockImplementation((input, init = {}) => {
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

    // describe('fetchContent', () => {
    //     const RENDER_MODES = ['edit','inline','preview','live','admin','next'];
    //     RENDER_MODES.forEach((mode) => {
    //         it(`${mode}`, () => {
    //             import('../../src/guillotine/fetchContent').then((moduleName) => {
    //                 const context: Context = {
    //                     headers: {
    //                         get(name: string) {
    //                             if (name === 'content-studio-mode') {
    //                                 return mode;
    //                             }
    //                             if (name === 'content-studio-project') {
    //                                 return 'prosjekt';
    //                             }
    //                             if (name === 'jsessionid') {
    //                                 return '1234';
    //                             }
    //                             if (name === XP_BASE_URL_HEADER) {
    //                                 return '/whatnot/edit/1234';
    //                             }
    //                             console.error('headers get name', name);
    //                         }
    //                     },
    //                 } as Context;
    //                 expect(moduleName.fetchContent(context)).toStrictEqual({});
    //             });
    //         });
    //     });
    // });

    // describe('fetchMetaData', () => {
    //     import('../../src/guillotine/fetchContent').then((moduleName) => {
    //         it('', () => {
    //             expect(moduleName.fetchMetaData()).toStrictEqual({});
    //         });
    //     });
    // });
});