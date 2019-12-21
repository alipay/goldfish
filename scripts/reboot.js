const { runCommand } = require('./utils');

runCommand('lerna clean --yes');
runCommand('lerna bootstrap --no-ci');
