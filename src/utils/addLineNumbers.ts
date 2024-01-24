export function addLineNumbers(s: string) {
    return s.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n');
}