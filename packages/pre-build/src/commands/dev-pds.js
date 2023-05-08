const path = require('path');
const lodash = require('lodash');
const { exec, getBinCommand } = require('../utils');
const { default: excludeUselessScriptsInIntlMiniProgramInDev } = require('../excludeUselessScriptsInIntlMiniProgramInDev');

module.exports = {
  name: 'dev-pds',
  description: 'Pre-compile the miniprogram source codes in develoment for PDS.',
  builder: (y) => {
    y.option('disable-copy-dependencies', {
      describe: 'Whether to copy dependencies.',
      type: 'boolean',
      demandOption: false,
    });
  },
  async handler(args) {
    const disableCopyDependencies = args.disableCopyDependencies;
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    const env = {
      BASE_DIR: 'src',
      OUT_DIR: 'lib',
      ...lodash.pick(process.env, 'BASE_DIR', 'OUT_DIR'),
    };
    await exec(`${gulpCommand} all-pds --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
    exec(`${gulpCommand} dev-pds --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd, env });
    if (!disableCopyDependencies) {
      excludeUselessScriptsInIntlMiniProgramInDev(path.resolve(cwd, env.OUT_DIR));
    }
  },
};
