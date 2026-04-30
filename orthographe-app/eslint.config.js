import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'ux-designer/**',
    'tests/**',
    'scripts/**',
    '*.jsx',          // root-level standalone JSX files (landing pages, prototypes)
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Node globals used in server files and Vite config
        process: 'readonly',
        // React 17+ new JSX transform — no import needed
        React: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // CharacterSprite.jsx defines many internal components not exported at module level;
      // fast-refresh limitation is acceptable in a single-file sprite library.
      'react-refresh/only-export-components': 'warn',
    },
  },
  // Server-side files: full Node.js globals
  {
    files: ['server/**/*.{js,mjs}', 'vite.config.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly',
      },
    },
  },
])
