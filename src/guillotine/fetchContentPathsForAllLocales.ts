import type {ContentPathItem} from '../types';

import {GET_STATIC_PATHS_QUERY} from '../common/constants';
import {getLocaleMappings} from '../utils/getLocaleMappings';
import {fetchContentPathsForLocale} from './fetchContentPathsForLocale';


export async function fetchContentPathsForAllLocales(
    path: string,
    query: string = GET_STATIC_PATHS_QUERY,
    countPerLocale = 999
): Promise<ContentPathItem[]> {
    const promises = Object.values(getLocaleMappings()).map(
        config => fetchContentPathsForLocale(
            path, config, query, countPerLocale
        )
    );
    return Promise.all(promises).then(results => {
        return results.reduce((all, localePaths) => all.concat(localePaths), []);
    });
}
