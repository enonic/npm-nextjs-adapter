import type {XP_COMPONENT_TYPE} from '../common/constants';
import type {Context} from './next';
import type {
    RichTextData as CompsRichTextData,
    LinkData as CompsLinkData,
    ImageData as CompsImageData,
    MacroData as CompsMacroData
} from '@enonic/react-components';

// Differs from ComponentDefinition to avoid storing catchAll on all components
// catchAll is calculated in getType instead
export interface ComponentDefinitionParams {
    query?: SelectedQueryMaybeVariablesFunc
    configQuery?: string
    processor?: DataProcessor
    view?: React.FunctionComponent<any>
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

export type ComponentDictionary = Record<string, ComponentDefinitionParams>;

// NB! Always return null or empty object from processor for next is unable to serialize undefined
export type DataProcessor = (data: any, context?: Context, config?: any) => Promise<Record<string, any>>;

export interface FragmentData {
    id: string;
    fragment: {
        components: PageComponent[];
    }
}

export type ImageData = CompsImageData;

export interface LayoutData {
    descriptor: string;
    config?: any;

    [customKeysFromQuery: string]: any;
}

export type LinkData = CompsLinkData;

export type MacroConfig = Record<string, any>;

export type MacroData = CompsMacroData;

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

export interface PartData {
    descriptor: string;
    config: any; // TODO NestedRecord?;

    [customKeysFromQuery: string]: any;
}

export interface QueryAndVariables {
    query: string
    variables?: Record<string, any>
}

export type QueryGetter = (path: string, context?: Context, config?: any) => string;

export type SelectedQueryMaybeVariablesFunc =
    | string
    | QueryGetter
    | {
    query: string | QueryGetter
    variables: VariablesGetter
}
    | [string | QueryGetter, VariablesGetter];

export type RegionTree = Record<string, PageRegion>;

export type RichTextData = CompsRichTextData;

export interface TextData {
    value: RichTextData;
}

// TODO: also access as arguments: dataAsJson, pageAsJson, configAsJson from the first (meta) call here?
//   Another option could be to let the component or page controller pass those values to NextJS by a header
export type VariablesGetter = (path: string, context?: Context, config?: any) => VariablesGetterResult;

export interface VariablesGetterResult {
    [variables: string]: any
    path: string
}
