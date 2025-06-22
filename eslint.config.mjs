import typescriptEslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import queryPlugin from '@tanstack/eslint-plugin-query';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

// Create the __filename and __dirname equivalents for ES Modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a compatibility layer for flat config using the recommended settings.
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// This is the critical change - extend the "next" configuration directly
// The Next.js ESLint plugin expects this specific format to be detected
export default [
  // Load Next.js configuration first to establish the base config
  ...compat.config({
    extends: ['next'],
  }),

  // Then extend with additional standard ESLint and plugin configs
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier',
  ),

  // Main project configuration
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      '@tanstack/query': queryPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'writable',
        JSX: 'readonly',
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // Next.js specific rule override.
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
  // Define files and directories to ignore.
  {
    ignores: [
      '**/.lintstagedrc.js',
      '**/eslint.config.mjs',
      '**/.prettierrc.js',
      '**/tailwind.config.js',
      '**/node_modules/',
      '**/.next/',
      '**/next.config.js',
    ],
  },
];
