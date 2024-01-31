module.exports = {
    extends: [
        '@enonic/eslint-config',
        'plugin:react/recommended',
    ],
    ignorePatterns: [
        '/dist',
        '*.js',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
};
