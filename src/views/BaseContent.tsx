import type {BasePageProps, FetchContentResult} from '../types';


import React from 'react';
import {ComponentRegistry} from '../ComponentRegistry';
import BasePage from './BasePage';


const BaseContent = (props: FetchContentResult) => {
    const {common, meta, page} = props;

    if (!meta?.type) {
        console.warn("BaseContent props are missing 'meta.type'");
        return null;
    }

    const pageData = page?.page;
    const pageDesc = pageData?.descriptor;
    const typeDef = ComponentRegistry.getContentType(meta.type);
    const ContentTypeView = typeDef?.view;

    if (ContentTypeView && !typeDef?.catchAll) {
        // console.info(`BaseContent: rendering '${meta.type}' with content type: ${ContentTypeView.name}`);
        return <ContentTypeView {...props}/>;
    } else if (pageDesc) {
        // console.info(`BaseContent: rendering '${meta.type}' with page: ${BasePage.name}`);
        const pageAttrs: BasePageProps = {
            component: pageData,
            path: page?.path,
            meta,
            common,
        };
        if (page?.data) {
            pageAttrs.data = page.data;
        }
        if (page?.error) {
            pageAttrs.error = page.error;
        }

        return <BasePage {...pageAttrs}/>;
    } else if (ContentTypeView) {
        // console.info(`BaseContent: rendering '${meta.type}' with content type catch-all: ${ContentTypeView.name}`);
        return <ContentTypeView {...props}/>;
    }

    console.log(`BaseContent: can not render ${meta.type}: no content type or page view defined`);
    return null;
};

export default BaseContent;
