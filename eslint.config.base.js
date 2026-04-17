import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';


export default defineConfig([{
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],

    plugins: {
        "import": importPlugin,
        'simple-import-sort': simpleImportSort,
        '@stylistic': stylistic,
        '@typescript-eslint': tseslint.plugin,
    },

    languageOptions: {
        parser: tseslint.parser,
    },

    rules: {
        'arrow-parens': 2,
        'comma-spacing': 2,
        'eol-last': 2,

        indent: ['error', 4, {
            SwitchCase: 1,
        }],

        'key-spacing': 1,
        'linebreak-style': ['error', 'unix'],
        'no-console': 0,
        'no-constant-condition': 1,
        'no-empty': 1,
        'no-multi-spaces': 1,
        'no-prototype-builtins': 0,
        'no-trailing-spaces': 2,
        'no-useless-catch': 0,

        'object-curly-newline': [2, {
            minProperties: 5,
            consistent: true,
        }],

        'prefer-template': 2,
        quotes: ['error', 'single'],
        'require-await': 1,
        semi: ['error', 'always'],
        'import/no-cycle': 2,
        'import/no-extraneous-dependencies': 2,

        'simple-import-sort/imports': [2, {
            groups: [
                ['^\\u0000'],
                ['^@?\\w'],
                ['^(?:\\.\\./)+shared(?:/|$)'],
                ['^(?:\\.\\.?/)+core(?:/|$)'],
                ['^\\.\\./\\.\\./'],
                ['^\\.\\./'],
                ['^'],
                ['^\\.'],
            ],
        }],

        '@stylistic/comma-dangle': ['error', 'always-multiline'],
        '@stylistic/indent': [2, 4],

        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,

        '@typescript-eslint/naming-convention': [1, {
            selector: 'variable',
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        }, {
            selector: 'function',
            format: ['camelCase', 'PascalCase'],
        }, {
            selector: 'typeLike',
            format: ['PascalCase'],
        }],

        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-shadow': 2,
        '@typescript-eslint/no-use-before-define': 0,
        '@typescript-eslint/no-var-requires': 0,
    },
}]);
