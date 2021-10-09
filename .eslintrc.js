module.exports = {
  plugins: ['@typescript-eslint/eslint-plugin'],
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    'no-console': 'warn', // ideally 'error' but could be annoying when quick debugging in dev
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    curly: ['error', 'all'],
    'no-throw-literal': 'error',
  },
  overrides: [
    {
      files: ['*.json'],
      rules: {
        'prettier/prettier': 'off',
      },
    },
  ],
}
