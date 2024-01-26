import type {BasePageProps} from '../types';


import React from 'react';
import {ComponentRegistry} from '../common/ComponentRegistry';
import {XP_COMPONENT_TYPE} from '../common/constants';
import {ErrorComponent, MissingComponent, shouldShowErrorView, shouldShowMissingView} from './BaseComponent';


const BasePage = (props: BasePageProps) => {
    const {component, data, common, error, meta, path} = props;
    const desc = component?.descriptor;
    if (error) {
        console.warn(`BasePage: '${desc}' error: ${error}`);
        if (shouldShowErrorView(meta)) {
            return <ErrorComponent reason={error} descriptor={desc} type={XP_COMPONENT_TYPE.PAGE}/>;
        } else {
            return null;
        }
    }
    let pageDef;
    if (desc) {
        pageDef = ComponentRegistry.getPage(desc);
    }
    const PageView = pageDef?.view;
    if (PageView) {
        return <PageView page={component}
                         path={path}
                         data={data}
                         common={common}
                         meta={meta}/>;
    } else if (component?.descriptor) {
        // empty descriptor usually means uninitialized page
        console.warn(`BasePage: can not render page '${desc}': no next view or catch-all defined`);
        if (shouldShowMissingView(meta)) {
            return <MissingComponent type={XP_COMPONENT_TYPE.PAGE} descriptor={component.descriptor}/>;
        }
    }
    return null;
};

export default BasePage;
