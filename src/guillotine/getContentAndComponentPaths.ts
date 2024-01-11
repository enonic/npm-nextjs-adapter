const COMPONENT_PATH_KEY = /\/?_\/component/;   // first slash is optional for root components

export const getContentAndComponentPaths = (requestPath: string): string[] => {
    let contentPath, componentPath;
    if (COMPONENT_PATH_KEY.test(requestPath)) {
        [contentPath, componentPath] = requestPath.split(COMPONENT_PATH_KEY);
    } else {
        contentPath = requestPath;
    }
    return [contentPath, componentPath];
};