import {getProjectLocaleConfigs} from './getProjectLocaleConfigs';


export function getProjectLocales(): string[] {
    return Object.keys(getProjectLocaleConfigs());
}