import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import less from 'gulp-less';
import NpmImportPlugin from 'less-plugin-npm-import';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import replace from 'gulp-replace';
import { TscWatchClient } from 'tsc-watch/client';
import getBabelConfig from './getBabelConfigNext';
import utils from './utils';
import createGulpConfig, { CreateGulConfigOptions } from './createGulpConfig';

export interface CreatePDSGulConfigOptions extends CreateGulConfigOptions {}

export default function createPDSGulpConfig(options: CreatePDSGulConfigOptions) {
  const baseGulpConfig = createGulpConfig(options);

  function commonStream(files: string[], cb: (s: NodeJS.ReadWriteStream) => NodeJS.ReadWriteStream) {
    return baseGulpConfig.commonStream(files, pdsCustomHandle(cb));
  }

  function compileJSStream(files: string[]) {
    return commonStream(files, stream => {
      return stream.pipe(
        replace('./assets/', function () {
          return `/${this.file.relative.replace(this.file.basename, '')}assets/`;
        }),
      );
    });
  }

  function compileTSStream(files: string[]) {
    return commonStream(files, stream => {
      const babelConfig = getBabelConfig({ projectDir: options.projectDir });
      return stream.pipe(babel(babelConfig));
    });
  }

  function compileDTS(opts: { watch?: boolean; onSuccess?: () => void }) {
    const tsconfigPath = options.tsconfigPath ?? path.resolve(options.projectDir, 'tsconfig.json');
    if (!tsconfigPath || !fs.existsSync(tsconfigPath)) {
      utils.error(`Please provide the tsconfig.json at here: ${tsconfigPath}.`);
      return;
    }

    if (opts.watch) {
      const watcher = new TscWatchClient();
      watcher.on('onCompilationComplete', () => {
        opts.onSuccess && opts.onSuccess();
      });
      watcher.start(
        '--project',
        tsconfigPath,
        '--noClear',
        '--emitDeclarationOnly',
        '--declaration',
        '--outDir',
        options.distDir,
      );
      return watcher;
    }

    const tsc = baseGulpConfig.resolveTypeScript();
    return utils
      .exec(`${tsc} --project ${tsconfigPath} --emitDeclarationOnly --declaration --outDir ${options.distDir}`, {
        cwd: options.projectDir,
        prefix: '[typescript]',
        color: false,
      })
      .catch(() => {});
  }

  function compileLessStream(files: string[]) {
    return commonStream(files, stream => {
      return stream
        .pipe(
          less({
            javascriptEnabled: true,
            plugins: [new NpmImportPlugin({ prefix: '~' })],
          }),
        )
        .pipe(
          postcss(file => {
            return {
              plugins: [
                require('autoprefixer')({}),
                require('postcss-px-to-viewport')({
                  viewportWidth: /mini-antui/.test(file.relative) ? 750 / 2 : 750,
                }),
              ],
            };
          }),
        )
        .pipe(
          rename({
            extname: '.acss',
          }),
        );
    });
  }

  function copyStream(files: string[]) {
    return gulp.src(files, { base: options.baseDir }).pipe(gulp.dest(options.distDir));
  }

  function getCustomBlobs() {
    try {
      const miniJson = require(`${options.projectDir}/mini.project.json`);
      const includePackages = miniJson['custom_watch_blobs_in_dev'];
      if (!includePackages || !includePackages.length) {
        return;
      }
      return includePackages;
    } catch (e) {
      utils.warn(e);
    }
  }

  function createDevWatcherTask(globs: string[], onComplete: (p: string) => void) {
    const watcher = gulp.watch(globs, {
      ignoreInitial: true,
    });
    watcher.on('change', path => sourceUpdateHandler(path, onComplete));
    watcher.on('add', path => sourceUpdateHandler(path, onComplete));
    watcher.on('unlink', path => {
      let targetPath = utils.getCompiledPath(path, baseGulpConfig.sourceType, baseGulpConfig.sourceFiles);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        onComplete && onComplete(path);
        utils.log(`Remove file successfully: ${targetPath}.`);
      }
    });
    return watcher;

    function sourceUpdateHandler(path: string, onComplete: (p: string) => void) {
      let callbackCounter = 1;
      const checkComplete = () => {
        callbackCounter--;
        if (callbackCounter <= 0) {
          onComplete && onComplete(path);
        }
      };

      const startTime = Date.now();
      let stream: NodeJS.ReadWriteStream | undefined;
      if (baseGulpConfig.sourceType.check(path, baseGulpConfig.sourceFiles) === 'ts') {
        callbackCounter = 2;
        stream = compileTSStream([path]);
      } else if (baseGulpConfig.sourceType.check(path, baseGulpConfig.sourceFiles) === 'less') {
        stream = compileLessStream([path]);
      } else if (baseGulpConfig.sourceType.check(path, baseGulpConfig.sourceFiles) === 'js') {
        stream = compileJSStream([path]);
      } else if (baseGulpConfig.sourceType.check(path, baseGulpConfig.sourceFiles) === 'copy') {
        stream = copyStream([path]);
      }

      if (!stream) {
        return;
      }

      stream.once('error', e => {
        utils.error('Compile file failed:', path, e);
      });
      stream.once('end', () => {
        utils.log('Compile file completed and cost ' + (Date.now() - startTime) + 'ms:', path);
        checkComplete();
      });
    }
  }

  // PDS Custom
  function pdsCustomHandle(cb) {
    const prefixRE = /^GOLDFISH_APP/;

    const envs = Object.create(null);
    Object.keys(process.env).forEach(key => {
      if (prefixRE.test(key) || key === 'NODE_ENV') {
        envs[key] = process.env[key];
      }
    });

    return stream => {
      stream = Object.entries(envs).reduce((_stream, [key, value]) => {
        return _stream.pipe(replace(`process.env.${key}`, JSON.stringify(value)));
      }, stream);

      return cb(stream);
    };
  }

  function build() {
    const tasks = [
      /* eslint-disable prefer-arrow-callback */
      function ts() {
        return compileTSStream(baseGulpConfig.sourceFiles.ts);
      },
      function js() {
        return compileJSStream(baseGulpConfig.sourceFiles.js);
      },
      function less() {
        return compileLessStream(baseGulpConfig.sourceFiles.less);
      },
      function copy() {
        return copyStream(baseGulpConfig.sourceFiles.copy);
      },
      function compileDeclarations() {
        return compileDTS({ watch: false });
      },
      /* eslint-enable prefer-arrow-callback */
    ];
    return gulp.parallel(tasks);
  }

  function dev(onSuccess?: string) {
    const watchers: Array<{ close: () => void }> = [];
    let hasClosed = false;
    return {
      task: gulp.parallel(
        /* eslint-disable prefer-arrow-callback */
        function sourceCode() {
          const watcher = createDevWatcherTask(
            ['./**/*', '!node_modules/**', '!coverage/**', `!${baseGulpConfig.excludeDistDir}`],
            filePath => {
              utils.execCallback(filePath, onSuccess);
            },
          );
          if (!hasClosed) {
            watchers.push(watcher);
          } else {
            watcher.close();
          }
          return watcher;
        },
        function customBlobs() {
          const blobs = getCustomBlobs() || [];
          if (blobs.length) {
            const watcher = createDevWatcherTask(blobs, filePath => {
              utils.execCallback(filePath, onSuccess);
            });
            if (!hasClosed) {
              watchers.push(watcher);
            } else {
              watcher.close();
            }
            return watcher;
          }
        },
        function compileDeclarations() {
          const watcher = compileDTS({
            watch: true,
            onSuccess: () => {
              utils.execCallback(undefined, onSuccess);
            },
          }) as TscWatchClient;
          if (!hasClosed) {
            watchers.push({
              close() {
                watcher.kill();
              },
            });
          } else {
            watcher.kill();
          }
          return new Promise(resolve => {
            watcher.on('exit', resolve);
          });
        },
        /* eslint-enable prefer-arrow-callback */
      ),
      close() {
        hasClosed = true;
        watchers.forEach(watcher => watcher.close());
      },
    };
  }

  return {
    build,
    dev,
  };
}
