import type {FetchOptions, GuillotineResult, ProjectLocaleConfig} from '../types';


import {fetchFromApi} from './fetchFromApi';


/** Guillotine-specialized fetch, using the generic fetch above */
export async function fetchGuillotine<Data = Record<string, unknown>>(
    contentApiUrl: string,
    projectConfig: ProjectLocaleConfig,
    options?: FetchOptions,
): Promise<GuillotineResult> {
    const body = options?.body;
    if (typeof body.query !== 'string' || !body.query.trim()) {
        return {
            error: {
                code: '400',
                message: `Invalid or missing query. JSON.stringify(query) = ${JSON.stringify(body.query)}`,
            },
        };
    }

    const path = body?.variables?.path;
    const pathMessage = path ? JSON.stringify(path) : '';
    return await fetchFromApi<Data>(
        contentApiUrl,
        projectConfig,
        options,
    )
        .then(json => {
            let errors: any[] = json.errors; // fetchFromApi ensures json is an object

            if (errors) {
                if (!Array.isArray(errors)) {
                    errors = [errors];
                }
                console.error(`${errors.length} error(s) when fetching data from: ${contentApiUrl}`);
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
}
