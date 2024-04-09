/** Import config values from .env, .env.development and .env.production */
import {GetServerSidePropsContext} from 'next';
import {ParsedUrlQuery} from 'node:querystring';
import {IncomingHttpHeaders} from 'http';

const mode = process.env.MODE || process.env.NEXT_PUBLIC_MODE;
export const IS_DEV_MODE = (mode === 'development');

export const PURGE_CACHE_URL = '/_/enonic/cache/purge';

export enum ENV_VARS {
    PROJECTS = 'ENONIC_PROJECTS',
    API = 'ENONIC_API',
    API_TOKEN = 'ENONIC_API_TOKEN',
}

/** URL to the guillotine API */
const API_URL = (process.env.ENONIC_API || process.env.NEXT_PUBLIC_ENONIC_API);

/** Locales and Enonic XP projects correspondence list */
const PROJECTS = (process.env.ENONIC_PROJECTS || process.env.NEXT_PUBLIC_ENONIC_PROJECTS);

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */
export const APP_NAME = (process.env.ENONIC_APP_NAME || process.env.NEXT_PUBLIC_ENONIC_APP_NAME);

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');

const PROJECT_CONFIG_REGEXP = new RegExp('^(?:([\\w-]+):)?([^\\/\\s]+)(\\/[\\w-.]+)?$', 'i');


// ////////////////////////////////////////////////////////////////////////  Hardcode-able constants

// URI parameter marking that a request is for a preview for CS. MUST MATCH THE VALUE OF 'FROM_XP_PARAM' on XP side.
export const XP_BASE_URL_HEADER = 'xpbaseurl';
export const RENDER_MODE_HEADER = 'content-studio-mode';
export const PROJECT_ID_HEADER = 'content-studio-project';
export const JSESSIONID_HEADER = 'jsessionid';

export const PORTAL_COMPONENT_ATTRIBUTE = 'data-portal-component-type';
export const PORTAL_REGION_ATTRIBUTE = 'data-portal-region';

export const FRAGMENT_CONTENTTYPE_NAME = 'portal:fragment';
export const FRAGMENT_DEFAULT_REGION_NAME = 'fragment';

export const PAGE_TEMPLATE_CONTENTTYPE_NAME = 'portal:page-template';
export const PAGE_TEMPLATE_FOLDER = 'portal:template-folder';

export const SITE_CONTENTTYPE_NAME = 'portal:site';

export const LOCALE_HEADER = 'locale';
export const LOCALES_HEADER = 'locales';
export const DEFAULT_LOCALE_HEADER = 'default-locale';

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
        {in: {field: "type", stringValues: ["base:folder", "base:shortcut"]}}
        {like: {field: "type", value: "media:*"}}
        {like: {field: "_path", value: "*/_*"}}
      ]}}
    ) {
      _name
      _path
      site {_name}
    }
  }
}`;


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

export interface ServerSideParams
    extends ParsedUrlQuery {
    // String array catching a sub-path assumed to match the site-relative path of an XP content.
    contentPath?: string[];
    mode?: string;
}

export interface PreviewParams {
    contentPath: string[];
    headers: Record<string, string>;
    params: Record<string, string>;
}

export type Context = GetServerSidePropsContext<ServerSideParams, PreviewParams>;

export type LocaleProjectConfig = {
    project: string;
    site: string;
    locale: string;
};

export type LocaleProjectConfigs = {
    default: LocaleProjectConfig;
    [locale: string]: LocaleProjectConfig;
};

export interface MinimalContext {
    req?: {
        headers: IncomingHttpHeaders;
    }
    locale?: string;
    defaultLocale?: string;
    locales?: string[];
}

export interface ContentPathItem {
    params: { contentPath: string[] },
    locale?: string,
}

export const getRenderMode = (context?: MinimalContext): RENDER_MODE => {
    const value = (context?.req?.headers || {})[RENDER_MODE_HEADER] as string | undefined;
    const enumValue = RENDER_MODE[<keyof typeof RENDER_MODE>value?.toUpperCase()];
    return enumValue || RENDER_MODE[process.env.RENDER_MODE] || RENDER_MODE.NEXT;
};

export function normalizeLocale(locale: string): string | undefined {
    return locale !== 'default' ? locale : undefined;
}

export function getLocaleProjectConfig(context?: MinimalContext): LocaleProjectConfig {
    const projectId = (context?.req?.headers || {})[PROJECT_ID_HEADER] as string | undefined;
    if (projectId) {
        return getLocaleProjectConfigById(projectId);
    }

    const projectsConfig = getLocaleProjectConfigs();
    const locale = context?.locale || context?.defaultLocale;
    let config: LocaleProjectConfig = projectsConfig[locale];
    if (!config) {
        config = projectsConfig.default;
    }
    if (!config) {
        throw new Error(`No config for locale "${locale}" found in "${ENV_VARS.PROJECTS}" environmental variable.
        Format: <default-repository-name>/<site-path>,<language>:<repository-name>/<site-path>,...`);
    }

    return config;
}

export function getLocaleProjectConfigById(projectId?: string, useDefault = true): LocaleProjectConfig {
    const projects: LocaleProjectConfigs = getLocaleProjectConfigs();
    if (!projectId) {
        return useDefault ? projects.default : undefined;
    }

    const match = Object.values(projects).find(p => {
        return p?.project?.toLowerCase() === projectId.toLowerCase();
    });

    return match || (useDefault ? projects.default : undefined);
}

export function getLocaleProjectConfigs(): LocaleProjectConfigs {
    const str = PROJECTS;
    const envVarName = ENV_VARS.PROJECTS;
    if (!str?.length) {
        throw Error(`"${envVarName}" environmental variable is required.`);
    }
    const result: LocaleProjectConfigs = str.split(',').reduce((config, prjStr) => {
        const matches: RegExpExecArray = PROJECT_CONFIG_REGEXP.exec(prjStr?.trim());
        if (!matches?.length) {
            return config;
        }
        const [full, lang = 'default', project, site] = matches;
        if (project && site) {
            config[lang] = {
                project,
                site,
                locale: lang,
            };
        } else {
            throw Error(`Wrong configuration in "${envVarName}": ${prjStr}.
            Format: <default-repository-name>/<site-path>,<language>:<repository-name>/<site-path>,...`);
        }
        return config;
    }, {
        default: {
            project: '',
            site: '',
            locale: '',
        },
    });
    if (!result.default.site || !result.default.project) {
        throw Error(`"${envVarName}" environmental variable should contain default value.
        Format: <default-repository-name>/<site-path>,<language>:<repository-name>/<site-path>,...`);
    }
    return result;
}

export function fixDoubleSlashes(str: string) {
    return str.replace(/(^|[^:/])\/{2,}/g, '$1/');
}

export function getContentApiUrl(context?: MinimalContext): string {
    const project = getLocaleProjectConfig(context).project;
    const branch = getRenderMode(context) === RENDER_MODE.NEXT ? 'master' : 'draft';

    return fixDoubleSlashes(`${API_URL}/${project}/${branch}`);
}

export function addJsessionHeaders(headers: Object = {}, context?: MinimalContext): void {
    const jsessionid = context?.req?.headers[JSESSIONID_HEADER];
    if (jsessionid) {
        headers['Cookie'] = `${JSESSIONID_HEADER}=${jsessionid}`;
    }
}

export function addLocaleHeaders(headers: Object = {}, context?: Context): void {
    const locale = context?.locale;
    if (locale) {
        headers[LOCALE_HEADER] = locale;
    }
    const locales = context?.locales;
    if (locales) {
        headers[LOCALES_HEADER] = JSON.stringify(locales);
    }
    const defaultLocale = context?.defaultLocale;
    if (defaultLocale) {
        headers[DEFAULT_LOCALE_HEADER] = defaultLocale;
    }
}

export const getXpBaseUrl = (context?: MinimalContext): string => {
    const header = ((context?.req?.headers || {})[XP_BASE_URL_HEADER] || '') as string;

    // TODO: workaround for XP pattern controller mapping not picked up in edit mode
    return (header || '/').replace(/\/edit\//, '/inline/');
};


export const commonChars = (s1?: string, s2?: string, wordSeparators?: string) => {
    let result = '';
    if (!s1 || s1.length === 0 || !s2 || s2.length === 0) {
        return result;
    }
    let lastSeparatorIndex = -1;
    let lastCommonIndex = -1;
    for (let i = 0; i < s1.length; i++) {
        const s1El = s1[i];
        if (wordSeparators?.indexOf(s1El) >= 0) {
            lastSeparatorIndex = i;
        }
        if (s2[i] === s1El) {
            lastCommonIndex = i;
        } else {
            break;
        }
    }

    if (lastSeparatorIndex > 0 || lastCommonIndex === lastSeparatorIndex) {
        result = s1.substring(0, lastSeparatorIndex);
    } else if (lastCommonIndex > -1) {
        result = s1.substring(0, lastCommonIndex + 1);
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
