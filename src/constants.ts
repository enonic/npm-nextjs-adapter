// Seems like NodeJS.fetch lowercases all headers, so we need to lowercase the
// header names here.
export enum GUILLOTINE_REQUEST_HEADERS {
    COOKIE = 'Cookie',
    LOCALE = 'locale',
    LOCALES = 'locales',
    DEFAULT_LOCALE = 'default-locale',
}

// URI parameter marking that a request is for a preview for CS. MUST MATCH THE VALUE OF 'FROM_XP_PARAM' on XP side.
export const XP_BASE_URL_HEADER = 'xpbaseurl';