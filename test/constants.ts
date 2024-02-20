import {ENV_VARS} from '../src/common/constants';
import {jest} from '@jest/globals';

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
