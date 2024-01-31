module.exports = {
    extends: ['../.eslintrc.cjs'],
    overrides: [{
        extends: '../.eslint-childrc.cjs',
        files: ['*.ts', '*.tsx'],
        parserOptions: {
            tsconfigRootDir: __dirname,
            project: '../tsconfig.json',
        },
    }],
};
