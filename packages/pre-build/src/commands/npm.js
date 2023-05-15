const path = require('path');
const fs = require('fs-extra');
const createGulpConfig = require('../createGulpConfig').default;
const { log, error } = require('../utils');

module.exports = {
  name: 'npm',
  description: 'Compile the source codes in npm development.',
  builder: () => {},
  async handler() {
    const cwd = process.cwd();
    fs.removeSync(path.resolve(cwd, './lib'));

    const { npm } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir: process.env.OUT_DIR || 'lib',
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
    });
    const taskPromise = new Promise((resolve, reject) => {
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
