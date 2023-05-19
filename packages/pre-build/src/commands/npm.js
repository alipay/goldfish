const path = require('path');
const fs = require('fs-extra');
const createGulpConfig = require('../createGulpConfig').default;
const { log, error } = require('../utils');

module.exports = {
  name: 'npm',
  description: 'Compile the source codes in npm development.',
  builder: y => {
    y.option('disable-px2vw', {
      describe: 'Disable the px-2-vw converting.',
      type: 'boolean',
    });
  },
  async handler(args) {
    const disablePx2vw = args.disablePx2vw;
    const cwd = process.cwd();
    const distDir = process.env.OUT_DIR || 'lib';
    fs.removeSync(path.resolve(cwd, distDir));

    const { npm } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir,
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
      disablePx2vw,
    });
    const taskPromise = new Promise(resolve => {
      const startTime = Date.now();
      log(`Start compiling the project: ${cwd}`);
      npm()(e => {
        if (e) {
          error(`Failed to compile the project: ${cwd}`, e);
        } else {
          log(`Successfully compile the project: ${cwd}. And cost ${Date.now() - startTime}ms.`);
        }
        resolve();
      });
    });
    await taskPromise;
  },
};
