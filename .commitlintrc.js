module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-enum': [
            2,
            'always',
            [
                'core',
                'animation',
                'avati-create-lib',
                'debounce',
                'html',
                'listener',
                'logger',
                'memoize',
                'element',
                'pointer',
                'scrollable',
                'state',
                'throttle',
                'signal',
                'release',
                'docs',
            ],
        ],
        'scope-empty': [2, 'never'],
        'subject-case': [0],
    },
};
