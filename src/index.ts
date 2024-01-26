export {
    APP_NAME,
    APP_NAME_DASHED,
    APP_NAME_UNDERSCORED,
    IS_DEV_MODE,
} from './common/env';

export type * from './types';

export {ComponentRegistry} from './common/ComponentRegistry';

export {
    CATCH_ALL,
    JSESSIONID_HEADER,
    PORTAL_COMPONENT_ATTRIBUTE,
    PORTAL_REGION_ATTRIBUTE,
    PROJECT_ID_HEADER,
    RENDER_MODE,
    RENDER_MODE_HEADER,
    XP_BASE_URL_HEADER,
    XP_COMPONENT_TYPE,
    XP_REQUEST_TYPE,
} from './common/constants';

export {fetchContent} from './guillotine/fetchContent';
export {fetchContentPathsForAllLocales} from './guillotine/fetchContentPathsForAllLocales';
export {fetchContentPathsForLocale} from './guillotine/fetchContentPathsForLocale';
export {fetchFromApi} from './guillotine/fetchFromApi';
export {fetchGuillotine} from './guillotine/fetchGuillotine';
export {richTextQuery} from './guillotine/metadata/richTextQuery';
export {validateData} from './guillotine/validateData';

export {I18n} from './i18n/i18n';

// NOTE: Avoid Server Error
// TypeError: (0 , react__WEBPACK_IMPORTED_MODULE_1__.createContext) is not a function
// export {LocaleContextProvider, useLocaleContext} from './i18n/LocaleContext';

export {getContentApiUrl} from './utils/getContentApiUrl';
export {getProjectLocaleConfig} from './utils/getProjectLocaleConfig';
export {getProjectLocaleConfigById} from './utils/getProjectLocaleConfigById';
export {getRequestLocaleInfo} from './utils/getRequestLocaleInfo';
export {sanitizeGraphqlName} from './utils/sanitizeGraphqlName';

export {
    UrlProcessor,
    getAsset,
    getUrl,
} from './common/UrlProcessor';
