import type {MetaData} from '../types';


import React from 'react';
import {TextData} from '../guillotine/getMetaData';
import RichTextView from './RichTextView';


type Props = {
    meta: MetaData,
    component: TextData,
    path: string,
};


const DefaultTextView = ({component, meta, path}: Props) => (
    <RichTextView data={component.value} meta={meta} renderMacroInEditMode={false}/>
);

export default DefaultTextView;
