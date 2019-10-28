const { lerna, runScript } = require('./utils');

lerna.list().forEach((pkg) => {
  runScript('test', pkg.location);
});
