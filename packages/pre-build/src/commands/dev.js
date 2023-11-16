const path = require('path');
const { error, log } = require('../utils');
const excludeUselessScriptsInIntlMiniProgramInDev = require('../excludeUselessScriptsInIntlMiniProgramInDev').default;
const compile = require('./compile');
const createGulpConfig = require('../gulp/createConfig').default;

module.exports = {
  name: 'dev',
  description: 'Pre-compile the miniprogram source codes in develoment.',
  builder: () => {},
  async handler() {
    await compile.handler({ type: 'intl' });
    const cwd = process.cwd();
    const outDir = process.env.OUT_DIR || 'lib';
    const { dev } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir: outDir,
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
    });
    const { task } = dev();
    log(`Start watching the project: ${cwd}`);
    task(e => {
      if (e) {
        error(e);
      } else {
        log(`Stop watching the project: ${cwd}.`);
      }
    });

    excludeUselessScriptsInIntlMiniProgramInDev(path.resolve(cwd, outDir));
  },
};
