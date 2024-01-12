import type {PageComponent} from '../types';


import {XP_COMPONENT_TYPE} from '../constants';
import {parseComponentPath} from './parseComponentPath';


export function restrictComponentsToPath(contentType: string, components?: PageComponent[], componentPath?: string) {
    if (!componentPath || !components?.length) {
        return components || [];
    }

    // filter components to the requested one only
    const component = components.find(cmp => {
        return cmp.path === componentPath;
    });

    if (!component) {
        return [];
    }

    let result: PageComponent[] = [component];
    if (component.type !== XP_COMPONENT_TYPE.LAYOUT) {
        // remember to include all parent layouts too !
        const cmpPath = parseComponentPath(contentType, component.path);
        for (let i = cmpPath.length - 2; i >= 0; i--) {
            const parentPath = cmpPath[i];
            const parentCmp = components.find(cmp => cmp.path === `/${parentPath.region}/${parentPath.index}`);
            if (parentCmp) {
                result.unshift(parentCmp);
            }
        }
    } else {
        // It's a layout, include child components
        const childCmps = components.filter(cmp => cmp.path !== component.path && cmp.path.startsWith(component.path));
        if (childCmps.length) {
            result = result.concat(childCmps);
        }
    }
    return result;
}