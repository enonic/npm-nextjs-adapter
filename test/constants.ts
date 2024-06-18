import {ENV_VARS, XP_REQUEST_TYPE, RENDER_MODE, XP_COMPONENT_TYPE} from '../src/common/constants';
import {jest} from '@jest/globals';
import type {MetaData} from '../src';

export const ENONIC_API = 'http://localhost:8080/site';
export const ENONIC_APP_NAME = 'com.enonic.app.enonic';
export const ENONIC_APP_NAME_UNDERSCORED = ENONIC_APP_NAME.replace(/\./g, '_');
export const ENONIC_MAPPINGS = 'en:project/site,no:prosjekt/nettsted';

export function setupServerEnv(overrides: Record<string, string> = {}): void {
    jest.replaceProperty(process, 'env', {
        [ENV_VARS.API_URL]: ENONIC_API,
        [ENV_VARS.APP_NAME]: ENONIC_APP_NAME,
        [ENV_VARS.MAPPINGS]: ENONIC_MAPPINGS,
        ...overrides,
    });
}

export function setupClientEnv(overrides: Record<string, string> = {}): void {
    jest.replaceProperty(process, 'env', {
        NEXT_PUBLIC_ENONIC_API: ENONIC_API,
        NEXT_PUBLIC_ENONIC_MAPPINGS: ENONIC_MAPPINGS,
        NEXT_PUBLIC_ENONIC_APP_NAME: ENONIC_APP_NAME,
        ...overrides,
    });
}

export const META: MetaData = {
    type: 'base:shortcut',
    path: '/site/playground/2-column-test',
    requestType: XP_REQUEST_TYPE.PAGE,
    renderMode: RENDER_MODE.EDIT,
    requestedComponent: {
        type: XP_COMPONENT_TYPE.PAGE,
        path: '/site/playground/2-column-test'
    },
    canRender: true,
    catchAll: false,
    apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
    baseUrl: '/site/inline/enonic-homepage/draft',
    locale: 'no',
    defaultLocale: 'en',
};
