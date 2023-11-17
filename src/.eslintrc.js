module.exports = {
    extends: ['../.eslintrc.js'],
    overrides: [{
        extends: '../.eslint-childrc.js',
        files: ['*.ts', '*.tsx'],
        parserOptions: {
            tsconfigRootDir: __dirname,
            project: '../tsconfig.json',
        },
    }],
};
