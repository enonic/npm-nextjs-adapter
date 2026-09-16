import {DEFAULT_GUILLOTINE_API, ENV_VARS} from './constants';
import {stripOutsideSlashes, stripTrailingSlashes} from '../utils/fixDoubleSlashes';

const isServer = typeof window === 'undefined';

// IMPORTANT:
// NEXT_PUBLIC_ vars should be explicitly referenced to be made available on the client side (substituted with constants) !!!
// The server reads ENONIC_*; the browser gets the NEXT_PUBLIC_* copies a site defines for its client components.
/** Absolute URL to the Enonic XP API root */
export const API_URL = stripTrailingSlashes((isServer ? process.env[ENV_VARS.API_URL] : process.env.NEXT_PUBLIC_ENONIC_API) || '');

/** URL to the Guillotine GraphQL endpoint: API_URL + GUILLOTINE_API (server-side only) */
export const GUILLOTINE_URL = API_URL && `${API_URL}/${stripOutsideSlashes(process.env[ENV_VARS.GUILLOTINE_API] || DEFAULT_GUILLOTINE_API)}`;

/** Absolute URL to the media API root, defaults to API_URL; without a NEXT_PUBLIC_ copy the client keeps media URLs relative */
export const MEDIA_URL = stripTrailingSlashes((isServer ? process.env[ENV_VARS.MEDIA_URL] : process.env.NEXT_PUBLIC_ENONIC_MEDIA_CDN) || '') || API_URL;

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */
export const APP_NAME = isServer ? process.env[ENV_VARS.APP_NAME] : process.env.NEXT_PUBLIC_ENONIC_APP_NAME;

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

/** True under `next dev`; NODE_ENV is inlined by Next.js on both server and client */
export const IS_DEV_MODE = process.env.NODE_ENV === 'development';

export const LOGGING = isServer ? process.env[ENV_VARS.LOG] : process.env['NEXT_PUBLIC_ENONIC_LOGGING'];

/** Locales and Enonic XP projects correspondence list; undefined on the client without a NEXT_PUBLIC_ copy */
export const MAPPINGS = isServer ? process.env[ENV_VARS.MAPPINGS] : process.env.NEXT_PUBLIC_ENONIC_MAPPINGS;

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
