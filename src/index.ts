import {
    PORTAL_COMPONENT_ATTRIBUTE,
    PORTAL_REGION_ATTRIBUTE,
} from './constants';
import {
    APP_NAME,
    APP_NAME_DASHED,
    APP_NAME_UNDERSCORED,
    API_URL,
} from './env';


export type * from './types'; // NOTE: tsc doesn't copy d.ts files to dist


export {ComponentRegistry} from './ComponentRegistry';

export {
    JSESSIONID_HEADER,
    PORTAL_COMPONENT_ATTRIBUTE,
    PROJECT_ID_HEADER,
    RENDER_MODE,
    RENDER_MODE_HEADER,
    XP_BASE_URL_HEADER,
    XP_COMPONENT_TYPE,
    XP_REQUEST_TYPE,
} from './constants';

export {
    APP_NAME,
    IS_DEV_MODE,
} from './env';

export {fetchContent} from './guillotine/fetchContent';
export {fetchContentPathsForAllLocales} from './guillotine/fetchContentPathsForAllLocales';
export {fetchContentPathsForLocale} from './guillotine/fetchContentPathsForLocale';
export {fetchFromApi} from './guillotine/fetchFromApi';
export {fetchGuillotine} from './guillotine/fetchGuillotine';
export {richTextQuery} from './guillotine/metadata/richTextQuery';
export {validateData} from './guillotine/validateData';

export {I18n} from './i18n/i18n';
export {LocaleContextProvider} from './i18n/LocaleContext';

export {getContentApiUrl} from './utils/getContentApiUrl';
export {getProjectLocaleConfig} from './utils/getProjectLocaleConfig';
export {getProjectLocaleConfigById} from './utils/getProjectLocaleConfigById';
export {getRequestLocaleInfo} from './utils/getRequestLocaleInfo';
export {sanitizeGraphqlName} from './utils/sanitizeGraphqlName';

export {
    UrlProcessor,
    getAsset,
    getUrl,
} from './UrlProcessor';


const adapterConstants = {
    APP_NAME,
    APP_NAME_DASHED,
    APP_NAME_UNDERSCORED,
    API_URL,
    PORTAL_COMPONENT_ATTRIBUTE,
    PORTAL_REGION_ATTRIBUTE,
};

// Verify required values
Object.keys(adapterConstants).forEach(key => {
    if (!adapterConstants[key]) {
        throw Error(`Config value '${key}' is missing (from .env?)`);
    }
});