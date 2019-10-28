const { runCommand, runScript, lerna } = require('./utils');

// 干净一点
runCommand('lerna clean --yes');
runCommand('lerna bootstrap');

const changedPackages = lerna.changed();

changedPackages.forEach((pkg) => {
  // 不理会 private 项目
  if (pkg.private) {
    return;
  }

  runScript('lint', pkg.location);
  runScript('build', pkg.location);
  runScript('test', pkg.location);
});

runCommand('lerna version --allow-branch master');

changedPackages.forEach((pkg) => {
  // 不要发布 private 项目
  if (pkg.private) {
    return;
  }
  runCommand(`cd ${pkg.location} && npm publish`);
});
