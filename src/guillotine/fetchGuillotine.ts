import type {
    ContentApiBaseBody,
    GuillotineResult,
    ProjectLocaleConfig,
} from '../types';


// const {stringify} = require('q-i');
import {fetchFromApi} from './fetchFromApi';


/** Guillotine-specialized fetch, using the generic fetch above */
export const fetchGuillotine = async <Data = Record<string,unknown>>(
    contentApiUrl: string,
    body: ContentApiBaseBody,
    projectConfig: ProjectLocaleConfig,
    headers?: {},
    returnType?: 'MetaResult' | 'ContentResult' | 'ContentPathItem[]',
): Promise<GuillotineResult> => {
    // console.debug('fetchGuillotine', stringify({contentApiUrl, body, projectConfig, headers}, { maxItems: Infinity }));
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
    const result: GuillotineResult = await fetchFromApi<Data>(
        contentApiUrl,
        body,
        projectConfig,
        headers,
    )
        .then(json => {
            // console.debug(`fetchGuillotine─<${returnType}>────────────────────────────────────────────────────────────────`);
            // console.debug(body.query);
            // console.debug(stringify({contentApiUrl, body: {...body, query: undefined}, projectConfig, headers, json}, {maxItems: Infinity}));
            // console.debug(`─────────────────────────────────────────────────────────────────fetchGuillotine─<${returnType}>`);
            // print(json, { maxItems: Infinity })
            let errors: any[] = json.errors; // fetchFromApi ensures json is an object

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
            // console.debug(`fetchGuillotine─<${returnType}>────────────────────────────────────────────────────────────────`);
            console.warn(`Client-side error when trying to fetch data ${pathMessage}`, err);
            // console.debug(`─────────────────────────────────────────────────────────────────fetchGuillotine─<${returnType}>`);
            try {
                return {error: JSON.parse(err.message)};
            } catch (e2) {
                return {error: {code: 'Client-side error', message: err.message}};
            }
        });

    return result;
};