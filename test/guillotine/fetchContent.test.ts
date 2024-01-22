import type {
    ContentResult,
    Context,
    GuillotineResult,
    // HeadlessCms,
    MetaResult,
    Result,
} from '../../src/types';

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import { XP_BASE_URL_HEADER } from '../../src/constants';


globalThis.console = {
    ...console,
    error: jest.fn(),
    // warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    // debug: jest.fn(),
} as Console;


const OLD_ENV = process.env;


const GUILLOTINE_RESULT_MINIMAL: GuillotineResult = {
    data: {
        query: [{
            valid: true
        }]
    }
};

const GUILLOTINE_RESULT_META: GuillotineResult = {
    data: {
        meta: {
            _path: '_path',
            type: 'type',
        }
    },
    // error: {
    //     code: '404',
    //     message: 'Not found',
    // },
    // error: null,
}

const CONTENT_RESULT: ContentResult = {
    contents: [{
        _path: '_path',
    }],
};

// const META_RESULT: MetaResult = {
//     // error: {
//     //     code: '404',
//     //     message: 'Not found',
//     // },
//     error: null,
//     // errors: [],
//     meta: {
//         _path: '_path',
//         type: 'type',
//     }
// };

const RESULT_WITH_ERROR: Result = {
    error: {
        code: '404',
        message: 'Not found',
    }
};


describe('guillotine', () => {
    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            // RUNTIME_ENV: 'client'
            RUNTIME_ENV: 'server'
        });
        jest.spyOn(globalThis, 'fetch').mockImplementation((url, init = {}) => {
            // console.debug('fetch url', url, 'init', init);

            const {body} = init;
            // console.debug('fetch body', body);

            const parsedBody = JSON.parse(body as string);
            // console.debug('fetch init body parsedBody', parsedBody);

            const {query, variables} = parsedBody;
            // console.debug('fetch init body parsedBody query', query);
            // console.debug('fetch init body parsedBody variables', variables);

            const {path} = variables;
            // console.debug('fetch init body parsedBody variables path', path);

            const result: Result = path === '${site}//content/path'
                ? GUILLOTINE_RESULT_META
                : path === '${site}/'
                    ? GUILLOTINE_RESULT_META
                    : RESULT_WITH_ERROR;
            return Promise.resolve({
                json: () => Promise.resolve(result),
                text: () => Promise.resolve(JSON.stringify(result['data'])),
                ok: true,
                status: 200
            } as Response);
        });
    }); // beforeEach

    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
    });

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
                import('../../src').then((moduleName) => {
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
                }); // import
            }); // it
        }); // TESTS.forEach

        it('handles context without headers', () => {
            // console.debug('process.en    v.RUNTIME_ENV', process.env.RUNTIME_ENV);
            const context: Context = {
                contentPath: '/content/path',
                headers: {
                    get(name: string) {
                        console.error('headers get name', name);
                        return '';
                    },
                } as Context['headers'],
            };
            import('../../src/guillotine/fetchContent').then(({fetchContent}) => {
                const promise = fetchContent(context);
                // expect(promise).rejects.toStrictEqual({});
                expect(promise).resolves.toStrictEqual({
                    common: null,
                    data: null,
                    error: {
                        code: '404',
                        message: 'No meta data found for content, most likely content does not exist',
                    },
                    meta: {
                        apiUrl: `http://localhost:8080/site/project/master`,
                        baseUrl: '/',
                        canRender: false,
                        catchAll: false,
                        defaultLocale: 'en',
                        locale: 'en',
                        path: '/content/path',
                        renderMode: 'next',
                        requestType: 'type',
                        type: '',
                    },
                    page: null,
                });
            });
        }); // it handles context without headers

        it('handles component paths', () => {
            // console.debug('process.en    v.RUNTIME_ENV', process.env.RUNTIME_ENV);
            const context: Context = {
                contentPath: '_/component/path',
            };
            import('../../src/guillotine/fetchContent').then(({fetchContent}) => {
                const promise = fetchContent(context);
                // expect(promise).rejects.toStrictEqual({});
                expect(promise).resolves.toStrictEqual({
                    common: null,
                    data: null,
                    error: {
                        code: '404',
                        message: 'No meta data found for content, most likely content does not exist',
                    },
                    meta: {
                        apiUrl: `http://localhost:8080/site/project/master`,
                        baseUrl: '/',
                        canRender: false,
                        catchAll: false,
                        defaultLocale: 'en',
                        locale: 'en',
                        path: '_/component/path',
                        renderMode: 'next',
                        requestType: 'type',
                        type: '',
                    },
                    page: null,
                });
            });
        }); // it handles component paths
    }); // describe fetchContent
}); // describe guillotine