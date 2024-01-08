import type {Context, RequestHeaders} from '../types';


import {REQUEST_HEADERS} from '../constants';


const JSESSIONID_HEADER = 'jsessionid';


export function setJsessionCookieHeader(
    requestHeaders: RequestHeaders,
    context: Context
): void {
    const jsessionid = context.headers?.get(JSESSIONID_HEADER);
    if (jsessionid) {
        // NOTE: Yes overwriting is intended.
        requestHeaders[REQUEST_HEADERS.COOKIE] =
            `${JSESSIONID_HEADER}=${jsessionid}`;
    }
}