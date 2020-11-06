module.exports = {
    extends: ['plugin:prettier/recommended', 'eslint:recommended'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
    },
    parserOptions: {
        ecmaVersion: 2017,
    },
    env: {
        es6: true,
        commonjs: true,
        node: true,
        mocha: true,
    },
}
