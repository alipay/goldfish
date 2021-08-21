const cp = require('child_process');

exports.runCommand = (cmd) => {
  console.log(`=== start executing: ${cmd}`);
  cp.execSync(cmd, { stdio: 'inherit' });
  console.log(`=== finish executing: ${cmd}\n`);
};

exports.runScript = (scriptName, pkgLocation) => {
  const pkgJson = require(`${pkgLocation}/package.json`);
  if (pkgJson.scripts && pkgJson.scripts[scriptName]) {
    exports.runCommand(`cd ${pkgLocation} && yarn run ${scriptName}`);
  }
};

exports.lerna = {
  changed() {
    return JSON.parse(cp.execSync('lerna changed --json'));
  },
  list() {
    return JSON.parse(cp.execSync('lerna list --json --toposort'));
  },
};
