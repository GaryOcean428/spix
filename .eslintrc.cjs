module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Allow unused 'React' import due to new JSX transform
    '@typescript-eslint/no-unused-vars': [
      'warn', // or 'error'
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^React$', // Ignore 'React' specifically
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
}
