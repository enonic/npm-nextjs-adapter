import type {BaseLayoutProps} from '../types';


import React from 'react';
import {XP_COMPONENT_TYPE} from '../common/constants';
import {ComponentRegistry} from '../common/ComponentRegistry';
import {MissingComponent, shouldShowMissingView} from './BaseComponent';


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
