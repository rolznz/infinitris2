module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testEnvironment: 'node',
};
