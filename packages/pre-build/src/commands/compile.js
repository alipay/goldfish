const path = require('path');
const fs = require('fs-extra');
const { default: excludeUselessScriptsInIntlMiniProgram } = require('../excludeUselessScriptsInIntlMiniProgram');
const { distDir: baseDistDir, log, error } = require('../utils');
const createGulpConfig = require('../createGulpConfig').default;

module.exports = {
  name: 'compile',
  description: 'Pre-compile the miniprogram source codes.',
  builder: y => {
    y.option('type', {
      describe: 'Project type.',
      alias: 't',
      type: 'string',
      default: 'intl',
    }).option('analyze', {
      describe: 'Analyze the bundle.',
      alias: 'a',
      type: 'string',
      default: 'false',
    });
  },
  async handler(args) {
    log('Start compilation.');

    const cwd = process.cwd();
    const defaultOutDir = 'lib';
    const distDir = process.env.OUT_DIR ? baseDistDir : path.resolve(cwd, defaultOutDir);

    fs.removeSync(distDir);

    const { build } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir: process.env.OUT_DIR || defaultOutDir,
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
    });
    const taskPromise = new Promise((resolve, reject) => {
      const startTime = Date.now();
      log(`Start compiling the project: ${cwd}`);
      build()(e => {
        if (e) {
          error(`Failed to compile the project: ${cwd}`, e);
        } else {
          log(`Successfully compile the project: ${cwd}. And cost ${Date.now() - startTime}ms.`);
        }
        resolve();
      });
    });
    await taskPromise;

    if (args.type === 'intl') {
      log('Start resolve and copy the dependecies.');
      excludeUselessScriptsInIntlMiniProgram(distDir);
      log('Successfully resolve and copy the dependencies.');
    }

    log('Compiled successfully.');
  },
};
