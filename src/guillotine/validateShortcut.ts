import type {FetchContentResult} from '../types';


import {notFound, redirect, RedirectType} from 'next/navigation';
import {RENDER_MODE} from '../constants';
import {IS_DEV_MODE} from '../env';
import {UrlProcessor} from '../UrlProcessor';


export function validateShortcut(props: FetchContentResult): void {
    const {data, meta, error} = props;
    const pageUrl = data?.get?.data?.target?.pageUrl;
    if (meta.type === 'base:shortcut' && pageUrl) {
        if (meta.renderMode !== RENDER_MODE.NEXT) {
            // do not show shortcut targets in preview/edit mode
            console.warn(404, `Shortcuts are not available in ${RENDER_MODE.NEXT} render mode`);
            notFound();
        }

        const destination = UrlProcessor.process(pageUrl, meta, true);
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