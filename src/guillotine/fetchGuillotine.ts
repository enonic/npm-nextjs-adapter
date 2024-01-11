import type {
    ContentApiBaseBody,
    GuillotineResult,
    ProjectLocaleConfig,
} from '../types';


import {fetchFromApi} from './fetchFromApi';


/** Guillotine-specialized fetch, using the generic fetch above */
export const fetchGuillotine = async (
    contentApiUrl: string,
    body: ContentApiBaseBody,
    projectConfig: ProjectLocaleConfig,
    headers?: {}): Promise<GuillotineResult> => {
    if (typeof body.query !== 'string' || !body.query.trim()) {
        return {
            error: {
                code: '400',
                message: `Invalid or missing query. JSON.stringify(query) = ${JSON.stringify(body.query)}`,
            },
        };
    }
    const path = body.variables?.path;
    const pathMessage = path ? JSON.stringify(path) : '';
    const result: GuillotineResult = await fetchFromApi(
        contentApiUrl,
        body,
        projectConfig,
        headers,
    )
        .then(json => {
            let errors: any[] = (json || {}).errors;

            if (errors) {
                if (!Array.isArray(errors)) {
                    errors = [errors];
                }
                console.error(`${errors.length} error(s) when fetching data from: ${contentApiUrl}`);
                console.error(`headers: ${JSON.stringify(headers, null, 2)} \nvariables: ${JSON.stringify(body.variables, null, 2)}`);
                errors.forEach(error => {
                    console.error(error);
                });

                return {
                    error: {
                        code: '500',
                        message: `Server responded with ${errors.length} error(s), probably from guillotine - see log.`,
                    },
                };
            }

            return json.data;
        })
        .catch((err) => {
            console.warn(`Client-side error when trying to fetch data ${pathMessage}`, err);
            try {
                return {error: JSON.parse(err.message)};
            } catch (e2) {
                return {error: {code: 'Client-side error', message: err.message}};
            }
        });

    return result;
};