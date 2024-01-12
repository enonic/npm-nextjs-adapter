import type {
    ComponentDescriptor,
    ContentFetcher,
    Context,
    FetchContentResult,
} from '../types';


import {headers} from 'next/headers';
import {ComponentRegistry} from '../ComponentRegistry';
import {UrlProcessor} from '../UrlProcessor';
import {
    APP_NAME,
    APP_NAME_DASHED,
    FRAGMENT_CONTENTTYPE_NAME,
    getContentApiUrl,
    getProjectLocaleConfig,
    getRenderMode,
    getRequestLocaleInfo,
    IS_DEV_MODE,
    PAGE_TEMPLATE_CONTENTTYPE_NAME,
    PAGE_TEMPLATE_FOLDER,
    RENDER_MODE,
    XP_COMPONENT_TYPE,
    XP_REQUEST_TYPE,
} from '../utils';
import {getXpBaseUrl} from '../utils/getXpBaseUrl';
import {buildGuillotineRequestHeaders} from '../utils/buildGuillotineRequestHeaders';

import {fetchMetaData} from './fetchMetaData';
import {getCleanContentPathArrayOrThrow400} from './getCleanContentPathArrayOrThrow400';
import {buildErrorResponse} from './buildErrorResponse';
import {getContentAndComponentPaths} from './getContentAndComponentPaths';
import {restrictComponentsToPath} from './restrictComponentsToPath';
import {processComponentConfig} from './processComponentConfig';
import {getQueryAndVariables} from './getQueryAndVariables';
import {collectComponentDescriptors} from './collectComponentDescriptors';
import {combineMultipleQueries} from './combineMultipleQueries';
import {fetchContentData} from './fetchContentData';
import {applyProcessors} from './applyProcessors';
import {createPageData} from './createPageData';
import {createMetaData} from './createMetaData';


/**
 * Configures, builds and returns a general fetchContent function.
 * @param config object containing ComponentRegistry as well as constants imported from enonic-connecion-config.js
 * @returns ContentFetcher
 */
export const buildContentFetcher = ({
    componentRegistry,
}: {
    componentRegistry: typeof ComponentRegistry
}): ContentFetcher => {

    return async (context: Context): Promise<FetchContentResult> => {

        const {locale, locales, defaultLocale} = getRequestLocaleInfo(context);

        // ideally we only want to set headers in draft mode,
        // but draft mode token is not passed in non-static mode
        // so try to add them whenever they are absent
        if (!context.headers) {
            const allHeaders = headers();

            context.headers = new Headers();
            allHeaders.forEach((value, key) => {
                context.headers.set(key, value);
            });
        }

        const outHeaders = buildGuillotineRequestHeaders({
            context,
            defaultLocale,
            locale,
            locales,
        });
        const xpBaseUrl = getXpBaseUrl(context);
        const contentApiUrl = getContentApiUrl(context);
        const projectConfig = getProjectLocaleConfig(context);
        const renderMode = getRenderMode(context);
        let requestType = XP_REQUEST_TYPE.TYPE;
        const requestContentPath = getCleanContentPathArrayOrThrow400(context.contentPath);
        const errorResponse = buildErrorResponse(requestType, renderMode, contentApiUrl, xpBaseUrl, locale, defaultLocale, requestContentPath);

        UrlProcessor.setSiteKey(projectConfig.site);

        try {
            const [siteRelativeContentPath, componentPath] = getContentAndComponentPaths(requestContentPath);
            if (componentPath) {
                // set component request type because url contains component path
                requestType = XP_REQUEST_TYPE.COMPONENT;
            }

            // /////////////  FIRST GUILLOTINE CALL FOR METADATA     /////////////////
            const metaResult = await fetchMetaData(contentApiUrl, '${site}/' + siteRelativeContentPath, projectConfig, outHeaders);
            // ///////////////////////////////////////////////////////////////////////

            const {_path, type} = metaResult.meta || {};
            const contentPath = _path || siteRelativeContentPath;

            if (metaResult.error) {
                console.error(metaResult.error);
                return errorResponse(metaResult.error.code, metaResult.error.message);
            }

            if (!metaResult.meta) {
                return errorResponse('404', 'No meta data found for content, most likely content does not exist');
            } else if (!type) {
                return errorResponse('500', "Server responded with incomplete meta data: missing content 'type' attribute.");

            } else if (renderMode === RENDER_MODE.NEXT && !IS_DEV_MODE &&
                (type === FRAGMENT_CONTENTTYPE_NAME ||
                    type === PAGE_TEMPLATE_CONTENTTYPE_NAME ||
                    type === PAGE_TEMPLATE_FOLDER)) {
                return errorResponse('404', `Content type [${type}] is not accessible in ${renderMode} mode`);
            }

            const components = restrictComponentsToPath(type, metaResult.meta.components, componentPath);
            if (componentPath && !components.length) {
                // component was not found
                return errorResponse('404', `Component ${componentPath} was not found`);
            }

            if (requestType !== XP_REQUEST_TYPE.COMPONENT && components.length > 0) {
                requestType = XP_REQUEST_TYPE.PAGE;
            }

            // //////////////////////////////////////////////////  Content type established. Proceed to data call:

            const allDescriptors: ComponentDescriptor[] = [];

            // Add the content type query at all cases
            const contentTypeDef = componentRegistry?.getContentType(type);
            const pageCmp = (components || []).find(cmp => cmp.type === XP_COMPONENT_TYPE.PAGE);
            if (pageCmp) {
                processComponentConfig(APP_NAME, APP_NAME_DASHED, pageCmp);
            }

            const contentQueryAndVars = getQueryAndVariables(type, contentPath, context, contentTypeDef?.query, pageCmp?.page?.config);
            if (contentQueryAndVars) {
                allDescriptors.push({
                    type: contentTypeDef,
                    queryAndVariables: contentQueryAndVars,
                });
            }

            const commonQueryAndVars = getQueryAndVariables(type, contentPath, context, componentRegistry.getCommonQuery(),
                pageCmp?.page?.config);
            if (commonQueryAndVars) {
                allDescriptors.push({
                    type: contentTypeDef,
                    queryAndVariables: commonQueryAndVars,
                });
            }

            if (components?.length && componentRegistry) {
                for (const cmp of (components || [])) {
                    processComponentConfig(APP_NAME, APP_NAME_DASHED, cmp);
                }
                // Collect component queries if defined
                const componentDescriptors = collectComponentDescriptors(components, componentRegistry, contentPath, context);
                if (componentDescriptors.length) {
                    allDescriptors.push(...componentDescriptors);
                }
            }

            const {query, variables} = combineMultipleQueries(allDescriptors);

            if (!query.trim()) {
                return errorResponse('400', `Missing or empty query override for content type ${type}`);
            }

            // ///////////////    SECOND GUILLOTINE CALL FOR DATA   //////////////////////
            const contentResults = await fetchContentData(contentApiUrl, contentPath, projectConfig, query, variables, outHeaders);
            // ///////////////////////////////////////////////////////////////////////////

            if (contentResults.error) {
                console.error(contentResults.error);
                return errorResponse(contentResults.error.code, contentResults.error.message);
            }

            // Apply processors to every component
            const datas = await applyProcessors(allDescriptors, contentResults, context);

            //  Unwind the data back to components

            let contentData = null, common = null;
            let startFrom = 0;
            if (contentQueryAndVars) {
                const item = datas[startFrom];
                contentData = item.status === 'fulfilled' ? item.value : item.reason;
                startFrom++;
            }
            if (commonQueryAndVars) {
                const item = datas[startFrom];
                common = item.status === 'fulfilled' ? item.value : item.reason;
                startFrom++;
            }

            for (let i = startFrom; i < datas.length; i++) {
                // component descriptors hold references to components
                // that will later be used for creating page regions
                const datum = datas[i];
                if (datum.status === 'rejected') {
                    let reason = datum.reason;
                    if (reason instanceof Error) {
                        reason = reason.message;
                    } else if (typeof reason !== 'string') {
                        reason = String(reason);
                    }
                    allDescriptors[i].component.error = reason;
                } else {
                    allDescriptors[i].component.data = datum.value;
                }
            }

            const page = createPageData(type, components);
            const meta = createMetaData(type, siteRelativeContentPath, requestType, renderMode, contentApiUrl, xpBaseUrl, locale, defaultLocale, componentPath, page, components);

            return {
                data: contentData,
                common,
                meta,
                page,
            };
        } catch (e: any) {
            console.error(e);

            let error;
            try {
                error = JSON.parse(e.message);
            } catch (e2) {
                error = {
                    code: 'Local',
                    message: e.message,
                };
            }
            return errorResponse(error.code, error.message);
        }
    };
};