const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    reactiveImportConfig,
    'reactive',
  ],
]);
