module.exports = {
    'packages/*/src/**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
    '*.{json,md}': ['prettier --write'],
};
