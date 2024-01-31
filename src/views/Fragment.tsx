/// <reference types="react" />
import type {FragmentProps, PageComponent} from '../types';


import {FRAGMENT_DEFAULT_REGION_NAME, XP_COMPONENT_TYPE} from '../common/constants';
import BaseComponent, {MissingComponent, shouldShowMissingView} from './BaseComponent';


const FragmentView = (props: FragmentProps) => {
    const {component, page} = props;
    const comps: PageComponent[] = [];
    if (page) {
        // rendering whole page
        const regions = page.regions || {};
        const regionComps = regions[FRAGMENT_DEFAULT_REGION_NAME]?.components;
        if (regionComps) {
            comps.push(...regionComps);
        }
    } else if (component?.fragment) {
        // rendering a part of a page
        comps.push(...component.fragment.components);
    }

    if (!comps.length && shouldShowMissingView(props.meta)) {
        return <MissingComponent type={XP_COMPONENT_TYPE.FRAGMENT} descriptor={page?.descriptor || component?.id}/>;
    } else {
        const {common, meta} = props;

        return (
            <>
                {
                    comps.map((comp: PageComponent, i: number) => (
                        <BaseComponent key={i} component={comp} common={common} meta={meta}/>
                    ))
                }
            </>
        );
    }
};

export default FragmentView;
