export default [
  {
    files: ['app.js', 'tests/**/*.js', 'vitest.config.js', 'playwright.config.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        globalThis: 'readonly',
        Event: 'readonly',
        DOMParser: 'readonly',
        getComputedStyle: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-eval': 'error',
    },
  },
]
