const { execCallback, log, error } = require('../utils');
const path = require('path');
const npm = require('./npm');
const createGulpConfig = require('../createGulpConfig').default;

module.exports = {
  name: 'npm-dev',
  description: 'Compile the source codes in npm development watch mode.',
  builder: y => {
    y.option('on-success', {
      describe: 'The callback after every changed file successfully handled.',
      type: 'string',
    });
    y.option('disable-px2vw', {
      describe: 'Disable the px-2-vw converting.',
      type: 'boolean',
    });
  },
  async handler(args) {
    const cwd = process.cwd();
    const onSuccess = args.onSuccess;
    const disablePx2vw = args.disablePx2vw;

    await npm.handler(args);
    await execCallback(undefined, onSuccess);

    const { npmDev } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir: process.env.OUT_DIR || 'lib',
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
      disablePx2vw,
    });
    const { task, close } = npmDev(onSuccess);
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
  },
};
