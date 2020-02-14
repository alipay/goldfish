const { lerna, runCommand } = require('./utils');

lerna.list().forEach((pkg) => {
  runCommand(`eslint --ext .ts -c .eslintrc.json --no-error-on-unmatched-pattern ${pkg.location}/src`);
});
