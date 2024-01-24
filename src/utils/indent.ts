export const indent = (s: string, count = 2, indentChar = ' ') => s
    .split('\n')
    .map((line) => `${indentChar.repeat(count)}${line}`)
    .join('\n');
