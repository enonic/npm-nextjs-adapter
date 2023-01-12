import {createElement, ReactNode, useEffect, useRef, useState} from 'react';

function useStaticContent() {
    const ref = useRef(null);
    const [render, setRender] = useState(typeof window === 'undefined');

    useEffect(() => {
        // check if the innerHTML is empty as client side navigation
        // need to render the component without server-side backup
        const isEmpty = ref?.current?.innerHTML === '';
        if (isEmpty) {
            setRender(true);
        }
    }, []);

    return [render, ref];
}

export interface StaticContentProps extends Record<string, any> {
    children?: ReactNode | ReactNode[];
    element?: string;
    condition: boolean;
}

export default function StaticContent({children, element = 'div', condition = true, ...props}: StaticContentProps) {
    const [render, ref] = useStaticContent();

    // just render if:
    // - condition is false
    // - we're in the server or a spa navigation
    if (render || !condition) {
        return createElement(element, props, ...[].concat(children));
    }

    // avoid re-render on the client
    return createElement(element, {
        ...props,
        ref,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: {__html: ''},
    });
}
