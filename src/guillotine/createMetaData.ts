import type {
    MetaData,
    PageComponent,
} from '../types';


import {RENDER_MODE, XP_REQUEST_TYPE} from '../constants';
import {ComponentRegistry} from '../ComponentRegistry';


export function createMetaData(contentType: string, contentPath: string,
    requestType: XP_REQUEST_TYPE, renderMode: RENDER_MODE,
    apiUrl: string, baseUrl: string,
    locale: string, defaultLocale: string,
    requestedComponentPath: string | undefined,
    pageCmp ? : PageComponent, components: PageComponent[] = []): MetaData {
    // .meta will be visible in final rendered inline props.
    // Only adding some .meta attributes here on certain conditions
    // (instead of always adding them and letting them be visible as false/undefined etc)
    const meta: MetaData = {
        type: contentType,
        path: contentPath,
        requestType: requestType,
        renderMode: renderMode,
        canRender: false,
        catchAll: false, // catchAll only refers to content type catch-all
        apiUrl,
        baseUrl,
        locale,
        defaultLocale,
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