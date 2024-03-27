export function getServerRenderedHtml(component: React.ReactNode): string {
    return require('react-dom/server').renderToString(component);
}
