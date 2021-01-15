const reactiveImportConfig = require('@goldfishjs/reactive/babel-plugin-import-config');
const utilsImportConfig = require('@goldfishjs/utils/babel-plugin-import-config');
const requesterImportConfig = require('@goldfishjs/requester/babel-plugin-import-config');
const pluginsImportConfig = require('@goldfishjs/plugins/babel-plugin-import-config');
const reactiveConnectImportConfig = require('@goldfishjs/reactive-connect/babel-plugin-import-config');
const compositionAPIImportConfig = require('@goldfishjs/composition-api/babel-plugin-import-config');
const gulpfileBase = require('../../scripts/gulpfile.base');

gulpfileBase([
  ['import', reactiveImportConfig, 'reactive'],
  ['import', utilsImportConfig, 'utils'],
  ['import', requesterImportConfig, 'requester'],
  ['import', pluginsImportConfig, 'plugins'],
  ['import', reactiveConnectImportConfig, 'reactive-connect'],
  ['import', compositionAPIImportConfig, 'composition-api'],
]);
