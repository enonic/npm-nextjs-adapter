import type {Context} from './types';

import {PageComponent} from './guillotine/getMetaData';
import {XP_COMPONENT_TYPE} from './utils';


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

type SelectorName = 'contentType' | 'page' | 'component' | 'part' | 'layout' | 'macro';

function toSelectorName(type: XP_COMPONENT_TYPE): SelectorName | undefined {
    switch (type) {
    case XP_COMPONENT_TYPE.PAGE:
        return 'page';
    case XP_COMPONENT_TYPE.LAYOUT:
        return 'layout';
    case XP_COMPONENT_TYPE.PART:
        return 'part';
    }
}

interface ComponentDictionary {
    [type: string]: ComponentDefinition;
}

// NB! Always return null or empty object from processor for next is unable to serialize undefined
export type DataProcessor = (data: any, context?: Context, config?: any) => Promise<Record<string, any>>;

// TODO: also access as arguments: dataAsJson, pageAsJson, configAsJson from the first (meta) call here?
//   Another option could be to let the component or page controller pass those values to NextJS by a header
export type VariablesGetter = (path: string, context?: Context, config?: any) => VariablesGetterResult;

export type QueryGetter = (path: string, context?: Context, config?: any) => string;

export type VariablesGetterResult = {
    [variables: string]: any,
    path: string,
};

export type SelectedQueryMaybeVariablesFunc = string | QueryGetter |
    { query: string | QueryGetter, variables: VariablesGetter } |
    [string | QueryGetter, VariablesGetter];

export const CATCH_ALL = '*';

export class ComponentRegistry {

    private static contentTypes: ComponentDictionary = {};
    private static pages: ComponentDictionary = {};
    private static components: ComponentDictionary = {};
    private static parts: ComponentDictionary = {};
    private static layouts: ComponentDictionary = {};
    private static macros: ComponentDictionary = {};
    private static commonQuery: SelectedQueryMaybeVariablesFunc;

    private static getSelector(name: SelectorName): ComponentDictionary {
        switch (name) {
        case 'contentType':
            return this.contentTypes;
        case 'page':
            return this.pages;
        case 'component':
            return this.components;
        case 'layout':
            return this.layouts;
        case 'part':
            return this.parts;
        case 'macro':
            return this.macros;
        }
    }

    private static getType(selectorName: SelectorName, typeName: string, useCatchAll = true): ComponentDefinition | undefined {
        const selector = ComponentRegistry.getSelector(selectorName);
        let type = selector[typeName];
        if (type) {
            type.catchAll = false;
        } else if (!type && useCatchAll) {
            type = selector[CATCH_ALL];
            if (type) {
                type.catchAll = true;
            }
        }
        return type;
    }

    private static addType(selectorName: SelectorName, name: string, obj: ComponentDefinition): void {
        const selector = ComponentRegistry.getSelector(selectorName);
        const curr = selector[name];
        selector[name] = curr ? Object.assign(curr, obj) : obj;
    }

    public static getByComponent(component: PageComponent): ComponentDefinition | undefined {
        const selName = toSelectorName(component.type);
        const cmpData = component[component.type];
        const desc = cmpData && 'descriptor' in cmpData ? cmpData.descriptor : component.path;
        return selName && desc ? this.getType(selName, desc) : undefined;
    }

    public static setCommonQuery(query: SelectedQueryMaybeVariablesFunc): void {
        this.commonQuery = query;
    }

    public static getCommonQuery(): SelectedQueryMaybeVariablesFunc {
        return this.commonQuery;
    }

    public static addMacro(name: string, obj: ComponentDefinition): void {
        return ComponentRegistry.addType('macro', name, obj);
    }

    public static getMacro(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('macro', name);
    }

    public static getMacros(): [string, ComponentDefinition][] {
        return Object.entries(this.macros);
    }

    public static getParts(): [string, ComponentDefinition][] {
        return Object.entries(this.parts);
    }

    public static getLayouts(): [string, ComponentDefinition][] {
        return Object.entries(this.layouts);
    }

    public static getPages(): [string, ComponentDefinition][] {
        return Object.entries(this.pages);
    }

    public static getContentTypes(): [string, ComponentDefinition][] {
        return Object.entries(this.contentTypes);
    }

    public static getComponents(): [string, ComponentDefinition][] {
        return Object.entries(this.components);
    }

    public static addContentType(name: string, obj: ComponentDefinition): void {
        return ComponentRegistry.addType('contentType', name, obj);
    }

    public static getContentType(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('contentType', name);
    }

    public static addPage(name: string, obj: ComponentDefinition): void {
        return ComponentRegistry.addType('page', name, obj);
    }

    public static getPage(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('page', name);
    }

    public static addPart(name: string, obj: ComponentDefinition): void {
        return ComponentRegistry.addType('part', name, obj);
    }

    public static getPart(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('part', name);
    }

    public static addLayout(name: string, obj: ComponentDefinition): void {
        return ComponentRegistry.addType('layout', name, obj);
    }

    public static getLayout(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('layout', name);
    }

    public static addComponent(name: string, obj: ComponentDefinition): void {
        return ComponentRegistry.addType('component', name, obj);
    }

    public static getComponent(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('component', name);
    }
}
