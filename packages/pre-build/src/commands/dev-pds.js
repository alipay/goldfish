const path = require('path');
const { error, log } = require('../utils');
const excludeUselessScriptsInIntlMiniProgramInDev = require('../excludeUselessScriptsInIntlMiniProgramInDev').default;
const compile = require('./compile-pds');
const replace = require('gulp-replace');
const createGulpConfig = require('../gulp/createConfig').default;

module.exports = {
  name: 'dev-pds',
  description: 'Pre-compile the miniprogram source codes in develoment for PDS.',
  builder: y => {
    y.option('disable-copy-dependencies', {
      describe: 'Whether to copy dependencies.',
      type: 'boolean',
    });
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
    const disableCopyDependencies = args.disableCopyDependencies;
    const onSuccess = args.onSuccess;
    const disablePx2Vw = args.disablePx2Vw;
    await compile.handler({ type: 'intl', ...args });
    await execCallback(undefined, onSuccess);
    const cwd = process.cwd();
    const outDir = process.env.OUT_DIR || 'lib';
    const { dev } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir: outDir,
      disablePx2Vw,
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
      customFileGulp(fileGulp) {
        const processor = {
          name: 'pds-replace',
          handler: (_, stream) => {
            const prefixRE = /^GOLDFISH_APP/;
            return Object.entries(process.env).reduce((stream, [key, value]) => {
              if (prefixRE.test(key)) {
                return stream.pipe(replace(`process.env.${key}`, JSON.stringify(value || '')));
              }
              return stream;
            }, stream);
          },
        };

        fileGulp.ts.processors.unshift(processor);
        fileGulp.js.processors.unshift(processor);
        return fileGulp;
      },
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

    if (disableCopyDependencies) {
      excludeUselessScriptsInIntlMiniProgramInDev(path.resolve(cwd, outDir));
    }
  },
};
