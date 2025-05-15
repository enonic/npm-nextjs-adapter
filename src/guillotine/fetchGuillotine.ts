import type {FetchOptions, GuillotineResult, LocaleMapping} from '../types';
import gqlmin from 'gqlmin';

import {fetchFromApi} from './fetchFromApi';

const XP_ERROR_PATTERN = '/_/error/';

/** Guillotine-specialized fetch, using the generic fetch above */
export async function fetchGuillotine<Data = Record<string, unknown>>(
    contentApiUrl: string,
    mapping: LocaleMapping,
    options?: FetchOptions,
): Promise<GuillotineResult> {
    const body = options?.body;
    const path = body?.variables?.path;

    if (typeof body.query !== 'string' || !body.query.trim()) {
        return {
            error: {
                code: '400',
                message: `Invalid or missing query. JSON.stringify(query) = ${JSON.stringify(body.query)}`,
            },
        };
    } else {
        // special case for not sending XP generated error paths to guillotine
        const pathArr = path?.split(XP_ERROR_PATTERN);
        if (pathArr?.length === 2) {
            return {
                error: {
                    code: pathArr[1],
                    message: `XP error URL detected`,
                },
            }
        } else {
            // Minify the query to avoid hitting 200k space limit
            body.query = gqlmin(body.query);
        }
    }

    const pathMessage = path ? JSON.stringify(path) : '';
    return await fetchFromApi<Data>(
        contentApiUrl,
        mapping,
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
