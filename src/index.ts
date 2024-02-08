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


export {richTextQuery} from './guillotine/metadata/richTextQuery';
export {validateData} from './guillotine/validateData';

export {I18n} from './i18n/i18n';

export {getContentApiUrl} from './utils/getContentApiUrl';
export {getProjectLocaleConfig} from './utils/getProjectLocaleConfig';
export {getProjectLocaleConfigById} from './utils/getProjectLocaleConfigById';
export {getProjectLocaleConfigByLocale} from './utils/getProjectLocaleConfigByLocale';
export {getRequestLocaleInfo} from './utils/getRequestLocaleInfo';
export {sanitizeGraphqlName} from './utils/sanitizeGraphqlName';

export {
    UrlProcessor,
    getAsset,
    getUrl,
} from './common/UrlProcessor';
