import path from 'path';
import fs from 'fs';
import gulp from 'gulp';
import less from 'gulp-less';
import NpmImportPlugin from 'less-plugin-npm-import';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import babel from 'gulp-babel';
import replace from 'gulp-replace';
import micromatch from 'micromatch';
import plumber from 'gulp-plumber';
import { TscWatchClient } from 'tsc-watch/client';
import getBabelConfig from './getBabelConfigNext';
import utils from './utils';

export interface CreateGulConfigOptions {
  projectDir: string;
  distDir: string;
  baseDir: string;
  tsconfigPath?: string;
}

export default function createGulpConfig(options: CreateGulConfigOptions) {
  const excludeDistDir = `${options.distDir.replace(options.projectDir + path.sep, '')}/**`;
  const souceBaseDir = path.relative(options.projectDir, options.baseDir);

  type SourceFiles = Record<'ts' | 'less' | 'js' | 'copy' | 'dts', string[]>;
  const sourceFiles: SourceFiles = {
    ts: [
      `${souceBaseDir}/**/*.ts`,
      `!${souceBaseDir}/**/*.d.ts`,
      '!node_modules/**',
      '!scripts/**',
      `!${excludeDistDir}`,
    ],
    less: [`${souceBaseDir}/**/*.@(less|acss)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
    js: [`${souceBaseDir}/**/*.@(js|sjs)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
    copy: [
      `${souceBaseDir}/**/*.@(json|axml|png|svg)`,
      '!node_modules/**',
      '!scripts/**',
      `!${excludeDistDir}`,
      '!mini.project.json',
      '!package.json',
      '!tsconfig.json',
    ],
    dts: [],
  };
  const npmSourceFiles: SourceFiles = {
    ts: ['src/**/*.@(ts|tsx)', '!src/**/*.d.ts'],
    js: ['src/**/*.@(js|jsx)'],
    less: ['src/**/*.@(acss|less)'],
    copy: ['src/**/*.@(json|axml|png|svg|sjs)', 'src/**/*.d.ts'],
    dts: ['src/**/*.@(ts|tsx)'],
  };

  const sourceType = {
    typeMap: {},
    check(path: string, sourceFiles: SourceFiles) {
      if (path in this.typeMap) {
        return this.typeMap[path];
      }

      if (micromatch([path], sourceFiles.ts).length) {
        this.typeMap[path] = 'ts';
      } else if (micromatch([path], sourceFiles.less).length) {
        this.typeMap[path] = 'less';
      } else if (micromatch([path], sourceFiles.js).length) {
        this.typeMap[path] = 'js';
      } else if (micromatch([path], sourceFiles.copy).length) {
        this.typeMap[path] = 'copy';
      }

      return this.typeMap[path];
    },
  };

  function replaceEnv(stream: NodeJS.ReadWriteStream) {
    let resultStream = stream;
    if (process.env.NODE_ENV) {
      resultStream = resultStream.pipe(replace('process.env.NODE_ENV', JSON.stringify(process.env.NODE_ENV)));
    }
    if (process.env.GOLDFISH_ENV) {
      resultStream = resultStream.pipe(replace('process.env.GOLDFISH_ENV', JSON.stringify(process.env.GOLDFISH_ENV)));
    }
    return resultStream;
  }

  function commonStream(files: string[], cb: (stream: NodeJS.ReadWriteStream) => NodeJS.ReadWriteStream) {
    let stream = cb(replaceEnv(gulp.src(files, { base: options.baseDir })).pipe(plumber(utils.error)));
    stream = stream.pipe(gulp.dest(options.distDir));
    return stream;
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

    const tsc = resolveTypeScript();
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

  function build() {
    const tasks = [
      /* eslint-disable prefer-arrow-callback */
      function ts() {
        return compileTSStream(sourceFiles.ts);
      },
      function js() {
        return compileJSStream(sourceFiles.js);
      },
      function less() {
        return compileLessStream(sourceFiles.less);
      },
      function copy() {
        return copyStream(sourceFiles.copy);
      },
      function compileDeclarations() {
        return compileDTS({ watch: false });
      },
      /* eslint-enable prefer-arrow-callback */
    ];
    return gulp.parallel(tasks);
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

  function createDevWatcherTask(globs: string[], sourceFiles: SourceFiles, onComplete?: (p: string) => void) {
    const watcher = gulp.watch(globs, {
      ignoreInitial: true,
    });
    watcher.on('change', sourceUpdateHandler);
    watcher.on('add', sourceUpdateHandler);
    watcher.on('unlink', path => {
      let targetPath = utils.getCompiledPath(path, sourceType, sourceFiles);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        onComplete && onComplete(path);
        utils.log(`Remove file successfully: ${targetPath}.`);
      }
    });
    return watcher;

    function sourceUpdateHandler(path: string) {
      let callbackCounter = 1;
      const checkComplete = () => {
        callbackCounter--;
        if (callbackCounter <= 0) {
          onComplete && onComplete(path);
        }
      };

      const startTime = Date.now();
      let stream: NodeJS.ReadWriteStream | undefined;
      if (sourceType.check(path, sourceFiles) === 'ts') {
        stream = compileTSStream([path]);
      } else if (sourceType.check(path, sourceFiles) === 'less') {
        stream = compileLessStream([path]);
      } else if (sourceType.check(path, sourceFiles) === 'js') {
        stream = compileJSStream([path]);
      } else if (sourceType.check(path, sourceFiles) === 'copy') {
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

  function dev() {
    const watchers: ReturnType<typeof createDevWatcherTask>[] = [];
    let hasClosed = false;
    return {
      task: gulp.parallel(
        /* eslint-disable prefer-arrow-callback */
        function sourceCode() {
          const watcher = createDevWatcherTask(
            ['./**/*', '!node_modules/**', '!coverage/**', `!${excludeDistDir}`],
            sourceFiles,
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
            const watcher = createDevWatcherTask(blobs, sourceFiles);
            if (!hasClosed) {
              watchers.push(watcher);
            } else {
              watcher.close();
            }
            return watcher;
          }
        },
        function compileDeclarations() {
          return compileDTS({ watch: true });
        },
        /* eslint-enable prefer-arrow-callback */
      ),
      close() {
        hasClosed = true;
        watchers.forEach(watcher => watcher.close());
      },
    };
  }

  // Compiler for npm package projects.
  function npm() {
    const tasks = [
      /* eslint-disable prefer-arrow-callback */
      function ts() {
        return compileTSStream(npmSourceFiles.ts);
      },
      function js() {
        return compileJSStream(npmSourceFiles.js);
      },
      function less() {
        return compileLessStream(npmSourceFiles.less);
      },
      function copy() {
        return copyStream(npmSourceFiles.copy);
      },
      function compileDeclarations() {
        return compileDTS({ watch: false });
      },
      /* eslint-enable prefer-arrow-callback */
    ];
    return gulp.parallel(tasks);
  }

  function npmDev(onSuccess?: string) {
    const watchers: Array<{ close: () => void }> = [];
    let hasClosed = false;
    return {
      task: gulp.parallel(
        /* eslint-disable prefer-arrow-callback */
        function sourceCode() {
          const watcher = createDevWatcherTask(
            [...npmSourceFiles.ts, ...npmSourceFiles.js, ...npmSourceFiles.less, ...npmSourceFiles.copy],
            npmSourceFiles,
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
    npm,
    npmDev,
    commonStream,
    resolveTypeScript,
    excludeDistDir,
    sourceFiles,
    sourceType,
  };
}

function resolveTypeScript() {
  try {
    return path.resolve(path.dirname(require.resolve('typescript')), '../bin/tsc');
  } catch (e) {
    utils.error('Can not find the TypeScript.', e);
    throw e;
  }
}
