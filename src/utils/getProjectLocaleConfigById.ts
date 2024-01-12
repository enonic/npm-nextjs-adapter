import type {ProjectLocaleConfig} from '../types';


import {getProjectLocaleConfigs} from './getProjectLocaleConfigs';


export function getProjectLocaleConfigById(projectId?: string, useDefault = true): ProjectLocaleConfig {
    const configs = getProjectLocaleConfigs();

    let config: ProjectLocaleConfig;
    if (projectId) {
        config = Object.values(configs).find(p => {
            return p?.project?.toLowerCase() === projectId.toLowerCase();
        });
    }
    if (!config && useDefault) {
        config = Object.values(configs).find(c => c.default);
    }

    return config;
}