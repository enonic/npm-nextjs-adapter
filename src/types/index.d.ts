import {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

export type AdapterConstants = {
    APP_NAME: string,
    APP_NAME_DASHED: string,
};

/**
 *  Object that configures the handling of a particular content type. All attributes are optional (see examples below), and missing values will fall back to default behavior:
 *          - 'query' (used in fetchContent.ts) Guillotine query for fetching content data, may also have a function that supplies guillotine variables. So, 'query' can EITHER be only a query string, OR also add a get-guillotine-variables function. In the latter case, 'query' can be an object with 'query' and 'variables' attributes, or an array where the query string is first and the get-variables function is second. Either way, the get-variables function takes two arguments: path (content path, mandatory) and context (next.js-supplied Context from getServerSideProps etc. Optional, and requires that fetchContent is called with the context, of course).
 *          - 'props' (used in fetchContent.ts) is a function for processing props after fetching them
 *          - 'view' (used in BasePage.tsx) is a React component: top-level content-type-specific rendering with the props first fetched from guillotine (and then optionally preprocessed with the function in 'props').
 */
export interface ComponentDefinition {
    catchAll?: boolean; // will be set automatically depending on the binding
    query?: SelectedQueryMaybeVariablesFunc,
    configQuery?: string,
    processor?: DataProcessor,
    view?: React.FunctionComponent<any>
}

export interface ComponentDescriptor {
    type?: ComponentDefinition;
    component?: PageComponent;
    queryAndVariables?: QueryAndVariables;
}

export interface ComponentDictionary {
    [type: string]: ComponentDefinition;
}

// Shape of content base-data API body
export type ContentApiBaseBody = {
    query?: string,                 // Override the default base-data query
    variables?: {                   // GraphQL variables inserted into the query
        path?: string,              // Full content item _path
        [key: string]: string | number | undefined,
    }
};

/**
 * Sends one query to the guillotine API and asks for content type, then uses the type to select a second query and variables, which is sent to the API and fetches content data.
 * @param contentPath string or string array: pre-split or slash-delimited _path to a content available on the API
 * @returns FetchContentResult object: {data?: T, error?: {code, message}}
 */
export type ContentFetcher = (context: Context) => Promise<FetchContentResult>;

export type ContentResult = Result & {
    contents?: Record<string, any>[];
};

export type Context = {
    headers?: ReadonlyHeaders | Headers
    locale?: string
    contentPath: string | string[]
};

export type FetcherConfig<T extends AdapterConstants> = T & {
    componentRegistry: typeof ComponentRegistry
};

export type FetchContentResult = Result & {
    data: Record<string, any> | null,
    common: Record<string, any> | null,
    meta: MetaData,
    page: PageComponent | null,
};

// Seems like NodeJS.fetch lowercases all headers, so we need to lowercase the
// header names here.
export interface GuillotineRequestHeaders {
    Cookie?: string
    locale: string
    locales: string
    'default-locale': string
}

export type GuillotineResult = Result & {
    [dataKey: string]: any;
};

export interface MetaData {
    type: string,
    path: string,
    requestType: XP_REQUEST_TYPE,
    renderMode: RENDER_MODE,
    requestedComponent?: PageComponent,
    canRender: boolean,
    catchAll: boolean,
    apiUrl: string,
    baseUrl: string,
    locale: string,
    defaultLocale: string,
}

type MetaResult = Result & {
    meta?: {
        _path: string;
        type: string,
        pageAsJson?: PageData,
        components?: PageComponent[],
    }
};

export interface PageComponent {
    [key: string]: any; // keeps ts happy when accessing component data field by XP_COMPONENT_TYPE type
    type: XP_COMPONENT_TYPE;
    path: string;
    page?: PageData;
    part?: PartData;
    layout?: LayoutData;
    fragment?: FragmentData;
    text?: TextData;
    image?: any;
    regions?: RegionTree;
    data?: any;
    error?: any;
}

export interface PageData {
    descriptor: string;
    config?: any;
    template?: string | null;
    regions?: RegionTree;
}

export interface PageRegion {
    name: string;
    components: PageComponent[];
}

export type PathFragment = { region: string, index: number };

export type ProjectLocaleConfig = {
    default: boolean;
    project: string;
    site: string;
    locale: string;
};

export type ProjectLocalesConfig = {
    [locale: string]: ProjectLocaleConfig;
};

export interface QueryAndVariables {
    query: string;
    variables?: Record<string, any>;
}

export type QueryGetter = (path: string, context?: Context, config?: any) => string;

export interface RegionTree {
    [key: string]: PageRegion;
}

type Result = {
    error?: {
        code: string,
        message: string
    } | null;
};

export type SelectedQueryMaybeVariablesFunc =
    | string
    | QueryGetter
    | {
        query: string | QueryGetter
        variables: VariablesGetter
    }
    | [string | QueryGetter, VariablesGetter];

// TODO: also access as arguments: dataAsJson, pageAsJson, configAsJson from the first (meta) call here?
//   Another option could be to let the component or page controller pass those values to NextJS by a header
export type VariablesGetter = (path: string, context?: Context, config?: any) => VariablesGetterResult;
