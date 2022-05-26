const path = require('path');
const fs = require('fs-extra');
const lodash = require('lodash');
// const { default: excludeUselessScriptsInIntlMiniProgram } = require('../excludeUselessScriptsInIntlMiniProgram');
const { exec, getBinCommand, getNPMCommand, distDir: baseDistDir, cwd } = require('../utils');

// redifine the `distDir`
const defaultOutDir = 'lib';
const distDir = process.env.OUT_DIR ? baseDistDir : path.resolve(cwd, defaultOutDir);

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
    fs.removeSync(distDir);

    const gulpCommand = getBinCommand('gulp', 'gulp', [__dirname]);

    const cwd = process.cwd();
    const gulpFilePath = path.resolve(__dirname, `..${path.sep}gulpfile.js`);
    const gulpPromise = exec(`${gulpCommand} all --gulpfile ${gulpFilePath} --cwd ${cwd}`, {
      cwd,
      env: {
        BASE_DIR: 'src',
        OUT_DIR: defaultOutDir,
        ...lodash.pick(process.env, 'BASE_DIR', 'OUT_DIR'),
      },
    });

    if (args.type === 'intl') {
      await gulpPromise;
      fs.copySync(`${cwd}/package.json`, `${distDir}/package.json`);
      const npm = await getNPMCommand();
      await exec(`${npm} i --production`, { cwd: distDir });
      // TODO: exclude optimization.
      // excludeUselessScriptsInIntlMiniProgram(distDir);
    }
  },
};
