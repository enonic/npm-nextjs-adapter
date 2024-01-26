import type {
    PageComponent,
    RegionTree,
} from '../types';


import {
    FRAGMENT_CONTENTTYPE_NAME,
    XP_COMPONENT_TYPE,
} from '../common/constants';
import {parseComponentPath} from './parseComponentPath';
import {getParentRegion} from './getParentRegion';


export function buildComponentTree(
    comps: PageComponent[],
    rootComp: PageComponent,
    contentType?: string,
): PageComponent {
    const rootTree: RegionTree = {};
    const isFragmentType = contentType === FRAGMENT_CONTENTTYPE_NAME;

    if (isFragmentType) {
        rootComp.regions = rootTree;
    }

    (comps || []).forEach(cmp => {
        const cmpPath = parseComponentPath(contentType, cmp.path);

        if (cmp.path === '/') {
            if (cmp.type === XP_COMPONENT_TYPE.PAGE && rootComp.type === XP_COMPONENT_TYPE.PAGE) {
                // add page values to page object
                rootComp = Object.assign(rootComp, cmp);
                rootComp.page.regions = rootTree;
                return;
            } else if (cmp.type === XP_COMPONENT_TYPE.LAYOUT && rootComp.type === XP_COMPONENT_TYPE.FRAGMENT) {
                // when rendering fragment as part of the page with layout at root path
                // remove other children from list as they will be included in layout
                rootComp.fragment.fragment.components = [cmp];
                cmp.regions = rootTree;
            }
        }

        if (cmp.type === XP_COMPONENT_TYPE.FRAGMENT) {
            // build component subtree for fragment
            cmp = buildComponentTree(cmp.fragment?.fragment?.components, cmp, contentType);
        }

        const region = getParentRegion(rootTree, contentType, cmpPath, comps, true);

        if (region) {
            // getting the index of component from string like '/main/0/left/11'
            const cmpIndex = cmpPath[cmpPath.length - 1]?.index;
            if (cmpIndex >= 0) {
                region.components.splice(cmpIndex, 0, cmp);
            } else {
                throw Error(`Could not find [${cmp.type}] component index at ${JSON.stringify(cmpPath, null, 2)}, rendering not possible.`);
            }
        }
    });

    return rootComp;
}