import prettierConfig from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import sveltePlugin from 'eslint-plugin-svelte';
import globals from 'globals';
// import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import svelteParser from 'svelte-eslint-parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...sveltePlugin.configs['flat/recommended'],
	prettierConfig,
	...sveltePlugin.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {...globals.browser, ...globals.node, ...globals.es2024},
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname,
				project: './tsconfig.json'
			}
		}
	},

	{
		files: ['**/*.{svelte, svelte.ts}', '*.{svelte, svelte.ts}'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				svelteFeatures: {experimentalGenerics: true},
				svelteConfig,
				parser: {ts: '@typescript-eslint/parser'},
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		files: ['**/*ts', '*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {tsconfigRootDir: import.meta.dirname, project: './tsconfig.json'}
		}
	},
	{
		plugins: {'@typescript-eslint': tsPlugin, svelte: sveltePlugin}
		//settings: {'svelte/typescript': () => require('typescript')}
	},
	{
		ignores: [
			'**/build',
			'**/.svelte-kit',
			'**/test',
			'**/docs',
			'**/vite*',
			'tailwind.config.ts',
			'**/sw.min.js',
			'**/node_modules',
			'**/*.js',
			'**/vite.config.ts',
			'**/forge.config.ts'
		]
	},
	{
		rules: {
			...sveltePlugin.configs.recommended.rules,
			'a11y-click-events-have-key-events': 'off',
			'a11y-autofocus': 'off',
			// '@typescript-eslint/no-unsafe-member-access': 'off',
			// 'no-constant-condition': 'off',
			// 'svelte/no-unused-class-name' : 'warn',// style
			// 'no-useless-escape': 'off',
			'no-extra-semi': 'off',
			// 'no-async-promise-executor': 'off',
			'svelte/no-immutable-reactive-statements': 'error',
			'svelte/valid-compile': 'warn',
			// 'svelte/valid-style-parse': 'warn',
			// '@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',

			'no-unsafe-optional-chaining': 'error',
			'no-constant-condition': ['error', {checkLoops: false}]
			// '@typescript-eslint/no-extra-semi': 'off',
			// '@typescript-eslint/ban-ts-comment': 'off',
			// '@typescript-eslint/no-unused-vars': [
			// 	'error',
			// 	{args: 'none', destructuredArrayIgnorePattern: '^_d?$', caughtErrors: 'none'}
			// ],
			// '@typescript-eslint/strict-boolean-expressions': 'error',
			// '@typescript-eslint/no-unsafe-argument': 'error',
			// '@typescript-eslint/no-unsafe-assignment': 'error'
		}
	}
];
