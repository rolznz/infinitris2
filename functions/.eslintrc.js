module.exports = {
  env: {
    'es6': true,
    'node': true,
    'jest/globals': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:jest/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
    '/node_modules/**/*', // Ignore built files.
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'quotes': ['error', 'single', 'avoid-escape'],
    'indent': ['error', 2],
    'max-len': ['error', { code: 120 }],
    'object-curly-spacing': ['error', 'always'],
    'space-before-function-paren': [
      'error',
      { anonymous: 'always', named: 'never', asyncArrow: 'always' },
    ],
    'valid-jsdoc': ['off'],
    'require-jsdoc': ['off'],
    'semi': 'off',
    '@typescript-eslint/semi': ['error'],
  },
};
