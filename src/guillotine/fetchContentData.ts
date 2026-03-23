import type {ContentApiBaseBody, ContentApiBaseBodyVariables, ContentResult, LocaleMapping, GuillotineRequestHeaders} from '../types';

import {fetchGuillotine} from './fetchGuillotine';


export const fetchContentData = async <Content = Record<string, unknown>>(
    contentApiUrl: string,
    contentPath: string,
    mapping: LocaleMapping,
    branch: string,
    query: string,
    variables?: ContentApiBaseBodyVariables,
    headers?: GuillotineRequestHeaders
): Promise<ContentResult> => {
    const body: ContentApiBaseBody = {
        query,
        variables: {
            path: contentPath,
            siteKey: mapping.site,
            project: mapping.project,
            branch
        }
    };
    if (variables && Object.keys(variables).length > 0) {
        body.variables = Object.assign(body.variables, variables);
    }
    const contentResults = await fetchGuillotine<ContentResult<Content>>(contentApiUrl, {
        body,
        headers
    });

    if (contentResults.error) {
        return contentResults;
    } else {
        return {
            // omit the aliases and return values
            contents: Object.values(contentResults)
        };
    }
};
