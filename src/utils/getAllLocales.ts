import {getLocaleMappings} from './getLocaleMappings';


export function getAllLocales(): string[] {
    return Object.keys(getLocaleMappings());
}
