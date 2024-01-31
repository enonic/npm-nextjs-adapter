import type {
    ComponentDefinition,
    ComponentDefinitionParams,
    ComponentDictionary,
    PageComponent,
    SelectedQueryMaybeVariablesFunc,
    SelectorName,
} from '../types';


import {
    CATCH_ALL,
    XP_COMPONENT_TYPE,
} from './constants';


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


export class ComponentRegistry {

    private static contentTypes: ComponentDictionary = {};
    private static pages: ComponentDictionary = {};
    private static components: ComponentDictionary = {};
    private static parts: ComponentDictionary = {};
    private static layouts: ComponentDictionary = {};
    private static macros: ComponentDictionary = {};
    private static commonQuery: SelectedQueryMaybeVariablesFunc;

    public static addComponent(name: string, obj: ComponentDefinitionParams): void {
        return ComponentRegistry.addType('component', name, obj);
    }

    public static addContentType(name: string, obj: ComponentDefinitionParams): void {
        return ComponentRegistry.addType('contentType', name, obj);
    }

    public static addMacro(name: string, obj: ComponentDefinitionParams): void {
        return ComponentRegistry.addType('macro', name, obj);
    }

    public static addLayout(name: string, obj: ComponentDefinitionParams): void {
        return ComponentRegistry.addType('layout', name, obj);
    }

    public static addPage(name: string, obj: ComponentDefinitionParams): void {
        return ComponentRegistry.addType('page', name, obj);
    }

    public static addPart(name: string, obj: ComponentDefinitionParams): void {
        return ComponentRegistry.addType('part', name, obj);
    }

    private static addType(selectorName: SelectorName, name: string, obj: ComponentDefinitionParams): void {
        const selector = ComponentRegistry.getSelector(selectorName);
        const curr = selector[name];
        selector[name] = curr ? Object.assign(curr, obj) : obj;
    }

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
        let type: ComponentDefinition|undefined = selector[typeName];
        if (type) {
            type.catchAll = typeName === CATCH_ALL;
        } else if (!type && useCatchAll) {
            type = selector[CATCH_ALL];
            if (type) {
                type.catchAll = true;
            }
        }
        return type;
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

    public static getContentType(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('contentType', name);
    }

    public static getPage(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('page', name);
    }

    public static getPart(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('part', name);
    }

    public static getLayout(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('layout', name);
    }

    public static getComponent(name: string): ComponentDefinition | undefined {
        return ComponentRegistry.getType('component', name);
    }
}
