import type {FetchContentResult} from '../types';


import {notFound, redirect, RedirectType} from 'next/navigation';
import {RENDER_MODE} from '../common/constants';
import {IS_DEV_MODE} from '../common/env';
import {UrlProcessor} from '../common/UrlProcessor';


export function validateShortcut(props: FetchContentResult): void {
    const {data, meta, error} = props;
    const dataObj = data?.get?.data;
    const pageUrl = dataObj?.target?.pageUrl;
    const parameters = dataObj?.parameters;
    if (meta.type === 'base:shortcut' && pageUrl) {
        if (meta.renderMode !== RENDER_MODE.NEXT) {
            // do not show shortcut targets in preview/edit mode
            console.warn(404, `Shortcuts are not available in ${meta.renderMode} render mode`);
            notFound();
        }

        let destination = UrlProcessor.process(pageUrl, meta, true);
        if (parameters) {
            const searchParams = parameters.map(({name, value}) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join('&');
            destination += '?' + searchParams;
        }
        console.debug(`Redirecting shortcut content [${meta.path}] to`, destination);
        redirect(destination, RedirectType.replace);
    }

    // we can not set 418 for static paths,
    // but we can show 404 instead to be handled in CS
    const canNotRender = meta && !meta.canRender && meta.renderMode !== RENDER_MODE.EDIT;

    const catchAllInNextProdMode = meta.renderMode === RENDER_MODE.NEXT && !IS_DEV_MODE && meta.catchAll;

    const isNotFound = (error && error.code === '404') || canNotRender || catchAllInNextProdMode;

    if (isNotFound) {
        console.warn(404, `Can not render content at [${meta.path}]`);
        notFound();
    }
}
