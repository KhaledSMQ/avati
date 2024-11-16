module.exports = {
    plugins: ["jest"],
    parser: '@typescript-eslint/parser',
    env: {
        "jest/globals": true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-require-imports": "off",
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars':'off',
        // '@typescript-eslint/no-unused-vars': ['error', {
        //     'argsIgnorePattern': '^_',
        //     'varsIgnorePattern': '^_'
        // }]
    }
};
