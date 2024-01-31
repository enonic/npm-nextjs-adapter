module.exports = {
    rules: {
        'no-plusplus': ['off'],
        'no-case-declarations': ['off'],
        'spaced-comment': ['error', 'always', { markers: ['/'] }],
        '@typescript-eslint/no-var-requires': ['off'],
        '@typescript-eslint/no-use-before-define': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/no-unsafe-assignment': ['off'],
        '@typescript-eslint/no-unsafe-member-access': ['off'],
        '@typescript-eslint/no-unsafe-call': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/no-unsafe-return': ['off'],
        '@typescript-eslint/member-ordering': ['off'],
        '@typescript-eslint/restrict-template-expressions': ['off'],
        '@typescript-eslint/ban-types': ['off'],
        'react/react-in-jsx-scope': ['off'],    // We have <reference types="react" /> in all files to not import react in the lib
    },
}
