const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    reactiveImportConfig,
    'reactive',
  ],
  [
    'import',
    utilsImportConfig,
    'utils',
  ],
]);
