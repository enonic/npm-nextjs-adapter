import type {PageComponent} from '../types';


import {buildPage} from './buildPage';


export function createPageData(
    contentType: string,
    components: PageComponent[],
    componentPath?: string
): PageComponent | undefined {
    let page;
    if (components && !componentPath) {
        page = buildPage(contentType, components);
    } else {
        // Don't build page for single component
        page = null;
    }
    return page as PageComponent;
}