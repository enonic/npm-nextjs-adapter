import {ENV_VARS} from './constants';

/** URL to the guillotine API */
export const API_URL = (process.env[ENV_VARS.API_URL] || process.env[`NEXT_PUBLIC_${ENV_VARS.API_URL}`]);

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */
export const APP_NAME = (process.env[ENV_VARS.APP_NAME] || process.env[`NEXT_PUBLIC_${ENV_VARS.APP_NAME}`]);

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

const mode = process.env.MODE || process.env.NEXT_PUBLIC_MODE;

export const IS_DEV_MODE = (mode === 'development');

/** Locales and Enonic XP projects correspondence list */
export const PROJECTS = (process.env[ENV_VARS.PROJECTS] || process.env[`NEXT_PUBLIC_${ENV_VARS.PROJECTS}`]);

const requiredConstants = {
    [ENV_VARS.APP_NAME]: APP_NAME,
    [ENV_VARS.API_URL]: API_URL,
    [ENV_VARS.PROJECTS]: PROJECTS,
};

if (typeof window === 'undefined') {
    // Verify required values on server-side only
    Object.keys(requiredConstants).forEach((key: string) => {
        const val = requiredConstants[key];
        console.info(`Checking required constant "${key}"`, val);
        if (!val) {
            throw new Error(`Environment variable '${key}' is missing (from .env?)`);
        }
    });
}
