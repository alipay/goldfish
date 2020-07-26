const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const coreImportConfig = require('@goldfishjs/core/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const pluginsImportConfig = require('@goldfishjs/plugins/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    reactiveImportConfig,
    'reactive',
  ],
  [
    'import',
    coreImportConfig,
    'core',
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
]);
