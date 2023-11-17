import path from 'path';
import fs from 'fs';
import gulp from 'gulp';
import micromatch from 'micromatch';
import { TscWatchClient } from 'tsc-watch/client';
import utils from '../utils';
import { getFileGulp } from './getFileGulp';
import compliePipeline from './compliePipeline';
import { CreateGulpConfigOptions, ProcessorTravelContext } from './types';

// processor 处理过程中共享的数据，记录输入输出文件对应关系
const processorTravelContext: ProcessorTravelContext = { files: [] }

export default function createGulpConfig(options: CreateGulpConfigOptions) {
  const excludeDistDir = `${options.distDir.replace(options.projectDir + path.sep, '')}/**`;
  const souceBaseDir = path.relative(options.projectDir, options.baseDir);
  const fileGulp = getFileGulp({ excludeDistDir, souceBaseDir, type: options.type, customFileGulp: options.customFileGulp });

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

  function build() {
    const tasks = Object.keys(fileGulp)
    .map(type => {
      const { glob, processors } = fileGulp[type];

      const fn = function () {
        return compliePipeline({
          fileGulp: { type, processors, glob },
          travelData: processorTravelContext,
          options
        });
      };

      // gulp 抛出异常的时候可以看到是哪个任务有问题
      fn.name = type;

      return fn
    });
    return gulp.parallel(tasks);
  }

  function createDevWatcherTask(globs: string[], onComplete?: (p: string) => void) {
    const watcher = gulp.watch(globs, {
      ignoreInitial: true,
      cwd: options.projectDir,
    });
    watcher.on('change', sourceUpdateHandler);
    watcher.on('add', sourceUpdateHandler);

    // 删除源文件后要将编译后的文件删除
    watcher.on('unlink', _path => {
      const sourceFilePath = path.resolve(options.projectDir, _path);
      const processFile = processorTravelContext.files.find(i => i.source === sourceFilePath);

      if(!processFile) return 

      const targetPath = processFile.output;

      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        onComplete && onComplete(_path);
        utils.log(`Remove file successfully: ${targetPath}.`);
      }
    });

    const close = () => {
      watcher.close();
    };

    process.on('SIGHUP', close);
    process.on('SIGINT', close);

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
      const type = Object.keys(fileGulp).find(i => !!micromatch([path], fileGulp[i].glob).length);

      if (!type) {
        utils.error(`Compile file failed: no processor for file: ${path}`);
        return;
      }

      const stream: NodeJS.ReadWriteStream = compliePipeline({
        fileGulp: {
          type,
          glob: [path],
          processors: fileGulp[type].processors,
        },
        options,
        travelData: processorTravelContext
      });
      if (!stream) return;

      stream.once('error', e => {
        utils.error('Compile file failed:', path, e);
      });
      stream.once('end', () => {
        utils.log('Compile file completed and cost ' + (Date.now() - startTime) + 'ms:', path);
        checkComplete();
      });
    }
  }

  function dev(onComplete?: (p: string) => void) {
    const watchers: ReturnType<typeof createDevWatcherTask>[] = [];
    let hasClosed = false;
    return {
      task: gulp.parallel(
        /* eslint-disable prefer-arrow-callback */
        function sourceCode() {
          const watcher = createDevWatcherTask(
            ['./**/*', '!node_modules/**', '!coverage/**', `!${excludeDistDir}`],
            filePath => {
              utils.execCallback(filePath, onComplete);
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
              utils.execCallback(undefined, onComplete);
            },
          }) as unknown as TscWatchClient;
          if (!hasClosed) {
            watchers.push({
              close() {
                watcher.kill();
              },
            } as any);
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

  return { build, dev };
}

function resolveTypeScript() {
  try {
    return path.resolve(path.dirname(require.resolve('typescript')), '../bin/tsc');
  } catch (e) {
    utils.error('Can not find the TypeScript.', e);
    throw e;
  }
}
