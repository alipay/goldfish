const path = require('path');
const esModules = ['lodash-es'].join('|');

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(__dirname, './tsconfig.test.json'),
    },
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(${esModules}))/`],
  testMatch: ['<rootDir>/test/**/*.spec.(tsx|ts|js)'],
};
