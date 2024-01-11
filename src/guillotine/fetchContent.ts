import type {
    AdapterConstants,
    ContentApiBaseBody,
    ContentFetcher,
    FetchContentResult,
    PageComponent,
    ProjectLocaleConfig,
} from '../types';


import {notFound, redirect, RedirectType} from 'next/navigation';
import adapterConstants, {
    ContentPathItem,
    GET_STATIC_PATHS_QUERY,
    getContentApiUrl,
    getProjectLocaleConfigs,
    IS_DEV_MODE,
    RENDER_MODE,
} from '../utils';
import {ComponentRegistry} from '../ComponentRegistry';
import {UrlProcessor} from '../UrlProcessor';
import {buildContentFetcher} from './buildContentFetcher'; // TODO: Import loop


type Result = {
    error?: {
        code: string,
        message: string
    } | null;
};

export type GuillotineResult = Result & {
    [dataKey: string]: any;
};


// /////////////////////////////////////////////////////////////////////////////// Data

/** Generic fetch */
export const fetchFromApi = async (
    apiUrl: string,
    body: ContentApiBaseBody,
    projectConfig: ProjectLocaleConfig,
    headers?: {},
    method = 'POST',
) => {
    const options = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Guillotine-SiteKey': projectConfig.site,
        },
        body: JSON.stringify(body),
    };

    if (headers) {
        Object.assign(options.headers, headers);
    }

    let res: Response;
    try {
        // console.debug(apiUrl, options);
        res = await fetch(apiUrl, options);
    } catch (e: any) {
        console.warn(apiUrl, e);
        throw new Error(JSON.stringify({
            code: 'API',
            message: e.message,
        }));
    }

    if (!res.ok) {
        throw new Error(JSON.stringify({
            code: res.status,
            message: `Data fetching failed (message: '${await res.text()}')`,
        }));
    }

    let json;
    try {
        json = await res.json();
    } catch (e) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with non-JSON data: ${JSON.stringify(await res.text())}`,
        }));
    }

    if (!json) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with unexpectedly empty data: ${JSON.stringify(await res.text())}`,
        }));
    }

    return json;
};

/** Guillotine-specialized fetch, using the generic fetch above */
export const fetchGuillotine = async (
    contentApiUrl: string,
    body: ContentApiBaseBody,
    projectConfig: ProjectLocaleConfig,
    headers?: {}): Promise<GuillotineResult> => {
    if (typeof body.query !== 'string' || !body.query.trim()) {
        return {
            error: {
                code: '400',
                message: `Invalid or missing query. JSON.stringify(query) = ${JSON.stringify(body.query)}`,
            },
        };
    }
    const path = body.variables?.path;
    const pathMessage = path ? JSON.stringify(path) : '';
    const result: GuillotineResult = await fetchFromApi(
        contentApiUrl,
        body,
        projectConfig,
        headers,
    )
        .then(json => {
            let errors: any[] = (json || {}).errors;

            if (errors) {
                if (!Array.isArray(errors)) {
                    errors = [errors];
                }
                console.error(`${errors.length} error(s) when fetching data from: ${contentApiUrl}`);
                console.error(`headers: ${JSON.stringify(headers, null, 2)} \nvariables: ${JSON.stringify(body.variables, null, 2)}`);
                errors.forEach(error => {
                    console.error(error);
                });

                return {
                    error: {
                        code: '500',
                        message: `Server responded with ${errors.length} error(s), probably from guillotine - see log.`,
                    },
                };
            }

            return json.data;
        })
        .catch((err) => {
            console.warn(`Client-side error when trying to fetch data ${pathMessage}`, err);
            try {
                return {error: JSON.parse(err.message)};
            } catch (e2) {
                return {error: {code: 'Client-side error', message: err.message}};
            }
        });

    return result;
};


// ------------------------------------------------------------- XP view component data handling



// ////////////////////////////  ENTRY 2: ready-to-use fetchContent function

/**
 * Default fetchContent function, built with params from imports.
 * It runs custom content-type-specific guillotine calls against an XP guillotine endpoint, returns content data, error and some meta data
 * Sends one query to the guillotine API and asks for content type, then uses the type to select a second query and variables, which is sent to the API and fetches content data.
 * @param contentPath string or string array: local (site-relative) path to a content available on the API (by XP _path - obtainable by running contentPath through getXpPath). Pre-split into string array, or already a slash-delimited string.
 * @param context object from Next, contains .query info
 * @returns FetchContentResult object: {data?: T, error?: {code, message}}
 */
export const fetchContent: ContentFetcher = buildContentFetcher<AdapterConstants>({
    ...adapterConstants,
    componentRegistry: ComponentRegistry,
});

export function validateData(props: FetchContentResult): void {
    validateNotFound(props);
    validateShortcut(props);
}

function validateNotFound(props: FetchContentResult): void {
    const {error} = props;
    if (error) {
        switch (error.code) {
            case '404':
                console.warn(error.code, error.message);
                notFound();
                break;
            default:
                console.error(error.code, error.message);
                throw new Error(error.message);
        }
    }
}

function validateShortcut(props: FetchContentResult): void {
    const {data, meta, error} = props;
    const pageUrl = data?.get?.data?.target?.pageUrl;
    if (meta.type === 'base:shortcut' && pageUrl) {
        if (meta.renderMode !== RENDER_MODE.NEXT) {
            // console.debug(`Returning 404 for shortcut in ${RENDER_MODE.NEXT} mode`);
            // do not show shortcut targets in preview/edit mode
            console.warn(404, `Shortcuts are not available in ${RENDER_MODE.NEXT} render mode`);
            notFound();
        }

        const destination = UrlProcessor.process(pageUrl, meta, true);
        console.debug(`Redirecting shortcut content [${meta.path}] to`, destination);
        redirect(destination, RedirectType.replace);
    }

    // we can not set 418 for static paths,
    // but we can show 404 instead to be handled in CS
    const canNotRender = meta && !meta.canRender && meta.renderMode !== RENDER_MODE.EDIT;

    const catchAllInNextProdMode = meta?.renderMode === RENDER_MODE.NEXT && !IS_DEV_MODE && meta?.catchAll;

    const isNotFound = (error && error.code === '404') || canNotRender || catchAllInNextProdMode;

    if (isNotFound) {
        console.warn(404, `Can not render content at [${meta.path}]`);
        notFound();
    }
}

export async function fetchContentPathsForAllLocales(path: string, query: string = GET_STATIC_PATHS_QUERY, countPerLocale = 999): Promise<ContentPathItem[]> {
    const promises = Object.values(getProjectLocaleConfigs()).map(config => fetchContentPathsForLocale(path, config, query, countPerLocale));
    return Promise.all(promises).then(results => {
        return results.reduce((all, localePaths) => all.concat(localePaths), []);
    });
}

export async function fetchContentPathsForLocale(path: string, config: ProjectLocaleConfig, query: string = GET_STATIC_PATHS_QUERY, count = 999): Promise<ContentPathItem[]> {
    const contentApiUrl = getContentApiUrl({
        contentPath: path,
        locale: config.locale,
    });
    const body: ContentApiBaseBody = {
        query,
        variables: {
            path,
            count,
        },
    };
    return fetchGuillotine(contentApiUrl, body, config).then((results: GuillotineResult) => {
        return results.guillotine.queryDsl.reduce((prev: ContentPathItem[], child: any) => {
            const regexp = new RegExp(`/${child.site?._name}/?`);
            const contentPath = child._path.replace(regexp, '');
            prev.push({
                contentPath: contentPath.split('/'),
                locale: config.locale,
            });
            return prev;
        }, []);
    });
}
