import type {
    FetchContentResult,
} from '../types';


import {
    RENDER_MODE,
    XP_REQUEST_TYPE,
} from '../constants';


export function buildErrorResponse(requestType: XP_REQUEST_TYPE, renderMode: RENDER_MODE,
    apiUrl: string, baseUrl: string, locale: string, defaultLocale: string,
    contentPath ? : string): (code ? : string, message ? : string) => FetchContentResult {

    return function (code = '500', message = 'Unknown error') {
        return {
            error: {
                code,
                message,
            },
            page: null,
            common: null,
            data: null,
            meta: {
                type: '',
                requestType: requestType,
                renderMode: renderMode,
                path: contentPath || '',
                canRender: false,
                catchAll: false,
                apiUrl,
                baseUrl,
                locale,
                defaultLocale,
            },
        };
    };
}