import type {Context} from '../types';


import Negotiator from 'negotiator';
import {match as localeMatcher} from '@formatjs/intl-localematcher';
import {PROJECT_ID_HEADER} from '../common/constants';
import {getLocaleMappings} from './getLocaleMappings';
import {getLocaleMappingByProjectId} from './getLocaleMappingByProjectId';


export function getRequestLocaleInfo(context: Context) {
    let locale: string;
    const configs = getLocaleMappings();
    const locales = Object.keys(configs);
    const defaultLocale = locales.find((locale) => configs[locale].default);
    const projectId = context.headers?.get(PROJECT_ID_HEADER);
    if (projectId) {
        locale = getLocaleMappingByProjectId(projectId, false)?.locale;

    } else {
        locale = context.locale;
        if (!locale) {
            const acceptLang = context.headers?.get('accept-language') || '';
            const langs = new Negotiator({headers: {'accept-language': acceptLang}}).languages();
            locale = localeMatcher(langs, locales, defaultLocale);
        }
    }
    return {locale, locales, defaultLocale};
}
