import type {ComponentDefinition} from '../../types';


import {sanitizeGraphqlName} from '../../utils/sanitizeGraphqlName';


export const configQuery = (
    list: [string, ComponentDefinition][],
    includeAppName = true,
    canUseConfigAsJson = true,
): string => {
    const hasQueryList = list?.filter(([key, def]) => def.configQuery) || [];
    if (hasQueryList.length === 0) {
        return canUseConfigAsJson ? 'configAsJson' : '';
    }

    const configsByApp: Record<string,string[]> = {};
    hasQueryList
        .forEach((entry) => {
            const nameParts = entry[0].split(':');
            if (nameParts.length === 2) {
                const sanitizedAppName = sanitizeGraphqlName(nameParts[0]);
                let existingConfigs = configsByApp[sanitizedAppName];
                if (!existingConfigs) {
                    existingConfigs = [];
                    configsByApp[sanitizedAppName] = existingConfigs;
                }
                existingConfigs.push(`${sanitizeGraphqlName(nameParts[1])}${entry[1].configQuery}`);
            }
        });

    // Still query for configAsJson if at least one item has no configQuery defined
    const configAsJsonQuery = canUseConfigAsJson && hasQueryList.length < list.length ? 'configAsJson' : '';

    if (!includeAppName) {
        return `${configAsJsonQuery}
                config {
                    ${Object.values(configsByApp).reduce((arr, curr) => arr.concat(curr), []).join('\n')}
                }`;
    } else {
        return `${configAsJsonQuery}
                config {
                    ${Object.entries(configsByApp).map(entry => entry[0] + '{\n' + entry[1].join('\n') + '\n}')}
                }`;
    }
};