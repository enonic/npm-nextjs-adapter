export const commonChars = (s1?: string, s2?: string) => {
    let result = '';
    if (!s1 || s1.length === 0 || !s2 || s2.length === 0) {
        return result;
    }
    for (let i = 0; i < s1.length; i++) {
        const s1Element = s1[i];
        if (s2[i] === s1Element) {
            result += s1Element;
        } else {
            break;
        }
    }

    return result;
};