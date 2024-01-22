import type {ContentApiBaseBody, ContentPathItem, GuillotineResult, ProjectLocaleConfig} from '../types';


import {GET_STATIC_PATHS_QUERY} from '../constants';
import {getContentApiUrl} from '../utils/getContentApiUrl';
import {fetchGuillotine} from './fetchGuillotine';


export async function fetchContentPathsForLocale(
    path: string,
    config: ProjectLocaleConfig,
    query: string = GET_STATIC_PATHS_QUERY,
    count = 999,
): Promise<ContentPathItem[]> {
    const contentApiUrl = getContentApiUrl({
        contentPath: path,
        locale: config.locale,
    });
    const body: ContentApiBaseBody = {
        query,
        variables: {
            path,
            count,
        },
    };
    return fetchGuillotine(contentApiUrl, body, config).then((
        results: GuillotineResult,
    ) => {
        return results.guillotine.queryDsl.reduce((
            prev: ContentPathItem[],
            child: any,
        ) => {
            const regexp = new RegExp(`^/${child.site ? child.site._name + '/?' : ''}`);
            const contentPath = child._path.replace(regexp, '');
            prev.push({
                contentPath: contentPath.split('/'),
                locale: config.locale,
            });
            return prev;
        }, []);
    });
}
