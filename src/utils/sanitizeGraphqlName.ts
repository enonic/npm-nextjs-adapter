// sanitizes text according to graphql naming spec http://spec.graphql.org/October2021/#sec-Names
export const sanitizeGraphqlName = (text: string) => {
    if (!text || text.trim().length === 0) {
        return '';
    }
    let result = text.replace(/([^0-9A-Za-z])+/g, '_');
    if (result.length > 0 && /[0-9]/.test(result.charAt(0))) {
        result = '_' + result;
    }
    return result;
};