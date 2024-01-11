import type {PathFragment} from '../types';


import {
    FRAGMENT_CONTENTTYPE_NAME,
    FRAGMENT_DEFAULT_REGION_NAME,
} from '../utils';


export function parseComponentPath(contentType: string, path: string): PathFragment[] {
    const matches: PathFragment[] = [];
    let match;
    const myRegexp = /(?:(\w+)\/(\d+))+/g;
    while ((match = myRegexp.exec(path)) !== null) {
        matches.push({
            region: match[1],
            index: +match[2],
        });
    }
    if (contentType === FRAGMENT_CONTENTTYPE_NAME) {
        // there is no main region in fragment content and the root component has '/' path
        // prepend FRAGMENT_DEFAULT_REGION_NAME to path to conform to page structure
        matches.unshift({
            region: FRAGMENT_DEFAULT_REGION_NAME,
            index: 0,
        });
    }
    return matches;
}