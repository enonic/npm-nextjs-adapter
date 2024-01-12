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


export type {
    ComponentDefinition,
    ContentFetcher,
    Context,
    FetchContentResult,
    GuillotineResult,
    MetaData,
    PageComponent,
    PageData,
    PageRegion,
    PartData,
    QueryGetter,
    RegionTree,
    SelectedQueryMaybeVariablesFunc,
    VariablesGetter,
    VariablesGetterResult,
} from './types'; // tsc doesn't copy d.ts files to dist


export {ComponentRegistry} from './ComponentRegistry';
export {
    PORTAL_COMPONENT_ATTRIBUTE,
    RENDER_MODE,
    XP_BASE_URL_HEADER,
} from './constants';
export {
    APP_NAME,
    IS_DEV_MODE,
} from './env';
export {fetchContent} from './guillotine/fetchContent';
export {fetchContentPathsForAllLocales} from './guillotine/fetchContentPathsForAllLocales';
export {fetchFromApi} from './guillotine/fetchFromApi';
export {fetchGuillotine} from './guillotine/fetchGuillotine';
export {richTextQuery} from './guillotine/metadata/richTextQuery';
export {validateData} from './guillotine/validateData';
export {getRequestLocaleInfo} from './utils/getRequestLocaleInfo';
export {sanitizeGraphqlName} from './utils/sanitizeGraphqlName';
export {
    UrlProcessor,
    getAsset,
    getUrl,
} from './UrlProcessor';
export {I18n} from './i18n/i18n';
export {LocaleContextProvider} from './i18n/LocaleContext';


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