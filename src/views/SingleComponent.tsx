/** Render only one component as a result of a request from XP-side .../_/component/... during edit refresh. */

import BaseComponent from './BaseComponent';
import React from 'react';
import {FetchContentResult} from '../guillotine/fetchContent';

const SingleComponent = ({meta, common}: FetchContentResult) => {

    if (!meta?.requestedComponent) {
        // TODO: Handle missing target region (Throw a 404, "component path not found"?)
        return null;
    }

    return <BaseComponent component={meta.requestedComponent} common={common} meta={meta}/>;
};

export default SingleComponent;
