const lodash = require('lodash');
module.exports = {
  ...lodash.cloneDeep(require('../../jest.config.base')),
  testEnvironment: './test/CustomTestEnvironment.js',
};
