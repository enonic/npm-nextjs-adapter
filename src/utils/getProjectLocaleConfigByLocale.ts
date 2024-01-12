import type {ProjectLocaleConfig} from '../types';


import {getProjectLocaleConfigs} from './getProjectLocaleConfigs';


export function getProjectLocaleConfigByLocale(locale?: string, useDefault = true): ProjectLocaleConfig {
    const configs = getProjectLocaleConfigs();

    let config: ProjectLocaleConfig;
    if (locale) {
        config = configs[locale];
    }
    if (!config && useDefault) {
        config = Object.values(configs).find(c => c.default);
    }

    return config;
}