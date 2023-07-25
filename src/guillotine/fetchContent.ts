import {getMetaQuery, MetaData, PageComponent, PageData, pageFragmentQuery, PageRegion, RegionTree} from './getMetaData';

import adapterConstants, {
    addJsessionHeaders,
    addLocaleHeaders,
    APP_NAME,
    APP_NAME_DASHED,
    Context,
    FRAGMENT_CONTENTTYPE_NAME,
    FRAGMENT_DEFAULT_REGION_NAME,
    getContentApiUrl,
    getLocaleProjectConfig,
    getRenderMode,
    getXpBaseUrl,
    IS_DEV_MODE,
    LocaleProjectConfig,
    PAGE_TEMPLATE_CONTENTTYPE_NAME,
    PAGE_TEMPLATE_FOLDER,
    RENDER_MODE,
    sanitizeGraphqlName,
    XP_COMPONENT_TYPE,
    XP_REQUEST_TYPE,
} from '../utils';
import {ComponentDefinition, ComponentRegistry, SelectedQueryMaybeVariablesFunc} from '../ComponentRegistry';
import {UrlProcessor} from '../UrlProcessor';

type AdapterConstants = {
    APP_NAME: string,
    APP_NAME_DASHED: string,
};

type Result = {
    error?: {
        code: string,
        message: string
    } | null;
};

export type GuillotineResult = Result & {
    [dataKey: string]: any;
};

type MetaResult = Result & {
    meta?: {
        _path: string;
        type: string,
        pageAsJson?: PageData,
        components?: PageComponent[],
    }
};

type ContentResult = Result & {
    contents?: Record<string, any>[];
};

interface ComponentDescriptor {
    type?: ComponentDefinition;
    component?: PageComponent;
    queryAndVariables?: QueryAndVariables;
}

export type FetchContentResult = Result & {
    data: Record<string, any> | null,
    common: Record<string, any> | null,
    meta: MetaData,
    page: PageComponent | null,
};


type FetcherConfig<T extends AdapterConstants> = T & {
    componentRegistry: typeof ComponentRegistry
};

interface QueryAndVariables {
    query: string;
    variables?: Record<string, any>;
}

/**
 * Sends one query to the guillotine API and asks for content type, then uses the type to select a second query and variables, which is sent to the API and fetches content data.
 * @param contentPath string or string array: pre-split or slash-delimited _path to a content available on the API
 * @returns FetchContentResult object: {data?: T, error?: {code, message}}
 */
export type ContentFetcher = (contentPath: string | string[], context?: Context) => Promise<FetchContentResult>;

const NO_PROPS_PROCESSOR = async (props: any) => await props ?? {};

const ALIAS_PREFIX = 'request';

const GUILLOTINE_QUERY_REGEXP = /^\s*query\s*(?:\((.*)*\))?\s*{\s*guillotine\s*{((?:.|\s)+)}\s*}\s*$/;

const GRAPHQL_FRAGMENTS_REGEXP = /fragment\s+.+\s+on\s+.+\s*{[\s\w{}().,:"'`]+}/;

// /////////////////////////////////////////////////////////////////////////////// Data

// Shape of content base-data API body
export type ContentApiBaseBody = {
    query?: string,                 // Override the default base-data query
    variables?: {                   // GraphQL variables inserted into the query
        path?: string,              // Full content item _path
        [key: string]: string | number | undefined,
    }
};

/** Generic fetch */
export const fetchFromApi = async (
    apiUrl: string,
    body: ContentApiBaseBody,
    projectConfig: LocaleProjectConfig,
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

    let res;
    try {
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
    projectConfig: LocaleProjectConfig,
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
    const result = await fetchFromApi(
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
                console.error(`headers: ${JSON.stringify(headers, null, 2)}
                variables: ${JSON.stringify(body.variables, null, 2)}`);
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

    return result as GuillotineResult;
};

// /////////////////////////////////////////////////////////////////////////////// Specific fetch wrappers:

const fetchMetaData = async (contentApiUrl: string, xpContentPath: string, projectConfig: LocaleProjectConfig, headers?: {}): Promise<MetaResult> => {
    const body: ContentApiBaseBody = {
        query: getMetaQuery(pageFragmentQuery()),
        variables: {
            path: xpContentPath,
        },
    };
    const metaResult = await fetchGuillotine(contentApiUrl, body, projectConfig, headers);
    if (metaResult.error) {
        return metaResult;
    } else {
        return {
            meta: metaResult?.guillotine?.get,
        };
    }
};


const fetchContentData = async <T>(
    contentApiUrl: string,
    xpContentPath: string,
    projectConfig: LocaleProjectConfig,
    query: string,
    variables?: {},
    headers?: {},
): Promise<ContentResult> => {

    const body: ContentApiBaseBody = {query};
    if (variables && Object.keys(variables).length > 0) {
        body.variables = variables;
    }
    const contentResults = await fetchGuillotine(contentApiUrl, body, projectConfig, headers);

    if (contentResults.error) {
        return contentResults;
    } else {
        return {
            // omit the aliases and return values
            contents: Object.values(contentResults),
        };
    }
};


// /////////////////////////////////////////////////////////////////////////////// Error checking:

/** Checks a site-relative contentPath as a slash-delimited string or a string array, and returns a pure site-relative path string (no double slashes, starts with a slash, does not end with one). */
const getCleanContentPathArrayOrThrow400 = (contentPath: string | string[] | undefined): string => {
    if (contentPath === undefined) {
        return '';
    }
    const isArray = Array.isArray(contentPath);

    if (!isArray) {
        if (typeof contentPath !== 'string') {
            throw Error(JSON.stringify({
                code: 400,
                message: `Unexpected target content _path: contentPath must be a string or pure string array (contentPath=${JSON.stringify(
                    contentPath)})`,
            }));
        }

        return contentPath;

    } else {
        return (contentPath).join('/');
    }
};


// ------------------------------------------------------------- XP view component data handling


type PathFragment = { region: string, index: number };

function parseComponentPath(contentType: string, path: string): PathFragment[] {
    const matches: PathFragment[] = [];
    let match;
    const myRegexp = /(?:(\w+)\/(\d+))+/g;
    while ((match = myRegexp.exec(path)) !== null) {
        matches.push({
            region: match[1],
            index: +match[2],
        });
    }
    if (contentType === FRAGMENT_CONTENTTYPE_NAME) {
        // there is no main region in fragment content and the root component has '/' path
        // prepend FRAGMENT_DEFAULT_REGION_NAME to path to conform to page structure
        matches.unshift({
            region: FRAGMENT_DEFAULT_REGION_NAME,
            index: 0,
        });
    }
    return matches;
}

function getParentRegion(source: RegionTree, contentType: string, cmpPath: PathFragment[], components: PageComponent[] = [],
                         createMissing?: boolean): PageRegion | undefined {

    let currentTree: RegionTree = source;
    let currentRegion: PageRegion | undefined;
    let parentPath = '';

    for (let i = 0; i < cmpPath.length; i++) {
        const pathFragment = cmpPath[i];
        const regionName = pathFragment.region;
        parentPath += `/${pathFragment.region}/${pathFragment.index}`;
        currentRegion = currentTree[regionName];

        if (!currentRegion) {
            if (createMissing) {
                currentRegion = {
                    name: regionName,
                    components: [],
                };
                currentTree[regionName] = currentRegion;
            } else {
                throw `Region [${regionName}] was not found`;
            }
        }

        if (i < cmpPath.length - 1) {
            // look for layouts inside if this is not the last path fragment

            const layout = components.find((cmp: PageComponent) => {
                return cmp.type === XP_COMPONENT_TYPE.LAYOUT && prefixLayoutPath(contentType, cmp.path) === parentPath;
            });
            if (!layout) {
                throw `Layout [${parentPath}] not found among components, but needed for component [${JSON.stringify(cmpPath, null, 2)}]`;
            }
            if (!layout.regions) {
                layout.regions = {};
            }
            currentTree = layout.regions;
        }
    }

    return currentRegion;
}

function prefixLayoutPath(contentType: string, path: string): string {
    if (contentType !== FRAGMENT_CONTENTTYPE_NAME) {
        return path;
    } else {
        // prepend FRAGMENT_DEFAULT_REGION_NAME to path to conform to page structure
        // so that component with path '/' becomes /FRAGMENT_DEFAULT_REGION_NAME/0
        // path /left/1 becomes /FRAGMENT_DEFAULT_REGION_NAME/0/left/1
        return `/${FRAGMENT_DEFAULT_REGION_NAME}/0${path === '/' ? '' : path}`;
    }
}

function buildPage(contentType: string, comps: PageComponent[] = []): PageComponent {

    const page: PageComponent = {
        type: XP_COMPONENT_TYPE.PAGE,
        path: '/',
    };

    return buildComponentTree(comps, page, contentType);
}

function buildComponentTree(comps: PageComponent[], rootComp: PageComponent, contentType?: string): PageComponent {
    const rootTree: RegionTree = {};
    const isFragmentType = contentType === FRAGMENT_CONTENTTYPE_NAME;

    if (isFragmentType) {
        rootComp.regions = rootTree;
    }

    (comps || []).forEach(cmp => {
        const cmpPath = parseComponentPath(contentType, cmp.path);

        if (cmp.path === '/') {
            if (cmp.type === XP_COMPONENT_TYPE.PAGE && rootComp.type === XP_COMPONENT_TYPE.PAGE) {
                // add page values to page object
                rootComp = Object.assign(rootComp, cmp);
                rootComp.page.regions = rootTree;
                return;
            } else if (cmp.type === XP_COMPONENT_TYPE.LAYOUT && rootComp.type === XP_COMPONENT_TYPE.FRAGMENT) {
                // when rendering fragment as part of the page with layout at root path
                // remove other children from list as they will be included in layout
                rootComp.fragment.fragment.components = [cmp];
                cmp.regions = rootTree;
            }
        }

        if (cmp.type === XP_COMPONENT_TYPE.FRAGMENT) {
            // build component subtree for fragment
            cmp = buildComponentTree(cmp.fragment?.fragment?.components, cmp, contentType);
        }

        const region = getParentRegion(rootTree, contentType, cmpPath, comps, true);

        if (region) {
            // getting the index of component from string like '/main/0/left/11'
            const cmpIndex = cmpPath[cmpPath.length - 1]?.index;
            if (cmpIndex >= 0) {
                region.components.splice(cmpIndex, 0, cmp);
            } else {
                throw Error(`Could not find [${cmp.type}] component index at ${JSON.stringify(cmpPath, null, 2)}, rendering not possible.`);
            }
        }
    });

    return rootComp;
}


function combineMultipleQueries(queriesWithVars: ComponentDescriptor[]): QueryAndVariables {
    const queries: string[] = [];
    const fragments: string[] = [];
    const superVars: { [key: string]: any } = {};
    const superParams: string[] = [];

    queriesWithVars.forEach((componentDescriptor: ComponentDescriptor, index: number) => {
        const queryAndVars = componentDescriptor.queryAndVariables;
        if (!queryAndVars) {
            return;
        }

        // Extract fragments first if exist
        let q = queryAndVars.query;
        let match = q.match(GRAPHQL_FRAGMENTS_REGEXP);
        if (match?.length === 1) {
            // extract a fragment to put it at root level
            fragments.push(match[0]);
            // remove it from query because queries are going to get wrapped
            q = q.replace(match[0], '');
        }

        // Extract graphql query and its params and add prefixes to exclude collisions with other queries
        match = q.match(GUILLOTINE_QUERY_REGEXP);
        let query = '';
        if (match && match.length === 2) {
            // no params, just query
            query = match[1];
        } else if (match && match.length === 3) {
            // both query and params are present
            query = match[2];
            // process args
            const args = match[1];
            if (args) {
                args.split(',').forEach(originalParamString => {
                    const [originalKey, originalVal] = originalParamString.trim().split(':');
                    const [prefixedKey, prefixedVal] = [`$${ALIAS_PREFIX}${index}_${originalKey.substr(1)}`, originalVal];
                    superParams.push(`${prefixedKey}:${prefixedVal}`);
                    // also update param references in query itself !
                    // query = query.replaceAll(originalKey, prefixedKey);
                    // replaceAll is not supported in older nodejs versions
                    const origKeyPattern = new RegExp(originalKey.replace(/\$/g, '\\$'), 'g');
                    query = query.replace(origKeyPattern, prefixedKey);
                });
            }
        }
        if (query.length) {
            queries.push(`${ALIAS_PREFIX}${index}:guillotine {${query}}`);
        }

        // Update variables with the same prefixes
        Object.entries(queryAndVars.variables || {}).forEach(entry => {
            superVars[`${ALIAS_PREFIX}${index}_${entry[0]}`] = entry[1];
        });
    });

    // Compose the super query
    const superQuery = `query ${superParams.length ? `(${superParams.join(', ')})` : ''} {
        ${queries.join('\n')}
    }
    ${fragments.join('\n')}
    `;

    return {
        query: superQuery,
        variables: superVars,
    };
}

async function applyProcessors(componentDescriptors: ComponentDescriptor[], contentResults: ContentResult,
                               context?: Context): Promise<PromiseSettledResult<any>[]> {

    let dataCounter = 0;
    const processorPromises = componentDescriptors.map(async (desc: ComponentDescriptor) => {
        // we're iterating component descriptors here
        // some of them might not have provided graphql requests
        // but we still need to run props processor for them
        // in case they want to fetch their data from elsewhere
        const propsProcessor = desc.type?.processor || NO_PROPS_PROCESSOR;
        let data;
        if (desc.queryAndVariables) {
            // if there is a query then there must be a result for it
            data = contentResults.contents[dataCounter++];
        }

        const config = getComponentConfig(desc.component);
        return await propsProcessor(data, context, config);
    });

    return Promise.allSettled(processorPromises);
}

function getComponentConfig(cmp?: PageComponent) {
    const cmpData = cmp && cmp[cmp.type];
    return cmpData && 'config' in cmpData ? cmpData.config : undefined;
}

function collectComponentDescriptors(components: PageComponent[],
                                     componentRegistry: typeof ComponentRegistry,
                                     xpContentPath: string,
                                     context: Context | undefined,
): ComponentDescriptor[] {

    const descriptors: ComponentDescriptor[] = [];

    for (const cmp of (components || [])) {
        processComponentConfig(APP_NAME, APP_NAME_DASHED, cmp);
        // only look for parts
        // look for single part if it is a single component request
        if (XP_COMPONENT_TYPE.FRAGMENT !== cmp.type) {
            const cmpDef = ComponentRegistry.getByComponent(cmp);
            if (cmpDef) {
                // const partPath = `${xpContentPath}/_component${cmp.path}`;
                const config = getComponentConfig(cmp);
                const queryAndVariables = getQueryAndVariables(cmp.type, xpContentPath, cmpDef.query, context, config);
                if (queryAndVariables) {
                    descriptors.push({
                        component: cmp,
                        type: cmpDef,
                        queryAndVariables: queryAndVariables,
                    });
                }
            }
        } else {
            // look for parts inside fragments
            const fragPartDescs = collectComponentDescriptors(cmp.fragment?.fragment?.components, componentRegistry, xpContentPath, context);
            if (fragPartDescs.length) {
                descriptors.push(...fragPartDescs);
            }
        }
    }

    return descriptors;
}

function processComponentConfig(myAppName: string, myAppNameDashed: string, cmp: PageComponent) {
    const cmpData = cmp[cmp.type];
    if (cmpData && 'descriptor' in cmpData && cmpData.descriptor) {
        const [appName, cmpName] = cmpData.descriptor.split(':');
        if (appName !== myAppName) {
            return;
        }
        let config;
        const configArray: Object[] = [];
        if ('configAsJson' in cmpData && cmpData.configAsJson && cmpData.configAsJson[myAppNameDashed]) {
            config = cmpData.configAsJson[myAppNameDashed][cmpName];
            if (config) {
                configArray.push(config);
                delete cmpData.configAsJson;
            }
        }
        const sanitizedAppName = sanitizeGraphqlName(appName);
        if ('config' in cmpData && cmpData.config && cmpData.config[sanitizedAppName]) {
            config = cmpData.config[sanitizedAppName][sanitizeGraphqlName(cmpName)];
            if (config) {
                configArray.push(config);
            }
        }
        if (configArray.length) {
            cmpData.config = Object.assign({}, ...configArray);
        }
    }
}

function getQueryAndVariables(type: string,
                              path: string,
                              selectedQuery?: SelectedQueryMaybeVariablesFunc,
                              context?: Context,
                              config?: any): QueryAndVariables | undefined {

    let query, getVariables;

    if (typeof selectedQuery === 'string' || typeof selectedQuery === 'function') {
        query = selectedQuery;

    } else if (Array.isArray(selectedQuery)) {
        query = selectedQuery[0];
        getVariables = selectedQuery[1];

    } else if (typeof selectedQuery === 'object') {
        query = selectedQuery.query;
        getVariables = selectedQuery.variables;
    }

    if (getVariables && typeof getVariables !== 'function') {
        throw Error(`getVariables for content type ${type} should be a function, not: ${typeof getVariables}`);
    }

    if (query && typeof query !== 'string' && typeof query !== 'function') {
        throw Error(`Query for content type ${type} should be a string or function, not: ${typeof query}`);
    }

    if (typeof query === 'function') {
        query = query(path, context, config);
    }

    if (query) {
        return {
            query,
            variables: getVariables ? getVariables(path, context, config) : {path},
        };
    }
}


function createPageData(contentType: string, components: PageComponent[], componentPath?: string): PageComponent | undefined {
    let page;
    if (components && !componentPath) {
        page = buildPage(contentType, components);
    } else {
        // Don't build page for single component
        page = null;
    }
    return page as PageComponent;
}


function createMetaData(contentType: string, contentPath: string,
                        requestType: XP_REQUEST_TYPE, renderMode: RENDER_MODE,
                        apiUrl: string, baseUrl: string,
                        requestedComponentPath: string | undefined,
                        pageCmp?: PageComponent, components: PageComponent[] = []): MetaData {
    // .meta will be visible in final rendered inline props.
    // Only adding some .meta attributes here on certain conditions
    // (instead of always adding them and letting them be visible as false/undefined etc)
    const meta: MetaData = {
        type: contentType,
        path: contentPath,
        requestType: requestType,
        renderMode: renderMode,
        canRender: false,
        catchAll: false,  // catchAll only refers to content type catch-all
        apiUrl,
        baseUrl,
    };

    if (requestedComponentPath) {
        meta.requestedComponent = components.find(cmp => cmp.path === requestedComponentPath);
    }

    const pageDesc = pageCmp?.page?.descriptor;
    const typeDef = ComponentRegistry.getContentType(contentType);
    if (typeDef?.view && !typeDef.catchAll) {
        meta.canRender = true;
    } else if (requestType === XP_REQUEST_TYPE.COMPONENT) {
        // always render a single component (show missing if not implemented)
        meta.canRender = true;
    } else if (pageDesc) {
        // always render a page if there is a descriptor (show missing if not implemented)
        meta.canRender = true;
    } else if (typeDef?.view) {
        meta.canRender = true;
        meta.catchAll = true;
    }

    return meta;
}

function errorResponse(code = '500', message = 'Unknown error',
                       requestType: XP_REQUEST_TYPE, renderMode: RENDER_MODE,
                       apiUrl: string, baseUrl: string, contentPath?: string): FetchContentResult {
    return {
        error: {
            code,
            message,
        },
        page: null,
        common: null,
        data: null,
        meta: {
            type: '',
            requestType: requestType,
            renderMode: renderMode,
            path: contentPath || '',
            canRender: false,
            catchAll: false,
            apiUrl,
            baseUrl,
        },
    };
}

function restrictComponentsToPath(contentType: string, components?: PageComponent[], componentPath?: string) {
    if (!componentPath || !components?.length) {
        return components || [];
    }

    // filter components to the requested one only
    const component = components.find(cmp => {
        return cmp.path === componentPath;
    });

    if (!component) {
        return [];
    }

    let result: PageComponent[] = [component];
    if (component.type !== XP_COMPONENT_TYPE.LAYOUT) {
        // remember to include all parent layouts too !
        const cmpPath = parseComponentPath(contentType, component.path);
        for (let i = cmpPath.length - 2; i >= 0; i--) {
            const parentPath = cmpPath[i];
            const parentCmp = components.find(cmp => cmp.path === `/${parentPath.region}/${parentPath.index}`);
            if (parentCmp) {
                result.unshift(parentCmp);
            }
        }
    } else {
        // It's a layout, include child components
        const childCmps = components.filter(cmp => cmp.path !== component.path && cmp.path.startsWith(component.path));
        if (childCmps.length) {
            result = result.concat(childCmps);
        }
    }
    return result;
}

const COMPONENT_PATH_KEY = /\/?_\/component/;   // first slash is optional for root components

const getContentAndComponentPaths = (requestPath: string, context: Context): string[] => {
    let contentPath, componentPath;
    if (COMPONENT_PATH_KEY.test(requestPath)) {
        [contentPath, componentPath] = requestPath.split(COMPONENT_PATH_KEY);
    } else {
        contentPath = requestPath;
    }
    return [contentPath, componentPath];
};

// /////////////////////////////  ENTRY 1 - THE BUILDER:

/**
 * Configures, builds and returns a general fetchContent function.
 * @param config object containing ComponentRegistry as well as constants imported from enonic-connecion-config.js
 * @returns ContentFetcher
 */
const buildContentFetcher = <T extends AdapterConstants>(config: FetcherConfig<T>): ContentFetcher => {

    const {
        APP_NAME,
        APP_NAME_DASHED,
        componentRegistry,
    } = config;

    return async (contentPathOrArray: string | string[], context: Context): Promise<FetchContentResult> => {

        const headers = {};
        addJsessionHeaders(headers, context);
        addLocaleHeaders(headers, context);
        const xpBaseUrl = getXpBaseUrl(context);
        const contentApiUrl = getContentApiUrl(context);
        const projectConfig = getLocaleProjectConfig(context);
        const renderMode = getRenderMode(context);
        let requestType = XP_REQUEST_TYPE.TYPE;

        UrlProcessor.setSiteKey(projectConfig.site);

        try {
            const requestContentPath = getCleanContentPathArrayOrThrow400(contentPathOrArray);
            const [siteRelativeContentPath, componentPath] = getContentAndComponentPaths(requestContentPath, context);
            if (componentPath) {
                // set component request type because url contains component path
                requestType = XP_REQUEST_TYPE.COMPONENT;
            }

            // /////////////  FIRST GUILLOTINE CALL FOR METADATA     /////////////////
            const metaResult = await fetchMetaData(contentApiUrl, '${site}/' + siteRelativeContentPath, projectConfig, headers);
            // ///////////////////////////////////////////////////////////////////////

            const {_path, type} = metaResult.meta || {};
            const contentPath = _path || siteRelativeContentPath;

            if (metaResult.error) {
                console.error(metaResult.error);
                return errorResponse(metaResult.error.code, metaResult.error.message, requestType, renderMode, contentApiUrl, xpBaseUrl, contentPath);
            }

            if (!metaResult.meta) {
                return errorResponse('404', 'No meta data found for content, most likely content does not exist', requestType, renderMode,
                    contentApiUrl, xpBaseUrl, contentPath);
            } else if (!type) {
                return errorResponse('500', "Server responded with incomplete meta data: missing content 'type' attribute.", requestType,
                    renderMode, contentApiUrl, xpBaseUrl, contentPath);

            } else if (renderMode === RENDER_MODE.NEXT && !IS_DEV_MODE &&
                (type === FRAGMENT_CONTENTTYPE_NAME ||
                    type === PAGE_TEMPLATE_CONTENTTYPE_NAME ||
                    type === PAGE_TEMPLATE_FOLDER)) {
                return errorResponse('404', `Content type [${type}] is not accessible in ${renderMode} mode`, requestType, renderMode,
                    contentApiUrl, xpBaseUrl, contentPath);
            }

            const components = restrictComponentsToPath(type, metaResult.meta.components, componentPath);
            if (componentPath && !components.length) {
                // component was not found
                return errorResponse('404', `Component ${componentPath} was not found`, requestType, renderMode, contentApiUrl, xpBaseUrl, contentPath);
            }

            if (requestType !== XP_REQUEST_TYPE.COMPONENT && components.length > 0) {
                requestType = XP_REQUEST_TYPE.PAGE;
            }

            // //////////////////////////////////////////////////  Content type established. Proceed to data call:

            const allDescriptors: ComponentDescriptor[] = [];

            // Add the content type query at all cases
            const contentTypeDef = componentRegistry?.getContentType(type);
            const pageCmp = (components || []).find(cmp => cmp.type === XP_COMPONENT_TYPE.PAGE);
            if (pageCmp) {
                processComponentConfig(APP_NAME, APP_NAME_DASHED, pageCmp);
            }

            const contentQueryAndVars = getQueryAndVariables(type, contentPath, contentTypeDef?.query, context, pageCmp?.page?.config);
            if (contentQueryAndVars) {
                allDescriptors.push({
                    type: contentTypeDef,
                    queryAndVariables: contentQueryAndVars,
                });
            }

            const commonQueryAndVars = getQueryAndVariables(type, contentPath, componentRegistry.getCommonQuery(), context,
                pageCmp?.page?.config);
            if (commonQueryAndVars) {
                allDescriptors.push({
                    type: contentTypeDef,
                    queryAndVariables: commonQueryAndVars,
                });
            }

            if (components?.length && componentRegistry) {
                for (const cmp of (components || [])) {
                    processComponentConfig(APP_NAME, APP_NAME_DASHED, cmp);
                }
                // Collect component queries if defined
                const componentDescriptors = collectComponentDescriptors(components, componentRegistry, contentPath, context);
                if (componentDescriptors.length) {
                    allDescriptors.push(...componentDescriptors);
                }
            }

            const {query, variables} = combineMultipleQueries(allDescriptors);

            if (!query.trim()) {
                return errorResponse('400', `Missing or empty query override for content type ${type}`, requestType, renderMode,
                    contentApiUrl, xpBaseUrl, contentPath);
            }

            // ///////////////    SECOND GUILLOTINE CALL FOR DATA   //////////////////////
            const contentResults = await fetchContentData(contentApiUrl, contentPath, projectConfig, query, variables, headers);
            // ///////////////////////////////////////////////////////////////////////////

            if (contentResults.error) {
                console.error(contentResults.error);
                return errorResponse(contentResults.error.code, contentResults.error.message, requestType, renderMode, contentApiUrl, xpBaseUrl, contentPath);
            }

            // Apply processors to every component
            const datas = await applyProcessors(allDescriptors, contentResults, context);

            //  Unwind the data back to components

            let contentData = null, common = null;
            let startFrom = 0;
            if (contentQueryAndVars) {
                const item = datas[startFrom];
                contentData = item.status === 'fulfilled' ? item.value : item.reason;
                startFrom++;
            }
            if (commonQueryAndVars) {
                const item = datas[startFrom];
                common = item.status === 'fulfilled' ? item.value : item.reason;
                startFrom++;
            }

            for (let i = startFrom; i < datas.length; i++) {
                // component descriptors hold references to components
                // that will later be used for creating page regions
                const datum = datas[i];
                if (datum.status === 'rejected') {
                    let reason = datum.reason;
                    if (reason instanceof Error) {
                        reason = reason.message;
                    } else if (typeof reason !== 'string') {
                        reason = String(reason);
                    }
                    allDescriptors[i].component.error = reason;
                } else {
                    allDescriptors[i].component.data = datum.value;
                }
            }

            const page = createPageData(type, components);
            const meta = createMetaData(type, siteRelativeContentPath, requestType, renderMode, contentApiUrl, xpBaseUrl, componentPath, page, components);

            return {
                data: contentData,
                common,
                meta,
                page,
            } as FetchContentResult;

        } catch (e: any) {
            console.error(e);

            let error;
            try {
                error = JSON.parse(e.message);
            } catch (e2) {
                error = {
                    code: 'Local',
                    message: e.message,
                };
            }
            return errorResponse(error.code, error.message, requestType, renderMode, contentApiUrl, xpBaseUrl, contentPathOrArray.toString());
        }
    };
};


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
