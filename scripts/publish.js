const { runCommand, lerna } = require('./utils');

const packages = lerna.list();

packages.forEach((pkg) => {
  // Do not release the private packages.
  if (pkg.private) {
    return;
  }
  try {
    runCommand(`cd ${pkg.location} && yarn publish --non-interactive --registry https://registry.npmjs.org`);
  } catch (e) {
    console.error(e);
  }
});
