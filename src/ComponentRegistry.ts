import type {
    ComponentDefinition,
    ComponentDictionary,
    Context,
    PageComponent,
    SelectedQueryMaybeVariablesFunc,
} from './types';


import {XP_COMPONENT_TYPE} from './utils';


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

// NB! Always return null or empty object from processor for next is unable to serialize undefined
export type DataProcessor = (data: any, context?: Context, config?: any) => Promise<Record<string, any>>;

export type VariablesGetterResult = {
    [variables: string]: any,
    path: string,
};


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
