import type {ContentApiBaseBody, ContentPathItem, GuillotineResult, LocaleMapping} from '../types';


import {GET_STATIC_PATHS_QUERY} from '../common/constants';
import {getContentApiUrl} from '../utils/getContentApiUrl';
import {fetchGuillotine} from './fetchGuillotine';


export async function fetchContentPathsForLocale(
    path: string,
    config: LocaleMapping,
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
    return fetchGuillotine<ContentPathItem[]>(contentApiUrl, config, {body}).then((
        results: GuillotineResult,
    ) => {
        return results.guillotine.queryDsl.reduce((
            prev: ContentPathItem[],
            child: any,
        ) => {
            const regexp = new RegExp(`^/${child.site?._name ? `${child.site._name}/?` : ''}`);
            const contentPath = child._path.replace(regexp, '');
            prev.push({
                contentPath: contentPath.split('/'),
                locale: config.locale,
            });
            return prev;
        }, []);
    });
}
