import type {LocaleMappings} from '../types';


import {ENV_VARS} from '../common/constants';
import {MAPPINGS} from '../common/env';


// NOTE: Dissallowing slash and any whitespace in 2nd capture group.
const PROJECT_CONFIG_REGEXP = /^([\w-]+):([^/\s]+)(\/[\w.-]+)?$/i;


export function getLocaleMappings(): LocaleMappings {
    const str = MAPPINGS;
    if (!str?.length) {
        throw new Error(`Did you forget to define "${ENV_VARS.MAPPINGS}" environmental variable?
        Format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>,...`);
    }
    return str.split(',').reduce((config, prjStr, index: number) => {
        const trimmedprjStr = prjStr.trim();
        if (!trimmedprjStr.length) {
            return config;
        }
        const matches: RegExpExecArray = PROJECT_CONFIG_REGEXP.exec(trimmedprjStr);
        if (!matches?.length) {
            throw new Error(`Project "${prjStr}" doesn't match format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>`);
        }
        const [_full, lang, project, site] = matches;
        config[lang] = {
            default: index === 0,
            project,
            site,
            locale: lang
        };
        return config;
    }, {});
}
