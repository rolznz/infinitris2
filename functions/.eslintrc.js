module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
  ],
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    // prettier-ignore
    'quotes': ['error', 'single'],
    // prettier-ignore
    'indent': ['error', 2],
    // prettier-ignore
    'object-curly-spacing': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
  },
};
