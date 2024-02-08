import {ENV_VARS} from './constants';

const isServer = typeof window === 'undefined';

// IMPORTANT:
// NEXT_PUBLIC_ vars should be explicitly referenced to be made available on the client side !!!
/** URL to the guillotine API */
export const API_URL = isServer ? process.env[ENV_VARS.API_URL] : process.env['NEXT_PUBLIC_ENONIC_API'];

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */
export const APP_NAME = isServer ? process.env[ENV_VARS.APP_NAME] : process.env['NEXT_PUBLIC_ENONIC_APP_NAME'];

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

const mode = isServer ? process.env.MODE : process.env.NEXT_PUBLIC_MODE;

export const IS_DEV_MODE = (mode === 'development');

/** Locales and Enonic XP projects correspondence list */
export const PROJECTS = isServer ? process.env[ENV_VARS.PROJECTS] : process.env['NEXT_PUBLIC_ENONIC_PROJECTS'];

const requiredConstants = {
    [ENV_VARS.APP_NAME]: APP_NAME,
    [ENV_VARS.API_URL]: API_URL,
    [ENV_VARS.PROJECTS]: PROJECTS,
};

// Verify required values on server-side only
Object.keys(requiredConstants).forEach((key: string) => {
    const val = requiredConstants[key];
    if (!val) {
        throw new Error(`Environment variable '${key}' is missing (from .env?)`);
    }
});

