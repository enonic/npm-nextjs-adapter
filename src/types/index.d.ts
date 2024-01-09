import {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';


export type Context = {
    headers?: ReadonlyHeaders | Headers
    locale?: string
    contentPath: string | string[]
};

// Seems like NodeJS.fetch lowercases all headers, so we need to lowercase the
// header names here.
export interface GuillotineRequestHeaders {
    Cookie?: string
    locale: string
    locales: string
    'default-locale': string
}