const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    reactiveConnectImportConfig,
    'reactiveConnect',
  ],
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
