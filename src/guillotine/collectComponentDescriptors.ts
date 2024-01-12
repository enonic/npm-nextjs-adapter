import type {
    ComponentDescriptor,
    Context,
    PageComponent,
} from '../types';


import {ComponentRegistry} from '../ComponentRegistry';
import {XP_COMPONENT_TYPE} from '../constants';
import {
    APP_NAME,
    APP_NAME_DASHED,
} from '../env';
import {processComponentConfig} from './processComponentConfig';
import {getComponentConfig} from './getComponentConfig';
import {getQueryAndVariables} from './getQueryAndVariables';


export function collectComponentDescriptors(components: PageComponent[],
    componentRegistry: typeof ComponentRegistry,
    xpContentPath: string,
    context: Context,
): ComponentDescriptor[] {

    const descriptors: ComponentDescriptor[] = [];

    for (const cmp of (components || [])) {
        processComponentConfig(APP_NAME, APP_NAME_DASHED, cmp);
        // only look for parts
        // look for single part if it is a single component request
        if (XP_COMPONENT_TYPE.FRAGMENT !== cmp.type) {
            const cmpDef = ComponentRegistry.getByComponent(cmp);
            if (cmpDef) {
                // const partPath = `${xpContentPath}/_component${cmp.path}`;
                const config = getComponentConfig(cmp);
                const queryAndVariables = getQueryAndVariables(cmp.type, xpContentPath, context, cmpDef.query, config);
                if (queryAndVariables) {
                    descriptors.push({
                        component: cmp,
                        type: cmpDef,
                        queryAndVariables: queryAndVariables,
                    });
                }
            }
        } else {
            // look for parts inside fragments
            const fragPartDescs = collectComponentDescriptors(
                cmp.fragment?.fragment?.components,
                componentRegistry,
                xpContentPath,
                context,
            );
            if (fragPartDescs.length) {
                descriptors.push(...fragPartDescs);
            }
        }
    }

    return descriptors;
}