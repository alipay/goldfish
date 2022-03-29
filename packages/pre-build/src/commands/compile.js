const { exec, getBinCommand } = require('../utils');
const path = require('path');

module.exports = {
  name: 'compile',
  description: 'Pre-compile the miniprogram source codes.',
  builder: () => {},
  async handler() {
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    exec(`${gulpCommand} all --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd });
  },
};
