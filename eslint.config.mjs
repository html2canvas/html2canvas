import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
    {
        ignores: ['**/*.js', 'build/**', 'dist/**', 'node_modules/**', 'tmp/**', 'www/**', 'tests/**', 'scripts/**']
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json'],
                ecmaVersion: 2018,
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier: prettierPlugin
        },
        rules: {
            ...tseslint.configs['recommended'].rules,
            ...prettierConfig.rules,
            '@typescript-eslint/explicit-member-accessibility': ['error', {accessibility: 'no-public'}],
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/class-name-casing': 'off',
            'prettier/prettier': 'error'
        }
    }
];
