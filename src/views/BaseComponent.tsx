import type {BaseComponentProps, MetaData, PageComponent} from '../types';


import React from 'react';
import {PORTAL_COMPONENT_ATTRIBUTE, RENDER_MODE, XP_COMPONENT_TYPE} from '../constants';
import {IS_DEV_MODE} from '../env';
import {ComponentRegistry} from '../ComponentRegistry';
import Empty from './Empty';


const BaseComponent = async ({component, meta, common}: BaseComponentProps) => {
    const {type, error} = component;
    const cmpData = component[type];
    const descriptor = cmpData && 'descriptor' in cmpData ? cmpData.descriptor : undefined;

    let ComponentView: JSX.Element | null;

    if (error) {
        // renders error component when rendering whole page
        console.warn(`BaseComponent: ${type} '${descriptor}' error: ${error}`);
        ComponentView = shouldShowErrorView(meta) ? <ErrorComponent type={type} reason={error} descriptor={descriptor}/> : <Empty/>;

    } else {

        const ViewFn = ComponentRegistry.getComponent(type)?.view;
        if (!ViewFn) {
            // show missing component kind, i.e. 'part', 'layout', 'text'
            console.warn(`BaseComponent: can not render component '${type}': no next view or catch-all defined`);
            ComponentView = shouldShowMissingView(meta) ? <MissingComponent type={type} descriptor={descriptor}/> : <Empty/>;

        } else {
            const cmpAttrs = createComponentAttrs(component, meta, common);
            ComponentView = <ViewFn {...cmpAttrs}/>;
        }
    }

    // need to display a placeholder if descriptor is empty as component is not initialized yet
    if (descriptor && shouldShowPlaceholderView(meta)) {
        const outputHTML = await renderComponent(ComponentView);
        if (!outputHTML?.trim().length) {
            // render some placeholder in case of empty output
            ComponentView = <PlaceholderComponent type={type} descriptor={descriptor}/>;
        }
    }

    if (meta.renderMode === RENDER_MODE.EDIT) {
        return (
            <div {...createEditorAttrs(type)}>
                {ComponentView}
            </div>
        );
    } else {
        // do not make component wrappers in live mode
        return ComponentView;
    }
};
export default BaseComponent;

/*
 *  Used for displaying components with missing implementations on the page, while rendering whole page
 */
export const MissingComponent = ({descriptor, type}: { descriptor?: string, type: string }) => {
    return (
        <div style={{
            border: '2px dashed lightgrey',
            padding: '16px',
        }}>
            <h3 style={{margin: 0}}>Missing component</h3>
            <p style={{marginBottom: 0, color: 'grey'}}>{`Missing ${type} with descriptor: ${descriptor}`}</p>
        </div>
    );
};

const renderComponent = async (component: React.ReactElement) => {
    if (typeof document !== 'undefined') {
        // render component on the client to see if it's empty
        const root = document.createElement('div');
        const ReactDOM = await import('react-dom/client');
        ReactDOM.hydrateRoot(root, component);
        return root.innerHTML;
    } else {
        // report non-empty output for server-side rendering
        return '<div>Server-side rendered component</div>';
    }
};

export function shouldShowMissingView(meta: MetaData): boolean {
    return IS_DEV_MODE || meta.renderMode !== RENDER_MODE.NEXT;
}

/*
 *  Used for displaying components with errors on the page, while rendering whole page
 */
export const ErrorComponent = ({type, descriptor, reason}: { type?: string, descriptor?: string, reason: string }) => {
    return (
        <div style={{
            border: '2px solid red',
            padding: '16px',
        }}>
            <h3 style={{margin: 0, textTransform: 'capitalize'}}>{reason ? reason : 'Unknown error'}</h3>
            {descriptor && <p style={{color: 'grey'}}>{`${type}: ${descriptor}`}</p>}
        </div>
    );
};

export function shouldShowErrorView(meta: MetaData): boolean {
    return meta.renderMode === RENDER_MODE.EDIT;
}

function createEditorAttrs(type: XP_COMPONENT_TYPE): Record<string,string> {
    return {
        [PORTAL_COMPONENT_ATTRIBUTE]: type,
    };
}

function createComponentAttrs(component: PageComponent, meta: MetaData, common?: any): Record<string,any> {
    const {type, data, error} = component;
    const cmpAttrs: Record<string,any> = {
        component: component[type],
        path: component.path,
        meta,
        common,
    };

    if (data) {
        cmpAttrs.data = data;
    }

    if (error) {
        cmpAttrs.error = error;
    }

    if (component.type === XP_COMPONENT_TYPE.LAYOUT) {
        // add regions to layout because they are not present in component[component.type] above
        cmpAttrs.regions = component.regions;
    }
    return cmpAttrs;
}

export const PlaceholderComponent = ({type, descriptor}: { type?: string, descriptor?: string }) => {
    return (
        <div style={{
            border: '2px solid lightgrey',
            padding: '16px',
        }}>
            <h3 style={{margin: 0, textTransform: 'capitalize'}}>Empty output</h3>
            {descriptor && <p style={{color: 'grey'}}>{`${type} '${descriptor}' output is empty`}</p>}
        </div>
    );
};

export function shouldShowPlaceholderView(meta: MetaData): boolean {
    return meta.renderMode === RENDER_MODE.EDIT;
}

