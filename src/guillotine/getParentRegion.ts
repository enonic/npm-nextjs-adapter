import type {PageComponent, PageRegion, PathFragment, RegionTree} from '../types';


import {XP_COMPONENT_TYPE} from '../common/constants';
import {prefixFragmentCmpPath} from './prefixFragmentCmpPath';


export function getParentRegion(
    source: RegionTree,
    contentType: string,
    cmpPath: PathFragment[],
    components: PageComponent[] = [],
    createMissing ? : boolean,
): PageRegion | undefined {
    let currentTree: RegionTree = source;
    let currentRegion: PageRegion | undefined;
    let parentPath = '';

    for (let i = 0; i < cmpPath.length; i++) {
        const pathFragment = cmpPath[i];
        const regionName = pathFragment.region;
        parentPath += `/${pathFragment.region}/${pathFragment.index}`;
        currentRegion = currentTree[regionName];

        if (!currentRegion) {
            if (createMissing) {
                currentRegion = {
                    name: regionName,
                    components: [],
                };
                currentTree[regionName] = currentRegion;
            } else {
                throw `Region [${regionName}] was not found`;
            }
        }

        if (i < cmpPath.length - 1) {
            // look for layouts inside if this is not the last path fragment

            const layout = components.find((cmp: PageComponent) => {
                return cmp.type === XP_COMPONENT_TYPE.LAYOUT && prefixFragmentCmpPath(contentType, cmp.path) === parentPath;
            });
            if (!layout) {
                throw `Layout [${parentPath}] not found among components, but needed for component [${JSON.stringify(cmpPath, null, 2)}]`;
            }
            if (!layout.regions) {
                layout.regions = {};
            }
            currentTree = layout.regions;
        }
    } // for

    return currentRegion;
}
