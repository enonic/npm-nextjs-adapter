import type {PageComponent} from '../types';


export function getComponentConfig(cmp?: PageComponent) {
    const cmpData = cmp && cmp[cmp.type];
    return cmpData && 'config' in cmpData ? cmpData.config : undefined;
}