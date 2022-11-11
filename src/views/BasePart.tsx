import React from 'react';
import {MetaData, PartData} from '../guillotine/getMetaData';
import {ComponentRegistry} from '../ComponentRegistry';
import {XP_COMPONENT_TYPE} from '../utils';
import {MissingComponent, shouldShowMissingView} from './BaseComponent';


export interface PartProps {
    part: PartData;
    path: string;
    data?: any;
    common?: any; // Content is passed down to componentviews. TODO: Use a react contextprovider instead?
    meta: MetaData;
}

interface BasePartProps {
    component?: PartData;
    path: string;
    common?: any;
    data?: any;
    error?: string;
    meta: MetaData;
}

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

