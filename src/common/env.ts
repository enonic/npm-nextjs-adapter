import {ENV_VARS} from './constants';

const isServer = typeof window === 'undefined';

// IMPORTANT:
// NEXT_PUBLIC_ vars should be explicitly referenced to be made available on the client side (substituted with constants) !!!
/** URL to the guillotine API (server-side only) */
export const API_URL = process.env[ENV_VARS.API_URL];

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) (server-side only) */
export const APP_NAME = process.env[ENV_VARS.APP_NAME];

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

/** True under `next dev`; NODE_ENV is inlined by Next.js on both server and client */
export const IS_DEV_MODE = process.env.NODE_ENV === 'development';

export const LOGGING = isServer ? process.env[ENV_VARS.LOG] : process.env['NEXT_PUBLIC_ENONIC_LOGGING'];

/** Locales and Enonic XP projects correspondence list (server-side only) */
export const MAPPINGS = process.env[ENV_VARS.MAPPINGS];

// Verify required values on server-side only
if (isServer) {
    const requiredConstants = {
        [ENV_VARS.APP_NAME]: APP_NAME,
        [ENV_VARS.API_URL]: API_URL,
        [ENV_VARS.MAPPINGS]: MAPPINGS
    };

    Object.keys(requiredConstants).forEach((key: string) => {
        if (!requiredConstants[key]) {
            throw new Error(`Environment variable '${key}' is missing (from .env?)`);
        }
    });
}
