// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest',
  testEnvironment: './test/CustomTestEnvironment.js',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json'
    }
  }

};
