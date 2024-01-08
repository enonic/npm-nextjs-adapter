/** Import config values from .env, .env.development and .env.production */
import {ParsedUrlQuery} from 'node:querystring';
import {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';
import Negotiator from 'negotiator';
import {match as localeMatcher} from '@formatjs/intl-localematcher';

const mode = process.env.MODE || process.env.NEXT_PUBLIC_MODE;
export const IS_DEV_MODE = (mode === 'development');

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

// NOTE: Dissallowing slash and any whitespace in 2nd capture group.
const PROJECT_CONFIG_REGEXP = /^([\w-]+):([^\/\s]+)(\/[\w.-]+)?$/i;


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

export type Context = {
    headers?: ReadonlyHeaders | Headers;
    locale?: string;
    contentPath: string | string[],
};

export type ProjectLocaleConfig = {
    default: boolean;
    project: string;
    site: string;
    locale: string;
};

export type ProjectLocalesConfig = {
    [locale: string]: ProjectLocaleConfig;
};

export interface ContentPathItem {
    contentPath: string[]
    locale: string,
}

export const getRenderMode = (context: Context): RENDER_MODE => {
    const value = context.headers?.get(RENDER_MODE_HEADER);
    const enumValue = RENDER_MODE[<keyof typeof RENDER_MODE>value?.toUpperCase()];
    return enumValue || RENDER_MODE[process.env.RENDER_MODE] || RENDER_MODE.NEXT;
};

export function getRequestLocaleInfo(context: Context) {
    let locale: string;
    const configs = getProjectLocaleConfigs();
    const locales = Object.keys(configs);
    const defaultLocale = locales.find((locale) => configs[locale].default)!;
    const projectId = context.headers?.get(PROJECT_ID_HEADER);
    if (projectId) {
        locale = getProjectLocaleConfigById(projectId, false)?.locale;

    } else {
        locale = context.locale;
        if (!locale) {
            const acceptLang = context.headers?.get('accept-language') || '';
            const langs = new Negotiator({headers: {'accept-language': acceptLang}}).languages();
            locale = localeMatcher(langs, locales, defaultLocale);
        }
    }
    return {locale, locales, defaultLocale};
}

export function getProjectLocaleConfig(context: Context): ProjectLocaleConfig {
    const projectId = context.headers?.get(PROJECT_ID_HEADER);

    let config: ProjectLocaleConfig;
    if (projectId) {
        // first use project id header
        config = getProjectLocaleConfigById(projectId, false);
    }
    if (!config) {
        // next try to use locale from url
        // it will fall back to default locale if not found
        config = getProjectLocaleConfigByLocale(context.locale);
    }

    return config;
}

export function getProjectLocales(): string[] {
    return Object.keys(getProjectLocaleConfigs());
}

export function getProjectLocaleConfigById(projectId?: string, useDefault = true): ProjectLocaleConfig {
    const configs = getProjectLocaleConfigs();

    let config: ProjectLocaleConfig;
    if (projectId) {
        config = Object.values(configs).find(p => {
            return p?.project?.toLowerCase() === projectId.toLowerCase();
        });
    }
    if (!config && useDefault) {
        config = Object.values(configs).find(c => c.default);
    }

    return config;
}

export function getProjectLocaleConfigByLocale(locale?: string, useDefault = true): ProjectLocaleConfig {
    const configs = getProjectLocaleConfigs();

    let config: ProjectLocaleConfig;
    if (locale) {
        config = configs[locale];
    }
    if (!config && useDefault) {
        config = Object.values(configs).find(c => c.default);
    }

    return config;
}

export function getProjectLocaleConfigs(): ProjectLocalesConfig {
    const str = PROJECTS;
    const envVarName = ENV_VARS.PROJECTS;
    if (!str?.length) {
        throw new Error(`Did you forget to define "${ENV_VARS.PROJECTS}" environmental variable?
        Format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>,...`);
    }
    return str.split(',').reduce((config, prjStr, index: number) => {
        const trimmedprjStr = prjStr.trim();
        if (!trimmedprjStr.length) {
            return config;
        }
        const matches: RegExpExecArray = PROJECT_CONFIG_REGEXP.exec(trimmedprjStr);
        if (!matches?.length) {
            throw new Error(`Project "${prjStr}" doesn't match format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>`);
        }
        const [full, lang, project, site] = matches;
        if (project && site) {
            config[lang] = {
                default: index === 0,
                project,
                site,
                locale: lang,
            };
        } else {
            throw Error(`Wrong configuration in "${envVarName}": ${prjStr}.
            Format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>,...`);
        }
        return config;
    }, {});
}

export function fixDoubleSlashes(str: string) {
    return str.replace(/(^|[^:/])\/{2,}/g, '$1/');
}

export function getContentApiUrl(context: Context): string {
    const project = getProjectLocaleConfig(context).project;
    const branch = getRenderMode(context) === RENDER_MODE.NEXT ? 'master' : 'draft';

    return fixDoubleSlashes(`${API_URL}/${project}/${branch}`);
}

export function addJsessionHeaders(target: Object = {}, context: Context): void {
    const jsessionid = context.headers?.get(JSESSIONID_HEADER);
    if (jsessionid) {
        target['Cookie'] = `${JSESSIONID_HEADER}=${jsessionid}`;
    }
}

export function addLocaleHeaders(target: Object = {}, locale: string, locales: string[], defaultLocale: string): void {
    target[LOCALE_HEADER] = locale;
    target[LOCALES_HEADER] = JSON.stringify(locales);
    target[DEFAULT_LOCALE_HEADER] = defaultLocale;
}

export const getXpBaseUrl = (context: Context): string => {
    const header = context.headers?.get(XP_BASE_URL_HEADER) || '/';

    // TODO: workaround for XP pattern controller mapping not picked up in edit mode
    return header.replace(/\/edit\//, '/inline/');
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
