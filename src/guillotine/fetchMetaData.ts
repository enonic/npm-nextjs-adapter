import type {ContentApiBaseBody, MetaResult, LocaleMapping, GuillotineRequestHeaders} from '../types';


import {getMetaQuery, pageFragmentQuery} from './getMetaData';
import {fetchGuillotine} from './fetchGuillotine';


export const fetchMetaData = async (
    contentApiUrl: string,
    contentPath: string,
    mapping: LocaleMapping,
    branch: string,
    headers?: GuillotineRequestHeaders
): Promise<MetaResult> => {
    const body: ContentApiBaseBody = {
        query: getMetaQuery(pageFragmentQuery()),
        variables: {
            path: contentPath,
            siteKey: mapping.site,
            project: mapping.project,
            branch
        }
    };
    const metaResult = await fetchGuillotine<MetaResult>(contentApiUrl, {
        body,
        headers
    });
    if (metaResult.error) {
        return metaResult;
    } else {
        return {
            meta: metaResult?.guillotine?.get
        };
    }
};
