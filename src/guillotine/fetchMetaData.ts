import type {
    ContentApiBaseBody,
    MetaResult,
    ProjectLocaleConfig,
} from '../types';


import {getMetaQuery, pageFragmentQuery} from './getMetaData';
import {fetchGuillotine} from './fetchGuillotine';


export const fetchMetaData = async (
    contentApiUrl: string,
    xpContentPath: string,
    projectConfig: ProjectLocaleConfig,
    headers?: {},
): Promise<MetaResult> => {
    const body: ContentApiBaseBody = {
        query: getMetaQuery(pageFragmentQuery()),
        variables: {
            path: xpContentPath,
        },
    };
    const metaResult = await fetchGuillotine<MetaResult>(contentApiUrl, body, projectConfig, headers);
    if (metaResult.error) {
        return metaResult;
    } else {
        return {
            meta: metaResult?.guillotine?.get,
        };
    }
};