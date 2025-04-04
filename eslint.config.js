const enonic = require('@enonic/eslint-config');
const reactPlugin = require('eslint-plugin-react');
const tseslint = require('typescript-eslint');

module.exports = [
    ...enonic,
    {
        plugins: {
            react: reactPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',  // We have <reference types="react" /> in all files to not import react in the lib
        },
    },
    // TypeScript-specific config
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            'no-plusplus': 'off',
            'no-case-declarations': 'off',
            'spaced-comment': ['error', 'always', { markers: ['/'] }],
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/member-ordering': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    // Ignore patterns
    {
        ignores: ['dist/', '*.js'],
    },
];
