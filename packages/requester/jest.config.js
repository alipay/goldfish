const { jsWithTs: tsjPreset } = require('ts-jest/presets');

// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest/presets/js-with-ts',
  // testEnvironment: './test/CustomTestEnvironment.js',
  globals: {
    'ts-jest': {
      tsConfig: './test/tsconfig.json'
    }
  }
};
