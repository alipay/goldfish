const { lerna, runCommand } = require('./utils');

runCommand(`cross-env TARGET_PACKAGE=${process.argv[2] || ''} jest --debug --watch -w 1`);
