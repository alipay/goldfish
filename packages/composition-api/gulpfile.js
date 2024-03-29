const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const pluginsImportConfig = require('@goldfishjs/plugins/babel-plugin-import-config');
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
    reactiveConnectImportConfig,
    'reactiveConnect',
  ],
  [
    'import',
    pluginsImportConfig,
    'plugins',
  ],
  [
    'import',
    utilsImportConfig,
    'utils',
  ],
]);
