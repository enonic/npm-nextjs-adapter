import type {LocaleMapping} from '../types';


import {getLocaleMappings} from './getLocaleMappings';


export function getLocaleMappingByLocale(locale?: string, useDefault = true): LocaleMapping {
    const mappings = getLocaleMappings();

    let config: LocaleMapping;
    if (locale) {
        config = mappings[locale];
    }
    if (!config && useDefault) {
        config = Object.values(mappings).find(c => c.default);
    }

    return config;
}
