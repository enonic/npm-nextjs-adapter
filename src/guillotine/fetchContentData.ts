import type {ContentApiBaseBody, ContentResult, LocaleMapping} from '../types';


import {fetchGuillotine} from './fetchGuillotine';


export const fetchContentData = async <Content = Record<string, unknown>>(
    contentApiUrl: string,
    xpContentPath: string,
    mapping: LocaleMapping,
    query: string,
    variables?: {},
    headers?: {},
): Promise<ContentResult> => {
    const body: ContentApiBaseBody = {query};
    if (variables && Object.keys(variables).length > 0) {
        body.variables = variables;
    }
    const contentResults = await fetchGuillotine<ContentResult<Content>>(contentApiUrl, mapping, {
        body,
        headers,
    });

    if (contentResults.error) {
        return contentResults;
    } else {
        return {
            // omit the aliases and return values
            contents: Object.values(contentResults),
        };
    }
};
