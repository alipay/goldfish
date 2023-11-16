const path = require('path');
const replace = require('gulp-replace');
const fs = require('fs-extra');
const { default: excludeUselessScriptsInIntlMiniProgram } = require('../excludeUselessScriptsInIntlMiniProgram');
const { log, error } = require('../utils');
const createGulpConfig = require('../gulp/createConfig').default;

module.exports = {
  name: 'compile-pds',
  description: 'Pre-compile the miniprogram source codes for PDS.',
  builder: y => {
    y.option('type', {
      describe: 'Project type.',
      alias: 't',
      type: 'string',
      default: 'intl',
    });
    y.option('analyze', {
      describe: 'Analyze the bundle.',
      alias: 'a',
      type: 'string',
      default: 'false',
    });
    y.option('disable-copy-dependencies', {
      describe: 'Whether to copy dependencies.',
      type: 'boolean',
    });
    y.option('disable-px2vw', {
      describe: 'Disable the px-2-vw converting.',
      type: 'boolean',
    });
  },
  async handler(args) {
    log('Start compilation.');

    const cwd = process.cwd();
    const disableCopyDependencies = args.disableCopyDependencies;
    const disablePx2Vw = args.disablePx2Vw;
    const defaultOutDir = 'lib';
    const distDir = process.env.OUT_DIR || defaultOutDir;

    fs.removeSync(path.resolve(cwd, distDir));

    const { build } = createGulpConfig({
      projectDir: cwd,
      baseDir: process.env.BASE_DIR || 'src',
      distDir,
      tsconfigPath: path.resolve(cwd, 'tsconfig.json'),
      disablePx2Vw,
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
    const taskPromise = new Promise(resolve => {
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

    if (args.type === 'intl' && !disableCopyDependencies) {
      log('Start resolve and copy the dependecies.');
      excludeUselessScriptsInIntlMiniProgram(path.resolve(cwd, distDir));
      log('Successfully resolve and copy the dependencies.');
    }

    log('Compiled successfully.');
  },
};
