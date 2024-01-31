/// <reference types="react" />
/** Render only one component as a result of a request from XP-side .../_/component/... during edit refresh. */
import type {FetchContentResult} from '../types';


import BaseComponent from './BaseComponent';


const SingleComponent = ({meta, common}: FetchContentResult) => {

    if (!meta?.requestedComponent) {
        // TODO: Handle missing target region (Throw a 404, "component path not found"?)
        return null;
    }

    return <BaseComponent component={meta.requestedComponent} common={common} meta={meta}/>;
};

export default SingleComponent;
