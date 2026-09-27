export default {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'babel',
  moduleNameMapper: {
    '^@blocks$': '<rootDir>/src',
    '^@blocks/(.*)$': '<rootDir>/src/$1',
    '@wa-dev/email-editor-shared/types': '<rootDir>/../email-editor-shared/src/types/index.ts',
    '@wa-dev/email-editor-shared': '<rootDir>/../email-editor-shared/src/index.ts',
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
