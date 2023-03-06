/** Import config values from .env, .env.development and .env.production */
import {MinimalContext} from './guillotine/fetchContent';

const mode = process.env.MODE || process.env.NEXT_PUBLIC_MODE;
export const IS_DEV_MODE = (mode === 'development');

/** URL to the guillotine API */
const CONTENT_API_DRAFT = (process.env.CONTENT_API_DRAFT || process.env.NEXT_PUBLIC_CONTENT_API_DRAFT);
const CONTENT_API_MASTER = (process.env.CONTENT_API_MASTER || process.env.NEXT_PUBLIC_CONTENT_API_MASTER);

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */

export const APP_NAME = (process.env.APP_NAME || process.env.NEXT_PUBLIC_APP_NAME);
/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */

export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');
/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */

export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

export const SITE_KEY = (process.env.SITE_KEY || process.env.NEXT_PUBLIC_SITE_KEY);


// ////////////////////////////////////////////////////////////////////////  Hardcode-able constants

// URI parameter marking that a request is for a preview for CS. MUST MATCH THE VALUE OF 'FROM_XP_PARAM' on XP side.
export const XP_BASE_URL_HEADER = 'xpbaseurl';
export const RENDER_MODE_HEADER = 'content-studio-mode';
export const JSESSIONID_HEADER = 'jsessionid';

export const PORTAL_COMPONENT_ATTRIBUTE = 'data-portal-component-type';
export const PORTAL_REGION_ATTRIBUTE = 'data-portal-region';

export const FRAGMENT_CONTENTTYPE_NAME = 'portal:fragment';
export const FRAGMENT_DEFAULT_REGION_NAME = 'fragment';

export const PAGE_TEMPLATE_CONTENTTYPE_NAME = 'portal:page-template';
export const PAGE_TEMPLATE_FOLDER = 'portal:template-folder';

export const SITE_CONTENTTYPE_NAME = 'portal:site';


// ------------------------------- Exports and auxillary functions derived from values above ------------------------------------

export enum XP_REQUEST_TYPE {
    COMPONENT = 'component',
    TYPE = 'type',
    PAGE = 'page',
}

export enum RENDER_MODE {
    INLINE = 'inline',
    EDIT = 'edit',
    PREVIEW = 'preview',
    LIVE = 'live',
    ADMIN = 'admin',
    NEXT = 'next'       // Fallback: not using XP proxy but rendering directly with next.js
}

// TODO: Use these instead of hardcoded strings everywhere
export enum XP_COMPONENT_TYPE {
    PART = 'part',
    LAYOUT = 'layout',
    TEXT = 'text',
    FRAGMENT = 'fragment',
    PAGE = 'page',
}

export const getRenderMode = (context?: MinimalContext): RENDER_MODE => {
    const value = (context?.req?.headers || {})[RENDER_MODE_HEADER] as string | undefined;
    const enumValue = RENDER_MODE[<keyof typeof RENDER_MODE>value?.toUpperCase()];
    return enumValue || RENDER_MODE[process.env.RENDER_MODE] || RENDER_MODE.NEXT;
};

export function getContentApiUrl(context?: MinimalContext): string {
    const mode = getRenderMode(context);
    return mode === RENDER_MODE.NEXT ? CONTENT_API_MASTER : CONTENT_API_DRAFT;
}

export function getJsessionHeaders(context?: MinimalContext): Object {
    const headers = {};
    const jsessionid = context?.req?.headers[JSESSIONID_HEADER];
    if (jsessionid) {
        headers['Cookie'] = `${JSESSIONID_HEADER}=${jsessionid}`;
    }
    return headers;
}

/** For '<a href="..."' link values in props when clicking the link should navigate to an XP content item page
 *  and the query returns the XP _path to the target content item:
 *  When viewed directly, the header will have a `<base href='/' />` (see src/pages/_app.tsx), and when viewed through an
 *  XP Content Studio preview, lib-nextjs-proxy will add `<base href='xp/relevant/root/site/url/' />`.
 *  So for content-item links to work in BOTH contexts, the href value should be the path relative to the root site item, not starting with a slash.
 * */
// export const getContentLinkUrlFromXpPath = (_path: string): string => _path.replace(siteNamePattern, '')

const xpBaseUrlMap: Record<string, string> = {};

export const getXpBaseUrl = (context?: MinimalContext): string => {
    const mode = getRenderMode(context);

    const existingUrl = xpBaseUrlMap[mode];
    if (existingUrl) {
        return existingUrl;
    }

    const header = ((context?.req?.headers || {})[XP_BASE_URL_HEADER] || '') as string;

    // TODO: workaround for XP pattern controller mapping not picked up in edit mode
    const resultingUrl = (header || '/').replace(/\/edit\//, '/inline/');

    xpBaseUrlMap[mode] = resultingUrl;

    return resultingUrl;
};


export const commonChars = (s1?: string, s2?: string) => {
    let result = '';
    if (!s1 || s1.length === 0 || !s2 || s2.length === 0) {
        return result;
    }
    for (let i = 0; i < s1.length; i++) {
        const s1Element = s1[i];
        if (s2[i] === s1Element) {
            result += s1Element;
        } else {
            break;
        }
    }

    return result;
};
// sanitizes text according to graphql naming spec http://spec.graphql.org/October2021/#sec-Names
export const sanitizeGraphqlName = (text: string) => {
    if (!text || text.trim().length === 0) {
        return '';
    }
    let result = text.replace(/([^0-9A-Za-z])+/g, '_');
    if (result.length > 0 && /[0-9]/.test(result.charAt(0))) {
        result = '_' + result;
    }
    return result;
};

// ---------------------------------------------------------------------------------------------------------------- Export

const adapterConstants = {
    IS_DEV_MODE,
    APP_NAME,
    APP_NAME_UNDERSCORED,
    APP_NAME_DASHED,
    SITE_KEY,
    PORTAL_COMPONENT_ATTRIBUTE,
    PORTAL_REGION_ATTRIBUTE,
};

// Verify required values
const NOT_REQUIRED = ['IS_DEV_MODE'];
Object.keys(adapterConstants).forEach(key => {
    if (NOT_REQUIRED.indexOf(key) === -1 && !adapterConstants[key]) {
        throw Error(`constants.ts: Config value '${key}' is missing (from .env?)`);
    }
});

export default adapterConstants;
