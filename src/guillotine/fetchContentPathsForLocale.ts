import type {ContentApiBaseBody, ContentPathItem, GuillotineResult, LocaleMapping} from '../types';


import {GET_STATIC_PATHS_QUERY} from '../common/constants';
import {API_URL} from '../common/env';
import {getContentBranch} from '../utils/getContentBranch';
import {fetchGuillotine} from './fetchGuillotine';


export async function fetchContentPathsForLocale(
    mapping: LocaleMapping,
    query: string = GET_STATIC_PATHS_QUERY,
    count = 999
): Promise<ContentPathItem[]> {
    const contentApiUrl = API_URL;
    const body: ContentApiBaseBody = {
        query,
        variables: {
            path: mapping.site,
            pathRegex: `/content${mapping.site}/*`,
            count,
            project: mapping.project,
            siteKey: mapping.site,
            branch: getContentBranch()
        }
    };
    return fetchGuillotine<ContentPathItem[]>(contentApiUrl, {body}).then((
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
                locale: mapping.locale
            });
            return prev;
        }, []);
    });
}
