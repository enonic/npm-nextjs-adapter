/** Import config values from .env, .env.development and .env.production */
import {GetServerSidePropsContext} from 'next';
import {ParsedUrlQuery} from 'node:querystring';
import {IncomingHttpHeaders} from 'http';

const mode = process.env.MODE || process.env.NEXT_PUBLIC_MODE;
export const IS_DEV_MODE = (mode === 'development');

export enum ENV_VARS {
    PROJECTS = 'ENONIC_PROJECTS',
    API = 'ENONIC_API',
    SITE_KEY = 'ENONIC_SITE_KEY',
    API_TOKEN = 'ENONIC_API_TOKEN',
}

/** URL to the guillotine API */
const API_URL = (process.env.ENONIC_API || process.env.NEXT_PUBLIC_ENONIC_API);

/** Locales and Enonic XP projects correspondence list */
const PROJECTS = (process.env.ENONIC_PROJECTS || process.env.NEXT_PUBLIC_ENONIC_PROJECTS);

export const SITE_KEY = (process.env.ENONIC_SITE_KEY || process.env.NEXT_PUBLIC_ENONIC_SITE_KEY);

/** Optional utility value - defining in one place the name of the target app (the app that defines the content types, the app name is therefore part of the content type strings used both in typeselector and in query introspections) */
export const APP_NAME = (process.env.ENONIC_APP_NAME || process.env.NEXT_PUBLIC_ENONIC_APP_NAME);

/** Optional utility value - derived from APP_NAME, only with underscores instead of dots */
export const APP_NAME_UNDERSCORED = (APP_NAME || '').replace(/\./g, '_');

/** Optional utility value - derived from APP_NAME, only with dashes instead of dots */
export const APP_NAME_DASHED = (APP_NAME || '').replace(/\./g, '-');


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

export type ProjectsConfig = {
    default: string;
    [project: string]: string;
};

export interface MinimalContext {
    req?: {
        headers: IncomingHttpHeaders;
    }
    locale?: string;
    defaultLocale?: string;
    locales?: string[];
}

export const getRenderMode = (context?: MinimalContext): RENDER_MODE => {
    const value = (context?.req?.headers || {})[RENDER_MODE_HEADER] as string | undefined;
    const enumValue = RENDER_MODE[<keyof typeof RENDER_MODE>value?.toUpperCase()];
    return enumValue || RENDER_MODE[process.env.RENDER_MODE] || RENDER_MODE.NEXT;
};

export function getProjectId(context?: MinimalContext): string {
    let projectId = (context?.req?.headers || {})[PROJECT_ID_HEADER] as string | undefined;
    if (projectId) {
        return projectId;
    }

    const projectsConfig = getProjectsConfig();
    const locale = context?.locale || context?.defaultLocale;
    if (locale) {
        projectId = projectsConfig[locale];
    }
    if (!projectId) {
        projectId = projectsConfig.default;
    }
    if (!projectId) {
        throw new Error(`No project for locale "${locale}" and no default project defined. Did you forget to define "${ENV_VARS.PROJECTS}" environmental variable?`);
    }

    return projectId;
}

export function getProjectLocale(projectId?: string): string {
    const projects: ProjectsConfig = getProjectsConfig();

    if (!projectId) {
        return projects.default;
    }

    const locale = Object.keys(projects).find(l => {
        return projects[l]?.toLowerCase() === projectId.toLowerCase();
    });

    return locale || projects.default;
}

export function getProjectsConfig(): ProjectsConfig {
    const str = PROJECTS;
    const envVarName = ENV_VARS.PROJECTS;
    if (!str?.length) {
        throw Error(`"${envVarName}" environmental variable is required.`);
    }
    const result: ProjectsConfig = str.split(',').reduce((config, prjStr) => {
        const [lang, prj] = prjStr.split(':').map(s => s?.trim());
        if (lang && !prj) {
            config.default = lang;
        } else if (lang && prj) {
            config[lang] = prj;
        }
        return config;
    }, {
        default: '',
    });
    if (!result.default) {
        throw Error(`"${envVarName}" environmental variable should contain default value.`);
    }
    return result;
}

export function fixDoubleSlashes(str: string) {
    return str.replace(/(^|[^:/])\/{2,}/g, '$1/');
}

export function getContentApiUrl(context?: MinimalContext): string {
    const project = getProjectId(context);
    const branch = getRenderMode(context) === RENDER_MODE.NEXT ? 'master' : 'draft';

    return fixDoubleSlashes(`${API_URL}/${project}/${branch}`);
}

export function getJsessionHeaders(context?: MinimalContext): Object {
    const headers = {};
    const jsessionid = context?.req?.headers[JSESSIONID_HEADER];
    if (jsessionid) {
        headers['Cookie'] = `${JSESSIONID_HEADER}=${jsessionid}`;
    }
    return headers;
}

export const getXpBaseUrl = (context?: MinimalContext): string => {
    const header = ((context?.req?.headers || {})[XP_BASE_URL_HEADER] || '') as string;

    // TODO: workaround for XP pattern controller mapping not picked up in edit mode
    return (header || '/').replace(/\/edit\//, '/inline/');
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
