module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'refactor',
                'revert',
                'style',
                'test',
                'deps'
            ],
        ],
        'scope-enum': [
            2,
            'always',
            [
                'core',
                'avati',
                'animation',
                'batch-scheduler',
                'debounce',
                'element',
                'listener',
                'logger',
                'memoize',
                'pointer',
                'scrollable',
                'signal',
                'state',
                'throttle',

            ],
        ],
        'scope-empty': [2, 'never'],
        'subject-case': [0],
    },
};
