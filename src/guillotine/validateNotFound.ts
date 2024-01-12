import type {FetchContentResult} from '../types';


import {notFound} from 'next/navigation';


export function validateNotFound(props: FetchContentResult): void {
    const {error} = props;
    if (error) {
        switch (error.code) {
            case '404':
                console.warn(error.code, error.message);
                notFound();
                break;
            default:
                console.error(error.code, error.message);
                throw new Error(error.message);
        }
    }
}