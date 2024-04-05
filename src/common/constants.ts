export const CATCH_ALL = '*';

export enum ENV_VARS {
    MAPPINGS = 'ENONIC_MAPPINGS',
    API_URL = 'ENONIC_API',
    APP_NAME = 'ENONIC_APP_NAME',
    LOG = 'ENONIC_LOGGING',
}

export const FRAGMENT_CONTENTTYPE_NAME = 'portal:fragment';
export const FRAGMENT_DEFAULT_REGION_NAME = 'fragment';

/** excluded contents:
 * - folder
 * - shortcuts (redirect can't be used in prerender)
 * - media
 * - paths with '/_' in them
 */
export const GET_STATIC_PATHS_QUERY = `query ($count: Int) {
    guillotine {
        queryDsl(
            first: $count,
            sort: {
                field: "modifiedTime",
                direction: DESC
            }
            query: {boolean: {mustNot: [
                {in: {field: "type", stringValues: ["base:shortcut", "portal:fragment", "portal:template-folder", "portal:page-template"]}}
                {like: {field: "type", value: "media:*"}}
            ]}}
        ) {
            _name
            _path
            site {_name}
        }
    }
}`;

// Seems like NodeJS.fetch lowercases all headers, so we need to lowercase the
// header names here.
export enum GUILLOTINE_REQUEST_HEADERS {
    COOKIE = 'Cookie',
    LOCALE = 'locale',
    LOCALES = 'locales',
    DEFAULT_LOCALE = 'default-locale',
}

export const JSESSIONID_HEADER = 'jsessionid';

export const PAGE_TEMPLATE_CONTENTTYPE_NAME = 'portal:page-template';
export const PAGE_TEMPLATE_FOLDER = 'portal:template-folder';
export const PORTAL_COMPONENT_ATTRIBUTE = 'data-portal-component-type';
export const PORTAL_REGION_ATTRIBUTE = 'data-portal-region';
export const PROJECT_ID_HEADER = 'content-studio-project';

export enum RENDER_MODE {
    INLINE = 'inline',
    EDIT = 'edit',
    PREVIEW = 'preview',
    LIVE = 'live',
    ADMIN = 'admin',
    NEXT = 'next'       // Fallback: not using XP proxy but rendering directly with next.js
}

export const RENDER_MODE_HEADER = 'content-studio-mode';

export const SITE_CONTENTTYPE_NAME = 'portal:site';

// URI parameter marking that a request is for a preview for CS. MUST MATCH THE VALUE OF 'FROM_XP_PARAM' on XP side.
export const XP_BASE_URL_HEADER = 'xpbaseurl';

// TODO: Use these instead of hardcoded strings everywhere
export enum XP_COMPONENT_TYPE {
    PART = 'part',
    LAYOUT = 'layout',
    TEXT = 'text',
    FRAGMENT = 'fragment',
    PAGE = 'page',
}

export enum XP_REQUEST_TYPE {
    COMPONENT = 'component',
    TYPE = 'type',
    PAGE = 'page',
}
