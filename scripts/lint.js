const { lerna, runScript } = require('./utils');

lerna.list().forEach((pkg) => {
  runScript('lint', pkg.location);
});
