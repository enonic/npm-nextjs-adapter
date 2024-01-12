import type {MetaData, RegionTree} from '../types';


import React from 'react';
import {XP_COMPONENT_TYPE} from '../constants';
import {LayoutData} from '../guillotine/getMetaData';
import {ComponentRegistry} from '../ComponentRegistry';
import {MissingComponent, shouldShowMissingView} from './BaseComponent';


export interface LayoutProps {
    layout: LayoutData;
    path: string;
    common: any;
    meta: MetaData;
}

interface BaseLayoutProps {
    component?: LayoutData;
    path: string;
    regions?: RegionTree;
    common?: any;
    meta: MetaData;
}


const BaseLayout = (props: BaseLayoutProps) => {

    const {component, common, regions, meta, path} = props;
    let layoutSelection;
    if (component) {
        layoutSelection = ComponentRegistry.getLayout(component.descriptor);
    }
    const SelectedLayoutView = layoutSelection?.view;
    if (SelectedLayoutView) {
        return <SelectedLayoutView layout={{descriptor: component?.descriptor, regions: regions || {}, config: component?.config}}
                                   path={path}
                                   common={common}
                                   meta={meta}/>;
    } else if (component?.descriptor) {
        // empty descriptor usually means uninitialized layout
        console.warn(`BaseLayout: can not render layout '${component?.descriptor}': no next view or catch-all defined`);
        if (shouldShowMissingView(meta)) {
            return <MissingComponent type={XP_COMPONENT_TYPE.LAYOUT} descriptor={component.descriptor}/>;
        }
    }
    return null;
};

export default BaseLayout;
