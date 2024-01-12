/** URL to the guillotine API */
export const API_URL = (process.env.ENONIC_API || process.env.NEXT_PUBLIC_ENONIC_API);

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */
export const APP_NAME = (process.env.ENONIC_APP_NAME || process.env.NEXT_PUBLIC_ENONIC_APP_NAME);

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

const mode = process.env.MODE || process.env.NEXT_PUBLIC_MODE;
export const IS_DEV_MODE = (mode === 'development');

/** Locales and Enonic XP projects correspondence list */
export const PROJECTS = (process.env.ENONIC_PROJECTS || process.env.NEXT_PUBLIC_ENONIC_PROJECTS);
