import React from 'react';

import {FetchContentResult} from '../guillotine/fetchContent';
import SingleComponent from './SingleComponent';
import BaseContent from './BaseContent';
import {XP_REQUEST_TYPE} from '../utils';


const _MainView = (props: FetchContentResult) => {
    const {meta} = props;

    // Single-component render:
    if (meta?.requestType === XP_REQUEST_TYPE.COMPONENT) {
        return <SingleComponent {...props} />;
    }

    // meta.requestType="type", and hence content-type based, is standard view for now.
    return <BaseContent {...props} />;
};

export default _MainView;
