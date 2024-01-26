import type {BasePartProps} from '../types';


import React from 'react';
import {ComponentRegistry} from '../common/ComponentRegistry';
import {XP_COMPONENT_TYPE} from '../common/constants';
import {MissingComponent, shouldShowMissingView} from './BaseComponent';


const BasePart = (props: BasePartProps) => {
    const {component, data, common, meta, path} = props;

    let partSelection;
    if (component) {
        partSelection = ComponentRegistry.getPart(component.descriptor);
    }
    const SelectedPartView = partSelection?.view;
    if (SelectedPartView) {
        return <SelectedPartView part={component}
                                 path={path}
                                 data={data}
                                 common={common}
                                 meta={meta}/>;
    } else if (component?.descriptor) {
        // empty descriptor usually means uninitialized part
        console.warn(`BasePart: can not render part '${component.descriptor}': no next view or catch-all defined`);
        if (shouldShowMissingView(meta)) {
            return <MissingComponent type={XP_COMPONENT_TYPE.PART} descriptor={component.descriptor}/>;
        }
    }
    return null;
};

export default BasePart;
