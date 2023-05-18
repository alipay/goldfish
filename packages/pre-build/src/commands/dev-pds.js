const path = require('path');
const { execCallback, log, error } = require('../utils');
const { default: excludeUselessScriptsInIntlMiniProgramInDev } = require('../excludeUselessScriptsInIntlMiniProgramInDev');
const createPDSGulpConfig = require('../createPDSGulpConfig').default;
const compilePDS = require('./compile-pds');

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

    const cwd = process.cwd();

    await compilePDS.handler({ type: 'intl', ...args });
    await execCallback(undefined, onSuccess);

    const outDir = process.env.OUT_DIR || 'lib';
    const { dev } = createPDSGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir: outDir,
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
    });
    const { task, close } = dev(onSuccess);
    process.on('SIGHUP', close);
    process.on('SIGINT', close);
    log(`Start watching the project: ${cwd}`);
    task(e => {
      if (e) {
        error(e);
      } else {
        log(`Stop watching the project: ${cwd}.`);
      }
    });

    if (!disableCopyDependencies) {
      excludeUselessScriptsInIntlMiniProgramInDev(path.resolve(cwd, outDir));
    }
  },
};
