const path = require('path');
const lodash = require('lodash');
const { exec, getBinCommand } = require('../utils');

module.exports = {
  name: 'dev',
  description: 'Pre-compile the miniprogram source codes in develoment.',
  builder: () => {},
  async handler() {
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    const env = {
      BASE_DIR: 'src',
      OUT_DIR: 'lib',
      ...lodash.pick(process.env, 'BASE_DIR', 'OUT_DIR'),
    };
    await exec(`${gulpCommand} all --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
    exec(`${gulpCommand} dev --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
  },
};
