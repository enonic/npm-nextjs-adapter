import type {
    ContentResult,
    Context,
    GuillotineResponse,
    GuillotineResponseJson,
    GuillotineResult,
    // HeadlessCms,
    MetaResult,
    Result,
} from '../../src/types';

import {
    // afterEach as afterAllTestsInThisDescribe,
    beforeEach as beforeAllTestsInThisDescribe,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {
    FRAGMENT_CONTENTTYPE_NAME,
    RENDER_MODE,
    RENDER_MODE_HEADER,
    XP_BASE_URL_HEADER,
} from '../../src/constants';
// import {ws} from '../testUtils';


globalThis.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    // debug: jest.fn(),
} as Console;


const OLD_ENV = process.env;


// const GUILLOTINE_RESULT_MINIMAL: GuillotineResult = {
//     data: {
//         query: [{
//             valid: true
//         }]
//     }
// };

const GUILLOTINE_RESULT_META: GuillotineResponseJson = {
    data: {
        guillotine: {
            get: {
                _id: '_id',
                _name: '_name',
                _path: '_path',
                type: 'type',
            }
        }
    },
    // error: {
    //     code: '404',
    //     message: 'Not found',
    // },
    // error: null,
}

// const CONTENT_RESULT: ContentResult = {
//     contents: [{
//         _path: '_path',
//     }],
// };

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

const RESULT_WITH_ERROR: GuillotineResponseJson = {
    errors: [{
        errorType: 'ValidationError',
        locations: [{
            column: 0,
            line: 0,
        }],
        message: 'message',
        validationErrorType: 'FieldUndefined',
    }]
};


describe('guillotine', () => {
    beforeAllTestsInThisDescribe(() => {
        jest.resetModules();
        jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            // RUNTIME_ENV: 'client'
            RUNTIME_ENV: 'server'
        });
        jest.spyOn(globalThis, 'fetch').mockImplementation((url, init = {}) => {
            // console.debug('fetch url', url);
            // console.debug('fetch init', init);

            const {body} = init;
            // console.debug('fetch body', body);

            const parsedBody = JSON.parse(body as string);
            // console.debug('fetch init body parsedBody', parsedBody);

            const {query, variables} = parsedBody;
            // console.debug('fetch init body parsedBody query', query);
            // console.debug('fetch init body parsedBody variables', variables);

            const {path} = variables;
            // console.debug('fetch init body parsedBody variables path', path);

            const json: GuillotineResponseJson = path === '${site}//content/path'
                ? GUILLOTINE_RESULT_META
                : path === '${site}/'
                    ? GUILLOTINE_RESULT_META
                    : RESULT_WITH_ERROR;
            return Promise.resolve({
                json: () => Promise.resolve(json),
                text: () => Promise.resolve(JSON.stringify(json.data ?? json.errors ?? json)),
                ok: true,
                status: 200
            } as Response);
        });
    }); // beforeEach

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
                            // code: '404',
                            // message: 'No meta data found for content, most likely content does not exist',
                            code: 'API',
                            message: "Cannot destructure property 'path' of 'variables' as it is undefined.",
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
                // headers: {
                //     get(name: string) {
                //         console.error('headers get name', name);
                //         return '';
                //     },
                // } as Context['headers'],
            };
            import('../../src/guillotine/fetchContent').then(({fetchContent}) => {
                const promise = fetchContent(context);
                // expect(promise).rejects.toStrictEqual({});
                expect(promise).resolves.toStrictEqual({
                    common: null,
                    data: null,
                    error: {
                        // code: '404',
                        // message: 'No meta data found for content, most likely content does not exist',
                        code: 'API',
                        message: "Cannot destructure property 'path' of 'variables' as it is undefined.",
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
                        message: 'Component /path was not found',
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

        it('handles metaResult with an error', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation((url, init = {}) => {
                const result: GuillotineResponseJson = {
                    errors: [{
                        errorType: 'ValidationError',
                        locations: [{
                            column: 0,
                            line: 0,
                        }],
                        message: 'message',
                        validationErrorType: 'FieldUndefined',
                    }]
                };
                return Promise.resolve({
                    json: () => Promise.resolve(result),
                    text: () => Promise.resolve(JSON.stringify(result.errors)),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then(async ({fetchContent}) => {
                const context: Context = {
                    contentPath: '_/component/path',
                };
                const promise = fetchContent(context);
                // await promise;
                expect(promise).resolves.toStrictEqual({
                    error: {
                        code: '500',
                        message: 'Server responded with 1 error(s), probably from guillotine - see log.',
                    },
                    page: null,
                    common: null,
                    data: null,
                    meta: {
                        apiUrl: 'http://localhost:8080/site/project/master',
                        baseUrl: '/',
                        canRender: false,
                        catchAll: false,
                        defaultLocale: 'en',
                        locale: 'en',
                        path: '_/component/path',
                        requestType: 'type',
                        renderMode: 'next',
                        type: '',
                    },
                });
            });
        }); // it handles metaResult with an error

        it('handles metaResult.meta without type', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation((url, init = {}) => {
                const json: GuillotineResponseJson = {
                    data: {
                        guillotine: {
                            get: {
                                _id: '_id',
                                _name: '_name',
                                _path: '_path',
                                // type: undefined
                            }
                        }
                    }
                };
                return Promise.resolve({
                    json: () => Promise.resolve(json),
                    text: () => Promise.resolve(JSON.stringify(json.data)),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then(async ({fetchContent}) => {
                const context: Context = {
                    contentPath: '_/component/path',
                };
                const promise = fetchContent(context);
                // await promise;
                expect(promise).resolves.toStrictEqual({
                    error: {
                        code: '500',
                        message: "Server responded with incomplete meta data: missing content 'type' attribute.",
                    },
                    page: null,
                    common: null,
                    data: null,
                    meta: {
                        apiUrl: 'http://localhost:8080/site/project/master',
                        baseUrl: '/',
                        canRender: false,
                        catchAll: false,
                        defaultLocale: 'en',
                        locale: 'en',
                        path: '_/component/path',
                        requestType: 'type',
                        renderMode: 'next',
                        type: '',
                    },
                });
            });
        }); // it handles metaResult.meta without type

        it('handles content type that is not accessible in render mode next ', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation((url, init = {}) => {
                const json: GuillotineResponseJson = {
                    data: {
                        guillotine: {
                            get: {
                                _id: '_id',
                                _name: '_name',
                                _path: '_path',
                                type: FRAGMENT_CONTENTTYPE_NAME
                            }
                        }
                    }
                };
                return Promise.resolve({
                    json: () => Promise.resolve(json),
                    text: () => Promise.resolve(JSON.stringify(json.data)),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then(async ({fetchContent}) => {
                const context: Context = {
                    contentPath: '_/component/path',
                    headers: {
                        get(name: string) {
                            if (name === RENDER_MODE_HEADER) {
                                return RENDER_MODE.NEXT
                            }
                            // console.debug('headers get name', name);
                            return '';
                        }
                    } as Context['headers'],
                };
                const promise = fetchContent(context);
                expect(promise).resolves.toStrictEqual({
                    error: {
                        code: '404',
                        message: `Content type [${FRAGMENT_CONTENTTYPE_NAME}] is not accessible in ${RENDER_MODE.NEXT} mode`,
                    },
                    page: null,
                    common: null,
                    data: null,
                    meta: {
                        apiUrl: 'http://localhost:8080/site/project/master',
                        baseUrl: '/',
                        canRender: false,
                        catchAll: false,
                        defaultLocale: 'en',
                        locale: 'en',
                        path: '_/component/path',
                        requestType: 'type',
                        renderMode: 'next',
                        type: '',
                    },
                });
            });
        }); // it 

    }); // describe fetchContent
}); // describe guillotine