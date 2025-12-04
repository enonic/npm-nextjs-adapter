'use client';
/// <reference types="react" />


import type {ReactElement} from 'react';


import getClientHydratedHtml from '../client/getClientHydratedHtml';
import PlaceholderView from './PlaceholderView';


export default function ClientComponentPlaceholder({component, type, descriptor}: { component: ReactElement, type?: string, descriptor?: string }) {
	const isEmpty = !getClientHydratedHtml(component)?.length;
	if (isEmpty) {
		return <PlaceholderView type={type} descriptor={descriptor}/>;
	}
	return component;
}


