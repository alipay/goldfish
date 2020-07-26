const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const bridgeImportConfig = require('@goldfishjs/bridge/babel-plugin-import-config');
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
  [
    'import',
    reactiveConnectImportConfig,
    'reactiveConnect',
  ],
  [
    'import',
    bridgeImportConfig,
    'bridge',
  ],
]);
