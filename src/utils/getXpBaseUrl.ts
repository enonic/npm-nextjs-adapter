import type {Context} from '../types';


import {XP_BASE_URL_HEADER} from '../common/constants';


export const getXpBaseUrl = (context: Context): string => {
    const header = context.headers?.get(XP_BASE_URL_HEADER) || '/';

    // TODO: workaround for XP pattern controller mapping not picked up in edit mode
    return header.replace(/\/edit\//, '/inline/');
};