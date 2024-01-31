'use client';
/// <reference types="react" />


import {hydrateRoot} from 'react-dom/client';


export default function getClientHydratedHtml(component: React.ReactNode) {
    const root = document.createElement('div');
    hydrateRoot(root, component);
    return root.innerHTML;
}
