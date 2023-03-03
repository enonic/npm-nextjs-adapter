module.exports = {
    extends: [
        '@enonic/eslint-config',
        'plugin:react/recommended',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    ignorePatterns: [
        '/dist',
        '*.js',
    ],
};
