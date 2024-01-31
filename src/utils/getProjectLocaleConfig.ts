import type {Context, ProjectLocaleConfig} from '../types';


import {PROJECT_ID_HEADER} from '../common/constants';
import {getProjectLocaleConfigById} from './getProjectLocaleConfigById';
import {getProjectLocaleConfigByLocale} from './getProjectLocaleConfigByLocale';


export function getProjectLocaleConfig(context: Context): ProjectLocaleConfig {
    const projectId = context.headers?.get(PROJECT_ID_HEADER);

    let config: ProjectLocaleConfig;
    if (projectId) {
        // first use project id header
        config = getProjectLocaleConfigById(projectId, false);
    }
    if (!config) {
        // next try to use locale from url
        // it will fall back to default locale if not found
        config = getProjectLocaleConfigByLocale(context.locale);
    }

    return config;
}