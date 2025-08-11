import type {ComponentDescriptor, ContentResult, Context} from '../types';


import {getComponentConfig} from './getComponentConfig';


const NO_PROPS_PROCESSOR = async (props: any) => await props ?? {};


export async function applyProcessors(
    componentDescriptors: ComponentDescriptor[],
    contentResults: ContentResult,
    context: Context
): Promise < PromiseSettledResult < any > [] > {

    let dataCounter = 0;
    const processorPromises = componentDescriptors.map(async (desc: ComponentDescriptor) => {
        // we're iterating component descriptors here
        // some of them might not have provided graphql requests
        // but we still need to run props processor for them
        // in case they want to fetch their data from elsewhere
        const propsProcessor = desc.type?.processor || NO_PROPS_PROCESSOR;
        let data;
        if (desc.queryAndVariables) {
            // if there is a query then there must be a result for it
            data = contentResults.contents[dataCounter++];
        }

        const config = getComponentConfig(desc.component);
        return await propsProcessor(data, context, config);
    });

    return Promise.allSettled(processorPromises);
}
