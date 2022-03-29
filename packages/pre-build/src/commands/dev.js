const { exec, getBinCommand } = require('../utils');
const path = require('path');

module.exports = {
  name: 'dev',
  description: 'Pre-compile the miniprogram source codes in develoment.',
  builder: () => {},
  async handler() {
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    await exec(`node ${gulpCommand} all --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd });
    exec(`${gulpCommand} dev --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd });
  },
};
