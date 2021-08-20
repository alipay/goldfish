const lodash = require('lodash');
const config = lodash.cloneDeep(require('../../jest.config.base'));
config.moduleNameMapper = {
  '^react$': '<rootDir>/test/react-use/react.ts',
};
module.exports = config;
