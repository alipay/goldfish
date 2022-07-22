const path = require('path');

// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  rootDir: __dirname,
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(__dirname, './test/tsconfig.json'),
    },
  },
  transformIgnorePatterns: [],
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'text-summary'],
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  watchPathIgnorePatterns: ['<rootDir>/test/utils/tmp'],
};
