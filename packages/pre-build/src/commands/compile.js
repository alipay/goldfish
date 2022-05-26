const path = require('path');
const { default: excludeUselessScriptsInIntlMiniProgram } = require('../excludeUselessScriptsInIntlMiniProgram');
const { exec, getBinCommand, getNPMCommand, distDir } = require('../utils');

module.exports = {
  name: 'compile',
  description: 'Pre-compile the miniprogram source codes.',
  builder: (y) => {
    y.option('type', {
      describe: 'Project type.',
      alias: 't',
      type: 'string',
      default: 'intl',
    });
  },
  async handler(args) {
    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    const gulpPromise = exec(`${gulpCommand} all --gulpfile ${gulpFilePath} --cwd ${cwd}`, { cwd });

    if (args.type === 'intl') {
      await gulpPromise;
      const npm = await getNPMCommand();
      await exec(`${npm} i --production`, { cwd: distDir });
      // TODO: exclude optimization.
      // excludeUselessScriptsInIntlMiniProgram(distDir);
    }
  },
};
