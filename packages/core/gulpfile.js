const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const pluginsImportConfig = require('@goldfishjs/plugins/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    utilsImportConfig,
    'utils',
  ],
  [
    'import',
    pluginsImportConfig,
    'plugins',
  ],
  [
    'import',
    reactiveConnectImportConfig,
    'reactiveConnect',
  ],
]);
