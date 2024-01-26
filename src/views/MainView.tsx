import type {FetchContentResult} from '../types';


import React from 'react';
import {XP_REQUEST_TYPE} from '../common/constants';
import SingleComponent from './SingleComponent';
import BaseContent from './BaseContent';


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
