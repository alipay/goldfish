const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    utilsImportConfig,
    'utils',
  ],
]);
