import type {
    ContentApiBaseBody,
    GuillotineResponse,
    GuillotineResponseJson,
    ProjectLocaleConfig,
} from '../types';


// import {stringify} from 'q-i';


/** Generic fetch */
export const fetchFromApi = async <Data = Record<string,unknown>>(
    apiUrl: string,
    body: ContentApiBaseBody,
    projectConfig: ProjectLocaleConfig,
    headers?: {},
    method = 'POST',
) => {
    const options = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Guillotine-SiteKey': projectConfig.site,
        },
        body: JSON.stringify(body),
    };

    if (headers) {
        Object.assign(options.headers, headers);
    }

    // console.debug('fetchFromApi: apiUrl = ', apiUrl, ', options = ', stringify(options, {maxItems: Infinity}));

    let res: GuillotineResponse<Data>;
    try {
        res = await fetch(apiUrl, options);
    } catch (e: any) {
        console.warn(apiUrl, e);
        throw new Error(JSON.stringify({
            code: 'API',
            message: e.message,
        }));
    }
    // console.debug('fetchFromApi: res = ', stringify(res, {maxItems: Infinity}));

    if (!res.ok) {
        throw new Error(JSON.stringify({
            code: res.status,
            message: `Data fetching failed (message: '${await res.text()}')`,
        }));
    }

    let json: GuillotineResponseJson<Data>;
    try {
        json = await res.json();
        // console.debug('fetchFromApi: ', stringify({apiUrl, options, json}, {maxItems: Infinity}));
    } catch (e) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with non-JSON data: ${JSON.stringify(await res.text())}`,
        }));
    }

    if (!json) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with unexpectedly empty data: ${JSON.stringify(await res.text())}`,
        }));
    }

    if (Array.isArray(json)) {
        throw new Error(JSON.stringify({
            code: 500,
            message: `API call completed but with unexpected array data: ${JSON.stringify(json)}`,
        }));
    }

    return json;
};