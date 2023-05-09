const path = require('path');
const lodash = require('lodash');
const { exec, getBinCommand, execCallback } = require('../utils');
const { default: excludeUselessScriptsInIntlMiniProgramInDev } = require('../excludeUselessScriptsInIntlMiniProgramInDev');

module.exports = {
  name: 'dev-pds',
  description: 'Pre-compile the miniprogram source codes in develoment for PDS.',
  builder: (y) => {
    y.option('disable-copy-dependencies', {
      describe: 'Whether to copy dependencies.',
      type: 'boolean',
    });
    y.option('on-success', {
      describe: 'The callback after every changed file successfully handled.',
      type: 'string',
    });
  },
  async handler(args) {
    const disableCopyDependencies = args.disableCopyDependencies;
    const onSuccess = args.onSuccess;
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile-pds.js`);
    const env = {
      BASE_DIR: 'src',
      OUT_DIR: 'lib',
      ...lodash.pick(process.env, 'BASE_DIR', 'OUT_DIR'),
      ON_SUCCESS_CALLBACK: onSuccess,
    };
    await exec(`${gulpCommand} all-pds --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
    await execCallback();
    exec(`${gulpCommand} dev-pds --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
    if (!disableCopyDependencies) {
      excludeUselessScriptsInIntlMiniProgramInDev(path.resolve(cwd, env.OUT_DIR));
    }
  },
};
