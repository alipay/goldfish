import path from 'path';
import fs from 'fs';
import gulp from 'gulp';
import micromatch from 'micromatch';
import plumber from 'gulp-plumber';
import { TscWatchClient } from 'tsc-watch/client';
import utils from './utils';
import getProcessors from './getProcessors';

export interface CreateGulConfigOptions {
  projectDir: string;
  distDir: string;
  baseDir: string;
  tsconfigPath?: string;
  disablePx2Vw?: boolean;
}

export default function createGulpConfig(options: CreateGulConfigOptions) {
  const excludeDistDir = `${options.distDir.replace(options.projectDir + path.sep, '')}/**`;
  const souceBaseDir = path.relative(options.projectDir, options.baseDir);

  type SourceFiles = Record<'ts' | 'less' | 'js' | 'copy' | 'dts' | 'axml' | 'json' | 'asset', string[]>;
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
    axml: [`${souceBaseDir}/**/*.@(axml)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
    json: [`${souceBaseDir}/**/*.@(json|jsonc|json5)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
    asset: [`${souceBaseDir}/**/*.@(png|svg|mp4|mp3)`, '!node_modules/**', '!scripts/**', `!${excludeDistDir}`],
    copy: [
      // TODO: 不写一个非排除的路径, build 报错
      `${souceBaseDir}/**/*.@(xx)`,
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
    axml: ['src/**/*.@(axml)'],
    json: ['src/**/*.@(json|jsonc|json5)'],
    asset: ['src/**/*.@(png|svg|mp4|mp3)'],
    less: ['src/**/*.@(acss|less)'],
    copy: ['src/**/*.@(sjs)', 'src/**/*.d.ts'],
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
      } else if (micromatch([path], sourceFiles.json).length) {
        this.typeMap[path] = 'json';
      } else if (micromatch([path], sourceFiles.asset).length) {
        this.typeMap[path] = 'asset';
      } else if (micromatch([path], sourceFiles.axml).length) {
        this.typeMap[path] = 'axml';
      } else if (micromatch([path], sourceFiles.copy).length) {
        this.typeMap[path] = 'copy';
      }

      return this.typeMap[path];
    },
  };

  function complieProcess(files, type) {
    const processors = getProcessors(type);

    const stream = processors.reduce(
      (stream, processor) => stream.pipe(processor.handler(options, stream)),
      gulp.src(files, { base: options.baseDir }),
    );

    const postProcessors = [() => plumber(utils.error), () => gulp.dest(options.distDir)];
    return postProcessors.reduce((stream, processor) => stream.pipe(processor()), stream);
  }

  function compileJSStream(files: string[]) {
    return complieProcess(files, 'js');
  }

  function compileTSStream(files: string[]) {
    return complieProcess(files, 'ts');
  }

  function compileJsonStream(files: string[]) {
    return complieProcess(files, 'json');
  }

  function compileAxmlStream(files: string[]) {
    return complieProcess(files, 'axml');
  }

  function compileAssetStream(files: string[]) {
    return complieProcess(files, 'asset');
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
    return complieProcess(files, 'less');
  }

  function copyStream(files: string[]) {
    return complieProcess(files, 'copy');
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
      function axml() {
        return compileAxmlStream(sourceFiles.axml);
      },
      function json() {
        return compileJsonStream(sourceFiles.json);
      },
      function asset() {
        return compileAssetStream(sourceFiles.asset);
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
      } else if (sourceType.check(path,sourceFiles) === 'axml' ) {
        stream = compileAxmlStream([path]);
      } else if (sourceType.check(path,sourceFiles) === 'json' ) { 
        stream = compileJsonStream([path]);
      } else if (sourceType.check(path,sourceFiles) === 'asset' ) { 
        stream = compileAssetStream([path]);
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
      function axml() {
        return compileAxmlStream(npmSourceFiles.axml);
      },
      function json() {
        return compileJsonStream(npmSourceFiles.json);
      },
      function asset() {
        return compileLessStream(npmSourceFiles.asset);
      },
      function copy() {
        return copyStream(npmSourceFiles.copy);
      },
    ];
    return gulp.series(
      gulp.parallel(tasks),
      function compileDeclarations() {
        return compileDTS({ watch: false });
      },
    )
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
