const { runCommand, runScript, lerna } = require('./utils');

runCommand('rm -rf node_modules && npm i --no-package-lock --registry=https://registry.npm.taobao.org');
runCommand('lerna clean --yes');
runCommand('lerna bootstrap --loglevel=verbose');

const packages = lerna.list();

packages.forEach((pkg) => {
  // Do not handle the private packages.
  if (pkg.private) {
    return;
  }

  runScript('lint', pkg.location);
  runScript('build', pkg.location);
  runScript('test', pkg.location);
});

runCommand('lerna version --allow-branch master --loglevel=verbose --force-publish');

packages.forEach((pkg) => {
  // Do not release the private packages.
  if (pkg.private) {
    return;
  }
  runCommand(`cd ${pkg.location} && npm publish`);
});
