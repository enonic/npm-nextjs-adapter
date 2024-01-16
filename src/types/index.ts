import type {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';
import type {ParsedUrlQuery} from 'node:querystring';
import type {ReactNode} from 'react';
import {DOMNode} from 'html-react-parser';
// import type {NestedRecord} from '@enonic-types/core';
import type {
    RENDER_MODE,
    XP_COMPONENT_TYPE,
    XP_REQUEST_TYPE,
} from '../constants';


export type BaseComponentProps = {
    component: PageComponent;
    meta: MetaData;
    common?: any;                  // Content is passed down for optional consumption in componentviews.
    // TODO: Use a react contextprovider instead of "manually" passing everything down
};

export interface BaseLayoutProps {
    component?: LayoutData;
    path: string;
    regions?: RegionTree;
    common?: any;
    meta: MetaData;
}

export interface BaseMacroProps {
    data: MacroData;
    meta: MetaData;
    renderInEditMode?: boolean;
}

export interface BasePageProps {
    component?: PageData;
    path?: string;
    common?: any;
    data?: any;
    error?: string;
    meta: MetaData;
}

export interface BasePartProps {
    component?: PartData;
    path: string;
    common?: any;
    data?: any;
    error?: string;
    meta: MetaData;
}

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

export interface ContentPathItem {
    contentPath: string[]
    locale: string,
}

export type Context = {
    headers?: ReadonlyHeaders | Headers
    locale?: string
    contentPath: string | string[]
};

// NB! Always return null or empty object from processor for next is unable to serialize undefined
export type DataProcessor = (data: any, context?: Context, config?: any) => Promise<Record<string, any>>;


export type Dict = {
    [key: string]: string,
};

export type FetchContentResult = Result & {
    data: Record<string, any> | null,
    common: Record<string, any> | null,
    meta: MetaData,
    page: PageComponent | null,
};

export interface FragmentData {
    id: string;
    fragment: {
        components: PageComponent[];
    }
}

export interface FragmentProps {
    page?: PageData;
    component?: FragmentData;
    common?: any;
    meta: MetaData;
}

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

export interface ImageData {
    ref: string;
    image: {
        id: string,
    } | null,
}

export interface LayoutData {
    descriptor: string;
    config?: any;

    [customKeysFromQuery: string]: any;
}

export interface LayoutProps {
    layout: LayoutData;
    path: string;
    common: any;
    meta: MetaData;
}

export interface LinkData {
    ref: string,
    media: {
        content: {
            id: string,
        }
    } | null,
}

export type LocaleContextType = {
    dictionary: Dict,
    locale: string,
    localize: (key: string, ...args: any[]) => string,
    setLocale: (locale: string) => Promise<Dict>
};

export interface MacroConfig {
    [key: string]: any;
}

export interface MacroData {
    ref: string;
    name: string;
    descriptor: string;
    config: {
        [name: string]: MacroConfig;
    };
}

export interface MacroProps {
    name: string;
    config: MacroConfig;
    meta: MetaData;
}

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

export type MetaResult = Result & {
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

export interface PageProps {
    page: PageData;
    path: string;
    data?: any;
    common?: any; // Content is passed down to componentviews. TODO: Use a react contextprovider instead?
    meta: MetaData;
}

export interface PageRegion {
    name: string;
    components: PageComponent[];
}

export interface PartData {
    descriptor: string;
    config: any; // TODO NestedRecord?;

    [customKeysFromQuery: string]: any;
}

export interface PartProps {
    part: PartData;
    path: string;
    data?: any;
    common?: any; // Content is passed down to componentviews. TODO: Use a react contextprovider instead?
    meta: MetaData;
}

export type PathFragment = { region: string, index: number };

export interface PreviewParams {
    contentPath: string[];
    headers: Record<string, string>;
    params: Record<string, string>;
}

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

export interface RegionProps {
    name: string;
    components?: PageComponent[];
    className?: string;
    common?: any;                  // Content is passed down for optional consumption in componentviews. TODO: Use a react contextprovider instead?
    meta: MetaData;
}

export interface RegionsProps {
    page: PageData | null;
    name?: string;
    common?: any;                  // Content is passed down for optional consumption in componentviews. TODO: Use a react contextprovider instead?
    meta: MetaData;
}

export interface RegionTree {
    [key: string]: PageRegion;
}

export type Replacer = (
    domNode: DOMNode,
    data: RichTextData,
    meta: MetaData,
    renderMacroInEditMode: boolean
) => ReplacerResult;

export type ReplacerResult = JSX.Element | object | void | undefined | null | false;

type Result = {
    error?: {
        code: string,
        message: string
    } | null;
};

export interface RichTextData {
    processedHtml: string,
    links: LinkData[],
    macros: MacroData[],
    images: ImageData[],
}

export type RichTextViewProps = {
    data: RichTextData,
    meta: MetaData,
    className?: string,
    tag?: string,
    renderMacroInEditMode?: boolean,
    customReplacer?: Replacer,
};

export type SelectedQueryMaybeVariablesFunc =
    | string
    | QueryGetter
    | {
        query: string | QueryGetter
        variables: VariablesGetter
    }
    | [string | QueryGetter, VariablesGetter];

export type SelectorName = 'contentType' | 'page' | 'component' | 'part' | 'layout' | 'macro';

export interface ServerSideParams
    extends ParsedUrlQuery {
    // String array catching a sub-path assumed to match the site-relative path of an XP content.
    contentPath?: string[];
    mode?: string;
}

export interface StaticContentProps extends Record<string, any> {
    children?: ReactNode | ReactNode[];
    element?: string;
    condition: boolean;
}

export interface TextData {
    value: RichTextData;
}

// TODO: also access as arguments: dataAsJson, pageAsJson, configAsJson from the first (meta) call here?
//   Another option could be to let the component or page controller pass those values to NextJS by a header
export type VariablesGetter = (path: string, context?: Context, config?: any) => VariablesGetterResult;

export type VariablesGetterResult = {
    [variables: string]: any,
    path: string,
};
