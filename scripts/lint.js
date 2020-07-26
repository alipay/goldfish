const { lerna, runCommand } = require('./utils');

lerna.list().forEach((pkg) => {
  runCommand(`eslint --ext .ts,.tsx,.js --no-error-on-unmatched-pattern ${pkg.location}/src`);
});
