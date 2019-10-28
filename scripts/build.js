const { lerna, runScript } = require('./utils');

lerna.list().forEach((pkg) => {
  runScript('build', pkg.location);
});
