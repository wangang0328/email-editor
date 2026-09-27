/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
const path = require('path');

export default {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'babel',
  moduleNameMapper: {
    '@lingui/core/macro': '<rootDir>/__mocks__/linguiMacro.js',
    '^@blocks$': path.join(__dirname, '../email-editor-blocks-react/src'),
    '^@blocks/(.*)$': path.join(__dirname, '../email-editor-blocks-react/src/$1'),
    '^@extensions/(.*)$': path.join(__dirname, 'src/$1'),
    '^@wa-dev/email-editor-blocks-react$': path.join(__dirname, '../email-editor-blocks-react/src/index.ts'),
    '^@wa-dev/email-editor-editor$': path.join(__dirname, '../email-editor-editor/src/index.tsx'),
    '@wa-dev/email-editor-shared/types': path.join(__dirname, '../email-editor-shared/src/types/index.ts'),
    '@wa-dev/email-editor-shared': path.join(__dirname, '../email-editor-shared/src/index.ts'),
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testMatch: ['<rootDir>/src/**/__tests__/**/*.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],
};
