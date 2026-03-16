import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      '.github',
      'functions',
      'api/**/*',           // Exclude server-side API files
      'vite.config.js',     // Exclude Vite config
      'tailwind.config.js', // Exclude Tailwind config
      'vitest.config.js',   // Exclude Vitest config
      'test_settings.js',   // Exclude test settings
      'convex/**/*',        // Exclude Convex server-side code
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,  // Add Node.js globals (process, etc.)
        // Add TypeScript global types
        JSX: 'readonly',
        NodeJS: 'readonly',
        React: 'readonly',
      },
      parser: tseslint,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      // React 18+ doesn't require React in scope for JSX
      'react/react-in-jsx-scope': 'off',
      // React 18+ handles unescaped entities fine
      'react/no-unescaped-entities': 'off',
      // TypeScript rules - start lenient
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'off', // Allow during migration
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': 'off', // Use TS version instead
      'react/prop-types': 'off',
    },
  },
  // Override for .js files (not in tsconfig.json)
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        // Don't require project for .js files
        project: null,
      },
    },
  },
];

