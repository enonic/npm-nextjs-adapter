import type {LocaleMapping} from '../types';


import {getLocaleMappings} from './getLocaleMappings';


export function getLocaleMappingByProjectId(projectId?: string, useDefault = true): LocaleMapping {
    const mappings = getLocaleMappings();

    let config: LocaleMapping;
    if (projectId) {
        config = Object.values(mappings).find(p => {
            return p?.project?.toLowerCase() === projectId.toLowerCase();
        });
    }
    if (!config && useDefault) {
        config = Object.values(mappings).find(c => c.default);
    }

    return config;
}
