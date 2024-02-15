import type {PageComponent} from '../../src/types';


import {beforeAll as beforeAllTestsInThisDecsribe, describe, expect, jest, test as it} from '@jest/globals';
import {ComponentRegistry} from '../../src/common/ComponentRegistry';
import {createMetaData} from '../../src/guillotine/createMetaData';
import {CATCH_ALL, RENDER_MODE, XP_COMPONENT_TYPE, XP_REQUEST_TYPE} from '../../src/common/constants';
import {ENONIC_APP_NAME} from '../constants';


// This must come before the imports to suppress logging.
globalThis.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    // debug: jest.fn(),
} as Console;


const PAGE_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.PAGE,
    page: {
        descriptor: `${ENONIC_APP_NAME}:mainPage`,
    },
    path: '/',
};
const CONTENT_TYPE_NAME_WITH_VIEW = `${ENONIC_APP_NAME}:withView`;
const CONTENT_TYPE_NAME_WITHOUT_VIEW = `${ENONIC_APP_NAME}:withOutView`;


describe('guillotine', () => {
    describe('createMetaData', () => {
        describe('before registering components', () => {
            it("should set catchAll and canRender to false, when componentRegistry is empty", () => {
                const contentType = "wont match since componentRegistry is empty";
                const contentPath = 'contentPath';
                const requestType = XP_REQUEST_TYPE.PAGE; // EVERYTHING BUT COMPONENT
                const renderMode = RENDER_MODE.NEXT;
                const apiUrl = 'apiUrl';
                const baseUrl = 'baseUrl';
                const locale = 'locale';
                const defaultLocale = 'defaultLocale';
                const requestedComponentPath = undefined; // ''
                const pageCmp: PageComponent|undefined = undefined;
                const components: PageComponent[]|undefined = undefined;
                expect(createMetaData({
                    contentType, contentPath, requestType, renderMode, apiUrl,
                    baseUrl, locale, defaultLocale, requestedComponentPath, pageCmp,
                    components
                })).toEqual({
                    apiUrl,
                    baseUrl,
                    canRender: false,
                    catchAll: false,
                    defaultLocale,
                    locale,
                    path: contentPath,
                    renderMode,
                    requestType,
                    type: contentType,
                });
            });
        });
        describe('after registering components', () => {
            beforeAllTestsInThisDecsribe((done) => {
                ComponentRegistry.addContentType(CONTENT_TYPE_NAME_WITH_VIEW, {
                    query: 'query { guillotine { withView } }',
                    view: () => {return 'theView';},
                });
                ComponentRegistry.addContentType(CONTENT_TYPE_NAME_WITHOUT_VIEW, {
                    query: 'query { guillotine { withOutView } }',
                });
                ComponentRegistry.addContentType(CATCH_ALL, {
                    query: 'query { guillotine { catchAll } }',
                    view: () => {return 'catchAll';},
                });
                done();
            });

            it("should return defaults when pageCmp and components are undefined", () => {
                const contentType = CONTENT_TYPE_NAME_WITHOUT_VIEW;
                const contentPath = 'contentPath';
                const requestType = XP_REQUEST_TYPE.PAGE; // EVERYTHING BUT COMPONENT
                const renderMode = RENDER_MODE.NEXT;
                const apiUrl = 'apiUrl';
                const baseUrl = 'baseUrl';
                const locale = 'locale';
                const defaultLocale = 'defaultLocale';
                const requestedComponentPath = undefined; // ''
                const pageCmp: PageComponent|undefined = undefined;
                const components: PageComponent[]|undefined = undefined;
                expect(createMetaData({
                    contentType, contentPath, requestType, renderMode, apiUrl,
                    baseUrl, locale, defaultLocale, requestedComponentPath, pageCmp,
                    components
                })).toEqual({
                    apiUrl,
                    baseUrl,
                    canRender: false,
                    catchAll: false,
                    defaultLocale,
                    locale,
                    path: contentPath,
                    renderMode,
                    requestType,
                    type: contentType,
                });
            });

            it("should set requestedComponent when requestedComponentPath is found in components", () => {
                const contentType = CONTENT_TYPE_NAME_WITHOUT_VIEW;
                const contentPath = 'contentPath';
                const requestType = XP_REQUEST_TYPE.PAGE; // EVERYTHING BUT COMPONENT
                const renderMode = RENDER_MODE.NEXT;
                const apiUrl = 'apiUrl';
                const baseUrl = 'baseUrl';
                const locale = 'locale';
                const defaultLocale = 'defaultLocale';
                const requestedComponentPath = '/';
                const pageCmp: PageComponent|undefined = undefined;
                const components: PageComponent[] = [PAGE_COMPONENT];
                expect(createMetaData({
                    contentType, contentPath, requestType, renderMode, apiUrl,
                    baseUrl, locale, defaultLocale, requestedComponentPath, pageCmp,
                    components
                })).toEqual({
                    apiUrl,
                    baseUrl,
                    canRender: false,
                    catchAll: false,
                    defaultLocale,
                    locale,
                    path: contentPath,
                    renderMode,
                    requestedComponent: PAGE_COMPONENT,
                    requestType,
                    type: contentType,
                });
            });

            it("should set canRender to true when contentType has view, but not catchAll", () => {
                const contentType = CONTENT_TYPE_NAME_WITH_VIEW;
                const contentPath = 'contentPath';
                const requestType = XP_REQUEST_TYPE.PAGE;
                const renderMode = RENDER_MODE.NEXT;
                const apiUrl = 'apiUrl';
                const baseUrl = 'baseUrl';
                const locale = 'locale';
                const defaultLocale = 'defaultLocale';
                const requestedComponentPath = undefined;
                const pageCmp: PageComponent|undefined = undefined;
                const components: PageComponent[] = [PAGE_COMPONENT];
                expect(createMetaData({
                    contentType, contentPath, requestType, renderMode, apiUrl,
                    baseUrl, locale, defaultLocale, requestedComponentPath, pageCmp,
                    components
                })).toEqual({
                    apiUrl,
                    baseUrl,
                    canRender: true,
                    catchAll: false,
                    defaultLocale,
                    locale,
                    path: contentPath,
                    renderMode,
                    requestType,
                    type: contentType,
                });
            });

            it("should set canRender to true when requestType is component and !typeDef", () => {
                const contentType = '';
                const contentPath = 'contentPath';
                const requestType = XP_REQUEST_TYPE.COMPONENT;
                const renderMode = RENDER_MODE.NEXT;
                const apiUrl = 'apiUrl';
                const baseUrl = 'baseUrl';
                const locale = 'locale';
                const defaultLocale = 'defaultLocale';
                const requestedComponentPath = undefined;
                const pageCmp: PageComponent|undefined = undefined;
                const components: PageComponent[] = [PAGE_COMPONENT];
                expect(createMetaData({
                    contentType, contentPath, requestType, renderMode, apiUrl,
                    baseUrl, locale, defaultLocale, requestedComponentPath, pageCmp,
                    components
                })).toEqual({
                    apiUrl,
                    baseUrl,
                    canRender: true,
                    catchAll: false,
                    defaultLocale,
                    locale,
                    path: contentPath,
                    renderMode,
                    requestType,
                    type: contentType,
                });
            });

            it("should set canRender to true when pageCmp.page.descriptor", () => {
                const contentType = 'not registered, without view or with catchAll';
                const contentPath = 'contentPath';
                const requestType = XP_REQUEST_TYPE.PAGE; // EVERYTHING BUT COMPONENT
                const renderMode = RENDER_MODE.NEXT;
                const apiUrl = 'apiUrl';
                const baseUrl = 'baseUrl';
                const locale = 'locale';
                const defaultLocale = 'defaultLocale';
                const requestedComponentPath = undefined;
                const pageCmp: PageComponent = PAGE_COMPONENT;
                const components: PageComponent[]|undefined = undefined;
                expect(createMetaData({
                    contentType, contentPath, requestType, renderMode, apiUrl,
                    baseUrl, locale, defaultLocale, requestedComponentPath, pageCmp,
                    components
                })).toEqual({
                    apiUrl,
                    baseUrl,
                    canRender: true,
                    catchAll: false,
                    defaultLocale,
                    locale,
                    path: contentPath,
                    renderMode,
                    requestType,
                    type: contentType,
                });
            });

            it(
                "should set catchAll and canRender to true when contentType is not registered and the registered catchAll has a view",
                () => {
                    const contentType = 'not registered';
                    const contentPath = 'contentPath';
                    const requestType = XP_REQUEST_TYPE.PAGE; // EVERYTHING BUT COMPONENT
                    const renderMode = RENDER_MODE.NEXT;
                    const apiUrl = 'apiUrl';
                    const baseUrl = 'baseUrl';
                    const locale = 'locale';
                    const defaultLocale = 'defaultLocale';
                    const requestedComponentPath = undefined;
                    const pageCmp: PageComponent|undefined = undefined;
                    const components: PageComponent[]|undefined = undefined;
                    expect(createMetaData({
                        contentType, contentPath, requestType, renderMode, apiUrl,
                        baseUrl, locale, defaultLocale, requestedComponentPath,
                        pageCmp, components
                    })).toEqual({
                        apiUrl,
                        baseUrl,
                        canRender: true,
                        catchAll: true,
                        defaultLocale,
                        locale,
                        path: contentPath,
                        renderMode,
                        requestType,
                        type: contentType,
                    });
                }
            );
        }); // describe after registering components
    }); // describe createMetaData
}); // describe guillotine
