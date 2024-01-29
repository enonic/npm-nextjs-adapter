'use client';


import {hydrateRoot} from 'react-dom/client';
import React from 'react';


export default function getClientHydratedHtml(component: React.ReactNode) {
    const root = document.createElement('div');
    hydrateRoot(root, component);
    return root.innerHTML;
}
