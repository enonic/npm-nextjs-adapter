import type {
    ComponentDefinition,
    MetaData,
    PageComponent,
} from '../types';


import {RENDER_MODE, XP_REQUEST_TYPE} from '../common/constants';
import {ComponentRegistry} from '../common/ComponentRegistry';


export function createMetaData({
    apiUrl,
    baseUrl,
    components = [], // Optional NOTE: Doesn't handle null
    contentPath,
    contentType,
    defaultLocale,
    locale,
    pageCmp, // Optional
    renderMode,
    requestedComponentPath,
    requestType,
}: {
    apiUrl: string
    baseUrl: string
    components?: PageComponent[]
    contentPath: string
    contentType: string
    defaultLocale: string
    locale: string
    pageCmp?: PageComponent
    renderMode: RENDER_MODE
    requestedComponentPath: string | undefined
    requestType: XP_REQUEST_TYPE
}): MetaData {
    // .meta will be visible in final rendered inline props.
    // Only adding some .meta attributes here on certain conditions
    // (instead of always adding them and letting them be visible as false/undefined etc)
    const meta: MetaData = {
        apiUrl,
        baseUrl,
        canRender: false,
        catchAll: false, // catchAll only refers to content type catch-all
        defaultLocale,
        locale,
        path: contentPath,
        renderMode: renderMode,
        requestType: requestType,
        type: contentType,
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