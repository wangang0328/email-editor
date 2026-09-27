const path = require('path');

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'babel',
  moduleNameMapper: {
    '^@$': '<rootDir>/src',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@blocks$': path.join(__dirname, '../email-editor-blocks-react/src'),
    '^@blocks/(.*)$': path.join(__dirname, '../email-editor-blocks-react/src/$1'),
    '@wa-dev/email-editor-shared/types': path.join(
      __dirname,
      '../email-editor-shared/src/types/index.ts',
    ),
    '@wa-dev/email-editor-shared': path.join(
      __dirname,
      '../email-editor-shared/src/index.ts',
    ),
    '@wa-dev/email-editor-blocks-react': path.join(
      __dirname,
      '../email-editor-blocks-react/src/index.ts',
    ),
    '^lodash-es$': 'lodash',
    '@lingui/core/macro': '<rootDir>/__mocks__/linguiMacro.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],
};
