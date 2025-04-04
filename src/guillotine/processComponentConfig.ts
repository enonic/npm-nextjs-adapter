import type {PageComponent} from '../types';


import {sanitizeGraphqlName} from '../utils/sanitizeGraphqlName';


export function processComponentConfig(
    myAppName: string,
    myAppNameDashed: string,
    cmp: PageComponent,
): void {
    const cmpData = cmp[cmp.type];
    if (cmpData && 'descriptor' in cmpData && cmpData.descriptor) {
        const [appName, cmpName] = cmpData.descriptor.split(':');
        if (appName !== myAppName) {
            return;
        }
        let config;
        const configArray: object[] = [];
        if ('configAsJson' in cmpData && cmpData.configAsJson && cmpData.configAsJson[myAppNameDashed]) {
            config = cmpData.configAsJson[myAppNameDashed][cmpName];
            if (config) {
                configArray.push(config);
                delete cmpData.configAsJson;
            }
        }
        const sanitizedAppName = sanitizeGraphqlName(appName);
        if ('config' in cmpData && cmpData.config && cmpData.config[sanitizedAppName]) {
            config = cmpData.config[sanitizedAppName][sanitizeGraphqlName(cmpName)];
            if (config) {
                configArray.push(config);
            }
        }
        if (configArray.length) {
            cmpData.config = Object.assign({}, ...configArray);
        }
    }
}
