const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const routeImportConfig = require('@goldfishjs/route/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const bridgeImportConfig = require('@goldfishjs/bridge/babel-plugin-import-config');
const requesterImportConfig = require('@goldfishjs/requester/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  [
    'import',
    reactiveImportConfig,
    'reactive',
  ],
  [
    'import',
    routeImportConfig,
    'route',
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
  [
    'import',
    requesterImportConfig,
    'requester',
  ],
]);
