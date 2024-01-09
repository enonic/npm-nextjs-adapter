import type {Context, GuillotineRequestHeaders} from '../types';


import {GUILLOTINE_REQUEST_HEADERS} from '../constants';


const JSESSIONID_HEADER = 'jsessionid';


export function buildGuillotineRequestHeaders({
    context,
    defaultLocale,
    locale,
    locales,
}: {
    context: Context
    defaultLocale: string
    locale: string
    locales: string[]
}): GuillotineRequestHeaders {
    const guillotineRequestHeaders: GuillotineRequestHeaders = {
        [GUILLOTINE_REQUEST_HEADERS.DEFAULT_LOCALE]: defaultLocale,
        [GUILLOTINE_REQUEST_HEADERS.LOCALE]: locale,
        [GUILLOTINE_REQUEST_HEADERS.LOCALES]: JSON.stringify(locales),
    };
    const jsessionid = context.headers?.get(JSESSIONID_HEADER);
    if (jsessionid) {
        guillotineRequestHeaders[GUILLOTINE_REQUEST_HEADERS.COOKIE] =
            `${JSESSIONID_HEADER}=${jsessionid}`;
    }
    return guillotineRequestHeaders;
}