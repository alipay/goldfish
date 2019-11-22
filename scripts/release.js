const { runCommand, runScript, lerna } = require('./utils');

runCommand('lerna clean --yes');
runCommand('lerna bootstrap');

const changedPackages = lerna.changed();

changedPackages.forEach((pkg) => {
  // Do not handle the private packages.
  if (pkg.private) {
    return;
  }

  runScript('lint', pkg.location);
  runScript('build', pkg.location);
  runScript('test', pkg.location);
});

runCommand('lerna version --allow-branch master');

changedPackages.forEach((pkg) => {
  // Do not release the private packages.
  if (pkg.private) {
    return;
  }
  runCommand(`cd ${pkg.location} && npm publish`);
});
