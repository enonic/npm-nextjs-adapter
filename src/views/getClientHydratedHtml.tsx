'use client';


import {hydrateRoot} from 'react-dom/client';


export default function getClientHydratedHtml(component) {
    const root = document.createElement('div');
    hydrateRoot(root, component);
    return root.innerHTML;
}
