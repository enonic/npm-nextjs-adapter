import type {FetchContentResult} from '../../src';


import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from '../constants';
import {RENDER_MODE, XP_COMPONENT_TYPE, XP_REQUEST_TYPE} from '../../src/common/constants';
import {RedirectType} from 'next/navigation';

globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


const notFound = jest.fn();
const redirect = jest.fn();


describe('guillotine', () => {

    beforeEach(() => {

        setupServerEnv();

        jest.mock('next/navigation', () => ({
            notFound,
            redirect,
            RedirectType: {
                replace: 'replace'
            }
        }));
    });

    afterEach(() => {
        jest.resetModules();
        jest.resetAllMocks(); // Resets the state of all mocks. Equivalent to calling .mockReset() on every mocked function.
        // jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
    });

    describe('validateData', () => {
        it("calls next/navigation.notFound when error is null", () => {
            const fetchContentResult: FetchContentResult = {
                common: null,
                data: null,
                error: null,
                meta: {
                    type: '',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.NEXT,
                    path: '',
                    canRender: false,
                    catchAll: false,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: null
            };
            import('../../src').then((moduleName) => {
                expect(notFound).not.toHaveBeenCalled();
                moduleName.validateData(fetchContentResult);
                expect(notFound).toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
            });
        });

        it("calls next/navigation.notFound when error.code is '404'", () => {
            const fetchContentResult: FetchContentResult = {
                common: null,
                data: null,
                error: {
                    code: '404',
                    message: 'Not Found'
                },
                meta: {
                    type: '',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.NEXT,
                    path: '',
                    canRender: false,
                    catchAll: false,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: null
            };
            import('../../src').then((moduleName) => {
                expect(notFound).not.toHaveBeenCalled();
                moduleName.validateData(fetchContentResult);
                expect(notFound).toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
            });
        });

        it("throws when error.message when error.code is not '404'", () => {
            const fetchContentResult: FetchContentResult = {
                common: null,
                data: null,
                error: {
                    code: 'NOT404',
                    message: 'Error message'
                },
                meta: {
                    type: '',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.NEXT,
                    path: '',
                    canRender: false,
                    catchAll: false,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: null
            };
            import('../../src').then((moduleName) => {
                expect(() => moduleName.validateData(fetchContentResult)).toThrowError('Error message');
                expect(notFound).not.toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
            });
        });

        it('calls next/navigation.notFound and redirect when meta.type is base:shortcut and meta.renderMode is not next', () => {
            const pageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/site/playground/2-column-test'
            };
            const fetchContentResult = {
                data: {
                    get: {
                        data: {
                            target: {
                                pageUrl: '/site/playground/2-column-test'
                            }
                        }
                    }
                },
                common: {},
                meta: {
                    type: 'base:shortcut',
                    path: '/site/playground/2-column-test',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.EDIT,
                    requestedComponent: pageComponent,
                    canRender: true,
                    catchAll: false,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: pageComponent
            };
            import('../../src').then((moduleName) => {
                expect(notFound).not.toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
                moduleName.validateData(fetchContentResult);
                expect(notFound).toHaveBeenCalled();
                expect(redirect).toHaveBeenCalled();
            });
        });

        it('calls redirect when meta.type is base:shortcut and meta.renderMode is next', () => {
            const pageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/site/playground/2-column-test'
            };
            const fetchContentResult = {
                data: {
                    get: {
                        data: {
                            target: {
                                pageUrl: '/redirect/page'
                            },
                            parameters: [
                                {
                                    name: 'intValue',
                                    value: 1,
                                },
                                {
                                    name: 'boolValue',
                                    value: true,
                                },
                                {
                                    name: 'strValue',
                                    value: 'string',
                                }
                            ]
                        }
                    }
                },
                common: {},
                meta: {
                    type: 'base:shortcut',
                    path: '/site/playground/2-column-test',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.NEXT,
                    requestedComponent: pageComponent,
                    canRender: true,
                    catchAll: false,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: pageComponent
            };
            import('../../src').then((moduleName) => {
                expect(notFound).not.toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
                moduleName.validateData(fetchContentResult);
                expect(notFound).not.toHaveBeenCalled();
                expect(redirect).toHaveBeenCalledWith("/no/redirect/page?intValue=1&boolValue=true&strValue=string", RedirectType.replace);
            });
        });

        it('calls next/navigation.notFound when meta.canRender is false and meta.type is not base:shortcut', () => {
            const pageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/site/playground/2-column-test'
            };
            const fetchContentResult = {
                data: {
                    get: {
                        data: {
                            target: {
                                pageUrl: '/site/playground/2-column-test'
                            }
                        }
                    }
                },
                common: {},
                meta: {
                    type: 'NOTbase:shortcut',
                    path: '/site/playground/2-column-test',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.NEXT,
                    requestedComponent: pageComponent,
                    canRender: false,
                    catchAll: false,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: pageComponent
            };
            import('../../src').then((moduleName) => {
                expect(notFound).not.toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
                moduleName.validateData(fetchContentResult);
                expect(notFound).toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
            });
        });

        it('calls next/navigation.notFound when meta.catchAll is true and meta.type is not base:shortcut', () => {
            const pageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/site/playground/2-column-test'
            };
            const fetchContentResult = {
                data: {
                    get: {
                        data: {
                            target: {
                                pageUrl: '/site/playground/2-column-test'
                            }
                        }
                    }
                },
                common: {},
                meta: {
                    type: 'NOTbase:shortcut',
                    path: '/site/playground/2-column-test',
                    requestType: XP_REQUEST_TYPE.PAGE,
                    renderMode: RENDER_MODE.NEXT,
                    requestedComponent: pageComponent,
                    canRender: true,
                    catchAll: true,
                    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
                    baseUrl: 'http://localhost:8080/site',
                    locale: 'no',
                    defaultLocale: 'en',
                },
                page: pageComponent
            };
            import('../../src').then((moduleName) => {
                expect(notFound).not.toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
                moduleName.validateData(fetchContentResult);
                expect(notFound).toHaveBeenCalled();
                expect(redirect).not.toHaveBeenCalled();
            });
        });
    });
});
