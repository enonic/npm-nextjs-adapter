import type {PageComponent, RegionProps, RegionsProps} from '../types';


import React from 'react';
import {
    PORTAL_REGION_ATTRIBUTE,
    RENDER_MODE,
} from '../constants';
import BaseComponent from './BaseComponent';


/** Single region */
export const RegionView = (props: RegionProps) => {
    const {name, components, common, meta, className} = props;
    const regionAttrs: { [key: string]: string } = {};

    if (className) {
        regionAttrs.className = className;
    }

    const children = (components || [])
        .sort(sortPageComponentsByPath)
        .map((component: PageComponent, i: number) => (
            <BaseComponent key={`${regionAttrs.id}-${i}`} component={component} common={common} meta={meta}/>
        ));

    if (meta.renderMode === RENDER_MODE.EDIT) {
        regionAttrs.id = name + 'Region';
        regionAttrs[PORTAL_REGION_ATTRIBUTE] = name;
    }

    return <div {...regionAttrs}>{children}</div>;
};


/** Multiple regions, or only one if named in props.selected */
const RegionsView = (props: RegionsProps) => {
    const {page, name, meta, common} = props;
    const regions = page?.regions;
    if (!regions || !Object.keys(regions)) {
        return null;
    }

    // Detect if any single region is selected for rendering and if so, handle that
    if (name) {
        const selectedRegion = regions[name];
        if (!selectedRegion) {
            console.warn(
                `Region name '${name}' was selected but not found among regions (${JSON.stringify(Object.keys(regions))}). Skipping.`);    // TODO: Throw error instead of this? Return null?
            return null;
        }
        return <RegionView {...selectedRegion} common={common} meta={meta}/>;
    }

    return (
        <>
            {
                Object.keys(regions).map((name: string, i) => {
                    const region = regions[name];
                    return <RegionView key={i} {...region} common={common} meta={meta}/>;
                })
            }
        </>
    );
};

function sortPageComponentsByPath(aComp: PageComponent, bComp: PageComponent): number {
    // sort according to index in region, otherwise there will be a mismatch of views and data
    // because after 10 components the order will be: /main/1, /main/11, /main/2, /main/3,...

    let pathArr = aComp.path.split('/');
    const aIndex = +(pathArr[pathArr.length - 1] || 0);
    pathArr = bComp.path.split('/');
    const bIndex = +(pathArr[pathArr.length - 1] || 0);

    return aIndex - bIndex;
}

export default RegionsView;
