import type {Context, LocaleMapping} from '../types';


import {PROJECT_ID_HEADER} from '../common/constants';
import {getLocaleMappingByProjectId} from './getLocaleMappingByProjectId';
import {getLocaleMappingByLocale} from './getLocaleMappingByLocale';


export function getLocaleMapping(context: Context): LocaleMapping {
    const projectId = context.headers?.get(PROJECT_ID_HEADER);

    let config: LocaleMapping;
    if (projectId) {
        // first use project id header
        config = getLocaleMappingByProjectId(projectId, false);
    }
    if (!config) {
        // next try to use locale from url
        // it will fall back to default locale if not found
        config = getLocaleMappingByLocale(context.locale);
    }

    return config;
}
