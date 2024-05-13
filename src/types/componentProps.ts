import {DOMNode} from 'html-react-parser';
import type {RENDER_MODE, XP_REQUEST_TYPE} from '../common/constants';
import type {
    FragmentData,
    LayoutData,
    MacroConfig,
    MacroData,
    PageComponent,
    PageData,
    PartData,
    RichTextData,
    RegionTree,
} from './component';


export interface BaseComponentProps {
    component: PageComponent;
    meta: MetaData;
    common?: any;                  // Content is passed down for optional consumption in componentviews.
    // TODO: Use a react contextprovider instead of "manually" passing everything down
}

export interface BaseLayoutProps {
    component?: LayoutData;
    path: string;
    regions?: RegionTree;
    common?: any;
    meta: MetaData;
}

export interface BaseMacroProps {
    data: MacroData;
    meta: MetaData;
    renderInEditMode?: boolean;
}

export interface BasePageProps {
    component?: PageData;
    path?: string;
    common?: any;
    data?: any;
    error?: string;
    meta: MetaData;
}

export interface BasePartProps {
    component?: PartData;
    path: string;
    common?: any;
    data?: any;
    error?: string;
    meta: MetaData;
}

export interface FragmentProps {
    page?: PageData;
    component?: FragmentData;
    common?: any;
    meta: MetaData;
}

export interface LayoutProps {
    layout: LayoutData;
    path: string;
    common: any;
    meta: MetaData;
}

export interface MacroProps {
    name: string;
    config: MacroConfig;
    meta: MetaData;
}

export interface MetaData {
    type: string,
    path: string,
    requestType: XP_REQUEST_TYPE,
    renderMode: RENDER_MODE,
    requestedComponent?: PageComponent,
    canRender: boolean,
    catchAll: boolean,
    apiUrl: string,
    baseUrl: string,
    locale: string,
    defaultLocale: string,
}

export interface PageProps {
    page: PageData;
    path: string;
    data?: any;
    common?: any; // Content is passed down to componentviews. TODO: Use a react contextprovider instead?
    meta: MetaData;
}

export interface PartProps {
    part: PartData
    path: string
    data?: any
    // Content is passed down to componentviews. TODO: Use a react contextprovider instead?
    common?: any
    meta: MetaData
}

export interface RegionProps {
    name: string
    components?: PageComponent[]
    className?: string
    // Content is passed down for optional consumption in componentviews. TODO: Use a react contextprovider instead?
    common?: any
    meta: MetaData
}

export interface RegionsProps {
    page: PageData | null;
    name?: string;
    // Content is passed down for optional consumption in componentviews. TODO: Use a react contextprovider instead?
    common?: any;
    meta: MetaData;
}

export type Replacer = (
    domNode: DOMNode,
    data: RichTextData,
    meta: MetaData,
    renderMacroInEditMode: boolean
) => ReplacerResult;

export type ReplacerResult = JSX.Element | DOMNode;

export interface RichTextViewProps {
    data: RichTextData
    meta: MetaData
    className?: string
    tag?: string
    renderMacroInEditMode?: boolean
    customReplacer?: Replacer
}
