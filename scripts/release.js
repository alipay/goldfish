const { runCommand, runScript, lerna } = require('./utils');

runCommand('rm -rf node_modules && rm -rf packages/*/node_modules');
runCommand('yarn install');

const packages = lerna.list();

packages.forEach((pkg) => {
  // Do not handle the private packages.
  if (pkg.private) {
    return;
  }

  runCommand(`eslint --ext .ts,.tsx,.js --no-error-on-unmatched-pattern ${pkg.location}/src`);
  runScript('build', pkg.location);
  runScript('test', pkg.location);
});

runCommand('lerna version --allow-branch master --loglevel=verbose --force-publish');

packages.forEach((pkg) => {
  // Do not release the private packages.
  if (pkg.private) {
    return;
  }
  runCommand(`cd ${pkg.location} && yarn publish`);
});
