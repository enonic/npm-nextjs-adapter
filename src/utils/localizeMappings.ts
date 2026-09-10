import type {LocaleMapping, UrlMappingRule} from '../types';

import {stripLeadingSlashes} from './fixDoubleSlashes';

/** Prefixes mapping targets with the locale, except for the default locale whose URLs carry no prefix; sources stay site-relative */
export function localizeMappings(mappings: UrlMappingRule[], mapping: Pick<LocaleMapping, 'locale' | 'default'>): UrlMappingRule[] {
    return mappings.map((rule) => ({
        ...rule,
        target: mapping.default ? rule.target : `/${mapping.locale}/${stripLeadingSlashes(rule.target)}`
    }));
}
