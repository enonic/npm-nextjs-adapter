// Seems like NodeJS.fetch lowercases all headers, so we need to lowercase the
// header names here.
export enum GUILLOTINE_REQUEST_HEADERS {
    COOKIE = 'Cookie',
    LOCALE = 'locale',
    LOCALES = 'locales',
    DEFAULT_LOCALE = 'default-locale',
}