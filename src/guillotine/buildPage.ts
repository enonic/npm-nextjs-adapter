import type {PageComponent} from '../types';


import {XP_COMPONENT_TYPE} from '../utils';
import {buildComponentTree} from './buildComponentTree';


export function buildPage(contentType: string, comps: PageComponent[] = []): PageComponent {
    const page: PageComponent = {
        type: XP_COMPONENT_TYPE.PAGE,
        path: '/',
    };

    return buildComponentTree(comps, page, contentType);
}