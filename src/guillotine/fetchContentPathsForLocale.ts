import type {ContentApiBaseBody, ContentPathItem, GuillotineResult, LocaleMapping} from '../types';


import {GET_STATIC_PATHS_QUERY} from '../common/constants';
import {getContentApiUrl} from '../utils/getContentApiUrl';
import {fetchGuillotine} from './fetchGuillotine';


export async function fetchContentPathsForLocale(
    path: string,
    config: LocaleMapping,
    query: string = GET_STATIC_PATHS_QUERY,
    count = 999
): Promise<ContentPathItem[]> {
    const decodedPath = decodeURIComponent(path);
    const contentApiUrl = getContentApiUrl({
        contentPath: decodedPath,
        locale: config.locale
    });
    const body: ContentApiBaseBody = {
        query,
        variables: {
            path: decodedPath,
            pathRegex: `/content${config.site}/*`,
            count
        }
    };
    return fetchGuillotine<ContentPathItem[]>(contentApiUrl, config, {body}).then((
        results: GuillotineResult
    ) => {
        return results.guillotine.queryDsl.reduce((
            prev: ContentPathItem[],
            child: any
        ) => {
            const regexp = new RegExp(`^/${child.site?._name ? `${child.site._name}/?` : ''}`);
            const contentPath = child._path.replace(regexp, '');
            prev.push({
                contentPath: contentPath.split('/'),
                locale: config.locale
            });
            return prev;
        }, []);
    });
}
